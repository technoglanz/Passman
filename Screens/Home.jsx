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
  PermissionsAndroid,
  Linking,
  Platform
} from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import Papa from 'papaparse';

const Home = ({ navigation }) => {
  const [credentials, setCredentials] = useState([]);
  const [searchCredentials, setSearchCredentials] = useState([]);
  const [search, setSearch] = useState('');

  const isMounted = useRef(true);

  const db = SQLite.openDatabase(
    { name: 'credentials.db', location: 'default' },
    () => {},
    (error) => {
      console.log(error);
      if (isMounted.current) {
        Alert.alert('Error', 'Failed to open the database.');
      }
    }
  );

  // Create the table if it doesn't exist
  useEffect(() => {
    isMounted.current = true;

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
          if (isMounted.current) {
            Alert.alert('Error', 'Failed to create table.');
          }
        }
      );
    });

    return () => {
      isMounted.current = false;
    };
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
          if (isMounted.current) {
            setCredentials(tempCredentials);
            setSearchCredentials(tempCredentials);
          }
        },
        (error) => {
          console.log(error);
          if (isMounted.current) {
            Alert.alert('Error', 'Failed to fetch credentials.');
          }
        }
      );
    });
  };

  const handleSearch = (text) => {
    setSearch(text);
    const filteredData = credentials.filter((data) =>
      data.name.toLowerCase().includes(text.toLowerCase())
    );
    if (isMounted.current) {
      setSearchCredentials(filteredData);
    }
  };

  const requestPermissions = async () => {
    try {
      // Check if permissions are required for the current platform
      if (Platform.OS !== 'android') {
        console.log('Permissions are not required for non-Android platforms.');
        return;
      }
  
      // Check for Android version (MANAGE_EXTERNAL_STORAGE is required for Android 11+)
      const androidVersion = parseInt(Platform.Version, 10);
  
      if (androidVersion >= 30) {
        // For Android 11+ (API 30+), MANAGE_EXTERNAL_STORAGE is not handled directly by PermissionsAndroid
        const readGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
        const writeGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
  
        if (!readGranted || !writeGranted) {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          ]);
  
          if (
            granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] !== PermissionsAndroid.RESULTS.GRANTED ||
            granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] !== PermissionsAndroid.RESULTS.GRANTED
          ) {
            Alert.alert(
              'Permissions Denied',
              'You have denied storage permissions. Please enable them in app settings.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => Linking.openSettings() },
              ]
            );
            return;
          }
        }
  
        // Check MANAGE_EXTERNAL_STORAGE manually
        const manageGranted = await PermissionsAndroid.check('android.permission.MANAGE_EXTERNAL_STORAGE');
        if (!manageGranted) {
          Alert.alert(
            'Manage All Files Access',
            'Please grant "All Files Access" for this app manually in the settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
        }
  
        console.log('Permissions granted successfully for Android 11+');
      } else {
        // For Android 10 and below
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);
  
        if (
          granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] !== PermissionsAndroid.RESULTS.GRANTED ||
          granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] !== PermissionsAndroid.RESULTS.GRANTED
        ) {
          Alert.alert(
            'Permissions Denied',
            'You have denied storage permissions. Please enable them in app settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
          return;
        }
  
        console.log('Permissions granted successfully for Android 10 and below');
      }
    } catch (err) {
      console.error('Error requesting permissions:', err);
      Alert.alert('Error', 'An error occurred while requesting permissions.');
    }
  };
  

  useFocusEffect(
    React.useCallback(() => {
      requestPermissions();
      fetchCredentials();
    }, [])
  );

  const selectFile = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
  
      console.log('Selected file:', res);
  
      const { uri, name } = res[0];
      
      // Check if URI exists
      if (!uri) {
        console.error('Error: No URI found in the selected file');
        Alert.alert('Error', 'No URI found in the selected file.');
        return;
      }
  
      console.log('File URI:', uri);
  
      // On Android, the URI is a content URI; resolve it to a file path
      if (Platform.OS === 'android') {
        if (uri.startsWith('content://')) {
          // Use react-native-fs to read the content URI directly (no need to copy)
          const fileContent = await RNFS.readFile(uri, 'utf8');
          console.log('File content:', fileContent);
  
          // Parse CSV
          Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
              const importedCredentials = result.data;
              importedCredentials.forEach((credential) => {
                db.transaction((tx) => {
                  tx.executeSql(
                    'INSERT INTO credentials (name, email, password) VALUES (?, ?, ?)',
                    [credential.name, credential.username, credential.password],
                    () => {
                      console.log(`Credential for ${credential.name} imported successfully`);
                    },
                    (error) => {
                      console.log('Error inserting credential', error);
                    }
                  );
                });
              });
              fetchCredentials();
            },
            error: (err) => {
              console.error('Error parsing CSV:', err);
              Alert.alert('Error', 'There was a problem reading the CSV file.');
            },
          });
        } else {
          // If not content:// URI, fallback case
          console.error('Invalid URI format');
          Alert.alert('Error', 'Invalid file URI format.');
        }
      } else {
        // For iOS or other platforms, we handle it differently
        const fileContent = await RNFS.readFile(uri, 'utf8');
        console.log('File content:', fileContent);
  
        // Parse CSV
        Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const importedCredentials = result.data;
            importedCredentials.forEach((credential) => {
              db.transaction((tx) => {
                tx.executeSql(
                  'INSERT INTO credentials (name, email, password) VALUES (?, ?, ?)',
                  [credential.name, credential.email, credential.password],
                  () => {
                    console.log(`Credential for ${credential.name} imported successfully`);
                  },
                  (error) => {
                    console.log('Error inserting credential', error);
                  }
                );
              });
            });
            fetchCredentials();
          },
          error: (err) => {
            console.error('Error parsing CSV:', err);
            Alert.alert('Error', 'There was a problem reading the CSV file.');
          },
        });
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User canceled the picker');
      } else {
        console.error('DocumentPicker Error:', err);
        Alert.alert('Error', 'An error occurred while selecting the file.');
      }
    }
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
      <FlatList
  data={searchCredentials}
  keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
  renderItem={({ item }) => (
    <TouchableOpacity
      style={styles.credentialItem}
      onPress={() => navigation.navigate('Details', { id: item.id })}
    >
      <Text style={styles.credentialTitle}>{item.name || 'No Name'}</Text>
      <Text style={styles.credentialEmail}>Username: {item.email ? encrypt(item.email) : 'No Email'}</Text>
      <Text style={styles.credentialPassword}>Password: {item.password ? '******' : 'No Password'}</Text>
    </TouchableOpacity>
  )}
  ListEmptyComponent={<Text style={styles.emptyText}>No credentials found.</Text>}
  showsVerticalScrollIndicator={false}
/>
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('Save')}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.importButton} onPress={() => selectFile()}>
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
  credentialEmail: {
    fontSize: 16,
    color: '#ffffff',
  },
  credentialPassword: {
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
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Home;
