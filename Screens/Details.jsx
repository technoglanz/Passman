import React, {useState, useEffect} from 'react';
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
  {name: 'credentials.db', location: 'default'},
  () => {},
  error => {
    console.error(error);
  },
);

export default function Details({navigation, route}) {
  const {id} = route.params; // Assuming an id is passed to identify the credential
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // State for password

  useEffect(() => {
    // Fetch the existing credential details from SQLite
    const fetchCredential = () => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM credentials WHERE id = ?',
          [id],
          (tx, results) => {
            if (results.rows.length > 0) {
              const credential = results.rows.item(0);
              setName(credential.name);
              setEmail(credential.email);
              setPassword(credential.password || ''); // Set password if available
            }
          },
          error => {
            console.log('Error fetching credential:', error);
          },
        );
      });
    };
    fetchCredential();
  }, [id]);

  // Update the existing credential
  const handleUpdate = () => {
    if (name && email && password) {
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE credentials SET name = ?, email = ?, password = ? WHERE id = ?',
          [name, email, password, id],
          () => {
            Alert.alert('Success', 'Credential updated successfully!');
            navigation.goBack();
          },
          error => {
            console.log('Error updating credential:', error);
          },
        );
      });
    } else {
      Alert.alert('Validation Error', 'Please fill in all fields.');
    }
  };

  // Delete the credential
  const handleDelete = () => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM credentials WHERE id = ?',
        [id],
        () => {
          Alert.alert('Success', 'Credential deleted successfully!');
          navigation.goBack();
        },
        error => {
          console.log('Error deleting credential:', error);
        },
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>Credential Details</Text>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.button} onPress={handleUpdate}>
            <Text style={styles.textButton}>Update</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, {backgroundColor: '#D32F2F'}]}
            onPress={handleDelete}>
            <Text style={styles.textButton}>Delete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
