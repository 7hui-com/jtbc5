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
    let defined = [];
    for (let tag in components)
    {
      let item = components[tag];
      let tagPrefix = tag.substring(0, tag.indexOf('-')).toLowerCase();
      let name = tag.replace(/\-\w/g, letter => letter.substring(1).toUpperCase());
      if (!this.loaded.includes(name))
      {
        this.loaded.push(name);
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
          result.registeredCount += 1;
        }
        catch(e)
        {
          result.errorCount += 1;
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
    };
    return result;
  };

  constructor(ver) {
    this.ver = ver;
    this.loaded = [];
  };
};