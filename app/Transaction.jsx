import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { useCart } from './CartContext';
import { firestore, auth } from './firebase';
import { collection, addDoc, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { useStripe, CardField } from '@stripe/stripe-react-native';

const Transaction = () => {
  const { cart, clearCart } = useCart();
  const { confirmPayment } = useStripe();
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [cashPaid, setCashPaid] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [card, setCard] = useState(null);
  const [stripeAccountId, setStripeAccountId] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchStripeAccountId = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const stripeDocRef = doc(firestore, `users/${user.uid}/stripe/default`);
          const stripeDoc = await getDoc(stripeDocRef);
          const stripeData = stripeDoc.data();
          setStripeAccountId(stripeData?.stripeAccountId || '');
        }
      } catch (error) {
        console.error('Error fetching Stripe account ID:', error);
      }
    };

    fetchStripeAccountId();
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCardPayment = async () => {
    try {
      if (!stripeAccountId) {
        Alert.alert('Stripe Account Not Connected', 'Please connect your Stripe account to proceed with the payment.');
        return;
      }

      const user = auth.currentUser;
      if (!user) {
        setErrorMessage('User not authenticated');
        return;
      }

      const response = await fetch('https://sunny-sales-backend.vercel.app/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(total * 100) }), // No stripeAccountId needed here
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const { clientSecret } = await response.json();

      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        type: 'Card',
        paymentMethodType: 'Card',
        paymentMethodData: {
          card: card,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      console.log('Payment successful:', paymentIntent);

      const userId = user.uid;
      const now = new Date();
      const currentDate = now.toLocaleDateString('en-CA');
      const currentTime = now.toLocaleTimeString('en-CA');

      const salesQuery = query(collection(firestore, `users/${userId}/sales`), where('date', '==', currentDate));
      const salesSnapshot = await getDocs(salesQuery);
      const saleNumber = salesSnapshot.size + 1;

      await addDoc(collection(firestore, `users/${userId}/sales`), {
        saleNumber,
        date: currentDate,
        time: currentTime,
        items: cart.map(item => ({ name: item.name, price: item.price, quantity: item.quantity })),
        total,
        paymentMethod,
      });

      clearCart();
      Alert.alert('Payment recorded successfully!');
      setCard(null);
      setCashPaid('');
      setPaymentMethod(null);
      navigation.navigate('Home');
    } catch (error) {
      setErrorMessage('Error completing payment');
      console.error('Error completing payment: ', error);
    }
  };

  const handleCashPayment = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setErrorMessage('User not authenticated');
        return;
      }

      const now = new Date();
      const currentDate = now.toLocaleDateString('en-CA');
      const currentTime = now.toLocaleTimeString('en-CA');

      const salesQuery = query(collection(firestore, `users/${user.uid}/sales`), where('date', '==', currentDate));
      const salesSnapshot = await getDocs(salesQuery);
      const saleNumber = salesSnapshot.size + 1;

      await addDoc(collection(firestore, `users/${user.uid}/sales`), {
        saleNumber,
        date: currentDate,
        time: currentTime,
        items: cart.map(item => ({ name: item.name, price: item.price, quantity: item.quantity })),
        total,
        paymentMethod,
        cashPaid: parseFloat(cashPaid),
        change: parseFloat(cashPaid) - total,
      });

      clearCart();
      Alert.alert('Payment recorded successfully!');
      setCard(null);
      setCashPaid('');
      setPaymentMethod(null);
      navigation.navigate('Home');
    } catch (error) {
      setErrorMessage('Error completing payment');
      console.error('Error completing payment: ', error);
    }
  };

  const handleCompletePayment = () => {
    if (paymentMethod === 'Card') {
      handleCardPayment();
    } else if (paymentMethod === 'Cash') {
      handleCashPayment();
    } else {
      Alert.alert('Error', 'Please select a payment method.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Total to Pay: ${total.toFixed(2)}</Text>

      {!paymentMethod && (
        <View>
          <Button title="Pay with Card" onPress={() => setPaymentMethod('Card')} />
          <Button title="Pay with Cash" onPress={() => setPaymentMethod('Cash')} />
        </View>
      )}

      {paymentMethod === 'Card' && (
        <View style={styles.form}>
          <CardField
            postalCodeEnabled={false}
            placeholder={{ number: 'Card Number' }}
            card={card}
            onCardChange={(cardDetails) => setCard(cardDetails)}
            style={styles.cardField}
          />
          <Button title="Complete Payment" onPress={handleCompletePayment} />
        </View>
      )}

      {paymentMethod === 'Cash' && (
        <View style={styles.form}>
          <Text>Total: ${total.toFixed(2)}</Text>
          <TextInput
            style={styles.input}
            placeholder="Cash Paid"
            value={cashPaid}
            onChangeText={setCashPaid}
            keyboardType="numeric"
          />
          <Text>Change: ${(parseFloat(cashPaid) - total).toFixed(2)}</Text>
          <Button title="Complete Payment" onPress={handleCompletePayment} />
        </View>
      )}

      {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  form: {
    marginTop: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  error: {
    color: 'red',
    marginTop: 20,
  },
  cardField: {
    height: 50,
    marginBottom: 20,
  },
});

export default Transaction;
