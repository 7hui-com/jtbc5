export default class fieldSerializer {
  #mode;
  #parentElement;

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
              if (this.#isValidField(el)) params[el.name] = el.value;
            }
            else
            {
              let multiElValue = [];
              fields.forEach(mel => {
                if (mel.name == el.name)
                {
                  if (this.#isValidField(mel)) multiElValue.push(mel.value);
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