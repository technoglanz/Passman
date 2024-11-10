import { useState, useEffect } from 'react';
import {
  SafeAreaView,
  Text,
  TextInput,
  FlatList,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home = ({ navigation }) => {
  const [credentials, setCredentials] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCredentials, setFilteredCredentials] = useState([]);

  useEffect(() => {
    // Fetch credentials from AsyncStorage
    const fetchCredentials = async () => {
      const storedCredentials = await AsyncStorage.getItem('credentials');
      const parsedCredentials = storedCredentials
        ? JSON.parse(storedCredentials)
        : [];
      setCredentials(parsedCredentials);
      setFilteredCredentials(parsedCredentials); // Display all credentials initially
    };
    fetchCredentials();
  }, []);

  // Filter credentials based on search query
  useEffect(() => {
    setFilteredCredentials(
      credentials.filter((cred) =>
        cred.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, credentials]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Your Saved Credentials</Text>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search by title"
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Credentials List */}
      <FlatList
        data={filteredCredentials}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.credentialItem}>
            <Text style={styles.credentialTitle}>{item.title}</Text>
            <Text style={styles.credentialEmail}>{item.email}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No credentials found.</Text>
        }
      />

    
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          navigation.navigate('Save');
        }}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Home;

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
  searchBar: {
    backgroundColor: '#1E1E1E',
    color: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    borderColor: '#333333',
    borderWidth: 1,
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
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold',
  },
});
