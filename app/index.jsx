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
    <SafeAreaView styles={styles.container}>
      <ScrollView contentContainerStyle={{height:"100%"}}>
          <View className="w-full justify-center items-center h-full px-4" style={styles.container}>
            <Image
              source={icons.sunny}
              className=""
              style={styles.logo}
              
            />
            <Text style={styles.title}>
              Control your sales with {'\n'} 
              SunnySales
            </Text>
            <CustomButton
              title="Start"
              handlePress={() => router.push('/sign-in')}
              containerStyles="w-full mt-5"
            />
          </View>
      </ScrollView>
      <StatusBar backgroundColor="#161622"
      style='light'/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1,
  },
  logo:{
    top: - 50,
    width: 150,
    height: 150,
  },
  title:{
    display:'flex',
    top: -40,
    textAlign:'center',
    fontSize:35,
    fontWeight:'600',
  }
})