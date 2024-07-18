import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, SafeAreaView, FlatList, Alert } from 'react-native';
import DatePicker from '@react-native-community/datetimepicker';
import { firestore, auth } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const SoldItemsReportScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [salesData, setSalesData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const { currentUser } = auth;
  const userId = currentUser ? currentUser.uid : null;

  useEffect(() => {
    fetchSalesData();
  }, [selectedDate]);

  const fetchSalesData = async () => {
    try {
      if (!userId) {
        console.error('User not authenticated.');
        return;
      }

      const formattedDate = selectedDate.toLocaleDateString('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

      const salesRef = collection(firestore, `users/${userId}/sales`);
      const q = query(salesRef, where('date', '==', formattedDate));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // No sales for the selected date
        setSalesData([]);
        setModalVisible(true);
        return;
      }

      // Map to store items and their aggregated sales data
      const itemsMap = new Map();

      // Process each sale document
      querySnapshot.forEach(doc => {
        const saleData = doc.data();
        saleData.items.forEach(item => {
          const { name, quantity, price } = item;
          const totalPrice = quantity * price;
          if (itemsMap.has(name)) {
            // Update existing item entry
            const existingItem = itemsMap.get(name);
            existingItem.quantitySold += quantity;
            existingItem.totalSold += totalPrice;
          } else {
            // Add new item entry
            itemsMap.set(name, {
              itemName: name,
              quantitySold: quantity,
              totalSold: totalPrice,
            });
          }
        });
      });

      // Convert itemsMap to an array for FlatList rendering
      const salesDataArray = Array.from(itemsMap.values());
      setSalesData(salesDataArray);
      setModalVisible(true);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const generatePDFReport = async () => {
    try {
      // Prepare PDF content
      const pdfContent = `
        <html>
          <body>
            <h1>Sold Items Report</h1>
            <p>Date: ${selectedDate.toLocaleDateString('en-CA')}</p>
            <table>
              <tr>
                <th>Item Name</th>
                <th>Quantity Sold</th>
                <th>Total $ Sold</th>
              </tr>
              ${salesData.map(item => `
                <tr>
                  <td>${item.itemName}</td>
                  <td>${item.quantitySold}</td>
                  <td>$${item.totalSold.toFixed(2)}</td>
                </tr>
              `).join('')}
            </table>
          </body>
        </html>
      `;

      // Generate PDF using expo-print
      const { uri } = await Print.printToFileAsync({ html: pdfContent });

      // Move the file to a writable directory on iOS
      const pdfPath = FileSystem.documentDirectory + 'sold_items_report.pdf';
      await FileSystem.moveAsync({
        from: uri,
        to: pdfPath,
      });

      // Use expo-sharing to share the PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfPath);
      } else {
        console.error('Sharing is not available on this device.');
      }

      // Show alert or confirmation message
      alert('PDF Report Downloaded Successfully!');
    } catch (error) {
      console.error('Error generating PDF report:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.title}>Sold Items Report</Text>
        <DatePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(event, date) => setSelectedDate(date)}
          style={styles.datePicker}
        />
        <TouchableOpacity style={styles.button} onPress={fetchSalesData}>
          <Text style={styles.buttonText}>Fetch Sales Data</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pdfButton} onPress={generatePDFReport}>
          <Text style={styles.pdfButtonText}>Download Report PDF</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sold Items on {selectedDate.toDateString()}</Text>
            <FlatList
              data={salesData}
              keyExtractor={(item) => item.itemName}
              renderItem={({ item }) => (
                <View style={styles.saleItem}>
                  <Text>Item: {item.itemName}</Text>
                  <Text>Quantity Sold: {item.quantitySold}</Text>
                  <Text>Total $ Sold: ${item.totalSold.toFixed(2)}</Text>
                </View>
              )}
              contentContainerStyle={{ flexGrow: 1 }}
            />
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  datePicker: {
    width: '100%',
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  pdfButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignSelf: 'center',
  },
  pdfButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  saleItem: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  closeButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default SoldItemsReportScreen;
