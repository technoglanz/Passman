import db from './database';

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

export const insertCredential = (name, email, password, callback, errorCallback) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO credentials (name, email, password) VALUES (?, ?, ?)',
      [name, email, password],
      callback,
      errorCallback,
    );
  });
};
