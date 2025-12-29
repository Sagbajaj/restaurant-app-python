import React, { useState } from 'react';
import { Alert } from 'react-native';

// 1. Data Source (Local Mock Data)
import { INITIAL_RESTAURANTS } from '../../src/data/mockData';

// 3. Screens
import LoginScreen from '../../src/screens/LoginScreen';
import HomeScreen from '../../src/screens/HomeScreen';
import AdminDashboard from '../../src/screens/AdminDashboard';
import RestaurantDetails from '../../src/screens/RestaurantDetails';
import RestaurantForm from '../../src/screens/RestaurantForm';
import MenuScreen from '../../src/screens/MenuScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('HOME');
  const [restaurants, setRestaurants] = useState(INITIAL_RESTAURANTS); // Local State
  const [selectedRest, setSelectedRest] = useState(null);
  const [user, setUser] = useState(null); // Auth State

  // --- NAVIGATION HELPER ---
  const navigateTo = (screen: React.SetStateAction<string>, data = null) => {
    if (data) setSelectedRest(data);
    setCurrentScreen(screen);
  };

  // --- CLOUD ACTION: LOGIN ---
  const handleLogin = (username: any, role: any) => {
    // 1. The API call ALREADY happened in LoginScreen. 
    // We don't need to fetch again.
    
    console.log("Parent received login success for:", username);
  
    // 2. Just update state and navigate
    setUser(username); // or whatever your user object structure is
    navigateTo('ADMIN_DASHBOARD');
  };

  // --- LOCAL ACTIONS (Mock Data) ---
  // Inside your App.js or Screen Component

const handleSaveRestaurant = async (formData: { name: any; res_type: any; cuisine: any; location: any; address: any; phone: any; email: any; website: any; wifi_ssid: any; wifi_password: any; id: string; }) => {
  try {
      const BASE_URL = 'https://restaurant-app-python.onrender.com/api/restaurants';
      let response;
      let method = 'POST';
      let url = BASE_URL;

      // --- 1. PREPARE DATA ---
      // The backend expects specific fields. Remove 'id' from the body if creating.
      // Also remove 'reviews'/'menu' if your form adds them, as the backend RestaurantCreate schema might not expect them yet.
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

      // --- 2. DECIDE: CREATE OR EDIT? ---
      if (formData.id) {
          // EDIT MODE
          method = 'PUT';
          url = `${BASE_URL}/${formData.id}`; // e.g., /api/restaurants/5
      } else {
          // CREATE MODE
          method = 'POST';
          url = `${BASE_URL}/`; // Note: FastAPI creates usually end in /
      }

      // --- 3. SEND TO SERVER ---
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

      // --- 4. UPDATE LOCAL STATE ---
      // Option A: Just reload the whole list from server (Easiest & Safest)
      // fetchRestaurants(); 
      
      // Option B: Manually update local list (Faster UI)
      if (formData.id) {
          // Replace the old one with the response from server
          setRestaurants(prev => prev.map(r => r.id === formData.id ? savedRestaurant : r));
      } else {
          // Add the new one (which now has a REAL database ID)
          setRestaurants(prev => [...prev, savedRestaurant]);
      }

      // Navigate back
      navigateTo('ADMIN_DASHBOARD');

  } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not connect to server");
  }
};

  const handleDeleteReview = (restId: string, reviewId: string) => {
    const updated = restaurants.map(r => {
      if (r.id === restId) {
        return { ...r, reviews: r.reviews.filter(rev => rev.id !== reviewId) };
      }
      return r;
    });
    setRestaurants(updated);
    
    // Update the currently viewed details page immediately
    if (selectedRest && selectedRest.id === restId) {
       setSelectedRest(updated.find(r => r.id === restId));
    }
  };

  // --- RENDER SCREENS ---
  if (currentScreen === 'HOME') {
    return <HomeScreen data={restaurants} onAdminPress={() => navigateTo('LOGIN')} />;
  }

  if (currentScreen === 'LOGIN') {
    // Pass the wrapper function that calls the API
    return (
      <LoginScreen 
        onLogin={(user: any, pass: any) => handleLogin(user, pass)} 
        onBack={() => navigateTo('HOME')} 
      />
    );
  }

  if (currentScreen === 'ADMIN_DASHBOARD') {
    return (
      <AdminDashboard 
        data={restaurants} 
        onLogout={() => { setUser(null); navigateTo('HOME'); }}
        onViewDetails={(item: null | undefined) => navigateTo('REST_DETAILS', item)}
        onAddPress={() => navigateTo('ADD_FORM')}
        onEditPress={(item: null | undefined) => navigateTo('EDIT_FORM', item)}
      />
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
      <RestaurantDetails 
        restaurant={selectedRest} 
        onBack={() => navigateTo('ADMIN_DASHBOARD')} 
        onManageMenu={() => navigateTo('MENU_PAGE', selectedRest)}
        onDeleteReview={handleDeleteReview}
      />
    );
  }

  if (currentScreen === 'MENU_PAGE') {
    return <MenuScreen restaurant={selectedRest} onBack={() => navigateTo('REST_DETAILS', selectedRest)} />;
  }

  return null;
}