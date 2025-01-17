import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, StyleSheet, Alert, View } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import { insertCredential } from '../Backend/database/queries';

const Save = ({ navigation }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const db = SQLite.openDatabase(
    { name: 'credentials.db', location: 'default' },
    () => {},
    (error) => {
      console.log(error);
      Alert.alert('Error', 'Failed to open the database.');
    }
  );

  const handleInsert = ()=> {

    insertCredential(name, url, username, password);
    navigation.goBack();
    Alert.alert('Saved successfully !');
    
  }
 

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
        
        <Text style={styles.label}>Enter url</Text>
        <TextInput
          style={styles.input}
          placeholder="url"
          placeholderTextColor="#888"
          value={url}
          onChangeText={setUrl}
        />

        <Text style={styles.label}>Enter username</Text>
        <TextInput
          style={styles.input}
          placeholder="username"
          placeholderTextColor="#888"
          value={username}
          onChangeText={setUsername}
        />

        <Text style={styles.label}>Enter Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
        
        />

        <TouchableOpacity style={styles.button} onPress={handleInsert}>
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
