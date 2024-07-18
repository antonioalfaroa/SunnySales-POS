// SaleDetails.jsx
import React from 'react';
import { View, Text } from 'react-native';
import { useRoute } from '@react-navigation/native'; // Import useRoute hook

const SaleDetails = () => {
  const route = useRoute(); // Use useRoute hook to access route object
  const { sale } = route.params || {}; // Safely access params, handle undefined case

  if (!sale) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No sale details available.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Sale Number: {sale.saleNumber}</Text>
      <Text>Date: {sale.date}</Text>
      <Text>Payment Method: {sale.paymentMethod}</Text>
      <Text>Total: ${sale.total.toFixed(2)}</Text>
      <Text>Items:</Text>
      <View>
        {sale.items.map((item, index) => (
          <View key={index}>
            <Text>{item.name}</Text>
            <Text>Price: ${item.price.toFixed(2)}</Text>
            <Text>Quantity: {item.quantity}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default SaleDetails;
