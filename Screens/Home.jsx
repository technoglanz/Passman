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
  const [isLoading, setIsLoading] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    initializeDatabase();

    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchCredentials = () => {
    setIsLoading(true);
    fetchAllCredentials(
      (creds) => {
        if (isMounted.current) {
          setCredentials(creds);
          setSearchCredentials(creds);
        }
        setIsLoading(false);
      },
      (error) => {
        console.log(error);
        Alert.alert('Error', 'Failed to fetch credentials.');
        setIsLoading(false);
      }
    );
  };

  const handleSearch = (text) => {
    setSearch(text);
    const filteredData = credentials.filter((data) =>
      data.name.toLowerCase().includes(text.toLowerCase())
    );
    setSearchCredentials(filteredData);
  };

  const handleFileImport = async () => {
    const permissionGranted = await requestPermissions();
    if (!permissionGranted) {
      Alert.alert('Permission Denied', 'Storage permission is required to import files.');
      return;
    }
  
    try {
      const data = await selectAndParseCSV();
  
      // If no data (e.g., user canceled or no file), exit early
      if (!data || data.length === 0) {
       console.log('No Data', 'No data found in the selected file.');
        return;
      }
  
      // Process the parsed data
      for (const item of data) {
        await insertCredential(
          item.name,
          item.url,
          item.username,
          item.password,
          () => console.log(`Credential for ${item.name} imported`),
          (error) => console.log('Error inserting credential:', error)
        );
      }
  
      fetchCredentials();
    } catch (error) {
      console.error('Error importing file:', error);
      Alert.alert('Error', 'Failed to import the file.');
    }
  };
  
  
  

  useFocusEffect(
    React.useCallback(() => {
      fetchCredentials();
    }, [])
  );

  const shortenUrl = (url) => (url && url.length > 30 ? `${url.substring(0, 30)}...` : url);

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

      {isLoading ? (
        <ActivityIndicator size="large" color="#FF6347" style={styles.loadingIndicator} />
      ) : (
        <FlatList
          data={searchCredentials}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.credentialItem}
              onPress={() => navigation.navigate('Details', { id: item.id })}
            >
              <Text style={styles.credentialTitle}>{item.name || 'No Name'}</Text>
              <Text style={styles.credentialUrl}>URL: {shortenUrl(item.url) || 'No URL'}</Text>
              <Text style={styles.credentialUsername}>Username: {item.username || 'No Username'}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No credentials found.</Text>}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('Save')}
      >
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
    fontWeight: 'bold',
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
