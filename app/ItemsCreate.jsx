import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { firestore, auth } from './firebase'; // Ensure auth and firestore are imported correctly
import { collection, addDoc, getDocs } from 'firebase/firestore';

const ItemsCreate = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(''); // Initialize price as an empty string
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userId = user.uid; // Ensure userId is correctly defined
          const querySnapshot = await getDocs(collection(firestore, `users/${userId}/categories`)); // Use getDocs with collection correctly
          const fetchedCategories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setCategories(fetchedCategories);
        }
      } catch (error) {
        console.error('Error fetching categories: ', error);
      }
    };

    fetchCategories();
  }, []); // Ensure empty dependency array to run once

  const handleSubmit = async () => {
    try {
      const user = auth.currentUser;
      if (user && category) {
        // Ensure price is converted to a number only if it's a valid number
        const priceValue = parseFloat(price);
        const itemData = {
          name,
          price: isNaN(priceValue) ? 0 : priceValue, // Set price to 0 if NaN
          category,
          description,
          userId: user.uid,
        };

        await addDoc(collection(firestore, `users/${user.uid}/items`), itemData); // Use addDoc with collection correctly
        alert('Item created successfully');
        setName('');
        setPrice(''); // Reset price to empty string after submission
        setCategory('');
        setDescription('');
      } else {
        alert('Please select a category.');
      }
    } catch (error) {
      console.error('Error adding item: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Item</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Price"
        value={price} // Use price directly as string
        onChangeText={setPrice} // Update price state directly
        keyboardType="numeric" // Set keyboard type to numeric for price input
      />
      <TouchableOpacity style={styles.input} onPress={() => setModalVisible(true)}>
        <Text>{category ? category : "Select Category"}</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setCategory(item.name);
                    setModalVisible(false);
                  }}
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <Button title="Save" onPress={handleSubmit} />
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
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
    justifyContent: 'center',
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
});

export default ItemsCreate;
