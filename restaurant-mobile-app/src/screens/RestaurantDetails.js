import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function RestaurantDetails({ restaurant, onBack, onManageMenu, onDeleteReview }) {
  
  // Safety Check: If data hasn't loaded yet, don't render anything
  if (!restaurant) return null;

  // 1. Handle Reviews safely (default to empty array if null)
  const reviews = restaurant?.reviews || [];

  // 2. Handle WiFi (Support both Python Backend 'wifi_ssid' and old mock 'wifi.ssid')
  const wifiSSID = restaurant?.wifi_ssid || restaurant?.wifi?.ssid || 'Not Configured';
  const wifiPass = restaurant?.wifi_password || restaurant?.wifi?.pass || 'N/A';

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backText}>← Back to Admin</Text>
      </TouchableOpacity>

      {/* Header Info */}
      <View style={styles.headerCard}>
        {/* Use ?. to safely access properties */}
        <Text style={styles.title}>{restaurant?.name || 'Unknown Name'}</Text>
        <Text style={styles.subtitle}>
          {restaurant?.res_type || 'Type N/A'} • {restaurant?.cuisine || 'Cuisine N/A'}
        </Text>
        <Text style={styles.meta}>
          ID: {restaurant?.id} | Created: {restaurant?.createdAt || 'N/A'}
        </Text>
      </View>

      {/* Contact & Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Contact & Address</Text>
        
        {/* Fallback text if data is missing */}
        <Text style={styles.infoText}>Address: {restaurant?.address || 'Not provided'}</Text>
        <Text style={styles.infoText}>Phone: {restaurant?.phone || 'Not provided'}</Text>
        <Text style={styles.infoText}>Email: {restaurant?.email || 'Not provided'}</Text>
        
        <View style={styles.mapBox}>
            <Text style={{color:'#999'}}>Google Map Placeholder</Text>
        </View>
      </View>

      {/* WiFi Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📶 WiFi Management</Text>
        <View style={styles.wifiRow}>
          <View>
            <Text style={{fontWeight: 'bold'}}>SSID: {wifiSSID}</Text>
            <Text>Pass: {wifiPass}</Text>
          </View>
          <View style={styles.qrCode}>
            <Text style={{fontSize: 8, color:'white'}}>QR</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.editLink}>
            <Text style={{color:'blue'}}>+ Update WiFi Details</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Shortcut */}
      <TouchableOpacity style={styles.menuBar} onPress={onManageMenu}>
        <Text style={styles.menuBarText}>Manage Menu Items</Text>
        <Text style={styles.menuBarText}>→</Text>
      </TouchableOpacity>

      {/* Reviews Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⭐ Customer Reviews</Text>
        
        {/* Check if reviews array exists and has items */}
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            // Use index as key fallback if review.id is missing
            <View key={review?.id || index} style={styles.reviewCard}>
              <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                <Text style={{fontWeight:'bold'}}>
                    {review?.user || 'Anonymous'} ({review?.rating || 0}/5)
                </Text>
                <TouchableOpacity onPress={() => onDeleteReview(restaurant.id, review.id)}>
                  <Text style={{color:'red', fontSize:12}}>Delete</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.reviewText}>{review?.text || 'No comment'}</Text>
            </View>
          ))
        ) : (
          <Text style={{fontStyle:'italic', color:'#888'}}>No reviews yet.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 15 },
  backBtn: { marginTop: 30, marginBottom: 15 },
  backText: { color: '#2196F3', fontWeight: 'bold' },
  headerCard: { backgroundColor: '#fff', padding: 20, borderRadius: 10, elevation: 2, marginBottom: 15 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 4 },
  meta: { fontSize: 11, color: '#999', marginTop: 8 },
  section: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 1 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  infoText: { fontSize: 14, color: '#444', marginBottom: 5 },
  mapBox: { height: 100, backgroundColor: '#eee', borderRadius: 8, marginTop: 10, justifyContent: 'center', alignItems: 'center' },
  wifiRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0f0f0', padding: 10, borderRadius: 8 },
  qrCode: { width: 40, height: 40, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
  editLink: { marginTop: 10 },
  menuBar: { backgroundColor: '#333', padding: 18, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  menuBarText: { color: '#fff', fontWeight: 'bold' },
  reviewCard: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 10 },
  reviewText: { color: '#555', marginTop: 4 }
});