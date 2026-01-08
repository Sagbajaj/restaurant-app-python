import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

export default function ReviewsModal({ visible, onClose, reviews, title }) {
    
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title || "Reviews"}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* List */}
          <FlatList
            data={reviews}
            keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
            contentContainerStyle={{ padding: 20 }}
            renderItem={({ item }) => (
              <View style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.user}>{item.user || 'Anonymous'}</Text>
                  <Text style={styles.rating}>⭐ {item.rating}/5</Text>
                </View>
                <Text style={styles.comment}>{item.text || item.comment || "No comment provided."}</Text>
                {item.date && (
                  <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
                )}
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No reviews found.</Text>
            }
          />
          
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { height: '80%', backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  closeBtn: { padding: 5 },
  closeText: { fontSize: 20, color: '#333' },
  reviewCard: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10, marginBottom: 15 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  user: { fontWeight: 'bold', fontSize: 16 },
  rating: { color: '#FF9800', fontWeight: 'bold' },
  comment: { color: '#555', lineHeight: 20 },
  date: { color: '#999', fontSize: 12, marginTop: 10, textAlign: 'right' },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 20, fontStyle: 'italic' }
});