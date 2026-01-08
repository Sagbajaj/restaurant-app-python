import React, { useState, useEffect } from 'react'; // Added useEffect
import { Alert, ActivityIndicator, View, StyleSheet } from 'react-native';

// 3. Screens
import LoginScreen from '../../src/screens/LoginScreen';
import HomeScreen from '../../src/screens/HomeScreen';
import AdminDashboard from '../../src/screens/AdminDashboard';
import RestaurantDetails from '../../src/screens/RestaurantDetails';
import RestaurantForm from '../../src/screens/RestaurantForm';
import MenuScreen from '../../src/screens/MenuScreen';
import LiveTrackingScreen from '../../src/screens/LiveTrackingScreen';
import ReviewsModal from '@/src/components/ReviewsModal';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('HOME');
  const [restaurants, setRestaurants] = useState([]); // Initialize empty
  const [loading, setLoading] = useState(true); // Loading state
  const [selectedRest, setSelectedRest] = useState(null);
  const [user, setUser] = useState(null);
  const [isTracking, setIsTracking] = useState(false); // <--- New State
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalReviews, setModalReviews] = useState<any[]>([]); // Use your Review interface here if available
  const [isLoading, setIsLoading] = useState(false);

  const BASE_URL = 'https://restaurant-app-python.onrender.com/api/restaurants';

  // --- 1. FETCH DATA FROM SERVER ON LOAD ---
  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/`);
      if (response.ok) {
        const data = await response.json();
        setRestaurants(data); // Update state with REAL data
      } else {
        console.error("Failed to fetch restaurants");
      }
    } catch (error) {
      console.error("Network Error:", error);
      Alert.alert("Error", "Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // --- NAVIGATION HELPER ---
  const navigateTo = (screen: React.SetStateAction<string>, data = null) => {
    if (data) setSelectedRest(data);
    setCurrentScreen(screen);
  };

   // 1. Show Tracking Screen
   if (isTracking && selectedRest) {
    return (
      <LiveTrackingScreen 
        route={{ params: { restaurant: selectedRest } }} 
        navigation={{ goBack: () => setIsTracking(false) }} 
      />
    );
  }

  // --- CLOUD ACTION: LOGIN ---
  const handleLogin = (username: React.SetStateAction<null>, role: any) => {
    console.log("Parent received login success for:", username);
    setUser(username);
    navigateTo('ADMIN_DASHBOARD');
  };

  // --- CLOUD ACTION: SAVE RESTAURANT ---
  const handleSaveRestaurant = async (formData: { name: any; res_type: any; cuisine: any; location: any; address: any; phone: any; email: any; website: any; wifi_ssid: any; wifi_password: any; id: any; }) => {
    try {
      let response;
      let method = 'POST';
      let url = BASE_URL; // Default to Create URL

      // 1. Prepare Data
      const bodyData = {
        name: formData.name,
        res_type: formData.res_type,
        cuisine: formData.cuisine,
        location: formData.location,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        wifi_ssid: formData.wifi_ssid,
        wifi_password: formData.wifi_password
      };

      // 2. Decide: Create or Edit?
      if (formData.id) {
        method = 'PUT';
        url = `${BASE_URL}/${formData.id}`;
      } else {
        method = 'POST';
        url = `${BASE_URL}/`; // Ensure trailing slash for POST if using APIRouter prefix
      }

      // 3. Send to Server
      response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const savedRestaurant = await response.json();

      if (!response.ok) {
        Alert.alert("Error", savedRestaurant.detail || "Failed to save");
        return;
      }

      console.log("Success:", savedRestaurant);

      // 4. REFRESH DATA from Server to be safe
      await fetchRestaurants(); 
      
      navigateTo('ADMIN_DASHBOARD');

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not connect to server");
    }
  };

  // --- LOCAL ACTION: DELETE REVIEW (We will connect this to API later) ---
  const handleDeleteReview = (restId: any, reviewId: any) => {
    const updated = restaurants.map(r => {
      if (r.id === restId) {
        // Safe check for r.reviews since API data might not have it yet
        const currentReviews = r.reviews || [];
        return { ...r, reviews: currentReviews.filter((rev: { id: any; }) => rev.id !== reviewId) };
      }
      return r;
    });
    setRestaurants(updated);
    
    if (selectedRest && selectedRest.id === restId) {
       setSelectedRest(updated.find(r => r.id === restId));
    }
  };

  const fetchAllReviews = async () => {
    try {
      // 1. Start Loading
      setIsLoading(true);
  
      // 2. Hit the URL (Replace with your actual API endpoint)
      // If you need to send an Auth Token, add it to headers
      const response = await fetch('https://restaurant-app-python.onrender.com/api/reviews/all-reviews', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${userToken}`, // Uncomment if you use login tokens
        },
      });
  
      // 3. Check for server errors (404, 500, etc.)
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
  
      // 4. Parse JSON data
      const data = await response.json();
  
      // 5. Update State
      // Note: Ensure 'data' matches the array format your Modal expects
      setModalReviews(data); 
      setModalVisible(true);
  
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch reviews from server.");
    } finally {
      // 6. Stop Loading (runs whether success or fail)
      setIsLoading(false);
    }
  };

  const fetchRestaurantReviews = async (restaurantId) => {
    // Safety check
    if (!restaurantId) {
      console.error("No restaurant ID provided");
      return;
    }
  
    try {
      setIsLoading(true);
  
      // 1. Construct the URL
      // I am assuming your backend endpoint structure here. 
      // It is likely one of these two formats:
      // Option A: /api/reviews/restaurant/{id}
      // Option B: /api/reviews?restaurant_id={id}
      const url = `https://restaurant-app-python.onrender.com/api/reviews/${restaurantId}`;
  
      // 2. Fetch
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
  
      const data = await response.json();
  
      // 3. Update the SAME state variables used by the Modal
      setModalReviews(data);
      setModalVisible(true);
  
    } catch (error) {
      console.error("Error fetching restaurant reviews:", error);
      Alert.alert("Error", "Could not load reviews.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOADING SCREEN ---
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  // --- RENDER SCREENS ---
  if (currentScreen === 'HOME') {
    return <HomeScreen data={restaurants} onAdminPress={() => navigateTo('LOGIN')} />;
  }

  if (currentScreen === 'LOGIN') {
    return (
      <LoginScreen 
        onLogin={handleLogin} 
        onBack={() => navigateTo('HOME')} 
      />
    );
  }

  if (currentScreen === 'ADMIN_DASHBOARD') {
    return (
      <>
        <AdminDashboard 
          data={restaurants} 
          onLogout={() => { setUser(null); navigateTo('HOME'); }}
          onViewDetails={(item: any) => navigateTo('REST_DETAILS', item)}
          onAddPress={() => navigateTo('ADD_FORM')}
          onEditPress={(item: any) => navigateTo('EDIT_FORM', item)}
          
          // Pass the function we defined above
          onShowReviews={fetchAllReviews}
        />
  
        {isLoading && (
          <View style={{
            position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
            backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center'
          }}>
            <ActivityIndicator size="large" color="#FF9800" />
          </View>
        )}

        {/* Render the Common Modal here as a sibling */}
        <ReviewsModal 
          visible={isModalVisible}
          onClose={() => setModalVisible(false)}
          reviews={modalReviews}
          title="All System Reviews"
        />
      </>
    );
  }

  if (currentScreen === 'ADD_FORM') {
    return <RestaurantForm onSave={handleSaveRestaurant} onCancel={() => navigateTo('ADMIN_DASHBOARD')} initialData={undefined} />;
  }

  if (currentScreen === 'EDIT_FORM') {
    return <RestaurantForm initialData={selectedRest} onSave={handleSaveRestaurant} onCancel={() => navigateTo('ADMIN_DASHBOARD')} />;
  }

  if (currentScreen === 'REST_DETAILS') {
    return (
      <><RestaurantDetails
        restaurant={selectedRest}
        onBack={() => navigateTo('ADMIN_DASHBOARD')}
        onManageMenu={() => navigateTo('MENU_PAGE', selectedRest)}
        onDeleteReview={handleDeleteReview}
        onTrackOrder={() => setIsTracking(true)} />
        
        <ReviewsModal
          visible={isModalVisible}
          onClose={() => setModalVisible(false)}
          reviews={modalReviews}
          title={selectedRest ? `Reviews: ${selectedRest.name}` : "Reviews"} 
          />
        </>
    );
  }

  if (currentScreen === 'MENU_PAGE') {
    return <MenuScreen restaurant={selectedRest} onBack={() => navigateTo('REST_DETAILS', selectedRest)} />;
  }

  return null;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});