import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, View, Image } from 'react-native';
import { Link, Router, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from '../images';
import CustomButton from '../components/CustomButton';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StripeProvider } from '@stripe/stripe-react-native'; // Import StripeProvider

// Replace with your actual Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51PfeXFLhIpYpbdjMHS047zIdDyYFqa9retlkMoWdXnM4tVPNgwOhuqPiTxDmfHZBTije8CVgFT4vK75vcWuLsuaO00BwUodvLA';

export default function App() {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ height: "100%" }}>
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
        <StatusBar backgroundColor="#161622" style='light' />
      </SafeAreaView>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logo: {
    top: -50,
    width: 150,
    height: 150,
  },
  title: {
    display: 'flex',
    top: -40,
    textAlign: 'center',
    fontSize: 35,
    fontWeight: '500',
    fontFamily: 'gordita',
  }
});
