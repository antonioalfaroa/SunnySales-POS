import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, SafeAreaView, FlatList } from 'react-native';
import DatePicker from '@react-native-community/datetimepicker';
import { firestore, auth } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const DailyReportsScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
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

      // Set selected date to UTC midnight
      const selectedUTCDate = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()));
      const formattedDate = selectedUTCDate.toISOString().split('T')[0];
      console.log('Formatted Date:', formattedDate); // Debugging log

      const salesRef = collection(firestore, `users/${userId}/sales`);
      const q = query(salesRef, where('date', '==', formattedDate));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('No sales data found for the selected date.'); // Debugging log
        setSalesData([]);
      } else {
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort data by sale number
        data.sort((a, b) => a.saleNumber - b.saleNumber);

        console.log('Fetched Sales Data:', data); // Debugging log
        setSalesData(data);
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || selectedDate;
    setSelectedDate(currentDate);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const generatePDFReport = async () => {
    try {
      // Fetch sales data if not already fetched
      if (!salesData || salesData.length === 0) {
        await fetchSalesData();
      }
  
      if (salesData.length === 0) {
        console.error('No sales data to generate PDF report.');
        return;
      }
  
      // Calculate the total sum of all sales
      const totalSum = salesData.reduce((acc, sale) => acc + sale.total, 0);
  
      // Calculate totals for cash and card
      const totalCash = salesData
        .filter(sale => sale.paymentMethod.toLowerCase() === 'cash')
        .reduce((acc, sale) => acc + sale.total, 0);
  
      const totalCard = salesData
        .filter(sale => sale.paymentMethod.toLowerCase() === 'card')
        .reduce((acc, sale) => acc + sale.total, 0);
  
      // Prepare PDF content
      const pdfContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; }
              h1 { text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #000; padding: 8px 12px; text-align: left; }
              th { background-color: #f2f2f2; }
              .total-row { font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Daily Sales Report</h1>
            <p>Date: ${selectedDate.toLocaleDateString('en-CA')}</p>
            <table>
              <tr>
                <th>Sale number</th>
                <th>Date</th>
                <th>Time</th>
                <th>Payment method</th>
                <th>Total</th>
              </tr>
              ${salesData.map((sale) => `
                <tr>
                  <td>${sale.saleNumber}</td>
                  <td>${sale.date}</td>
                  <td>${sale.time}</td>
                  <td>${sale.paymentMethod}</td>
                  <td>$${sale.total.toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="4">Total Sum:</td>
                <td>$${totalSum.toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td colspan="4">Total in Cash:</td>
                <td>$${totalCash.toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td colspan="4">Total in Card:</td>
                <td>$${totalCard.toFixed(2)}</td>
              </tr>
            </table>
          </body>
        </html>
      `;
  
      // Generate PDF using expo-print
      const { uri } = await Print.printToFileAsync({ html: pdfContent });
  
      // Move the file to a writable directory on iOS
      const pdfPath = FileSystem.documentDirectory + 'daily_sales_report.pdf';
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
        <Text style={styles.title}>Daily Sales Report</Text>
        <View style={styles.datePickerContainer}>
          <Text style={styles.label}>Select Date:</Text>
          <DatePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
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
            <Text style={styles.modalTitle}>Daily Sales Report</Text>
            <Text style={styles.date}>
              Date: {selectedDate.toLocaleDateString('en-CA')}
            </Text>
            <FlatList
              data={salesData}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.saleItem}>
                  <Text>Sale Number: {item.saleNumber}</Text>
                  <Text>Date: {item.date}</Text>
                  <Text>Time: {item.time}</Text>
                  <Text>Payment Method: {item.paymentMethod}</Text>
                  <Text>Total: ${item.total.toFixed(2)}</Text>
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
    textAlign: 'center',
  },
  datePickerContainer: {
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
    marginBottom: 20,
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
  date: {
    fontSize: 16,
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

export default DailyReportsScreen;
