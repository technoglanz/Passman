import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  { name: 'credentials.db', location: 'default' },
  () => console.log('Database opened successfully'),
  error => console.log('Error opening database:', error),
);

export const initializeDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS credentials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        password TEXT
      )`,
      [],
      () => console.log('Table created or already exists'),
      error => console.log('Error creating table:', error),
    );
  });
};

export default db;
