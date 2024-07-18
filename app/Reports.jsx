import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Reports = () => {
  const navigation = useNavigation();

  const navigateToDailySales = () => {
    navigation.navigate('DailySalesScreen');
  };

  const navigateToWeeklySales = () => {
    navigation.navigate('WeeklySalesScreen');
  };

  const navigateToMonthlySales = () => {
    navigation.navigate('SoldItemsReportScreen');
  };

  const navigateToItemsSales = () => {
    navigation.navigate('SoldItemsRangeScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reports</Text>
      <TouchableOpacity style={styles.button} onPress={navigateToDailySales}>
        <Text style={styles.buttonText}>Daily Sales</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={navigateToWeeklySales}>
        <Text style={styles.buttonText}>Custom Date Sales</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={navigateToMonthlySales}>
        <Text style={styles.buttonText}>Daily report per items</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={navigateToItemsSales}>
        <Text style={styles.buttonText}>Custom Date report per items</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default Reports;
