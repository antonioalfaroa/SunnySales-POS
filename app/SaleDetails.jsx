// SaleDetails.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native'; // Import useRoute hook
import { SafeAreaView } from 'react-native-safe-area-context';

const SaleDetails = () => {
  const route = useRoute(); // Use useRoute hook to access route object
  const { sale } = route.params || {}; // Safely access params, handle undefined case

  if (!sale) {
    return (
      <View style={styles.centered}>
        <Text>No sale details available.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Sale Details</Text>
      <Text>Sale Number: {sale.saleNumber}</Text>
      <Text>Date: {sale.date}</Text>
      <Text>Time: {sale.time}</Text>
      <Text>Payment Method: {sale.paymentMethod}</Text>
      <Text>Total: ${sale.total.toFixed(2)}</Text>
      <Text>Items:</Text>
      <View style={styles.itemsContainer}>
        {sale.items.map((item, index) => (
          <View key={index} style={styles.item}>
            <Text>{item.name}</Text>
            <Text>Price: ${item.price.toFixed(2)}</Text>
            <Text>Quantity: {item.quantity}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  itemsContainer: {
    marginTop: 10,
  },
  item: {
    marginBottom: 10,
  },
});

export default SaleDetails;
