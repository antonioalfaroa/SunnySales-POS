import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Button, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { useCart } from './CartContext';
import { firestore, auth } from './firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const Transaction = () => {
  const { cart, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [cashPaid, setCashPaid] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigation = useNavigation();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const currentDate = new Date().toLocaleDateString('en-CA'); // Format: YYYY-MM-DD

  const handleCompletePayment = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setErrorMessage('User not authenticated');
        return;
      }
      const userId = user.uid;

      // Fetch the latest sale number for the current date
      const salesQuery = query(collection(firestore, `users/${userId}/sales`), where('date', '==', currentDate));
      const salesSnapshot = await getDocs(salesQuery);
      const saleNumber = salesSnapshot.size + 1;

      // Create a new sale document
      await addDoc(collection(firestore, `users/${userId}/sales`), {
        saleNumber,
        date: currentDate,
        items: cart.map(item => ({ name: item.name, price: item.price, quantity: item.quantity })),
        total,
        paymentMethod,
        ...(paymentMethod === 'Cash' ? { cashPaid: parseFloat(cashPaid), change: parseFloat(cashPaid) - total } : {}),
      });

      clearCart();
      Alert.alert('Payment recorded successfully!');
      setCardDetails({ number: '', expiry: '', cvv: '' }); // Reset card details
      setCashPaid(''); // Reset cash paid
      setPaymentMethod(null); // Reset payment method
      navigation.navigate('Home'); // Navigate to the Home tab (Items page)
    } catch (error) {
      setErrorMessage('Error completing payment');
      console.error('Error completing payment: ', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Total to Pay: ${total.toFixed(2)}</Text>

      {!paymentMethod && (
        <View>
          <TouchableOpacity onPress={() => setPaymentMethod('Card')} style={styles.paymentButton}>
            <Text>Pay with Card</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPaymentMethod('Cash')} style={styles.paymentButton}>
            <Text>Pay with Cash</Text>
          </TouchableOpacity>
        </View>
      )}

      {paymentMethod === 'Card' && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Card Number"
            value={cardDetails.number}
            onChangeText={(text) => setCardDetails({ ...cardDetails, number: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Expiry Date"
            value={cardDetails.expiry}
            onChangeText={(text) => setCardDetails({ ...cardDetails, expiry: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="CVV"
            value={cardDetails.cvv}
            onChangeText={(text) => setCardDetails({ ...cardDetails, cvv: text })}
            secureTextEntry
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
    marginTop: 20, // Ensure it's within the safe zone
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  paymentButton: {
    padding: 16,
    marginVertical: 10,
    backgroundColor: '#ddd',
    borderRadius: 10,
    alignItems: 'center',
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
});

export default Transaction;
