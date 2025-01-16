import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchAllCredentials, insertCredential } from '../Backend/database/queries';
import { selectAndParseCSV } from '../Backend/utils/fileUtils';
import { requestPermissions } from '../Backend/utils/permissions';
import { initializeDatabase } from '../Backend/database/database';

const Home = ({ navigation }) => {
  const [credentials, setCredentials] = useState([]);
  const [searchCredentials, setSearchCredentials] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    initializeDatabase();

    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchCredentials = () => {
    setIsLoading(true); // Start loading indicator when fetching data
    fetchAllCredentials(
      creds => {
        if (isMounted.current) {
          setCredentials(creds);
          setSearchCredentials(creds);
          setIsLoading(false); // Hide loading indicator after fetching data
        }
      },
      error => {
        console.log(error);
        Alert.alert('Error', 'Failed to fetch credentials.');
        setIsLoading(false); // Hide loading indicator on error
      },
    );
  };

  const handleSearch = text => {
    setSearch(text);
    const filteredData = credentials.filter(data =>
      data.name.toLowerCase().includes(text.toLowerCase()),
    );
    if (isMounted.current) {
      setSearchCredentials(filteredData);
    }
  };

  const handleFileImport = async () => {
    setIsLoading(true); // Show loading indicator when starting the import process
    const permissionGranted = await requestPermissions();
    if (permissionGranted) {
      try {
        const data = await selectAndParseCSV(); 
        if (data.length === 0) {
          // No file selected or no data found
          setIsLoading(false); // Hide loading indicator if no file is selected
          Alert.alert('No File Selected', 'Please select a CSV file.'); 
          return;
        }

        // If CSV data is available, insert the credentials
        for (const item of data) {
          await insertCredential(
            item.name,
            item.url,
            item.username,
            item.password,
            () => console.log(`Credential for ${item.name} imported`),
            error => console.log('Error inserting credential:', error),
          );
        }

        // Update credentials after all imports are complete
        fetchCredentials(); 
      } catch (error) {
        console.log('Error parsing CSV:', error);
        Alert.alert('Error', 'Failed to read the CSV file.');
        setIsLoading(false); // Hide loading indicator if there's an error
      }
    } else {
      Alert.alert('Permission Denied', 'Storage permission is required to import files.');
      setIsLoading(false); // Hide loading indicator if permission is denied
    }
  };

  // Handle focus effect to reset the loading indicator when navigating back or away
  useFocusEffect(
    React.useCallback(() => {
      // Reset loading state if we're navigating back or if no file is imported
      setIsLoading(false); 
      fetchCredentials(); 
    }, []),
  );

  // Shorten URL function
  const shortenUrl = (url) => {
    return url && url.length > 30 ? url.substring(0, 30) + '...' : url;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Your Saved Credentials</Text>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#888888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder="Search credentials"
          placeholderTextColor="#888888"
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      {/* Show loading indicator while data is being fetched or imported */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#FF6347" style={styles.loadingIndicator} />
      ) : (
        <FlatList
          data={searchCredentials}
          keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.credentialItem}
              onPress={() => navigation.navigate('Details', { id: item.id })}>
              <Text style={styles.credentialTitle}>{item.name || 'No Name'}</Text>
              <Text style={styles.credentialUrl}>URL: {shortenUrl(item.url) || 'No URL'}</Text>
              <Text style={styles.credentialUsername}>Username: {item.username || 'No Username'}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No credentials found.</Text>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('Save')}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.importButton} onPress={handleFileImport}>
        <Icon name="file-upload" size={50} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#2b2b2b',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 15,
  },
  searchIcon: {
    alignSelf: 'center',
  },
  searchBar: {
    flex: 1,
    padding: 10,
    color: '#ffffff',
  },
  credentialItem: {
    backgroundColor: '#2b2b2b',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  credentialTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold'
  },
  credentialUrl: {
    fontSize: 16,
    color: 'skyblue',
  },
  credentialUsername: {
    fontSize: 16,
    color: '#ffffff',
  },
  emptyText: {
    fontSize: 18,
    color: '#888888',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 25,
    right: 25, 
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
  importButton: {
    position: 'absolute',
    bottom: 100,
    right: 25, 
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
});

export default Home;