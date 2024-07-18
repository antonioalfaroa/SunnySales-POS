import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, Router, router } from 'expo-router';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Items from './Items'
import Order from './Order'
import Reports from './Reports';
import Settings from './Settings'
import Cart from './Cart';
import { Ionicons } from '@expo/vector-icons';
import Categories from './Categories';

const Tab = createBottomTabNavigator();

const profile = () => {
  return (
    <Tab.Navigator screenOptions={{
       tabBarActiveTintColor:'orange',
       }}>
      <Tab.Screen name='Home' component={Items} 
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen name='Order' component={Order}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'list' : 'list-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen name='Cart' component={Cart}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'cart' : 'cart-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen name='Reports' component={Reports}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'bar-chart' : 'bar-chart-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen name='Categories' component={Categories}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'bar-chart' : 'bar-chart-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen name='Settings' component={Settings}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  )
}

export default profile

const styles = StyleSheet.create({
  
})