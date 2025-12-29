import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

export default function RestaurantForm({ initialData, onSave, onCancel }) {
  
  // 1. Initialize State matching Backend Schema
  const [formData, setFormData] = useState({
    // If editing, preserve the ID
    id: initialData?.id || null, 
    
    // Text Fields
    name: initialData?.name || '',
    res_type: initialData?.res_type || '',
    cuisine: initialData?.cuisine || '',
    
    // Location vs Address
    location: initialData?.location || '', // e.g. "Mumbai"
    address: initialData?.address || '',   // e.g. "123 Street Name"
    
    // Contact
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    website: initialData?.website || '',
    
    // WiFi (Flattened to match Backend)
    // Checks for new backend format (wifi_ssid) OR old mock format (wifi.ssid)
    wifi_ssid: initialData?.wifi_ssid || initialData?.wifi?.ssid || '',
    wifi_password: initialData?.wifi_password || initialData?.wifi?.pass || ''
  });

  const handleSave = () => {
    // Basic validation
    if (!formData.name || !formData.res_type) {
      alert("Name and Type are required!");
      return;
    }
    // Pass the flat object directly to App.js
    onSave(formData);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>{initialData ? 'Edit Restaurant' : 'Add New Restaurant'}</Text>

        {/* --- BASIC INFO --- */}
        <Text style={styles.label}>Restaurant Name *</Text>
        <TextInput 
          style={styles.input} 
          value={formData.name} 
          onChangeText={(txt) => setFormData({...formData, name: txt})} 
          placeholder="e.g. Spice Garden"
        />

        <View style={styles.row}>
          <View style={{flex: 1, marginRight: 10}}>
            <Text style={styles.label}>Type *</Text>
            <TextInput 
              style={styles.input} 
              value={formData.res_type} 
              onChangeText={(txt) => setFormData({...formData, res_type: txt})} 
              placeholder="e.g. Cafe"
            />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.label}>Cuisine</Text>
            <TextInput 
              style={styles.input} 
              value={formData.cuisine} 
              onChangeText={(txt) => setFormData({...formData, cuisine: txt})} 
              placeholder="e.g. Italian"
            />
          </View>
        </View>

        {/* --- LOCATION --- */}
        <Text style={styles.label}>City / Location</Text>
        <TextInput 
          style={styles.input} 
          value={formData.location} 
          onChangeText={(txt) => setFormData({...formData, location: txt})} 
          placeholder="e.g. Bandra, Mumbai"
        />

        <Text style={styles.label}>Full Address</Text>
        <TextInput 
          style={[styles.input, {height: 60}]} 
          multiline 
          value={formData.address} 
          onChangeText={(txt) => setFormData({...formData, address: txt})} 
          placeholder="e.g. Shop 4, Main Street..."
        />

        {/* --- CONTACT --- */}
        <Text style={styles.label}>Phone Number</Text>
        <TextInput 
          style={styles.input} 
          keyboardType="phone-pad"
          value={formData.phone} 
          onChangeText={(txt) => setFormData({...formData, phone: txt})} 
        />

        <View style={styles.row}>
          <View style={{flex: 1, marginRight: 10}}>
            <Text style={styles.label}>Email</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email} 
              onChangeText={(txt) => setFormData({...formData, email: txt})} 
            />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.label}>Website</Text>
            <TextInput 
              style={styles.input} 
              autoCapitalize="none"
              value={formData.website} 
              onChangeText={(txt) => setFormData({...formData, website: txt})} 
            />
          </View>
        </View>

        {/* --- WIFI --- */}
        <Text style={styles.sectionHeader}>WiFi Setup</Text>
        <View style={styles.wifiBox}>
            <Text style={styles.label}>WiFi Name (SSID)</Text>
            <TextInput 
            style={styles.input} 
            value={formData.wifi_ssid} 
            onChangeText={(txt) => setFormData({...formData, wifi_ssid: txt})} 
            placeholder="Network Name"
            />

            <Text style={styles.label}>WiFi Password</Text>
            <TextInput 
            style={styles.input} 
            value={formData.wifi_password} 
            onChangeText={(txt) => setFormData({...formData, wifi_password: txt})} 
            placeholder="Network Password"
            />
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
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});