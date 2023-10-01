export default class proxyCreator {
  #changedCallbacks = [];

  get changedCallbacks() {
    return this.#changedCallbacks;
  };

  #getCurrentKey(parentKey, key) {
    return parentKey.length == 0? key: (parentKey + '.' + key);
  };

  addChangedCallback(changedCallback) {
    if (changedCallback != null)
    {
      if (changedCallback instanceof Function)
      {
        this.#changedCallbacks.push(changedCallback);
      }
      else
      {
        throw new Error('Unexpected value');
      };
    };
    return this;
  };

  create(data, parentKey = '') {
    return new Proxy(data, {
      'deleteProperty': (target, key) => {
        let result = false;
        if (Reflect.deleteProperty(target, key))
        {
          result = true;
          this.changedCallbacks.forEach(callback => callback(this.#getCurrentKey(parentKey, key), undefined, 'delete'));
        };
        return result;
      },
      'get': (target, key) => {
        let result = null;
        if (key == '__isProxy')
        {
          result = true;
        }
        else if (key == '__target__')
        {
          result = target;
        }
        else
        {
          result = Reflect.get(target, key);
          if (typeof(key) == 'string' && result instanceof Object && result.__isProxy !== true)
          {
            result = this.create(result, this.#getCurrentKey(parentKey, key));
          };
        };
        return result;
      },
      'set': (target, key, value) => {
        let result = false;
        if (Reflect.get(target, key) != value)
        {
          if (Reflect.set(target, key, value))
          {
            result = true;
            this.changedCallbacks.forEach(callback => callback(this.#getCurrentKey(parentKey, key), value, 'set'));
          };
        };
        return result;
      },
    });
  };

  constructor(changedCallback = null) {
    this.addChangedCallback(changedCallback);
  };
};