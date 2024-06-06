import { StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'
import { useState } from 'react'

const FormField = ({title, value, placeholder, handleChangeText, otherStyles, ...props}) => {
    const [showPassword, setshowPassword] = useState(false)

  return (
    <View className="space-y-2">
      <Text className="text-base text-gray-100 font-pmedium">{title}</Text>
      <View className="border-2 border-white w-full h-16 px-4 bg-black-100 rounded-2xl focus:border-black ">
        <TextInput
            className="flex-1 text-white font-psemibold text-base"
            value={value}
            placeholder={placeholder}
            placeholderTextColor="#7b7b8b"
            onChangeText={handleChangeText}
            secureTextEntry={title==="Password" && !showPassword}
        />
      </View>
    </View>
  )
}

export default FormField

const styles = StyleSheet.create({})