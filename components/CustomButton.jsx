import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';

const CustomButton = ({ title, handlePress, containerStyles, textStyles, isLoading }) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`bg-yellow-500 rounded-xl min-h-[42px] min-w-[180px] justify-center items-center ${containerStyles}`}
    >
      <Text className={`text-lg ${textStyles}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

export default CustomButton;

const styles = StyleSheet.create({});
