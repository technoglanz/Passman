import React, { useState, useEffect } from 'react';
import {
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Welcome({navigation}) {
  const [pin, setPin] = useState('');
  const [storedPin, setStoredPin] = useState(null);
  const [isSettingPin, setIsSettingPin] = useState(false);

  useEffect(() => {
    // Check if a PIN already exists in AsyncStorage
    const fetchPin = async () => {
      const savedPin = await AsyncStorage.getItem('userPin');
      setStoredPin(savedPin);
      setIsSettingPin(!savedPin); // If no PIN, we prompt the user to set one
    };
    fetchPin();
  }, []);

  // Function to handle setting or verifying the PIN
  const handlePinSubmit = async () => {
    if (isSettingPin) {
      // Save the PIN if the user is setting it for the first time
      await AsyncStorage.setItem('userPin', pin);
      Alert.alert('PIN Set!', 'Your PIN has been saved.');
      setStoredPin(pin);
      setIsSettingPin(false);
    } else {
      // Verify the PIN if the user is entering to unlock the app
      if (pin === storedPin) {
        Alert.alert('Access Granted', 'Welcome to the app!');
          navigation.navigate('Home')
      } else {
        Alert.alert('Incorrect PIN', 'Please try again.');
      }
    }
    setPin('');
  
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>{isSettingPin ? 'Set Your PIN' : 'Enter PIN'}</Text>
      <View style={styles.formContainer}>
        <Text style={styles.label}>
          {isSettingPin ? 'Create a 4-digit PIN' : 'Enter your 4-digit PIN'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="••••"
          placeholderTextColor="#888"
          value={pin}
          onChangeText={setPin}
          maxLength={4}
          secureTextEntry
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.button} onPress={handlePinSubmit}>
          <Text style={styles.buttonText}>{isSettingPin ? 'Set PIN' : 'Unlock'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    padding: 20,
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 40,
  },
  formContainer: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  label: {
    color: '#AAAAAA',
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    width: '80%',
    height: 50,
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    color: '#FFFFFF',
    backgroundColor: '#2A2A2A',
    textAlign: 'center',
    fontSize: 18,
  },
  button: {
    backgroundColor: '#E53935',
    height: 50,
    width: '80%',
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
