import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AccountOption from '../components/AccountOption';
import UserProfile from '../components/UserProfile';
import { firestore, auth } from './firebase'; // Adjust import as needed
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { useNavigation } from 'expo-router';

const Settings = () => {
  const [stripeAccountModalVisible, setStripeAccountModalVisible] = useState(false);
  const [connectedAccountModalVisible, setConnectedAccountModalVisible] = useState(false);
  const [stripeAccountId, setStripeAccountId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [currentStripeAccountId, setCurrentStripeAccountId] = useState('');
  const [currentStripeAccountName, setCurrentStripeAccountName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserInfo = () => {
      const user = auth.currentUser;
      if (user) {
        setEmail(user.email);

        // Real-time listener for user document
        const userDocRef = doc(firestore, `users/${user.uid}`);
        const unsubscribe = onSnapshot(userDocRef, (doc) => {
          const userData = doc.data();
          if (userData) {
            setCompanyName(userData.companyName || '');
          }
        });

        // Real-time listener for Stripe account info
        const stripeDocRef = doc(firestore, `users/${user.uid}/stripe/default`);
        const unsubscribeStripe = onSnapshot(stripeDocRef, (doc) => {
          const stripeData = doc.data();
          if (stripeData) {
            setCurrentStripeAccountId(stripeData.stripeAccountId || '');
            setCurrentStripeAccountName(stripeData.stripeAccountName || 'Not registered');
          }
        });

        return () => {
          unsubscribe();
          unsubscribeStripe();
        };
      }
    };

    fetchUserInfo();
  }, []);

  const handleSearchStripeAccount = async () => {
    try {
      const response = await fetch(`https://sunny-sales-backend.vercel.app/api/verify-stripe-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stripeAccountId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.accountName) {
        setSearchResult({ id: stripeAccountId, name: data.accountName });
      } else {
        Alert.alert('Error', 'Stripe account not found or invalid ID.');
        setSearchResult(null);
      }
    } catch (error) {
      console.error('Error searching Stripe account:', error);
      Alert.alert('Error', 'Failed to search Stripe account.');
    }
  };

  const handleConnectStripeAccount = async () => {
    const { currentUser } = auth;
    if (!currentUser) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    try {
      // Save Stripe account ID and name to Firestore
      await setDoc(doc(firestore, `users/${currentUser.uid}/stripe/default`), 
        { 
          stripeAccountId: searchResult.id, 
          stripeAccountName: searchResult.name 
        }, 
        { merge: true }
      );
      Alert.alert('Success', 'Stripe account connected successfully!');
      setStripeAccountModalVisible(false);
      setCurrentStripeAccountId(searchResult.id);
      setCurrentStripeAccountName(searchResult.name);
      setConnectedAccountModalVisible(true);
    } catch (error) {
      console.error('Error connecting Stripe account:', error);
      Alert.alert('Error', 'Failed to connect Stripe account.');
    }
  };

  const handleDisconnectStripeAccount = async () => {
    const { currentUser } = auth;
    if (!currentUser) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    try {
      // Remove Stripe account ID and name from Firestore
      await updateDoc(doc(firestore, `users/${currentUser.uid}/stripe/default`), 
        { 
          stripeAccountId: '', 
          stripeAccountName: '' 
        }
      );
      Alert.alert('Success', 'Stripe account disconnected successfully!');
      setCurrentStripeAccountId('');
      setCurrentStripeAccountName('Not registered');
      setConnectedAccountModalVisible(false);
      setStripeAccountModalVisible(true);
    } catch (error) {
      console.error('Error disconnecting Stripe account:', error);
      Alert.alert('Error', 'Failed to disconnect Stripe account.');
    }
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <UserProfile Name={companyName} email={email} onPress={() => navigation.navigate('EditInformation')}/>
        <AccountOption title={"Connect Stripe Account"} onPress={() => {
          if (currentStripeAccountId) {
            setConnectedAccountModalVisible(true);
          } else {
            setStripeAccountModalVisible(true);
          }
        }} />
        <AccountOption title={"About the App"}/>
        <AccountOption title={"Chat with Sunny!"} onPress={() => navigation.navigate('ChatBotScreen')}/>
        <AccountOption title={"Log out"}/>
        
        {/* Connect Stripe Account Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={stripeAccountModalVisible}
          onRequestClose={() => setStripeAccountModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Connect Stripe Account</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your Stripe Account ID"
                value={stripeAccountId}
                onChangeText={setStripeAccountId}
              />
              <TouchableOpacity style={styles.button} onPress={handleSearchStripeAccount}>
                <Text style={styles.buttonText}>Search Account</Text>
              </TouchableOpacity>
              
              {searchResult && (
                <View style={styles.resultContainer}>
                  <Text style={styles.resultText}>Stripe ID: {searchResult.id}</Text>
                  <Text style={styles.resultText}>Registered as: {searchResult.name}</Text>
                  <TouchableOpacity style={styles.button} onPress={handleConnectStripeAccount}>
                    <Text style={styles.buttonText}>Connect</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity style={styles.closeButton} onPress={() => setStripeAccountModalVisible(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Connected Account Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={connectedAccountModalVisible}
          onRequestClose={() => setConnectedAccountModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Connected Stripe Account</Text>
              <Text style={styles.resultText}>Stripe ID: {currentStripeAccountId}</Text>
              <Text style={styles.resultText}>Registered as: {currentStripeAccountName}</Text>
              <TouchableOpacity style={styles.button} onPress={() => {
                setConnectedAccountModalVisible(false);
                setStripeAccountModalVisible(true);
              }}>
                <Text style={styles.buttonText}>Connect Different Account</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleDisconnectStripeAccount}>
                <Text style={styles.buttonText}>Disconnect Account</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={() => setConnectedAccountModalVisible(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 10,
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
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#6c757d',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
  resultContainer: {
    marginVertical: 10,
  },
  resultText: {
    fontSize: 16,
  },
});

export default Settings;
