import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, SafeAreaView, FlatList } from 'react-native';
import DatePicker from '@react-native-community/datetimepicker';
import { firestore, auth } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const WeeklySalesScreen = () => {
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
      } else {
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort data by date and sale number
        data.sort((a, b) => {
          if (a.date < b.date) return -1;
          if (a.date > b.date) return 1;
          return a.saleNumber - b.saleNumber;
        });

        setSalesData(data);
        setModalVisible(true);
      }
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
      // Fetch sales data if not already fetched
      if (!salesData || salesData.length === 0) {
        await fetchSalesData();
      }
  
      if (salesData.length === 0) {
        console.error('No sales data to generate PDF report.');
        return;
      }
  
      // Prepare PDF content
      const pdfContent = `
        <html>
          <body>
            <h1>Weekly Sales Report</h1>
            <p>Date Range: ${startDate.toLocaleDateString('en-CA')} to ${endDate.toLocaleDateString('en-CA')}</p>
            <table>
              <tr>
                <th>Sale number</th>
                <th>Date</th>
                <th>Payment method</th>
                <th>Total</th>
              </tr>
              ${salesData.map((sale) => `
                <tr>
                  <td>${sale.saleNumber}</td>
                  <td>${sale.date}</td>
                  <td>${sale.paymentMethod}</td>
                  <td>$${sale.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </table>
          </body>
        </html>
      `;
  
      // Generate PDF using expo-print
      const { uri } = await Print.printToFileAsync({ html: pdfContent });

      // Move the file to a writable directory on iOS
      const pdfPath = FileSystem.documentDirectory + 'weekly_sales_report.pdf';
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
        <Text style={styles.title}>Weekly Sales Report</Text>
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
            <Text style={styles.modalTitle}>Weekly Sales Report</Text>
            <Text style={styles.dateRange}>
              Date Range: {startDate.toLocaleDateString('en-CA')} to {endDate.toLocaleDateString('en-CA')}
            </Text>
            <FlatList
              data={salesData}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.saleItem}>
                  <Text>Sale Number: {item.saleNumber}</Text>
                  <Text>Date: {item.date}</Text>
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
  dateRange: {
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

export default WeeklySalesScreen;
