import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { Link, Stack, useNavigation } from 'expo-router';
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { StackActions } from '@react-navigation/native';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';


const SignIn = () => {

  const navigation = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setform] = useState({
    email:'',
    password:''
  });

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.dispatch(StackActions.replace("profile"));
      }
    });
    return () => unsubscribe();
  }, [navigation]);

  const submit = async () => {
    setIsSubmitting(true);
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, form.email, form.password);
      navigation.dispatch(StackActions.replace("profile"));;
    } catch (error) {
      alert('Wrong email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-[#9A887A] h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[80vh] px-4 my-6">
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
            title="Sign In"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />

          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Don't have an account?
            </Text>
            <Link href="(auth)/sign-up" className='text-lg font-psmibold text-yellow'> Sign up</Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn

const styles = StyleSheet.create({})