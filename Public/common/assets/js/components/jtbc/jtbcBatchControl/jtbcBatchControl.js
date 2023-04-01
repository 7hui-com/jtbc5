export default class jtbcBatchControl extends HTMLDivElement {
  static get observedAttributes() {
    return ['url', 'partner', 'message', 'text-ok', 'text-cancel'];
  };

  #url = null;
  #partner = null;
  #message = null;

  get partner() {
    return document.getElementById(this.#partner) ?? document.querySelector(this.#partner);
  };

  get url() {
    return this.#url;
  };

  get type() {
    let result = null;
    let typeEl = this.querySelector('[role=type]');
    if (typeEl != null && typeEl.options.length != 0)
    {
      result = {
        'name': typeEl.value,
        'text': typeEl.options[typeEl.selectedIndex].text,
      };
    };
    return result;
  };

  execute() {
    if (this.locked == false && this.url != null)
    {
      this.locked = true;
      let type = this.type;
      let partner = this.partner;
      let checked = partner.getChecked();
      let params = new URLSearchParams();
      params.set('type', type.name);
      if (Array.isArray(checked))
      {
        checked.forEach(item => {
          params.append('id[]', item);
        });
      };
      let fetchInit = {
        'method': 'post',
        'headers': {'Content-Type': 'application/x-www-form-urlencoded'},
        'body': params.toString(),
      };
      let miniMessage = document.getElementById('miniMessage');
      fetch(this.url, fetchInit).then(res => res.ok? res.json(): {}).then(data => {
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
            this.getTarget().reload();
          };
        };
        this.locked = false;
      });
    };
  };

  submit() {
    let type = this.type;
    let partner = this.partner;
    let message = this.#message;
    if (type != null && partner != null && message != null)
    {
      if (Reflect.has(partner, 'getChecked'))
      {
        let checked = partner.getChecked();
        let dialog = document.getElementById('dialog');
        if (!Array.isArray(checked))
        {
          if (this.hasAttribute('empty_tips'))
          {
            let emptyTips = this.getAttribute('empty_tips');
            if (dialog != null)
            {
              dialog.alert(emptyTips);
            }
            else
            {
              window.alert(emptyTips);
            };
          };
        }
        else
        {
          message = message.replace(/\[\]/g, '[' + type.text + ']');
          if (dialog != null)
          {
            dialog.confirm(message, () => {
              this.execute();
            }, this.textOk, this.textCancel);
          }
          else
          {
            if (window.confirm(message))
            {
              this.execute();
            };
          };
        };
      };
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'partner':
      {
        this.#partner = newVal;
        break;
      };
      case 'message':
      {
        this.#message = newVal;
        break;
      };
      case 'url':
      {
        this.#url = newVal;
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
    this.textOk = null;
    this.textCancel = null;
    this.delegateEventListener('[role=submit]', 'click', () => { this.submit(); });
  };
};