import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Slot, Stack } from 'expo-router'

const RootLayout = () => {
  return (
    <Stack>
        <Stack.Screen name='index' options={{ headerShown: false}}/>
        <Stack.Screen name='(auth)' options={{headerShown: false}}/>
        <Stack.Screen name='(tabs)' options={{headerShown: false}}/>
        <Stack.Screen name='profile' options={{headerShown: false}}/>
        <Stack.Screen name='categories' options={{headerShown: false}}/>
        <Stack.Screen name='items' options={{headerShown: false}}/>
        <Stack.Screen name='settings' options={{headerShown: false}}/>
    </Stack>
  )
}

export default RootLayout