import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function LoginScreen({ onLogin, onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const handleLogin = async (e) => {
    // 1. STOP THE BROWSER from refreshing/submitting the form automatically
    if (e && e.preventDefault) { 
      e.preventDefault(); 
    }

    // Basic validation
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }

    try {
      // 2. CLEAN URL: Remove "?username=..." from the end. 
      // Only send the base URL.
      const response = await fetch('https://restaurant-app-python.onrender.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // 3. Body sends the data (JSON)
        body: JSON.stringify({
          username: username,
          password: password
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log("Login Success:", data);
        onLogin(data.username, data.password); 
      } else {
        // Log the error to see exactly what the server says
        console.log("Server Error:", data);
        Alert.alert('Login Failed', data.detail || 'Invalid credentials');
      }
    } catch (error) {
      console.error("Network Error:", error);
      Alert.alert('Error', 'Could not connect to server');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Portal</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Username" 
        value={username} onChangeText={setUsername} 
        autoCapitalize="none"
      />
      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        secureTextEntry 
        value={password} onChangeText={setPassword} 
      />
      
      <TouchableOpacity style={styles.btn} onPress={(e) => handleLogin(e)}>
        <Text style={styles.btnText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.link} onPress={onBack}>
        <Text style={styles.linkText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16 },
  btn: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#2196F3', fontSize: 16 }
}); 