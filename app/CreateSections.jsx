import { StyleSheet, Text, View, TextInput, Button } from 'react-native';
import React, { useState } from 'react';
import { firestore, auth } from './firebase'; // Ensure auth is imported
import { collection, addDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const CreateSections = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const navigation = useNavigation();

  const handleSubmit = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;
        const docRef = await addDoc(collection(firestore, `users/${userId}/categories`), {
          name,
          description,
        });
        alert('Category created successfully');
        setName('');
        setDescription('');
      } else {
        alert('No user is signed in.');
      }
    } catch (error) {
      console.error('Error adding category: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Category</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
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
  },
});

export default CreateSections;
