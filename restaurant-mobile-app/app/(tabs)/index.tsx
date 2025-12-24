import React, { useState } from 'react';
import { Alert } from 'react-native';

// 1. Data Source (Local Mock Data)
import { INITIAL_RESTAURANTS } from '../../src/data/mockData';

// 2. API (Cloud Login)
import { loginUser } from '../../src/api/api';

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
  const handleLogin = async (username: any, password: any) => {
    try {
      // Connect to Render Database
      const data = await loginUser(username, password);
      setUser(data.username);
      navigateTo('ADMIN_DASHBOARD');
    } catch (error) {
      Alert.alert("Login Failed", "Invalid username or password.");
    }
  };

  // --- LOCAL ACTIONS (Mock Data) ---
  const handleSaveRestaurant = (formData: { id: string; }) => {
    if (formData.id) {
      // Edit existing
      setRestaurants(restaurants.map(r => r.id === formData.id ? formData : r));
    } else {
      // Add new
      const newRest = { ...formData, id: Math.random().toString(), reviews: [], menu: [] };
      setRestaurants([...restaurants, newRest]);
    }
    navigateTo('ADMIN_DASHBOARD');
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