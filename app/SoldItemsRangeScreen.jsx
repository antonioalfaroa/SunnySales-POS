import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, SafeAreaView, FlatList, Alert } from 'react-native';
import DatePicker from '@react-native-community/datetimepicker';
import { firestore, auth } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const SoldItemsRangeScreen = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [salesData, setSalesData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const { currentUser } = auth;
  const userId = currentUser ? currentUser.uid : null;

  const fetchSalesData = async () => {
    try {
      if (!userId) {
        console.error('User not authenticated.');
        return;
      }

      const startFormattedDate = startDate.toISOString().split('T')[0];
      const endFormattedDate = endDate.toISOString().split('T')[0];

      const salesRef = collection(firestore, `users/${userId}/sales`);
      const q = query(salesRef, where('date', '>=', startFormattedDate), where('date', '<=', endFormattedDate));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setSalesData([]);
        setModalVisible(true);
        return;
      }

      const itemsMap = new Map();

      querySnapshot.forEach(doc => {
        const saleData = doc.data();
        saleData.items.forEach(item => {
          const { name, quantity, price } = item;
          const totalPrice = quantity * parseFloat(price);
          if (itemsMap.has(name)) {
            const existingItem = itemsMap.get(name);
            existingItem.quantitySold += quantity;
            existingItem.totalSold += totalPrice;
          } else {
            itemsMap.set(name, {
              itemName: name,
              quantitySold: quantity,
              totalSold: totalPrice,
            });
          }
        });
      });

      const salesDataArray = Array.from(itemsMap.values());
      setSalesData(salesDataArray);
      setModalVisible(true);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  const handleStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setStartDate(currentDate);
  };

  const handleEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setEndDate(currentDate);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const generatePDFReport = async () => {
    try {
      // Prepare PDF content with styled HTML
      const pdfContent = `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f4f4f4;
              }
              h1 {
                text-align: center;
                color: #333;
              }
              p {
                font-size: 16px;
                color: #555;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                background-color: #fff;
                border-radius: 5px;
                overflow: hidden;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              th, td {
                padding: 10px;
                text-align: left;
                border-bottom: 1px solid #ddd;
              }
              th {
                background-color: #007BFF;
                color: #fff;
              }
              tr:hover {
                background-color: #f1f1f1;
              }
              @media print {
                body {
                  margin: 0;
                }
                table {
                  page-break-inside: auto;
                }
              }
            </style>
          </head>
          <body>
            <h1>Sold Items Report</h1>
            <p>Date Range: ${startDate.toLocaleDateString('en-CA')} to ${endDate.toLocaleDateString('en-CA')}</p>
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
        <View style={styles.dateRangePicker}>
          <Text style={styles.label}>Start Date:</Text>
          <DatePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={handleStartDateChange}
            style={styles.datePicker}
          />
          <Text style={styles.label}>End Date:</Text>
          <DatePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
            style={styles.datePicker}
          />
        </View>
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
            <Text style={styles.modalTitle}>Sold Items from {startDate.toDateString()} to {endDate.toDateString()}</Text>
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
  dateRangePicker: {
    marginBottom: 20,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  datePicker: {
    width: '100%',
    marginBottom: 12,
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    alignSelf: 'center',
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
    textAlign: 'center',
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

export default SoldItemsRangeScreen;
