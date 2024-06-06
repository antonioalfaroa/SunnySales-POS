import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, View, Image } from 'react-native';
import { Link, Router, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from '../images';
import CustomButton from '../components/CustomButton';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function App() {
  return (
    <SafeAreaView className="bg-gray-300 h-full">
      <ScrollView contentContainerStyle={{height:"100%"}}>
        <LinearGradient
          colors={['rgba(92, 25, 76, 1.5)', 'rgba(255, 106, 0, 0.5)']} // Set your desired gradient colors
          style={{ flex: 1 }}
        >
          <View className="w-full justify-center items-center h-full px-4" style={styles.container}>
            <Image
              source={icons.sunny}
              className=""
              style={styles.logo}
              
            />
            <Text className="text-center text-2xl mt-[20px]">
              Control your sales with {'\n'} 
              SunnySales
            </Text>
            <CustomButton
              title="Start"
              handlePress={() => router.push('/sign-in')}
              containerStyles="w-full mt-5"
            />
          </View>
        </LinearGradient>
      </ScrollView>
      <StatusBar backgroundColor="#161622"
      style='light'/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logo:{
    top: -50,
  },

  container: {
    
  },
})