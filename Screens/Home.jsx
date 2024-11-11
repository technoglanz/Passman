import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import { useFocusEffect } from '@react-navigation/native';  

const Home = ({ navigation }) => {
  const [credentials, setCredentials] = useState([]);

  const db = SQLite.openDatabase(
    { name: 'credentials.db', location: 'default' },
    () => {},
    (error) => {
      console.log(error);
      Alert.alert('Error', 'Failed to open the database.');
    }
  );

  // Create the table if it doesn't exist
  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS credentials (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          email TEXT,
          password TEXT
        )`,
        [],
        () => {
          console.log('Table created or already exists');
        },
        (error) => {
          console.log(error);
          Alert.alert('Error', 'Failed to create table.');
        }
      );
    });
  }, []);

  const encrypt = (email) => {
    if (email.includes('@')) {
      const [ename, domain] = email.split('@');
      return '*****@' + domain;
    }
    return email;
  };

  const fetchCredentials = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM credentials',
        [],
        (tx, results) => {
          const len = results.rows.length;
          let tempCredentials = [];
          for (let i = 0; i < len; i++) {
            tempCredentials.push(results.rows.item(i));
          }
          setCredentials(tempCredentials);
        },
        (error) => {
          console.log(error);
          Alert.alert('Error', 'Failed to fetch credentials.');
        }
      );
    });
  };

  // Refresh the credentials whenever the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchCredentials();  // Fetch credentials every time the screen is focused
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Your Saved Credentials</Text>

      <FlatList
        data={credentials}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.credentialItem}
            onPress={() => navigation.navigate('Details', { id: item.id })}
          >
            <Text style={styles.credentialTitle}>{item.name}</Text>
            <Text style={styles.credentialEmail}>Email: {encrypt(item.email)}</Text>
            <Text style={styles.credentialPassword}>Password: *******</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No credentials found.</Text>}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('Save')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  credentialItem: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  credentialTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  credentialEmail: {
    color: '#AAAAAA',
    fontSize: 16,
  },
  credentialPassword: {
    color: '#AAAAAA',
    fontSize: 16,
  },
  emptyText: {
    color: '#888888',
    textAlign: 'center',
    marginTop: 20,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold',
  },
});

export default Home;
