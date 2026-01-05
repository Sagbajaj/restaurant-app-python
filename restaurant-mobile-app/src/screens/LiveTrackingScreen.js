import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker } from '../components/SafeMap'; // Uses your SafeMap
import { Ionicons } from '@expo/vector-icons'; // Ensure you have this installed or use emoji

export default function LiveTrackingScreen({ route, navigation }) {
  // Use data passed from previous screen, or defaults for testing
  const { restaurant } = route.params || {};
  const orderId = "test_order_1"; // Hardcoded ID for simulation

  // 1. Initial State (Pune, India default)
  const startLoc = { 
    latitude: restaurant?.latitude || 18.5204, 
    longitude: restaurant?.longitude || 73.8567 
  };

  const [driverLoc, setDriverLoc] = useState(startLoc);
  const [status, setStatus] = useState("Connecting...");
  
  // WebSocket Reference
  const ws = useRef(null);

  useEffect(() => {
    // 2. CONNECT TO WEBSOCKET
    // Replace with your Render URL (wss://...) or Local IP (ws://192.168.x.x:8000)
    const wsUrl = `wss://restaurant-app-python.onrender.com/ws/track/${orderId}`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => setStatus("🟢 Live Connection Open");
    ws.current.onclose = () => setStatus("🔴 Connection Closed");
    ws.current.onerror = (e) => console.log(e);

    // 3. LISTEN FOR UPDATES (Customer Logic)
    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.latitude && data.longitude) {
        setDriverLoc({
            latitude: data.latitude,
            longitude: data.longitude
        });
      }
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  // 4. SIMULATE DRIVER MOVEMENT (Driver Logic)
  // This function simulates the Driver App sending GPS updates
  const simulateDriverMove = () => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      Alert.alert("Error", "Socket not connected");
      return;
    }

    // Move slightly North-East each click
    const newLat = driverLoc.latitude + 0.0005; 
    const newLng = driverLoc.longitude + 0.0005;

    const payload = {
      latitude: newLat,
      longitude: newLng,
      role: "DRIVER"
    };

    // Send to Server
    ws.current.send(JSON.stringify(payload));
  };

  return (
    <View style={styles.container}>
      {/* Header / Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={{color:'white', fontWeight:'bold'}}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.statusBox}>
        <Text style={styles.statusText}>{status}</Text>
        <Text style={{fontSize:10, color:'#ddd'}}>Order ID: {orderId}</Text>
      </View>

      <MapView
        style={styles.map}
        region={{
          ...driverLoc, // Keep map centered on driver
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* Restaurant Marker (Static) */}
        <Marker coordinate={startLoc} title="Restaurant" pinColor="red" />

        {/* Driver Marker (Moving) */}
        <Marker coordinate={driverLoc} title="Driver" pinColor="blue">
            {/* Custom Icon View */}
            <View style={{backgroundColor:'blue', padding:5, borderRadius:15}}>
                <Text style={{fontSize:15}}>🚴</Text>
            </View>
        </Marker>
      </MapView>

      {/* SIMULATION CONTROLS */}
      <View style={styles.controlPanel}>
        <Text style={styles.controlTitle}>Simulation Controls</Text>
        <Text style={styles.controlSub}>Click to act as the Driver and move the bike.</Text>
        
        <TouchableOpacity style={styles.moveBtn} onPress={simulateDriverMove}>
            <Text style={styles.btnText}>🚴 Move Driver (Send GPS)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  backBtn: { position: 'absolute', top: 40, left: 20, zIndex: 10, backgroundColor: 'black', padding: 10, borderRadius: 8 },
  statusBox: { position: 'absolute', top: 40, right: 20, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.7)', padding: 10, borderRadius: 8 },
  statusText: { color: 'white', fontWeight: 'bold' },
  
  controlPanel: { height: 160, backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 10 },
  controlTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  controlSub: { color: '#666', marginBottom: 15 },
  moveBtn: { backgroundColor: '#2196F3', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});