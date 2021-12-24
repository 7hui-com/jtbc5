export default class tinyDB {
  createTable(tableName, version) {
    return new Promise((resolve, reject) => {
      let conn = indexedDB.open(this.dbName, version);
      conn.addEventListener('upgradeneeded', e => {
        let db = e.target.result;
        if (!db.objectStoreNames.contains(tableName))
        {
          db.createObjectStore(tableName, { keyPath: 'key' });
          resolve(true);
        };
        db.close();
      });
      conn.addEventListener('error', e => { reject(e); });
    });
  };

  getItem(key) {
    return new Promise((resolve, reject) => {
      let tableName = this.tableName;
      let conn = indexedDB.open(this.dbName);
      conn.addEventListener('success', e => {
        let db = e.target.result;
        if (db.objectStoreNames.contains(tableName))
        {
          let req = db.transaction([tableName]).objectStore(tableName).get(key);
          req.addEventListener('success', e => {
            resolve(e.target.result?.value ?? null);
          });
          req.addEventListener('error', e => { reject(e); });
        }
        else
        {
          resolve(null);
        };
        db.close();
      });
      conn.addEventListener('error', e => { reject(e); });
    });
  };

  setItem(key, value) {
    return new Promise((resolve, reject) => {
      let tableName = this.tableName;
      let conn = indexedDB.open(this.dbName);
      conn.addEventListener('success', e => {
        let db = e.target.result;
        let newVersion = db.version + 1;
        if (db.objectStoreNames.contains(tableName))
        {
          let req = db.transaction([tableName], 'readwrite').objectStore(tableName).put({key: key, value: value});
          req.addEventListener('success', e => {
            resolve(true);
          });
          req.addEventListener('error', e => { reject(e); });
        }
        else
        {
          this.createTable(tableName, newVersion).then(() => {
            this.setItem(key, value).then(bool => {
              resolve(bool);
            }).catch(e => { reject(e); });
          });
        };
        db.close();
      });
      conn.addEventListener('error', e => { reject(e); });
    });
  };

  constructor(tableName, dbName = null) {
    this.dbName = dbName ?? 'jtbc';
    this.tableName = tableName;
  };
};