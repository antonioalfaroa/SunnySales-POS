import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { auth, firestore } from './firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { useCart } from './CartContext';

const Items = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Breakfast'); // Default to 'Breakfast'
  const { addItemToCart } = useCart();

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedModalCategory, setSelectedModalCategory] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchItemsByCategory(selectedCategory);
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;
        const q = query(collection(firestore, `users/${userId}/categories`));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const fetchedCategories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setCategories(fetchedCategories);
        });
  
        // Return unsubscribe function to clean up listener when component unmounts
        return unsubscribe;
      }
    } catch (error) {
      console.error('Error fetching categories: ', error);
    }
  };
  
  const fetchItemsByCategory = async (categoryName) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;
        const q = query(collection(firestore, `users/${userId}/items`), where('category', '==', categoryName));
        const querySnapshot = await getDocs(q);
        const fetchedItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItems(fetchedItems);
      }
    } catch (error) {
      console.error('Error fetching items: ', error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => addItemToCart(item)}>
      <Text style={styles.itemName}>{item.name}</Text>
      {typeof item.price === 'number' ? (
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
      ) : (
        <Text style={styles.itemPrice}>Price not available</Text>
      )}
    </TouchableOpacity>
  );

  const handleCategoryModalClose = () => {
    setModalVisible(false);
  };

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    setSelectedModalCategory(categoryName);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Items</Text>
      <View style={styles.categorySelector}>
        <Text>Select Category:</Text>
        <TouchableOpacity style={styles.categoryButton} onPress={() => setModalVisible(true)}>
          <Text style={{ fontWeight: 'bold' }}>{selectedModalCategory || 'Select Category'}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />

      {/* Modal for Category Selection */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCategoryModalClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Pressable style={styles.closeButton} onPress={handleCategoryModalClose}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
            <FlatList
              data={categories}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleCategorySelect(item.name)}
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemName: {
    fontSize: 16,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  closeText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Items;
