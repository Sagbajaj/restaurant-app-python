import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

// ⚠️ KEEP YOUR API KEY HERE

export default function LiveTrackingScreen({ route, navigation }) {
  const { restaurant } = route.params || {};
  const orderId = "demo_order_1"; 
  
  // 1. LOCATIONS
  const startLoc = { 
    latitude: parseFloat(restaurant?.location?.split(',')[0] || 19.0760), 
    longitude: parseFloat(restaurant?.location?.split(',')[1] || 72.8777) 
  };

  // 2. STATE
  const [driverLoc, setDriverLoc] = useState(startLoc);
  const [customerLoc, setCustomerLoc] = useState({ // Default slightly away
    latitude: startLoc.latitude + 0.01,
    longitude: startLoc.longitude + 0.01
  });
  
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [status, setStatus] = useState("Select Delivery Location");
  
  const [isSelecting, setIsSelecting] = useState(true); // <--- NEW: Selection Mode
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  
  const ws = useRef(null);
  const mapRef = useRef(null);
  const animationRef = useRef(null);

  // 3. WEBSOCKET SETUP
  useEffect(() => {
    const wsUrl = `wss://restaurant-app-python.onrender.com/ws/track/${orderId}`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => console.log("WS Connected");
    ws.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.latitude && data.longitude) {
            setDriverLoc({ latitude: data.latitude, longitude: data.longitude });
        }
      } catch (err) {}
    };

    return () => {
      if (ws.current) ws.current.close();
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, []);

  // --- 4. FETCH ROUTE (Only after confirmation) ---
  const handleConfirmLocation = async () => {
    setIsSelecting(false); // Lock the pin
    setIsLoadingRoute(true);
    setStatus("Calculating Route...");

    try {
      const origin = `${startLoc.latitude},${startLoc.longitude}`;
      const destination = `${customerLoc.latitude},${customerLoc.longitude}`;
      
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_API_KEY}&mode=driving`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.routes.length) {
        const points = decodePolyline(data.routes[0].overview_polyline.points);
        setRouteCoordinates(points);
        setStatus("Ready to Drive");
        
        // Zoom to fit entire route
        setTimeout(() => {
            mapRef.current?.fitToCoordinates(points, {
                edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
                animated: true
            });
        }, 500);
      } else {
        Alert.alert("Error", "No route found (Try a closer location)");
        setIsSelecting(true); // Go back to selection mode
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch directions");
      setIsSelecting(true);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  // --- 5. SIMULATION LOGIC ---
  const startSimulation = async () => {
    setStatus("🚀 Driving...");
    
    for (let i = 0; i < routeCoordinates.length - 1; i++) {
        const p1 = routeCoordinates[i];
        const p2 = routeCoordinates[i+1];
        const heading = getBearing(p1, p2);

        await new Promise(resolve => {
            let step = 0;
            const steps = 10;
            
            animationRef.current = setInterval(() => {
                step++;
                const fraction = step / steps;
                
                const lat = p1.latitude + (p2.latitude - p1.latitude) * fraction;
                const lng = p1.longitude + (p2.longitude - p1.longitude) * fraction;

                const payload = { latitude: lat, longitude: lng, heading: heading, role: "DRIVER" };

                setDriverLoc({ latitude: lat, longitude: lng });
                if (ws.current?.readyState === WebSocket.OPEN) {
                    ws.current.send(JSON.stringify(payload));
                }

                if (step >= steps) {
                    clearInterval(animationRef.current);
                    resolve();
                }
            }, 50);
        });
    }
    setStatus("✅ Delivered!");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={{color:'white', fontWeight:'bold'}}>← Back</Text>
      </TouchableOpacity>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{ ...startLoc, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
        // Update customer location as user drags map (ONLY in selection mode)
        onRegionChangeComplete={(region) => {
            if (isSelecting) {
                setCustomerLoc({ latitude: region.latitude, longitude: region.longitude });
            }
        }}
      >
        <Marker coordinate={startLoc} title="Restaurant" pinColor="red" />
        
        {/* DRIVER (Visible only after simulation starts) */}
        {!isSelecting && (
             <Marker coordinate={driverLoc} anchor={{x: 0.5, y: 0.5}}>
                <View style={styles.driverMarker}><Text style={{fontSize:20}}>🛵</Text></View>
             </Marker>
        )}

        {/* CUSTOMER (Visible when locked) */}
        {!isSelecting && <Marker coordinate={customerLoc} pinColor="green" />}

        {/* ROUTE LINE */}
        {!isSelecting && routeCoordinates.length > 0 && (
            <Polyline coordinates={routeCoordinates} strokeColor="#4285F4" strokeWidth={4} />
        )}
      </MapView>

      {/* CENTER PIN (Target) - Only visible during selection */}
      {isSelecting && (
        <View pointerEvents="none" style={styles.centerTarget}>
             <Text style={{fontSize: 40, color: 'green', paddingBottom: 40}}>📍</Text>
        </View>
      )}

      {/* CONTROL PANEL */}
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{status}</Text>
        
        {isSelecting ? (
            <View>
                <Text style={{color:'#666', marginBottom:10}}>Drag map to place pin on customer location.</Text>
                <TouchableOpacity style={[styles.btn, {backgroundColor: 'black'}]} onPress={handleConfirmLocation}>
                    <Text style={styles.btnText}>📍 Confirm Location</Text>
                </TouchableOpacity>
            </View>
        ) : (
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                {isLoadingRoute ? (
                    <ActivityIndicator size="small" color="blue" />
                ) : (
                    <>
                        <TouchableOpacity style={[styles.btn, {backgroundColor: '#ccc'}]} onPress={() => setIsSelecting(true)}>
                            <Text style={{color:'black'}}>Reset</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btn} onPress={startSimulation}>
                            <Text style={styles.btnText}>▶ Start Drive</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        )}
      </View>
    </View>
  );
}

// --- UTILS ---
const decodePolyline = (t,e)=>{for(var n,o,u=0,l=0,r=0,d=[],h=0,i=0,a=null,c=Math.pow(10,e||5);u<t.length;){a=null,h=0,i=0;do{a=t.charCodeAt(u++)-63,i|=(31&a)<<h,h+=5}while(a>=32);n=1&i?~(i>>1):i>>1,h=i=0;do{a=t.charCodeAt(u++)-63,i|=(31&a)<<h,h+=5}while(a>=32);o=1&i?~(i>>1):i>>1,l+=n,r+=o,d.push({latitude:l/c,longitude:r/c})}return d};

const getBearing = (start, end) => {
    const startLat = start.latitude * Math.PI / 180;
    const startLng = start.longitude * Math.PI / 180;
    const endLat = end.latitude * Math.PI / 180;
    const endLng = end.longitude * Math.PI / 180;
    const y = Math.sin(endLng - startLng) * Math.cos(endLat);
    const x = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);
    const θ = Math.atan2(y, x);
    return (θ * 180 / Math.PI + 360) % 360;
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10, backgroundColor: 'black', padding: 10, borderRadius: 8 },
  panel: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 10 },
  panelTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  btn: { backgroundColor: '#2196F3', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold' },
  driverMarker: { backgroundColor: 'white', padding: 5, borderRadius: 50, borderWidth: 2, borderColor: '#2196F3', elevation: 5 },
  centerTarget: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 5 }
});