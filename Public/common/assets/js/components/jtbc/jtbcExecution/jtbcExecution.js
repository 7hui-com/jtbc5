export default class jtbcExecution extends HTMLElement {
  static get observedAttributes() {
    return ['url', 'href', 'confirm', 'message', 'text-ok', 'text-cancel'];
  };

  execute() {
    if (this.locked == false && this.currentURL != null)
    {
      this.locked = true;
      let miniMessage = document.getElementById('miniMessage');
      fetch(this.currentURL).then(res => res.ok? res.json(): {}).then(data => {
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
            if (this.currentHref == null)
            {
              target.reload();
            }
            else
            {
              target.href = this.currentHref;
            };
          };
        };
        this.locked = false;
      });
    };
  };

  init() {
    this.addEventListener('click', () => {
      if (this.currentConfirm == true)
      {
        let dialog = document.getElementById('dialog');
        if (dialog != null)
        {
          dialog.confirm(this.currentMessage, () => {
            this.execute();
          }, this.textOk, this.textCancel);
        }
        else
        {
          if (window.confirm(this.currentMessage))
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

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'confirm':
      {
        this.currentConfirm = (newVal == 'false'? false: true);
        break;
      };
      case 'href':
      {
        this.currentHref = newVal;
        break;
      };
      case 'message':
      {
        this.currentMessage = newVal;
        break;
      };
      case 'url':
      {
        this.currentURL = newVal;
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
  };

  constructor() {
    super();
    this.ready = false;
    this.locked = false;
    this.currentConfirm = true;
    this.currentHref = null;
    this.currentMessage = '';
    this.currentURL = null;
    this.textOk = null;
    this.textCancel = null;
    this.init();
  };
};