import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';

const AccountOption = ({icon, title, onPress}) => {
  return (
   <TouchableOpacity style={styles.button} onPress={onPress}>
    <View style={styles.iconContainer}>
        {icon}
    </View>
    <Text style={styles.title}>{title}</Text>
   </TouchableOpacity>
  );
};

export default AccountOption;

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:'flex-start',
        borderColor: 'gray',
        borderRadius: 100,
        borderWidth: 1,
        width: 363,
        height: 55,
        paddingTop: 5,
        paddingRight: 10,
        paddingBottom: 5,
        paddingLeft: 5,
        gap: 10,
    },
    iconContainer: {
        position: 'relative',
        backgroundColor: 'gray',
        width: 45,
        height: 45,
        borderRadius: 100,
    },
    title:{
        color: 'black',
        fontSize: 16,
        fontFamily: 'gordita',
        fontWeight: '500',
        lineHeight: 24,
    }
});
