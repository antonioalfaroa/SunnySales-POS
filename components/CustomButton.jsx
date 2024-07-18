import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';

const CustomButton = ({ title, handlePress, isLoading }) => {
  return (
    <TouchableOpacity
      style={styles.but}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={styles.text}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

export default CustomButton;

const styles = StyleSheet.create({
  but:{
    backgroundColor:'orange',
    minWidth: 100,
    minHeight:40,
    justifyContent:'center',
    display:'flex',
    alignItems:'center',
    borderRadius:'50',
    marginTop:20,
  },

  text:{
    fontSize:'20',
    color:'white',
  }
});
