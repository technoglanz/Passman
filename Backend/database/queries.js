import db from './database';
import { Alert } from 'react-native';

// Fetch all credentials from the database
export const fetchAllCredentials = (callback, errorCallback) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM credentials',
      [],
      (tx, results) => {
        const credentials = [];
        for (let i = 0; i < results.rows.length; i++) {
          credentials.push(results.rows.item(i));
        }
        callback(credentials);
      },
      error => errorCallback(error),
    );
  });
};

// Insert a new credential into the database
export const insertCredential = (
  name,
  url,
  username,
  password,
  callback,
  errorCallback,
) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO credentials (name, url, username, password) VALUES (?, ?, ?, ?)',
      [name, url, username, password],
      callback,
      errorCallback,
    );
  });
};

// Update an existing credential in the database
export const handleUpdate = (
  id,
  name,
  url,
  username,
  password,
  callback,
  errorCallback,
) => {
  db.transaction(tx => {
    tx.executeSql(
      'UPDATE credentials SET name = ?, url = ?, username = ?, password = ? WHERE id = ?',
      [name, url, username, password, id],
      callback,
      errorCallback,
    );
  });
};

// Delete a credential from the database
export const handleDelete = (id, navigation, callback, errorCallback) => {
  Alert.alert(
    'Confirm Delete',
    'Are you sure you want to delete this credential?',
    [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          db.transaction(tx => {
            tx.executeSql(
              'DELETE FROM credentials WHERE id = ?',
              [id],
              () => {
                callback(); // Calling the callback to refresh data if needed
                Alert.alert('Deleted', 'Credential deleted successfully!');
                navigation.goBack(); // Go back after deleting
              },
              error => {
                console.error('Error deleting credential:', error);
                errorCallback(error);
              },
            );
          });
        },
      },
    ],
  );
};
