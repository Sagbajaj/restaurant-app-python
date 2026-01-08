import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function RestaurantForm({ initialData, onSave, onCancel }) {
  
 
  // --- STATE ---
  const [formData, setFormData] = useState({
    id: null, name: '', res_type: '', cuisine: '', address: '', phone: '', email: '', website: '', wifi_ssid: '', wifi_password: ''
  });

  const [mapRegion, setMapRegion] = useState({
    latitude: 19.0760, longitude: 72.8777, latitudeDelta: 0.005, longitudeDelta: 0.005,
  });

  const [loadingLocation, setLoadingLocation] = useState(false);

  // --- EFFECT: Handle Edit vs Create Mode ---
  useEffect(() => {
    if (initialData) {
      // EDIT MODE: Populate fields
      setFormData({
        id: initialData.id,
        name: initialData.name || '',
        res_type: initialData.res_type || '',
        cuisine: initialData.cuisine || '',
        address: initialData.address || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        website: initialData.website || '',
        wifi_ssid: initialData.wifi_ssid || initialData.wifi?.ssid || '',
        wifi_password: initialData.wifi_password || initialData.wifi?.pass || ''
      });

      // Update Map to the existing location
      const coords = getInitialCoords(initialData.location);
      setMapRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });

    } else {
      // CREATE MODE: Reset fields
      setFormData({
        id: null, name: '', res_type: '', cuisine: '', address: '', phone: '', email: '', website: '', wifi_ssid: '', wifi_password: ''
      });
    }
  }, [initialData]);
 // Helper to parse coordinates
 const getInitialCoords = (locString) => {
  if (!locString) return { latitude: 19.0760, longitude: 72.8777 }; // Default: Mumbai
  const parts = locString.split(',');
  if (parts.length === 2 && !isNaN(parts[0])) {
    return { latitude: parseFloat(parts[0]), longitude: parseFloat(parts[1]) };
  }
  return { latitude: 19.0760, longitude: 72.8777 };
};


  // --- FEATURE: GET CURRENT LOCATION ---
  const handleGetCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access to use this feature.');
        setLoadingLocation(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not fetch location. Ensure GPS is on.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.res_type) {
      Alert.alert("Error", "Name and Type are required!");
      return;
    }

    const locationString = `${mapRegion.latitude},${mapRegion.longitude}`;
    const finalData = { ...formData, location: locationString };

    onSave(finalData);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>
            {formData.id ? 'Edit Restaurant' : 'Add New Restaurant'}
        </Text>

        <Text style={styles.label}>Restaurant Name *</Text>
        <TextInput 
          style={styles.input} 
          value={formData.name} 
          onChangeText={(txt) => setFormData(prev => ({...prev, name: txt}))} 
          placeholder="e.g. Spice Garden"
        />

        <View style={styles.row}>
          <View style={{flex: 1, marginRight: 10}}>
            <Text style={styles.label}>Type *</Text>
            <TextInput style={styles.input} value={formData.res_type} onChangeText={(txt) => setFormData(prev => ({...prev, res_type: txt}))} placeholder="e.g. Cafe"/>
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.label}>Cuisine</Text>
            <TextInput style={styles.input} value={formData.cuisine} onChangeText={(txt) => setFormData(prev => ({...prev, cuisine: txt}))} placeholder="e.g. Italian"/>
          </View>
        </View>

        <Text style={styles.label}>Full Address</Text>
        <TextInput style={[styles.input, {height: 60}]} multiline value={formData.address} onChangeText={(txt) => setFormData(prev => ({...prev, address: txt}))} />

        {/* --- MAP PICKER SECTION --- */}
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5}}>
            <Text style={styles.label}>Pin Location</Text>
            
            {/* GPS BUTTON IS HERE */}
            <TouchableOpacity onPress={handleGetCurrentLocation} style={styles.gpsBtn}>
                {loadingLocation ? (
                    <ActivityIndicator size="small" color="#2196F3" />
                ) : (
                    <Text style={styles.gpsText}>📍 Use Current Location</Text>
                )}
            </TouchableOpacity>
        </View>

        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={mapRegion}
            onRegionChangeComplete={(region) => setMapRegion(region)}
          >
            <Marker coordinate={mapRegion} />
          </MapView>
          <View pointerEvents="none" style={styles.centerMarker}>
             <Text style={{fontSize: 30, paddingBottom: 35}}>📍</Text>
          </View>
        </View>
        <Text style={styles.hintText}>Drag map to position pin.</Text>

        {/* --- CONTACT INFO --- */}
        <Text style={styles.label}>Phone Number</Text>
        <TextInput style={styles.input} keyboardType="phone-pad" value={formData.phone} onChangeText={(txt) => setFormData(prev => ({...prev, phone: txt}))} />

        <View style={styles.row}>
            <View style={{flex: 1, marginRight: 10}}>
                <Text style={styles.label}>Email</Text>
                <TextInput style={styles.input} keyboardType="email-address" autoCapitalize="none" value={formData.email} onChangeText={(txt) => setFormData(prev => ({...prev, email: txt}))} />
            </View>
            <View style={{flex: 1}}>
                <Text style={styles.label}>Website</Text>
                <TextInput style={styles.input} autoCapitalize="none" value={formData.website} onChangeText={(txt) => setFormData(prev => ({...prev, website: txt}))} />
            </View>
        </View>

        {/* --- WIFI --- */}
        <Text style={styles.sectionHeader}>WiFi Setup (Optional)</Text>
        <View style={styles.wifiBox}>
            <Text style={styles.label}>WiFi Name (SSID)</Text>
            <TextInput style={styles.input} value={formData.wifi_ssid} onChangeText={(txt) => setFormData(prev => ({...prev, wifi_ssid: txt}))} />

            <Text style={styles.label}>WiFi Password</Text>
            <TextInput style={styles.input} value={formData.wifi_password} onChangeText={(txt) => setFormData(prev => ({...prev, wifi_password: txt}))} />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.btnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.btnText}>Save Restaurant</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 20, paddingBottom: 50 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 10, color: '#444' },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16, backgroundColor: '#f9f9f9' },
  row: { flexDirection: 'row' },
  wifiBox: { padding: 15, backgroundColor: '#f0f4f8', borderRadius: 10, marginBottom: 20 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  saveBtn: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, flex: 0.6, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#f44336', padding: 15, borderRadius: 8, flex: 0.35, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  
  // Map
  mapContainer: { height: 200, borderRadius: 10, overflow: 'hidden', marginBottom: 5, position: 'relative', borderWidth: 1, borderColor: '#eee' },
  map: { width: '100%', height: '100%' },
  centerMarker: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  hintText: { fontSize: 12, color: '#888', textAlign: 'center', marginBottom: 15 },
  
  // GPS Button
  gpsBtn: { flexDirection: 'row', alignItems: 'center', padding: 5, backgroundColor: '#E3F2FD', borderRadius: 5 },
  gpsText: { color: '#2196F3', fontWeight: 'bold', fontSize: 12 },
});