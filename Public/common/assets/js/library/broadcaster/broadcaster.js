import proxyCreator from '../proxy/proxyCreator.js';

export default class broadcaster {
  #channel = null;
  #channels = {};
  #hooks = {'before': {}, 'after': {}};
  #states = {};
  #statuses = {};
  #mutations = {};

  #clearMutations(channel) {
    this.#mutations[channel] = [];
  };

  #getCurrentChannel(channel) {
    return channel ?? this.#channel ?? String.fromCharCode(106, 116, 98, 99);
  };

  #getHooks(channel, name) {
    return this.#hooks[name][channel];
  };

  #getMutations(channel) {
    let mutations = [];
    if (this.#mutations.hasOwnProperty(channel))
    {
      mutations = this.#mutations[channel];
    }
    else
    {
      this.#mutations[channel] = mutations;
    };
    return mutations;
  };

  #getProxy(channel) {
    let proxy = new proxyCreator(key => this.#pushMutations(channel, key));
    return proxy.create(this.getState(channel));
  };

  #pushMutations(channel, key) {
    let mutations = this.#getMutations(channel);
    if (!mutations.includes(key))
    {
      mutations.push(key);
    };
    return mutations;
  };

  #runHooks(channel, name, state) {
    let result = null;
    let hooks = this.#getHooks(channel, name);
    if (Array.isArray(hooks))
    {
      hooks.forEach(hook => {
        if (hook(state) === false)
        {
          result = false;
        };
      });
    };
    return result;
  };

  after(callback, channel = null) {
    let hooks = this.#hooks.after;
    let currentChannel = this.#getCurrentChannel(channel);
    if (!Array.isArray(hooks[currentChannel]))
    {
      hooks[currentChannel] = [];
    };
    hooks[currentChannel].push(callback);
    return this;
  };

  before(callback, channel = null) {
    let hooks = this.#hooks.before;
    let currentChannel = this.#getCurrentChannel(channel);
    if (!Array.isArray(hooks[currentChannel]))
    {
      hooks[currentChannel] = [];
    };
    hooks[currentChannel].push(callback);
    return this;
  };

  getState(channel = null) {
    let result = {};
    let currentChannel = this.#getCurrentChannel(channel);
    if (this.#states.hasOwnProperty(currentChannel))
    {
      result = this.#states[currentChannel];
    }
    else
    {
      this.#states[currentChannel] = result;
    };
    return result;
  };

  isPublishing(channel = null) {
    let result = false;
    let currentChannel = this.#getCurrentChannel(channel);
    if (this.#statuses[currentChannel] === 1)
    {
      result = true;
    };
    return result;
  };

  async publish(state = {}, channel = null) {
    let result = false;
    let currentChannel = this.#getCurrentChannel(channel);
    if (!this.isPublishing(currentChannel))
    {
      result = null;
      if (state instanceof Object)
      {
        result = undefined;
        this.#statuses[currentChannel] = 1;
        if (this.#runHooks(currentChannel, 'before', state) !== false)
        {
          result = true;
          this.#clearMutations(currentChannel);
          let proxy = this.#getProxy(currentChannel);
          const changeState = (target, state) => {
            Object.keys(state).forEach(key => {
              let value = state[key];
              if (value instanceof Object)
              {
                if (Reflect.has(target, key))
                {
                  changeState(Reflect.get(target, key), value);
                }
                else
                {
                  Reflect.set(target, key, value);
                };
              }
              else
              {
                Reflect.set(target, key, value);
              };
            });
          };
          changeState(proxy, state);
          let mutations = this.#getMutations(currentChannel);
          if (mutations.length != 0)
          {
            result = [];
            let channels = this.#channels;
            if (channels.hasOwnProperty(currentChannel))
            {
              let callbacks = channels[currentChannel];
              if (Array.isArray(callbacks))
              {
                for (let callback of callbacks)
                {
                  result.push(await callback(mutations, state, this.getState(currentChannel)));
                };
              };
            };
          };
          this.#statuses[currentChannel] = 0;
          this.#runHooks(currentChannel, 'after', state);
        };
      }
      else
      {
        throw new Error('Unexpected value');
      };
    };
    return result;
  };

  subscribe(callback, channel = null) {
    let channels = this.#channels;
    let currentChannel = this.#getCurrentChannel(channel);
    if (!Array.isArray(channels[currentChannel]))
    {
      channels[currentChannel] = [];
    };
    channels[currentChannel].push(callback);
    return this.getState(currentChannel);
  };

  switch(channel) {
    this.#channel = channel;
    return this;
  };

  async tryPublish(state = {}, channel = null, delay = 3000) {
    let result = await this.publish(state, channel);
    const nap = delay => new Promise(resolve => setTimeout(resolve, delay));
    while (result === false)
    {
      await nap(delay);
      result = await this.publish(state, channel);
    };
    return result;
  };

  constructor(channel) {
    this.#channel = channel;
  };
};