import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function MenuScreen({ restaurant, onBack }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backText}>← Back to Restaurant Details</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Menu: {restaurant.name}</Text>
      
      <TouchableOpacity style={styles.addBtn} onPress={() => Alert.alert("Add Item", "Add menu form would open here")}>
        <Text style={styles.btnText}>+ Add New Item</Text>
      </TouchableOpacity>

      <FlatList
        data={restaurant.menu}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>₹{item.price}</Text>
            </View>
            <View style={{flexDirection:'row'}}>
              <TouchableOpacity style={styles.editBtn}><Text style={styles.smBtnText}>Update</Text></TouchableOpacity>
              <TouchableOpacity style={styles.delBtn}><Text style={styles.smBtnText}>Delete</Text></TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  backBtn: { marginTop: 30, marginBottom: 20 },
  backText: { color: '#2196F3', fontWeight: 'bold' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  addBtn: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  btnText: { color: 'white', fontWeight: 'bold' },
  itemCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemName: { fontSize: 16, fontWeight: 'bold' },
  itemPrice: { color: '#666' },
  editBtn: { backgroundColor: '#2196F3', padding: 8, borderRadius: 5, marginRight: 8 },
  delBtn: { backgroundColor: '#F44336', padding: 8, borderRadius: 5 },
  smBtnText: { color: 'white', fontSize: 12 }
});