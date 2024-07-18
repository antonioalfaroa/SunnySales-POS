import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Slot, Stack } from 'expo-router'
import { CartProvider } from './CartContext';

const RootLayout = () => {
  return (
    <CartProvider>
      <Stack>
        <Stack.Screen name='index' options={{ headerShown: false }} />
        <Stack.Screen name='(auth)' options={{ headerShown: false }} />
        <Stack.Screen name='profile' options={{ headerShown: false }} />
        <Stack.Screen name='Categories' options={{ headerShown: false }} />
        <Stack.Screen name='Settings' options={{ headerShown: false }} />
        <Stack.Screen name='Cart' options={{ headerShown: false }} />
        <Stack.Screen name='Report' options={{ headerShown: false }} />
        <Stack.Screen name='Transaction' options={{ headerShown: false }}/>
        <Stack.Screen name='Items' options={{ headerShown: false }}/>
        <Stack.Screen name='SaleDetails' options={{ headerShown: false }}/>
        <Stack.Screen name='DailySalesScreen' options={{ headerShown: false }}/>
        <Stack.Screen name='WeeklySalesScreen' options={{ headerShown: false }}/>
        <Stack.Screen name='SoldItemsReportScreen' options={{ headerShown: false }}/>
        <Stack.Screen name='SoldItemsRangeScreen' options={{ headerShown: false }}/>
      </Stack>
    </CartProvider>
  );
};

export default RootLayout;