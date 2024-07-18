import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

const Categories = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Categories</Text>
      <Link href="/CreateSections">
        <Text style={styles.link}>Create Category</Text>
      </Link>
      <Link href="/ItemsCreate" asChild>
        <Text style={styles.link}>Create Item</Text>
      </Link>
      <Link href="/EditCategories" asChild>
        <Text style={styles.link}>Edit Categories</Text>
      </Link>
      <Link href="/EditItems" asChild>
        <Text style={styles.link}>Edit Items</Text>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  link: {
    fontSize: 18,
    color: 'blue',
    marginVertical: 10,
  },
});

export default Categories;
