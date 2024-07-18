import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Button, StyleSheet } from 'react-native';
import { firestore, auth } from './firebase';
import { collection, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';

const EditCategories = () => {
  const [categories, setCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editedCategory, setEditedCategory] = useState({});
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const handleEditCategory = async () => {
    try {
      const user = auth.currentUser;
      if (user && editedCategory.id) {
        const docRef = doc(firestore, `users/${user.uid}/categories/${editedCategory.id}`);
        await updateDoc(docRef, {
          name: newName || editedCategory.name,
          description: newDescription,  // Update description even if it's an empty string
        });

        await updateItemsCategory(user.uid, editedCategory.name, newName || editedCategory.name);

        setModalVisible(false);
        fetchCategories(); // Refresh categories after update
      }
    } catch (error) {
      console.error('Error updating category: ', error);
    }
  };

  const updateItemsCategory = async (userId, oldCategoryName, newCategoryName) => {
    try {
      const itemsCollectionRef = collection(firestore, `users/${userId}/items`);
      const querySnapshot = await getDocs(query(itemsCollectionRef, where('category', '==', oldCategoryName)));

      querySnapshot.forEach(async itemDoc => {
        const itemRef = doc(itemsCollectionRef, itemDoc.id);
        await updateDoc(itemRef, { category: newCategoryName });
      });
    } catch (error) {
      console.error('Error updating items category: ', error);
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    try {
      const user = auth.currentUser;
      if (user && categoryId) {
        // Delete all items in the category first
        const itemsCollectionRef = collection(firestore, `users/${user.uid}/items`);
        const querySnapshot = await getDocs(query(itemsCollectionRef, where('category', '==', categoryName)));

        querySnapshot.forEach(async itemDoc => {
          await deleteDoc(doc(firestore, `users/${user.uid}/items/${itemDoc.id}`));
        });

        // Then delete the category
        await deleteDoc(doc(firestore, `users/${user.uid}/categories/${categoryId}`));

        fetchCategories(); // Refresh categories after deletion
      }
    } catch (error) {
      console.error('Error deleting category: ', error);
    }
  };

  const toggleModal = (category) => {
    setEditedCategory(category);
    setNewName(category.name);
    setNewDescription(category.description || '');
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Categories</Text>
      <FlatList
        data={categories}
        renderItem={({ item }) => (
          <View style={styles.categoryContainer}>
            <Text>{item.name}</Text>
            <Text>{item.description}</Text>
            <TouchableOpacity onPress={() => toggleModal(item)}>
              <Text>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteCategory(item.id, item.name)}>
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
              placeholder="New Description"
              value={newDescription}
              onChangeText={setNewDescription}
            />
            <Button title="Save Changes" onPress={handleEditCategory} />
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
  categoryContainer: {
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
});

export default EditCategories;
