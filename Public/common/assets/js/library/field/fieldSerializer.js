export default class fieldSerializer {
  #mode;
  #parentElement;

  #getConvertedValue(el) {
    let result = el.value;
    if (el.hasAttribute('converter'))
    {
      switch (el.getAttribute('converter')) {
        case 'int':
        {
          result = Number.parseInt(result);
          break;
        };
        case 'float':
        {
          result = Number.parseFloat(result);
          break;
        };
        case 'object':
        {
          result = JSON.parse(result);
          break;
        };
      };
    };
    return result;
  };

  #isMultiField(el) {
    let result = false;
    if (el.getAttribute('multi') == 'true') result = true;
    else
    {
      if (el instanceof HTMLInputElement)
      {
        if (el.getAttribute('type') == 'checkbox')
        {
          result = true;
        };
      };
    };
    return result;
  };

  #isValidField(el) {
    let result = true;
    if (el.getAttribute('invalid') == 'true') result = false;
    else
    {
      if (el instanceof HTMLInputElement)
      {
        if (['radio', 'checkbox'].includes(el.getAttribute('type')) && el.checked != true)
        {
          result = false;
        };
      };
    };
    return result;
  };

  getContentType() {
    let result = null;
    let mode = this.#mode;
    if (mode == 'json')
    {
      result = 'application/json';
    }
    else if (mode == 'queryString')
    {
      result = 'application/x-www-form-urlencoded';
    };
    return result;
  };

  makeFetchOptions(method = 'POST') {
    return {
      'method': method,
      'headers': {
        'Content-Type': this.getContentType(),
      },
      'body': this.serialize(),
    };
  };

  serialize() {
    let result = null;
    let mode = this.#mode;
    let parentElement = this.#parentElement;
    if (parentElement instanceof HTMLElement)
    {
      let fields = parentElement.querySelectorAll('[role=field]');
      if (mode == 'json')
      {
        let params = {};
        fields.forEach(el => {
          if (!params.hasOwnProperty(el.name))
          {
            if (!this.#isMultiField(el))
            {
              if (this.#isValidField(el)) params[el.name] = this.#getConvertedValue(el);
            }
            else
            {
              let multiElValue = [];
              fields.forEach(mel => {
                if (mel.name == el.name)
                {
                  if (this.#isValidField(mel)) multiElValue.push(this.#getConvertedValue(mel));
                };
              });
              params[el.name] = multiElValue;
            };
          };
        });
        result = JSON.stringify(params);
      }
      else if (mode == 'queryString')
      {
        let params = new URLSearchParams();
        fields.forEach(el => {
          if (this.#isValidField(el)) params.append(el.name, el.value);
        });
        result = params.toString();
      };
    };
    return result;
  };

  constructor(parentElement, mode = 'queryString') {
    this.#mode = mode;
    this.#parentElement = parentElement;
  };
};