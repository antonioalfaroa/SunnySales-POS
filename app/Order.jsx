import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { auth, firestore } from './firebase';
import { collection, orderBy, onSnapshot } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const Order = () => {
  const [sales, setSales] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = fetchSales();
    return () => unsubscribe();
  }, []);

  const fetchSales = () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;
        const q = collection(firestore, `users/${userId}/sales`);
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const fetchedSales = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          // Filter sales for today's date
          const today = new Date().toLocaleDateString('en-CA');
          const filteredSales = fetchedSales.filter(sale => sale.date === today);

          // Sort filtered sales by saleNumber in descending order
          filteredSales.sort((a, b) => Number(b.saleNumber) - Number(a.saleNumber));

          setSales(filteredSales);
        });
        return unsubscribe;
      }
    } catch (error) {
      console.error('Error fetching sales: ', error);
    }
  };

  const navigateToSaleDetails = (sale) => {
    navigation.navigate('SaleDetails', { sale });
  };

  const renderSaleItem = ({ item }) => (
    <TouchableOpacity style={styles.saleItem} onPress={() => navigateToSaleDetails(item)}>
      <Text>{item.saleNumber}</Text>
      <Text>Date: {item.date}</Text>
      <Text>Total: ${item.total.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sales Order</Text>
      <FlatList
        data={sales}
        renderItem={renderSaleItem}
        keyExtractor={item => item.id}
        style={styles.salesList}
      />
    </View>
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
  saleItem: {
    padding: 16,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  salesList: {
    flex: 1,
  },
});

export default Order;
