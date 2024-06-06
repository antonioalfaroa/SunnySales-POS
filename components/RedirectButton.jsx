import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const RedirectButton = ({ title, handlePress}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style = {styles.button}
    >
      <LinearGradient
        colors={['rgba(92, 25, 76, 1.5)', 'rgba(255, 106, 0, 0.5)']}
        start={[0, 0]}
        end={[1, 1]}
        style={styles.gradient}
      >
      <Text style={styles.buttonText}>
        {title}
      </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default RedirectButton;

const styles = StyleSheet.create({
    button:{
        justifyContent: 'center',
        backgroundColor:'red',
        width:130,
        height: 100,
        alignItems:'center',
        margin: 20,
        borderRadius: 20,
    },
    gradient:{
        width: '100%',
        height:'100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 23,
    },
});
