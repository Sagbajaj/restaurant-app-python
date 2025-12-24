import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

export default function HomeScreen({ data, onAdminPress }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🍽️ Pune Eats</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={onAdminPress}>
          <Text style={styles.loginText}>Admin Login</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subHeader}>Featured Restaurants</Text>
      
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSub}>{item.type} • {item.location}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 30 },
  title: { fontSize: 24, fontWeight: 'bold' },
  loginBtn: { backgroundColor: '#333', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20 },
  loginText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  subHeader: { fontSize: 18, fontWeight: '600', marginBottom: 10, color: '#555' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  cardSub: { color: '#777', marginTop: 4 }
});