import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'

const UserProfile = ({Icon, Name, email, onPress}) => {
  return (
    <View style={styles.container}>
      <View style={styles.username}>
        <View style={styles.icon}>
            {Icon}
        </View>
        
        <View style={styles.information}>
            <Text style={styles.name}>{Name}</Text>
            <Text style={styles.email}>{email}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.edit} onPress={onPress}>
        {Icon}
      </TouchableOpacity>
    </View>
  )
}

export default UserProfile

const styles = StyleSheet.create({
    container: {
        width: 363,
        height: 65,
        borderRadius: 100,
        justifyContent: 'space-between',
        alignItems:'center',
        flexDirection: 'row',
        paddingTop: 5,
        paddingRight: 10,
        paddingBottom: 5,
        paddingLeft: 5,
        backgroundColor: 'gray',
        marginBottom: 25,
    },
    username: {
        flexDirection: 'row',
        gap: 15,
    },
    icon:{
        backgroundColor: 'white',
        width: 55,
        height: 55,
        borderRadius: 100,
    },
    information: {
        width: 220,
        height: 39,
        
    },
    name: {
        fontFamily:'gordita',
        fontWeight:'500',
        fontSize:20,
        lineHeight: 30,
        color: '#FFFFFF',
        
    },
    email: {
        fontFamily: 'gordita',
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 24,
        color: '#FFFFFF99',
    },
    edit:{
        borderRadius: 100,
        width: 45,
        height: 45,
        borderWidth: 1,
        gap: 5,
        borderColor:'#FFFFFF33',
    }


})