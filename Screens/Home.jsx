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
import { fetchAllCredentials, insertCredential } from '../database/queries';
import { selectAndParseCSV } from '../utils/fileUtils';
import { requestPermissions } from '../utils/permissions';
import { initializeDatabase } from '../database/database';
import { encrypt } from '../utils/fileUtils';

const Home = ({ navigation }) => {
  const [credentials, setCredentials] = useState([]);
  const [searchCredentials, setSearchCredentials] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    initializeDatabase();
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchCredentials = () => {
    setLoading(true);
    fetchAllCredentials(
      creds => {
        if (isMounted.current) {
          setCredentials(creds);
          setSearchCredentials(creds);
        }
        setLoading(false);
      },
      error => {
        console.error(error);
        Alert.alert('Error', 'Failed to fetch credentials.');
        setLoading(false);
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
    const permissionGranted = await requestPermissions();
    if (permissionGranted) {
      selectAndParseCSV(
        data => {
          data.forEach(item => {
            insertCredential(
              item.name,
              item.email,
              item.password,
              () => console.log(`Credential for ${item.name} imported`),
              error => console.error('Error inserting credential:', error),
            );
          });
          fetchCredentials();
        },
        error => {
          console.error('Error parsing CSV:', error);
          Alert.alert('Error', 'Failed to read the CSV file.');
        },
      );
    } else {
      Alert.alert('Permission Denied', 'Storage permission is required to import files.');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchCredentials();
    }, []),
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.credentialItem}
      onPress={() => navigation.navigate('Details', { id: item.id })}>
      <Text style={styles.credentialTitle}>{item.name || 'No Name'}</Text>
      <Text style={styles.credentialEmail}>
        Username: {item.email ? encrypt(item.email) : 'No Email'}
      </Text>
      <Text style={styles.credentialPassword}>
        Password: {item.password ? '******' : 'No Password'}
      </Text>
    </TouchableOpacity>
  );

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
      {loading ? (
        <ActivityIndicator size="large" color="#ffffff" />
      ) : (
        <FlatList
          data={searchCredentials}
          keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="lock-outline" size={50} color="#888888" />
              <Text style={styles.emptyText}>No credentials found.</Text>
            </View>
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
        <Icon name="file-upload" size={30} color="#ffffff" />
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
  credentialEmail: {
    fontSize: 16,
    color: '#ffffff',
  },
  credentialPassword: {
    fontSize: 16,
    color: '#ffffff',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#888888',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 25,
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
  importButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Home;
