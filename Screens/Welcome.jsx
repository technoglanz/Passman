import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, StyleSheet, Modal, View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Welcome = ({ navigation }) => {
  const [pin, setPin] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [savedPin, setSavedPin] = useState('');
  const [savedMobileNo, setSavedMobileNo] = useState('');
  const [isRegistered, setIsRegistered] = useState(false); // State to check if user is registered or not
  const [isModalVisible, setIsModalVisible] = useState(false); // To show/hide modal for Forgot PIN

  // Load PIN and mobile number from AsyncStorage on component mount
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const savedPin = await AsyncStorage.getItem('userPin');
        const savedMobileNo = await AsyncStorage.getItem('userMobileNo');
        if (savedPin && savedMobileNo) {
          setSavedPin(savedPin);
          setSavedMobileNo(savedMobileNo);
          setIsRegistered(true); // Mark as registered if data exists
        }
        console.log("Loaded saved PIN: ", savedPin);
        console.log("Loaded saved Mobile No: ", savedMobileNo);
      } catch (error) {
        console.error('Error loading credentials', error);
      }
    };

    loadCredentials();
    
  }, []);

  // Handle the "Forgot PIN" functionality
  const handleForgotPin = () => {
    setIsModalVisible(true); // Show modal to enter mobile number for reset
  };

  const handlePinReset = async () => {
    if (mobileNo === savedMobileNo) {
      // Generate a random PIN (4 digits)
      const newPin = Math.floor(1000 + Math.random() * 9000).toString();
      console.log("Generated new PIN: ", newPin); // Debugging generated PIN
  
      try {
        // Save the new PIN in AsyncStorage
        await AsyncStorage.setItem('userPin', newPin);
        console.log("New PIN saved to AsyncStorage: ", newPin); // Debugging storage update
  
        // Fetch the updated PIN from AsyncStorage to verify
        const updatedPin = await AsyncStorage.getItem('userPin');
        console.log("Updated PIN from AsyncStorage: ", updatedPin); // Verify if PIN is updated correctly
  
        // Update the savedPin state with the newly fetched PIN
        setSavedPin(updatedPin); // Ensure that savedPin is updated immediately
  
        setIsModalVisible(false); // Close modal
        Alert.alert('PIN Reset', `Your PIN has been reset successfully. New PIN is: ${newPin}`);
        setMobileNo('');
      } catch (error) {
        Alert.alert('Error', 'Failed to reset PIN.');
        console.error("Error resetting PIN: ", error);
      }
    } else {
      Alert.alert('Error', 'Mobile number does not match the registered number.');
    }
  };
  
  

  // Handle registration
  const handleRegister = async () => {
    if (pin && mobileNo) {
      try {
        // Save user data in AsyncStorage
        await AsyncStorage.setItem('userPin', pin);
        await AsyncStorage.setItem('userMobileNo', mobileNo);
        setSavedPin(pin); // Set the state after successful registration
        setSavedMobileNo(mobileNo); // Store the registered mobile number
        setIsRegistered(true); // Switch to login screen
        setPin(''); // set pin field empty
        Alert.alert('Registration Successful', 'You have been registered successfully.');
      } catch (error) {
        Alert.alert('Error', 'Failed to save the credentials.');
        console.error("Error registering user: ", error);
      }
    } else {
      Alert.alert('Error', 'Please enter both PIN and mobile number.');
    }
  };

  // Handle login
  const handleLogin = async () => {
    console.log("PIN entered: ", pin);  // Debugging entered PIN
  
    // Fetch the PIN from AsyncStorage before comparing
    const savedPin = await AsyncStorage.getItem('userPin');
    console.log("Saved PIN from AsyncStorage: ", savedPin);  // Debugging saved PIN
  
    if (pin === savedPin) {
      navigation.navigate('Home'); // Navigate to Home screen if PIN matches
      setPin('')
    } else {
      Alert.alert('Error', 'Invalid PIN');
    }
  };
  
  

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>P A S S M A N</Text>

      {isRegistered ? (
        // Login Screen
        <>
          <Text style={styles.infoText}>Please enter your PIN:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter PIN"
            keyboardType="numeric"
            secureTextEntry
            value={pin}
            onChangeText={setPin}
          />
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.textButton}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.forgotButton} onPress={handleForgotPin}>
            <Text style={styles.forgotButtonText}>Forgot PIN?</Text>
          </TouchableOpacity>
        </>
      ) : (
        // Registration Screen
        <>
          <Text style={styles.infoText}>Please register your mobile number and PIN:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Mobile Number"
            keyboardType="numeric"
            value={mobileNo}
            onChangeText={setMobileNo}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter PIN"
            keyboardType="numeric"
            secureTextEntry
            value={pin}
            onChangeText={setPin}
          />
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.textButton}>Register</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Forgot PIN Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Reset PIN</Text>
            <Text style={styles.modalText}>Enter your registered mobile number:</Text>
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              keyboardType="numeric"
              value={mobileNo}
              onChangeText={setMobileNo}
            />
            <TouchableOpacity style={styles.button} onPress={handlePinReset}>
              <Text style={styles.textButton}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.textButton}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 30,
  },
  infoText: {
    color: '#CCCCCC',
    fontSize: 16,
    marginBottom: 15,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    color: '#FFFFFF',
    backgroundColor: '#2A2A2A',
    marginBottom: 15,
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
  textButton: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  forgotButton: {
    marginTop: 20,
  },
  forgotButtonText: {
    color: '#AAAAAA',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalText: {
    marginBottom: 15,
  },
});

export default Welcome;
