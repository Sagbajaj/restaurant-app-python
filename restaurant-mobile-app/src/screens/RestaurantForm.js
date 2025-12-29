import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

export default function RestaurantForm({ initialData, onSave, onCancel }) {
  // If initialData exists, we are EDITING; otherwise, we are ADDING
  const [formData, setFormData] = useState(initialData || {
    name: '',
    res_type: '',
    cuisine: '',
    location: '',
    phone: '',
    email: '',
    website: '',
    wifi: { ssid: '', pass: '' }
  });

  const handleSave = () => {
    // Basic validation
    if (!formData.name || !formData.res_type) return;
    onSave(formData);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>{initialData ? 'Edit Restaurant' : 'Add New Restaurant'}</Text>

        <Text style={styles.label}>Restaurant Name</Text>
        <TextInput 
          style={styles.input} 
          value={formData.name} 
          onChangeText={(txt) => setFormData({...formData, name: txt})} 
        />

        <View style={styles.row}>
          <View style={{flex: 1, marginRight: 10}}>
            <Text style={styles.label}>Type (e.g. Cafe)</Text>
            <TextInput 
              style={styles.input} 
              value={formData.res_type} 
              onChangeText={(txt) => setFormData({...formData, res_type: txt})} 
            />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.label}>Cuisine</Text>
            <TextInput 
              style={styles.input} 
              value={formData.cuisine} 
              onChangeText={(txt) => setFormData({...formData, cuisine: txt})} 
            />
          </View>
        </View>

        <Text style={styles.label}>Address</Text>
        <TextInput 
          style={[styles.input, {height: 80}]} 
          multiline 
          value={formData.location} 
          onChangeText={(txt) => setFormData({...formData, location: txt})} 
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput 
          style={styles.input} 
          keyboardType="phone-pad"
          value={formData.phone} 
          onChangeText={(txt) => setFormData({...formData, phone: txt})} 
        />

        <Text style={styles.label}>WiFi SSID</Text>
        <TextInput 
          style={styles.input} 
          value={formData.wifi.ssid} 
          onChangeText={(txt) => setFormData({...formData, wifi: {...formData.wifi, ssid: txt}})} 
        />

        <Text style={styles.label}>WiFi Password</Text>
        <TextInput 
          style={styles.input} 
          value={formData.wifi.pass} 
          onChangeText={(txt) => setFormData({...formData, wifi: {...formData.wifi, pass: txt}})} 
        />

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
  scrollContent: { padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
  row: { flexDirection: 'row' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  saveBtn: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, flex: 0.6, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#f44336', padding: 15, borderRadius: 8, flex: 0.35, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold' }
});