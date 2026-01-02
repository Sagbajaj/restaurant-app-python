import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Linking, Platform } from 'react-native';
// USE YOUR SAFEMAP TO PREVENT WEB CRASHES
import MapView, { Marker } from 'react-native-maps';
import QRCode from 'react-native-qrcode-svg';

export default function RestaurantDetails({ restaurant, onBack, onManageMenu, onDeleteReview }) {
  const [qrModalVisible, setQrModalVisible] = useState(false);

  // Safety check to prevent crash if data is missing
  if (!restaurant) return null;

  const reviews = restaurant.reviews || [];
  const wifiSSID = restaurant.wifi_ssid || restaurant.wifi?.ssid;
  const wifiPass = restaurant.wifi_password || restaurant.wifi?.pass;

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

        {/* Reviews Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ Customer Reviews</Text>
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <View key={review.id || index} style={styles.reviewCard}>
                <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                  <Text style={{fontWeight:'bold'}}>
                      {review.user || 'Anonymous'} ({review.rating || 0}/5)
                  </Text>
                  <TouchableOpacity onPress={() => onDeleteReview(restaurant.id, review.id)}>
                    <Text style={{color:'red', fontSize:12}}>Delete</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.reviewText}>{review.text || 'No comment'}</Text>
              </View>
            ))
          ) : (
            <Text style={{fontStyle:'italic', color:'#888'}}>No reviews yet.</Text>
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