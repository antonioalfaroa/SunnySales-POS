import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, StyleSheet, SafeAreaView } from 'react-native';
import { useCart } from './CartContext';
import { useNavigation } from '@react-navigation/native';

const Cart = () => {
  const { cart, updateItemQuantity, removeItemFromCart } = useCart();
  const navigation = useNavigation();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
      <View style={styles.quantityControl}>
        <TouchableOpacity onPress={() => updateItemQuantity(item.id, item.quantity - 1)}>
          <Text style={styles.controlButton}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <TouchableOpacity onPress={() => updateItemQuantity(item.id, item.quantity + 1)}>
          <Text style={styles.controlButton}>+</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => removeItemFromCart(item.id)}>
        <Text style={styles.removeButton}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Cart</Text>
      <FlatList
        data={cart}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total: ${total.toFixed(2)}</Text>
      </View>
      <Button title="Continue" onPress={() => navigation.navigate('Transaction')} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemName: {
    fontSize: 16,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    fontSize: 20,
    paddingHorizontal: 10,
  },
  quantity: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  removeButton: {
    color: 'red',
  },
  totalContainer: {
    marginVertical: 20,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Cart;
