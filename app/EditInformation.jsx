import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth, signInWithEmailAndPassword, updateEmail, updatePassword } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from './firebase';

const EditInformation = ({ navigation }) => {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newValue, setNewValue] = useState('');
  const [editField, setEditField] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          setEmail(user.email);

          const userDocRef = doc(firestore, `users/${user.uid}`);
          const userDoc = await getDoc(userDocRef);
          const userData = userDoc.data();

          if (userData && userData.companyName) {
            setCompanyName(userData.companyName);
          }
          if (userData && userData.address) {
            setAddress(userData.address);
          }
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, []);

  const resetFields = () => {
    setCurrentPassword('');
    setNewPassword('');
    setNewValue('');
  };

  const verifyPassword = async (email, password) => {
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error('Password verification failed:', error.message);
      Alert.alert('Authentication Failed', 'Incorrect password.');
      return false;
    }
  };

  const handleEdit = async () => {
    if (editField !== 'password' && !currentPassword) {
      Alert.alert('Password Required', 'Please enter your current password.');
      return;
    }

    const authenticated = await verifyPassword(email, currentPassword);
    if (!authenticated) return;

    if (editField === 'email' && (!newValue.includes('@') || !newValue.endsWith('.com'))) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (editField === 'email') {
        await updateEmail(user, newValue);
        setEmail(newValue);
      } else if (editField === 'companyName') {
        const userDocRef = doc(firestore, `users/${user.uid}`);
        await updateDoc(userDocRef, { companyName: newValue });
        setCompanyName(newValue);
      } else if (editField === 'address') {
        const userDocRef = doc(firestore, `users/${user.uid}`);
        await updateDoc(userDocRef, { address: newValue });
        setAddress(newValue);
      }
      Alert.alert('Success', `${editField} updated successfully!`);
      setModalVisible(false);
      resetFields(); // Clear the text inputs after saving
    } catch (error) {
      console.error('Error updating info:', error);
      Alert.alert('Error', 'Failed to update information.');
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Fields Required', 'Please enter both current and new passwords.');
      return;
    }

    const authenticated = await verifyPassword(email, currentPassword);
    if (!authenticated) return;

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      await updatePassword(user, newPassword);
      Alert.alert('Success', 'Password updated successfully!');
      setModalVisible(false);
      resetFields(); // Clear the text inputs after saving
    } catch (error) {
      console.error('Error updating password:', error);
      Alert.alert('Error', 'Failed to update password.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Edit Information</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Company Name: {companyName}</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => { setEditField('companyName'); setModalVisible(true); }}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Email: {email}</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => { setEditField('email'); setModalVisible(true); }}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Address: {address}</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => { setEditField('address'); setModalVisible(true); }}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.infoContainer}>
        <TouchableOpacity style={styles.changePasswordButton} onPress={() => { setEditField('password'); setModalVisible(true); }}>
          <Text style={styles.changePasswordButtonText}>Change Password</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={isModalVisible} animationType="slide" transparent={true} onRequestClose={() => { setModalVisible(false); resetFields(); }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {(editField === 'password') ? (
              <>
                <Text>Enter your current password</Text>
                <TextInput
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                />
                <Text>Enter new password</Text>
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </>
            ) : (
              <>
                <Text>Enter your password</Text>
                <TextInput
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                />
                <Text>Enter new {editField}</Text>
                <TextInput
                  style={styles.input}
                  value={newValue}
                  onChangeText={setNewValue}
                />
              </>
            )}
            <TouchableOpacity style={styles.button} onPress={editField === 'password' ? handlePasswordChange : handleEdit}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => { setModalVisible(false); resetFields(); }}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
  },
  editButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  changePasswordButton: {
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 5,
  },
  changePasswordButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxWidth: 400,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default EditInformation;
