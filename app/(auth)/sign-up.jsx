import { ScrollView, StyleSheet, Text, View, Alert } from 'react-native';
import { Link, Stack, useNavigation } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { StackActions } from '@react-navigation/native';
import { getFirestore, doc, setDoc } from 'firebase/firestore'; // Import Firestore functions

// Utility functions for validation
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => /^(?=.*\d).{8,}$/.test(password);

const SignUp = () => {
  const navigation = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    const { email, password, companyName, address } = form;

    // Validate email and password
    if (!validateEmail(email)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('Invalid password', 'Password must be at least 8 characters long and contain at least one number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const auth = getAuth();
      const firestore = getFirestore(); // Initialize Firestore

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user details to Firestore
      await setDoc(doc(firestore, `users/${user.uid}`), {
        companyName,
        address,
        email
      });

      Alert.alert('Sign up successful!');
      navigation.dispatch(StackActions.popToTop());
    } catch (error) {
      Alert.alert('Sign up failed', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [form, setform] = useState({
    companyName: '',
    address: '',
    email: '',
    password: ''
  });

  return (
    <SafeAreaView style={{backgroundColor: '#fb923c', flex: 1}}>
      <ScrollView>
        <View style={{ width: '100%', justifyContent: 'center', minHeight: '80vh', paddingHorizontal: 16, marginVertical: 24 }}>
          <Text style={{ fontSize: 24, color: 'white', marginTop: 10 }}>Sign up to SunnySales</Text>

          <FormField
            title="Company Name"
            value={form.companyName}
            handleChangeText={(e) => setform({...form, companyName: e})}
            style={{ marginTop: 28 }}
          />

          <FormField
            title="Address"
            value={form.address}
            handleChangeText={(e) => setform({...form, address: e})}
            style={{ marginTop: 28 }}
          />

          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setform({...form, email: e})}
            style={{ marginTop: 28 }}
            keyboardType="email-address"
          />

          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setform({...form, password: e})}
            style={{ marginTop: 28 }}
            secureTextEntry
          />

          <CustomButton
            title="Sign Up"
            handlePress={submit}
            style={{ marginTop: 28 }}
            isLoading={isSubmitting}
          />

          <View style={{ justifyContent: 'center', paddingTop: 20, flexDirection: 'row', gap: 8 }}>
            <Text style={{ fontSize: 18, color: 'gray', fontFamily: 'Regular' }}>
              Have an account already?
            </Text>
            <Link href="(auth)/sign-in" style={{ fontSize: 18, fontFamily: 'Bold', color: '#fbbf24' }}> Log In</Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;

const styles = StyleSheet.create({});
