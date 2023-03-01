export default class components {
  #ver = null;

  get ver() {
    return this.#ver;
  };

  set ver(ver) {
    this.#ver = ver;
  };

  async load(components) {
    let result = {
      'errorCount': 0,
      'loadedCount': 0,
      'registeredCount': 0,
      'components': components,
    };
    let names = [];
    let defined = [];
    for (let tag in components)
    {
      let item = components[tag];
      let tagPrefix = tag.substring(0, tag.indexOf('-')).toLowerCase();
      let name = tag.replace(/\-\w/g, letter => letter.substring(1).toUpperCase());
      if (!this.loaded.has(name))
      {
        if (!this.loading.has(name))
        {
          this.loading.add(name);
          try
          {
            let path = item.path;
            if (path == null)
            {
              if (tagPrefix != 'web')
              {
                path = (item.dir ?? './' + tagPrefix + '/') + name + '/' + name + '.js';
              }
              else
              {
                let tagArr = tag.split('-');
                let realDir = '../../../../';
                let realName = tag.substring(tag.lastIndexOf('-') + 1).toLowerCase();
                if (tagArr.length >= 3)
                {
                  tagArr.shift();
                  tagArr.pop();
                  realDir += tagArr.join('-').replace(/\-/g, '/') + '/';
                };
                realDir += 'common/assets/js/components/';
                path = (item.dir ?? realDir) + realName + '/' + realName + '.js';
              };
              if (this.ver != null)
              {
                path = path + '?ver=' + encodeURIComponent(this.ver);
              };
            };
            let options = item.extends? {'extends': item.extends}: {};
            let component = await import(path);
            customElements.define(tag, component.default, options);
            defined.push(customElements.whenDefined(tag));
            names.push(name);
            result.registeredCount += 1;
          }
          catch(e)
          {
            result.errorCount += 1;
            this.loading.delete(name);
          };
        }
        else
        {
          await new Promise((resolve, reject) => {
            let delay = 100;
            let delayed = 0;
            let checkLoading = setInterval(() => {
              delayed += delay;
              if (delayed >= this.loadingTimeLimit)
              {
                reject(name);
                result.errorCount += 1;
                clearInterval(checkLoading);
              }
              else
              {
                if (this.loaded.has(name))
                {
                  resolve(name);
                  result.loadedCount += 1;
                  clearInterval(checkLoading);
                };
              };
            }, delay);
          });
        };
      }
      else
      {
        result.loadedCount += 1;
      };
    };
    if (defined.length != 0)
    {
      await Promise.all(defined);
      names.forEach(name => {
        this.loaded.add(name);
        this.loading.delete(name);
      });
    };
    return result;
  };

  constructor(ver) {
    this.ver = ver;
    this.loaded = new Set();
    this.loading = new Set();
    this.loadingTimeLimit = 30000;
  };
};