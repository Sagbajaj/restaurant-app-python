import React, { useState,useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Linking, Platform, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import QRCode from 'react-native-qrcode-svg';
// import ReviewsModal from '../components/ReviewsModal';

export default function RestaurantDetails({ restaurant, onBack, onManageMenu, onTrackOrder, onShowRestaurantReviews}) {
  const [qrModalVisible, setQrModalVisible] = useState(false);
  // 2. NEW: Local state to hold reviews for the preview list
  const [previewReviews, setPreviewReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  if (!restaurant) return null;

  const reviews = restaurant.reviews || [];
  const wifiSSID = restaurant.wifi_ssid || restaurant.wifi?.ssid;
  const wifiPass = restaurant.wifi_password || restaurant.wifi?.pass;

  // 3. NEW: Fetch reviews automatically when this screen mounts
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoadingReviews(true);
        // Use the same URL structure as your App.js
        const response = await fetch(`https://restaurant-app-python.onrender.com/api/reviews/${restaurant.id}`);
        if (response.ok) {
          const data = await response.json();
          setPreviewReviews(data);
        }
      } catch (error) {
        console.error("Failed to load review previews", error);
      } finally {
        setLoadingReviews(false);
      }
    };

    loadReviews();
  }, [restaurant.id]); // Re-run if restaurant ID changes

  // Helper: Parse location string
  const getCoords = (locString) => {
    if (!locString) return null;
    const parts = locString.split(',');
    if (parts.length === 2 && !isNaN(parts[0])) {
      return { latitude: parseFloat(parts[0]), longitude: parseFloat(parts[1]) };
    }
    return null;
  };

  // Get coordinates using the correct prop 'restaurant'
  const coords = getCoords(restaurant.location);

  // Helper: Open external maps app
  const openExternalMap = () => {
    if(!coords) return;
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${coords.latitude},${coords.longitude}`;
    const label = restaurant.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });
    Linking.openURL(url);
  };

  return (
    <View style={{flex: 1, backgroundColor: '#f8f9fa'}}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* BACK BUTTON */}
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back to List</Text>
        </TouchableOpacity>

        {/* Header Info */}
        <View style={styles.headerCard}>
          <Text style={styles.title}>{restaurant.name || 'Unknown Name'}</Text>
          <Text style={styles.subtitle}>
            {restaurant.res_type || 'Type N/A'} • {restaurant.cuisine || 'Cuisine N/A'}
          </Text>
        </View>

        {/* Contact & Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Contact & Address</Text>
          <Text style={styles.infoText}>Address: {restaurant.address || 'Not provided'}</Text>
          <Text style={styles.infoText}>Phone: {restaurant.phone || 'Not provided'}</Text>
          
          {/* MAP VIEW */}
          <View style={styles.mapBox}>
             {coords ? (
               <MapView
                 style={{flex: 1}}
                 // Static map view (no scrolling)
                 initialRegion={{
                   ...coords,
                   latitudeDelta: 0.005,
                   longitudeDelta: 0.005,
                 }}
                 scrollEnabled={false} 
                 zoomEnabled={false}
                 onPress={openExternalMap} 
               >
                  <Marker coordinate={coords} />
               </MapView>
             ) : (
               <View style={styles.centerPlaceholder}>
                  <Text style={{color:'#999'}}>No Location Pinned</Text>
               </View>
             )}
          </View>
          
          {coords && (
              <TouchableOpacity onPress={openExternalMap} style={{marginTop: 8}}>
                  <Text style={styles.linkText}>Open in Maps App ↗</Text>
              </TouchableOpacity>
          )}
        </View>

        {/* WiFi Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📶 WiFi Management</Text>
          {wifiSSID ? (
              <View style={styles.wifiRow}>
                  <View style={{flex: 1}}>
                      <Text style={styles.wifiName}>{wifiSSID}</Text>
                      <Text style={styles.wifiPass}>Pass: {wifiPass || 'No Password'}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setQrModalVisible(true)}>
                      <View style={styles.qrThumbnail}>
                          <Text style={{fontSize: 24}}>📱</Text>
                          <Text style={{fontSize: 10, color: 'blue'}}>Show QR</Text>
                      </View>
                  </TouchableOpacity>
              </View>
          ) : (
              <Text style={{fontStyle:'italic', color:'#888'}}>No Wi-Fi configured.</Text>
          )}
        </View>

        {/* Menu Shortcut */}
        <TouchableOpacity style={styles.menuBar} onPress={onManageMenu}>
          <Text style={styles.menuBarText}>Manage Menu Items</Text>
          <Text style={styles.menuBarText}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            style={{backgroundColor: '#FF9800', padding: 15, borderRadius: 10, marginTop: 10, alignItems: 'center'}} 
            onPress={onTrackOrder}
        >
            <Text style={{color: 'white', fontWeight: 'bold'}}>🚴 Live Tracking Demo</Text>
        </TouchableOpacity>

        {/* Reviews Section */}
        <View style={styles.section}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
            <Text style={styles.sectionTitle}>⭐ Customer Reviews</Text>
            
            {/* Clicking this opens the Parent Modal (View All) */}
            <TouchableOpacity onPress={onShowRestaurantReviews}>
              <Text style={{color: '#2196F3', fontWeight: 'bold'}}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* LOADING STATE */}
          {loadingReviews ? (
             <ActivityIndicator size="small" color="#999" />
          ) : (
            <>
              {/* SHOW PREVIEW: Map over 'previewReviews' instead of 'restaurant.reviews' */}
              {previewReviews.length > 0 ? (
                previewReviews.slice(0, 3).map((review, index) => ( // Only show top 3
                  <View key={review.id || index} style={styles.reviewCard}>
                    <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                      <Text style={{fontWeight:'bold'}}>
                          {review.user || 'Anonymous'} ({review.rating}/5)
                      </Text>
                      {/* Optional: Add date here if available */}
                    </View>
                    <Text numberOfLines={2} style={styles.reviewText}>{review.text}</Text>
                  </View>
                ))
              ) : (
                <Text style={{fontStyle:'italic', color:'#888'}}>No reviews yet.</Text>
              )}
            </>
          )}
        </View>
        
      </ScrollView>

      {/* QR MODAL */}
      <Modal visible={qrModalVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Scan to Connect</Text>
                  <View style={{borderWidth: 1, borderColor: '#eee', padding: 10, borderRadius: 10}}>
                    <QRCode value={`WIFI:S:${wifiSSID};T:WPA;P:${wifiPass};;`} size={200} />
                  </View>
                  <Text style={styles.modalSub}>{wifiSSID}</Text>
                  <TouchableOpacity onPress={() => setQrModalVisible(false)} style={styles.closeBtn}>
                      <Text style={{color: 'white', fontWeight: 'bold'}}>Close</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>

      {/* <ReviewsModal 
        visible={reviewModalVisible} 
        onClose={() => setReviewModalVisible(false)}
        reviews={reviews}
        title={`Reviews for ${restaurant.name}`}
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 40 },
  backBtn: { marginTop: 30, marginBottom: 15 },
  backText: { color: '#2196F3', fontWeight: 'bold', fontSize: 16 },
  
  // Header
  headerCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, elevation: 2, marginBottom: 15 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 4 },

  // General Section
  section: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  infoText: { fontSize: 15, color: '#555', marginBottom: 8 },
  linkText: { color: '#2196F3', fontWeight: '600' },

  // Map
  mapBox: { height: 180, borderRadius: 8, marginTop: 5, overflow: 'hidden', backgroundColor: '#eee', borderWidth: 1, borderColor: '#ddd' },
  centerPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Wi-Fi
  wifiRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9f9f9', padding: 12, borderRadius: 10 },
  wifiName: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  wifiPass: { color: '#666', marginTop: 2 },
  qrThumbnail: { alignItems: 'center', justifyContent: 'center', padding: 5, backgroundColor: 'white', borderRadius: 8, elevation: 1 },

  // Menu Button
  menuBar: { backgroundColor: '#333', padding: 18, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, elevation: 3 },
  menuBarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // Reviews
  reviewCard: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 12 },
  reviewText: { color: '#555', marginTop: 5, lineHeight: 20 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', padding: 30, borderRadius: 20, alignItems: 'center', width: '85%' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  modalSub: { marginTop: 15, fontSize: 18, fontWeight: '600', color: '#333' },
  closeBtn: { marginTop: 25, backgroundColor: 'black', paddingHorizontal: 40, paddingVertical: 12, borderRadius: 25 }
});