import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const getCoords = (locString) => {
  if (!locString) return { latitude: 19.0760, longitude: 72.8777 }; // Default
  const parts = locString.split(',');
  if (parts.length === 2 && !isNaN(parts[0])) {
    return { latitude: parseFloat(parts[0]), longitude: parseFloat(parts[1]) };
  }
  return { latitude: 19.0760, longitude: 72.8777 }; // Fallback
};

export default function LiveTrackingScreen({ route, navigation }) {
  const { restaurant } = route.params || {};
  const orderId = "test_order_1"; 

  // --- HELPER: Parse "lat,long" string ---
 

  // 1. Get correct start location from the string
  const startLoc = getCoords(restaurant?.location);

  const [driverLoc, setDriverLoc] = useState(startLoc);
  const [status, setStatus] = useState("Connecting...");
  

  const ws = useRef(null);

  useEffect(() => {
    // 2. CONNECT TO WEBSOCKET
    // Ensure this URL matches your backend
    const wsUrl = `wss://restaurant-app-python.onrender.com/ws/track/${orderId}`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => setStatus("🟢 Live Connection Open");
    ws.current.onclose = () => setStatus("🔴 Connection Closed");
    ws.current.onerror = (e) => console.log("WebSocket Error:", e.message);

    ws.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.latitude && data.longitude) {
          setDriverLoc({
              latitude: data.latitude,
              longitude: data.longitude
          });
        }
      } catch (err) {
        console.log("Error parsing WS data");
      }
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  

  const simulateDriverMove = () => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      Alert.alert("Error", "Socket not connected");
      return;
    }

    // Move slightly (Simulate movement)
    const newLat = driverLoc.latitude + 0.0005; 
    const newLng = driverLoc.longitude + 0.0005;

    const payload = {
      latitude: newLat,
      longitude: newLng,
      role: "DRIVER"
    };

    ws.current.send(JSON.stringify(payload));
  };



  return (
  

    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={{color:'white', fontWeight:'bold'}}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.statusBox}>
        <Text style={styles.statusText}>{status}</Text>
      </View>

      <MapView
        style={styles.map}
        // region={{
        //   ...driverLoc,
        //   latitudeDelta: 0.01,
        //   longitudeDelta: 0.01,
        // }}
      >
        {/* <Marker coordinate={startLoc} title="Restaurant" pinColor="red" /> */}
        
        {/* Driver Marker */}
        {/* <Marker coordinate={driverLoc} title="Driver" pinColor="blue">
            <View style={{backgroundColor:'white', padding:5, borderRadius:10, borderWidth:1, borderColor:'blue'}}>
                <Text>🚴</Text>
            </View>
        </Marker> */}
      </MapView>

      <View style={styles.controlPanel}>
        <Text style={styles.controlTitle}>Simulation Controls</Text>
        <TouchableOpacity style={styles.moveBtn} onPress={simulateDriverMove}>
            <Text style={styles.btnText}>🚴 Move Driver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10, backgroundColor: 'black', padding: 10, borderRadius: 8 },
  statusBox: { position: 'absolute', top: 50, right: 20, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.7)', padding: 10, borderRadius: 8 },
  statusText: { color: 'white', fontWeight: 'bold' },
  controlPanel: { height: 120, backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 10 },
  controlTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  moveBtn: { backgroundColor: '#2196F3', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold' }
});