export default class treeDiffer {
  #idKey;
  #childrenKey;
  #ignoreKeys;
  #oldArray;
  #newArray;

  #diffArray(oldArray, newArray, parentPath) {
    let changes = [];
    let oldMap = new Map();
    let newMap = new Map();
    const joinPath = (parentPath, segment) => {
      return parentPath ? `${parentPath}/${segment}` : `/${segment}`;
    };
    const toPlainObject = obj => {
      if (!obj || typeof obj !== 'object') return obj;
      let result = {};
      for (let key of Object.keys(obj))
      {
        if (key !== this.#childrenKey)
        {
          result[key] = obj[key];
        };
      };
      return result;
    };
    for (let item of oldArray || [])
    {
      let id = item[this.#idKey];
      if (id !== undefined && id !== null)
      {
        oldMap.set(String(id), item);
      };
    };
    for (let item of newArray || [])
    {
      let id = item[this.#idKey];
      if (id !== undefined && id !== null)
      {
        newMap.set(String(id), item);
      };
    };
    for (let [id, oldItem] of oldMap)
    {
      if (!newMap.has(id))
      {
        changes.push({
          type: 'removed',
          path: joinPath(parentPath, id),
          oldValue: toPlainObject(oldItem),
        });
      };
    };
    for (let [id, newItem] of newMap)
    {
      if (!oldMap.has(id))
      {
        changes.push({
          type: 'added',
          path: joinPath(parentPath, id),
          newValue: toPlainObject(newItem),
        });
      };
    };
    for (let [id, oldItem] of oldMap)
    {
      let newItem = newMap.get(id);
      if (newItem)
      {
        let itemPath = joinPath(parentPath, id);
        this.#diffObject(oldItem, newItem, itemPath, changes);
      };
    };
    return changes;
  };

  #diffObject(oldObject, newObject, path, changes) {
    let allKeys = new Set([
      ...Object.keys(oldObject || {}),
      ...Object.keys(newObject || {}),
    ]);
    const deepEqual = (a, b) => {
      if (a === b) return true;
      if (a == null || b == null) return a === b;
      if (typeof a !== typeof b) return false;
      if (typeof a === 'object')
      {
        if (Array.isArray(a) && Array.isArray(b))
        {
          if (a.length !== b.length) return false;
          return a.every((item, i) => deepEqual(item, b[i]));
        };
        if (!Array.isArray(a) && !Array.isArray(b))
        {
          let aKeys = Object.keys(a);
          let bKeys = Object.keys(b);
          if (aKeys.length !== bKeys.length) return false;
          return aKeys.every(key => deepEqual(a[key], b[key]));
        };
        return false;
      };
      return a === b;
    };
    for (let key of allKeys)
    {
      if (key === this.#idKey) continue;
      if (this.#ignoreKeys.has(key)) continue;
      if (key === this.#childrenKey)
      {
        let oldChildren = (oldObject && oldObject[this.#childrenKey]) || [];
        let newChildren = (newObject && newObject[this.#childrenKey]) || [];
        let childChanges = this.#diffArray(oldChildren, newChildren, path);
        changes.push(...childChanges);
      }
      else
      {
        let oldVal = oldObject ? oldObject[key] : undefined;
        let newVal = newObject ? newObject[key] : undefined;
        if (!deepEqual(oldVal, newVal))
        {
          changes.push({
            type: 'modified',
            path: `${path}.${key}`,
            oldValue: oldVal,
            newValue: newVal,
          });
        };
      };
    };
  };

  diff(oldArray, newArray) {
    this.#oldArray = oldArray ?? [];
    this.#newArray = newArray ?? [];
    let changes = this.#diffArray(this.#oldArray, this.#newArray, '');
    changes.sort((a, b) => a.path.localeCompare(b.path));
    let summary = {
      added: changes.filter(c => c.type === 'added').length,
      removed: changes.filter(c => c.type === 'removed').length,
      modified: changes.filter(c => c.type === 'modified').length,
      total: changes.length,
    };
    return { changes, summary };
  };

  constructor(options = {}) {
    this.#idKey = options.idKey ?? 'id';
    this.#childrenKey = options.childrenKey ?? 'children';
    this.#ignoreKeys = new Set(options.ignoreKeys ?? []);
  };
};