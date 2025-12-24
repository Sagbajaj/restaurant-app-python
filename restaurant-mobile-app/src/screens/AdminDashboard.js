import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';

export default function AdminDashboard({ data, onLogout, onViewDetails, onAddPress, onEditPress }) {
  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Header / Navbar */}
      <View style={styles.navBar}>
        <Text style={styles.navTitle}>Admin Dashboard</Text>
        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Sidebar Simulation (Tabs) */}
      <View style={styles.tabsContainer}>
        <Text style={[styles.tabItem, styles.activeTab]}>Restaurants</Text>
        <Text style={styles.tabItem}>Reviews</Text>
        <Text style={styles.tabItem}>Wifi Details</Text>
      </View>

      {/* 3. Add Button */}
      <TouchableOpacity style={styles.addBtn} onPress={onAddPress}>
        <Text style={styles.btnText}>+ Add Restaurant</Text>
      </TouchableOpacity>

  

      {/* 4. List of Restaurants */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{flex: 1}}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSub}>{item.address}</Text>
            </View>
            
            <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.viewBtn} onPress={() => onViewDetails(item)}>
                    <Text style={styles.smallBtnText}>View</Text>
                </TouchableOpacity>
               
  <TouchableOpacity style={styles.editBtn} onPress={() => onEditPress(item)}>
     <Text style={styles.smallBtnText}>Edit</Text>
  </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // FIX: Force background color to white
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
  
  navBar: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#333', padding: 15, borderRadius: 8, marginBottom: 15, marginTop: 25 
  },
  navTitle: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  logoutText: { color: '#ff6b6b', fontWeight: 'bold' },

  tabsContainer: { flexDirection: 'row', marginBottom: 15, borderBottomWidth: 1, borderColor: '#ccc', paddingBottom: 10 },
  tabItem: { marginRight: 20, fontSize: 16, color: '#888' },
  activeTab: { color: '#000', fontWeight: 'bold', borderBottomWidth: 2, borderBottomColor: 'orange' },

  addBtn: { backgroundColor: '#FF9800', padding: 12, borderRadius: 8, marginBottom: 15, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  card: { 
    backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 10, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    elevation: 2 
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  cardSub: { fontSize: 12, color: 'gray', marginTop: 4 },

  actionButtons: { alignItems: 'flex-end' },
  viewBtn: { backgroundColor: '#2196F3', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 4, marginBottom: 5 },
  editBtn: { backgroundColor: '#757575', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 4 },
  smallBtnText: { color: 'white', fontSize: 12 }
});