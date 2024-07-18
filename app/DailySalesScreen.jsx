import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, SafeAreaView, FlatList, Alert } from 'react-native';
import DatePicker from '@react-native-community/datetimepicker';
import { firestore, auth } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const DailySalesScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [salesData, setSalesData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    allPayments: true,
    cash: false,
    card: false,
  });
  const { currentUser } = auth;
  const userId = currentUser ? currentUser.uid : null;

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
      let q;

      if (!filterOptions.allPayments && !filterOptions.cash && !filterOptions.card) {
        // Alert user to select at least one option
        Alert.alert('Please select at least one filter option.');
        return;
      }

      if (filterOptions.allPayments) {
        q = query(salesRef, where('date', '==', formattedDate));
      } else {
        const paymentMethods = [];
        if (filterOptions.cash) paymentMethods.push('Cash');
        if (filterOptions.card) paymentMethods.push('Card');
        
        q = query(salesRef, 
          where('date', '==', formattedDate), 
          where('paymentMethod', 'in', paymentMethods)
        );
      }

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setSalesData([]);
      } else {
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
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
      if (!salesData) {
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
            <h1>Report Daily Sales</h1>
            <p>Date: ${selectedDate.toLocaleDateString('en-CA')}</p>
            <table>
              <tr>
                <th>Sale number</th>
                <th>Payment method</th>
                <th>Total</th>
              </tr>
              ${salesData.map((sale, index) => `
                <tr>
                  <td>${index + 1}</td>
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
        <Text style={styles.title}>Daily Sales</Text>
        <DatePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          style={styles.datePicker}
        />
        <View style={styles.filterOptions}>
          <TouchableOpacity
            style={[styles.optionButton, filterOptions.allPayments && styles.selectedOption]}
            onPress={() => setFilterOptions({ ...filterOptions, allPayments: !filterOptions.allPayments })}
          >
            <Text>All Payments</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionButton, filterOptions.cash && styles.selectedOption]}
            onPress={() => setFilterOptions({ ...filterOptions, cash: !filterOptions.cash })}
          >
            <Text>Cash</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionButton, filterOptions.card && styles.selectedOption]}
            onPress={() => setFilterOptions({ ...filterOptions, card: !filterOptions.card })}
          >
            <Text>Card</Text>
          </TouchableOpacity>
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
            <Text style={styles.modalTitle}>Sales on {selectedDate.toDateString()}</Text>
            <FlatList
              data={salesData}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.saleItem}>
                  <Text>Sale ID: {item.id}</Text>
                  <Text>Amount: ${item.total.toFixed(2)}</Text>
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
  optionButton: {
    padding: 10,
    margin: 5,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#ccc',
  },
  selectedOption: {
    backgroundColor: 'lightblue',
  },
});

export default DailySalesScreen;
