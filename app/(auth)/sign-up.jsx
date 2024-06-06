import { ScrollView, StyleSheet, Text, View, Alert } from 'react-native'
import { Link, Stack, useNavigation } from 'expo-router';
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { StackActions } from '@react-navigation/native';


const SignUp = () => {

  const navigation = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async () => {
    setIsSubmitting(true);
    try {
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, form.email, form.password);
      alert('Sign up successful!');
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
  })

  return (
    <SafeAreaView className="bg-[#fb923c] h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[80vh] px-4 my-6">
            <Text className="text-sxl text-white mt-10 ">Sign up to SunnySales</Text>

            <FormField
            title="Company Name"
            value={form.cName}
            handleChangeText={(e) => setform({...form, cName:e})}
            otherStyles="mt-7"
          />

            <FormField
            title="Address"
            value={form.address}
            handleChangeText={(e) => setform({...form, address:e})}
            otherStyles="mt-7"
          />

          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setform({...form, email:e})}
            otherStyles="mt-7"
            keyboardType="email-address"
          />

          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setform({...form, password:e})}
            otherStyles="mt-7"
          />

          <CustomButton
            title="Sign Up"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />

          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Have an account already?
            </Text>
            <Link href="(auth)/sign-in" className='text-lg font-psmibold text-yellow'> Log In</Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignUp

const styles = StyleSheet.create({})