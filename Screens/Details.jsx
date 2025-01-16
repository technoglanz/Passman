import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  { name: 'credentials.db', location: 'default' },
  () => console.log('Database connected successfully'),
  error => console.error('Database connection error:', error),
);

const Details = ({ navigation, route }) => {
  const { id } = route.params; // Credential ID passed from the Home screen
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCredential = () => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM credentials WHERE id = ?',
          [id],
          (tx, results) => {
            if (results.rows.length > 0) {
              const credential = results.rows.item(0);
              setName(credential.name || '');
              setEmail(credential.email || '');
              setPassword(credential.password || '');
            } else {
              Alert.alert('Error', 'Credential not found.');
              navigation.goBack();
            }
            setLoading(false);
          },
          error => {
            console.error('Error fetching credential:', error);
            setLoading(false);
          },
        );
      });
    };

    fetchCredential();
  }, [id, navigation]);

  const handleUpdate = () => {
    if (!name || !email || !password) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        'UPDATE credentials SET name = ?, email = ?, password = ? WHERE id = ?',
        [name, email, password, id],
        () => {
          Alert.alert('Success', 'Credential updated successfully!');
          navigation.goBack();
        },
        error => console.error('Error updating credential:', error),
      );
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this credential?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            db.transaction(tx => {
              tx.executeSql(
                'DELETE FROM credentials WHERE id = ?',
                [id],
                () => {
                  Alert.alert('Deleted', 'Credential deleted successfully!');
                  navigation.goBack();
                },
                error => console.error('Error deleting credential:', error),
              );
            });
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>Edit Credential</Text>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter name"
            placeholderTextColor="#888888"
          />
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email"
            placeholderTextColor="#888888"
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor="#888888"
            secureTextEntry
          />
          <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
            <Text style={styles.buttonText}>Update</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}>
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  label: {
    color: '#BBBBBB',
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#2A2A2A',
    color: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#E53935',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#888888',
    fontSize: 18,
  },
});

export default Details;
