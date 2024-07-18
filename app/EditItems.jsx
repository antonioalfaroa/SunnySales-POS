// EditItems.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Button, StyleSheet } from 'react-native';
import { firestore, auth } from './firebase';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const EditItems = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editedItem, setEditedItem] = useState({});
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const fetchItems = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;
        const querySnapshot = await getDocs(collection(firestore, `users/${userId}/items`));
        const fetchedItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItems(fetchedItems);
      }
    } catch (error) {
      console.error('Error fetching items: ', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;
        const querySnapshot = await getDocs(collection(firestore, `users/${userId}/categories`));
        const fetchedCategories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(fetchedCategories);
      }
    } catch (error) {
      console.error('Error fetching categories: ', error);
    }
  };

  const handleEditItem = async () => {
    try {
      const user = auth.currentUser;
      if (user && editedItem.id) {
        await updateDoc(doc(firestore, `users/${user.uid}/items`, editedItem.id), {
          name: newName || editedItem.name,
          price: newPrice ? parseFloat(newPrice) : editedItem.price,
          category: newCategory || editedItem.category,
          description: newDescription || editedItem.description,
        });
        setModalVisible(false);
        fetchItems(); // Refresh items after update
      }
    } catch (error) {
      console.error('Error updating item: ', error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const user = auth.currentUser;
      if (user && itemId) {
        await deleteDoc(doc(firestore, `users/${user.uid}/items`, itemId));
        fetchItems(); // Refresh items after deletion
      }
    } catch (error) {
      console.error('Error deleting item: ', error);
    }
  };

  const toggleModal = (item) => {
    setEditedItem(item);
    setNewName(item.name);
    setNewPrice(item.price.toString());
    setNewCategory(item.category);
    setNewDescription(item.description);
    setModalVisible(true);
  };

  const handleSelectCategory = (category) => {
    setNewCategory(category);
    setCategoryModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Items</Text>
      <FlatList
        data={items}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text>{item.name}</Text>
            <Text>{item.price}</Text>
            <Text>{item.category}</Text>
            <Text>{item.description}</Text>
            <TouchableOpacity onPress={() => toggleModal(item)}>
              <Text>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteItem(item.id)}>
              <Text>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={item => item.id}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <TextInput
              style={styles.input}
              placeholder="New Name"
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={styles.input}
              placeholder="New Price"
              value={newPrice}
              onChangeText={setNewPrice}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={styles.input}
              onPress={() => setCategoryModalVisible(true)}
            >
              <Text>{newCategory || "Select Category"}</Text>
            </TouchableOpacity>
            <Modal
              animationType="slide"
              transparent={true}
              visible={categoryModalVisible}
              onRequestClose={() => setCategoryModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalView}>
                  <FlatList
                    data={categories}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.modalItem}
                        onPress={() => handleSelectCategory(item.name)}
                      >
                        <Text>{item.name}</Text>
                      </TouchableOpacity>
                    )}
                  />
                  <Button title="Close" onPress={() => setCategoryModalVisible(false)} />
                </View>
              </View>
            </Modal>
            <TextInput
              style={styles.input}
              placeholder="New Description"
              value={newDescription}
              onChangeText={setNewDescription}
            />
            <Button title="Save Changes" onPress={handleEditItem} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
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
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
    width: '100%',
  },
  modalItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default EditItems;
