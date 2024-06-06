
import { View, Image } from 'react-native';
import { Tabs, Redirect } from 'expo-router';
import { icons } from '../../images'; // Correct the import path
import React from 'react';

const TabIcon = ({ icon,color,name,focused }) => {
  return (
    <View>
      <Image 
        source={icon}
        resizeMode='contain'
        tintColor={color}
        className='w-6 h-6'
      />
    </View>
  );
};

const _layout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor:"#FFA001",
          tabBarInactiveBackgroundColor:"#CDCDE0",
          tabBarStyle:{
            backgroundColor:"161622",
            borderTopWidth:1,
            borderTopColor:"#232533",
            height:84,
          }
        }}
      >
        <Tabs.Screen
          name="menu"
          options={{
            title: 'Menu',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.items} // Pass the correct icon prop
                name="Menu"
                color={color}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: 'Cart',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.items} // Pass the correct icon prop
                name="Cart"
                color={color}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{
            title: 'Reports',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.items} // Pass the correct icon prop
                name="Reports"
                color={color}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.items} // Pass the correct icon prop
                name="Settings"
                color={color}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="solution"
          options={{
            title: 'Solution',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.items} // Pass the correct icon prop
                name="Solution"
                color={color}
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
};

export default _layout;