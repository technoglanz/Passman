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
  Linking,
} from 'react-native';
import { fetchAllCredentials, handleUpdate, handleDelete } from '../Backend/database/queries';

export default function Details({ navigation, route }) {
  const { id } = route.params; // Make sure the 'id' is passed correctly
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isEditingUrl, setIsEditingUrl] = useState(false);

  useEffect(() => {
    fetchAllCredentials(
      (credentials) => {
        const credential = credentials.find(c => c.id === id);
        if (credential) {
          setName(credential.name || '');
          setUrl(credential.url || '');
          setUsername(credential.username || '');
          setPassword(credential.password || '');
        }
      },
      (error) => console.log('Error fetching credential:', error),
    );
  }, [id]);

  const handleOpenUrl = () => {
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Failed to open the URL. Please check if it is valid.');
      });
    }
  };

  const toggleEditUrl = () => {
    setIsEditingUrl(!isEditingUrl); // Toggle between edit and view mode
  };
  

  const updateCredential = () => {
    handleUpdate(id, name, url, username, password, 
      () => {
        Alert.alert('Success', 'Credential updated successfully!');
        navigation.goBack();
      },
      error => {
        console.log('Error updating credential:', error);
        Alert.alert('Error', 'Failed to update the credential.');
      }
    );
  };

  const deleteCredential = () => {
    handleDelete(id, navigation, 
      () => {
        // Refresh credentials list or update state if needed
      },
      error => {
        console.log('Error deleting credential:', error);
        Alert.alert('Error', 'Failed to delete the credential.');
      }
    );
  };

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
          />
          <Text style={styles.label}>URL</Text>
          <View style={styles.urlContainer}>
            {isEditingUrl ? (
              <TextInput
                style={styles.input}
                value={url}
                onChangeText={setUrl}
                multiline = {true}
              />
            ) : (
              <TouchableOpacity onPress={handleOpenUrl} style={styles.urlTextContainer}>
                <Text style={styles.urlText}>{url}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={toggleEditUrl} style={styles.editButton}>
              <Text style={styles.editButtonText}>
                {isEditingUrl ? 'Save' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
        </View>
        <TouchableOpacity style={styles.updateButton} onPress={updateCredential}>
          <Text style={styles.updateButtonText}>Update</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={deleteCredential}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  formContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#2b2b2b',
    color: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  urlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'space-between',  // Ensures that both the URL and button are spaced properly
    flexWrap: 'wrap', // Allow the content to wrap if needed
  },
  urlTextContainer: {
    flex: 1,  // Allow the URL to take up available space
    marginRight: 10,
  },
  urlText: {
    flexDirection: 'row',
    color: 'skyblue',
    textDecorationLine: 'underline',
    fontSize: 15,
    flexShrink: 1,  // Prevents text overflow
    maxWidth: '80%',  // Limit the width of URL text to avoid it getting too long
  },
  editButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    marginLeft: 10,
    width: '30%', // Ensures the button stays the same size as the update and delete buttons
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  updateButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
