import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, TextInput, Image } from 'react-native';

export default function MenuScreen({ restaurant, onBack }) {
  const [menuItems, setMenuItems] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Track if we are editing (null means we are Adding new)
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [dishName, setDishName] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isVegetarian, setIsVegetarian] = useState(true);

  // NOTE: Ensure this matches your backend URL exactly (no trailing slash usually)
  const BASE_URL = 'https://restaurant-app-python.onrender.com/api/menus';

  // 1. FETCH MENU ON LOAD
  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await fetch(`${BASE_URL}/?restaurant_id=${restaurant.id}`);
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 2. OPEN MODAL HELPERS
  const openAddModal = () => {
    setEditingItem(null); // We are adding
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item); // We are editing this item
    setDishName(item.name);
    setPrice(item.price.toString());
    setImageUrl(item.image_url || '');
    setIsVegetarian(item.is_vegetarian);
    setModalVisible(true);
  };

  // 3. HANDLE SAVE (ADD OR EDIT)
  const handleSave = async () => {
    if (!dishName || !price) {
      Alert.alert("Error", "Name and Price are required");
      return;
    }

    const payload = {
      name: dishName,
      price: parseFloat(price),
      image_url: imageUrl,
      is_vegetarian: isVegetarian,
      restaurant_id: restaurant.id
    };

    try {
      let response;
      
      if (editingItem) {
        // --- EDIT MODE (PUT) ---
        response = await fetch(`${BASE_URL}/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // --- ADD MODE (POST) ---
        response = await fetch(BASE_URL + '/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        const savedItem = await response.json();

        if (editingItem) {
          // Update the list locally by replacing the old item
          setMenuItems(menuItems.map(item => item.id === editingItem.id ? savedItem : item));
        } else {
          // Append new item
          setMenuItems([...menuItems, savedItem]);
        }

        setModalVisible(false);
        resetForm();
      } else {
        Alert.alert("Error", "Failed to save item");
      }
    } catch (error) {
      Alert.alert("Error", "Network error");
      console.error(error);
    }
  };

  // 4. DELETE ITEM
  const handleDelete = async (itemId) => {
    try {
      await fetch(`${BASE_URL}/${itemId}`, { method: 'DELETE' });
      setMenuItems(menuItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setDishName('');
    setPrice('');
    setImageUrl('');
    setIsVegetarian(true);
    setEditingItem(null);
  };

  return (
    <View style={styles.container}>
      {/* --- HEADER --- */}
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backText}>← Back to Restaurant</Text>
      </TouchableOpacity>
      
      <Text style={styles.header}>Menu: {restaurant.name}</Text>

      {/* --- ADD BUTTON --- */}
      <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
        <Text style={styles.btnText}>+ Add New Dish</Text>
      </TouchableOpacity>

      {/* --- LIST --- */}
      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={{flexDirection:'row', alignItems:'center', flex: 1}}>
               {/* Show Image if available, else placeholder */}
               {item.image_url ? (
                 <Image source={{uri: item.image_url}} style={styles.foodImg} />
               ) : (
                 <View style={styles.placeholderImg}><Text>🍽️</Text></View>
               )}
               <View style={{marginLeft: 10}}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>₹{item.price}</Text>
               </View>
            </View>
            
            {/* Buttons Row */}
            <View style={styles.actionButtons}>
                <TouchableOpacity onPress={() => openEditModal(item)} style={styles.editBtn}>
                    <Text style={styles.smBtnText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.delBtn}>
                    <Text style={styles.smBtnText}>Delete</Text>
                </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* --- ADD/EDIT MODAL --- */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
                {editingItem ? "Edit Dish" : "Add New Dish"}
            </Text>
            
            <TextInput 
              style={styles.input} 
              placeholder="Dish Name (e.g. Butter Chicken)" 
              value={dishName} onChangeText={setDishName} 
            />
            
            <TextInput 
              style={styles.input} 
              placeholder="Price (e.g. 350)" 
              keyboardType="numeric"
              value={price} onChangeText={setPrice} 
            />

            <TextInput 
              style={styles.input} 
              placeholder="Image URL (http://...)" 
              value={imageUrl} onChangeText={setImageUrl} 
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.btnText}>
                    {editingItem ? "Update" : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  
  // Item Card
  itemCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemName: { fontSize: 16, fontWeight: 'bold' },
  itemPrice: { color: '#666' },
  foodImg: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#eee' },
  placeholderImg: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#eee', justifyContent:'center', alignItems:'center' },
  
  // Action Buttons
  actionButtons: { flexDirection: 'row', alignItems: 'center' },
  editBtn: { backgroundColor: '#2196F3', padding: 8, borderRadius: 5, marginRight: 10 },
  delBtn: { backgroundColor: '#F44336', padding: 8, borderRadius: 5 },
  smBtnText: { color: 'white', fontSize: 12 },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 15 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelBtn: { backgroundColor: '#999', padding: 12, borderRadius: 8, flex: 0.45, alignItems: 'center' },
  saveBtn: { backgroundColor: '#2196F3', padding: 12, borderRadius: 8, flex: 0.45, alignItems: 'center' }
});