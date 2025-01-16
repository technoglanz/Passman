import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  { name: 'credentials.db', location: 'default' },
  () => console.log('Database opened successfully'),
  error => console.log('Error opening database:', error),
);

// Initialize the database
export const initializeDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS credentials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        username TEXT NOT NULL,
        password TEXT NOT NULL
      )`,
      [],
      () => console.log('Table created or already exists'),
      error => console.log('Error creating table:', error),
    );
  });
};

export default db;
