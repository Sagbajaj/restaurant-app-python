import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert 
} from 'react-native';
// Import Ionicons (works in Expo standard or react-native-vector-icons)
import { Ionicons } from '@expo/vector-icons'; 

export default function LoginScreen({ onLogin, onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // 1. New State for toggling password visibility
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = async (e) => {
    if (e && e.preventDefault) { 
      e.preventDefault(); 
    }

    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }

    try {
      const response = await fetch('https://restaurant-app-python.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log("Login Success:", data);
        onLogin(data.username, data.password); 
      } else {
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
      
      {/* Username Input (Unchanged) */}
      <TextInput 
        style={styles.input} 
        placeholder="Username" 
        value={username} 
        onChangeText={setUsername} 
        autoCapitalize="none"
      />

      {/* 2. Password Input Wrapper */}
      <View style={styles.passwordContainer}>
        <TextInput 
          style={styles.passwordInput} 
          placeholder="Password" 
          // 3. Toggle secureTextEntry based on state
          secureTextEntry={!isPasswordVisible} 
          value={password} 
          onChangeText={setPassword} 
        />
        
        {/* 4. The Eye Icon Button */}
        <TouchableOpacity 
          style={styles.eyeIcon} 
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          <Ionicons 
            name={isPasswordVisible ? 'eye' : 'eye-off'} 
            size={24} 
            color="gray" 
          />
        </TouchableOpacity>
      </View>
      
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
  
  // Standard Input Style
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 15, 
    fontSize: 16 
  },

  // 5. New Styles for the Password Container
  passwordContainer: {
    flexDirection: 'row', // Aligns input and icon horizontally
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff', // Ensures background matches
  },
  passwordInput: {
    flex: 1, // Takes up remaining space
    padding: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10, // Adds touch area around the icon
  },

  btn: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#2196F3', fontSize: 16 }
});