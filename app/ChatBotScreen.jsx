import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import axios from 'axios';

const ChatBotScreen = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [model, setModel] = useState('microsoft/DialoGPT-medium'); // Use a conversational model

  const handleSend = async () => {
    if (message.trim() === '') return;

    // Add user message to the chat
    setMessages([...messages, { text: message, sender: 'user' }]);
    setMessage('');

    try {
      // Call Hugging Face API
      const response = await axios.post(`https://api-inference.huggingface.co/models/${model}`, {
        inputs: message,
      }, {
        headers: {
          'Authorization': `Bearer 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`, // Replace with your actual API key
          'Content-Type': 'application/json',
        }
      });

      // Inspect the response data structure
      console.log('Response from Hugging Face:', response.data);

      // Adjust based on actual response structure
      const aiMessage = response.data[0]?.generated_text || 'No response received';

      // Add AI response to the chat
      setMessages([...messages, { text: message, sender: 'user' }, { text: aiMessage, sender: 'ai' }]);
    } catch (error) {
      console.error('Error fetching data from Hugging Face:', error.response ? error.response.data : error.message);
      // Provide user feedback in case of error
      setMessages([...messages, { text: 'Sorry, something went wrong. Please try again later.', sender: 'ai' }]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.chatContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <FlatList
          data={messages}
          renderItem={({ item }) => (
            <View style={[styles.message, item.sender === 'ai' ? styles.aiMessage : styles.userMessage]}>
              <Text>{item.text}</Text>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  chatContainer: {
    flex: 1,
    padding: 10,
  },
  message: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  aiMessage: {
    backgroundColor: '#e0e0e0',
    alignSelf: 'flex-start',
  },
  userMessage: {
    backgroundColor: '#007bff',
    color: 'white',
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  sendButton: {
    backgroundColor: '#007bff',
    borderRadius: 20,
    marginLeft: 10,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ChatBotScreen;
