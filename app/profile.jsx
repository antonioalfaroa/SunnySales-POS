import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomButton from '../components/CustomButton'
import { Link, Router, router } from 'expo-router';
import RedirectButton from '../components/RedirectButton';
import { LinearGradient } from 'expo-linear-gradient';

const profile = () => {
  return (
    <SafeAreaView style={{flex: 1}}>
      <LinearGradient
          colors={['rgba(92, 25, 76, 1.5)', 'rgba(255, 106, 0, 0.5)']} // Set your desired gradient colors
          style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <View style={styles.separators}>
            <RedirectButton
              title={"Order"}
              handlePress={() => router.push('/menu')}
            />
            <RedirectButton
              title={"Categories"}
              handlePress={() => router.push('/categories')}
            />
          </View>
          <View style={styles.separators}>
            <RedirectButton
              title={"Items"}
              handlePress={() => router.push('/items')}
            />
            <RedirectButton
              title={"Settings"}
              handlePress={() => router.push('/settings')}
            />
          </View>
        </View>
      </LinearGradient>

    </SafeAreaView>
    
  )
}

export default profile

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separators:{
    flexDirection:'row',
    margin: 20,
  }

})