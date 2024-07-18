import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { auth } from './firebase'; // Adjust the path as needed

const CreateElements = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const querySnapshot = await firestore.collection('categories').where('userId', '==', user.uid).get();
          const fetchedCategories = [];
          querySnapshot.forEach((doc) => {
            fetchedCategories.push({ id: doc.id, ...doc.data() });
          });
          setCategories(fetchedCategories);
        }
      } catch (error) {
        console.error('Error fetching categories: ', error);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await firestore.collection('items').add({
          name,
          price,
          category,
          description,
          userId: user.uid,
        });
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
        value={price}
        onChangeText={setPrice}
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
  modalView: {
    margin: 20,
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

export default CreateElements;
