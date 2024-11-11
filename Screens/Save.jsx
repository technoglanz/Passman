import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, StyleSheet, Alert, View } from 'react-native';
import SQLite from 'react-native-sqlite-storage';

const Save = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const db = SQLite.openDatabase(
    { name: 'credentials.db', location: 'default' },
    () => {},
    (error) => {
      console.log(error);
      Alert.alert('Error', 'Failed to open the database.');
    }
  );

  const saveData = () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO credentials (name, email, password) VALUES (?, ?, ?)',
        [name, email, password],
        () => {
          Alert.alert('Success', 'Credentials saved');
          navigation.goBack();
        },
        (error) => {
          console.log(error);
          Alert.alert('Error', 'Failed to save credentials.');
        }
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Save New Credential</Text>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Enter Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
        />
        
        <Text style={styles.label}>Enter Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Enter Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={saveData}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 30,
    textAlign: 'center',
    letterSpacing: 1.2,
  },
  formContainer: {
    backgroundColor: '#1E1E1E',
    paddingVertical: 30,
    paddingHorizontal: 25,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  label: {
    color: '#CCCCCC',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 15,
  },
  input: {
    marginTop: 8,
    width: '100%',
    height: 50,
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    color: '#FFFFFF',
    backgroundColor: '#2A2A2A',
  },
  button: {
    backgroundColor: '#E53935',
    height: 50,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textButton: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});


export default Save;
