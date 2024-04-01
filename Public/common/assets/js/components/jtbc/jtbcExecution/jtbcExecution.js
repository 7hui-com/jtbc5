export default class jtbcExecution extends HTMLElement {
  static get observedAttributes() {
    return ['credentials', 'url', 'href', 'message', 'silent', 'with-global-headers', 'text-ok', 'text-cancel'];
  };

  #credentials = 'same-origin';
  #href = null;
  #message = '';
  #URL = null;
  #silent = false;
  #credentialsList = ['include', 'same-origin', 'omit'];
  #withGlobalHeaders = null;

  get credentials() {
    return this.#credentials;
  };

  get href() {
    return this.#href;
  };

  get message() {
    return this.#message;
  };

  get URL() {
    return this.#URL;
  };

  set credentials(credentials) {
    if (this.#credentialsList.includes(credentials))
    {
      this.#credentials = credentials;
    }
    else
    {
      throw new Error('Unexpected value');
    };
  };

  set href(href) {
    this.#href = href;
  };

  set message(message) {
    this.#message = message;
  };

  set URL(URL) {
    this.#URL = URL;
  };

  #getFetchParams() {
    let withGlobalHeaders = this.#withGlobalHeaders;
    let result = {'method': 'get', 'credentials': this.#credentials};
    if (withGlobalHeaders != null)
    {
      let broadcaster = getBroadcaster('fetch');
      let state = broadcaster.getState();
      if (state.hasOwnProperty(withGlobalHeaders))
      {
        result.headers = state[withGlobalHeaders];
      };
    };
    return result;
  };

  #initEvents() {
    this.addEventListener('click', () => {
      if (!this.isSilentMode())
      {
        let dialog = document.getElementById('dialog');
        if (dialog != null)
        {
          dialog.confirm(this.message, () => {
            this.execute();
          }, this.textOk, this.textCancel);
        }
        else
        {
          if (window.confirm(this.message))
          {
            this.execute();
          };
        };
      }
      else
      {
        this.execute();
      };
    });
  };

  isSilentMode() {
    return this.#silent == true? true: false;
  };

  execute() {
    if (this.locked == false && this.URL != null)
    {
      this.locked = true;
      let miniMessage = document.getElementById('miniMessage');
      fetch(this.URL, this.#getFetchParams()).then(res => res.ok? res.json(): {}).then(data => {
        if (Number.isInteger(data.code))
        {
          if (data.code != 1)
          {
            if (miniMessage == null)
            {
              window.alert(data.message);
            }
            else
            {
              miniMessage.push(data.message);
            };
          }
          else
          {
            let target = this.getTarget();
            if (this.href == null)
            {
              target.reload();
            }
            else
            {
              target.href = this.href;
            };
          };
        };
        this.locked = false;
      });
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'credentials':
      {
        this.credentials = newVal;
        break;
      };
      case 'href':
      {
        this.href = newVal;
        break;
      };
      case 'message':
      {
        this.message = newVal;
        break;
      };
      case 'url':
      {
        this.URL = newVal;
        break;
      };
      case 'silent':
      {
        this.#silent = this.hasAttribute('silent')? true: false;
        break;
      };
      case 'with-global-headers':
      {
        this.#withGlobalHeaders = newVal;
        break;
      };
      case 'text-ok':
      {
        this.textOk = newVal;
        break;
      };
      case 'text-cancel':
      {
        this.textCancel = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.#initEvents();
  };

  constructor() {
    super();
    this.ready = false;
    this.locked = false;
    this.textOk = null;
    this.textCancel = null;
  };
};