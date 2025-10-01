export default class manage {
  initList() {
    if (this.inited != true)
    {
      this.inited = true;
      let scarf = this.self.parentNode.querySelector('.scarf');
      scarf.delegateEventListener('jtbc-field-select2[name=genre]', 'selected', e => {
        this.main.href = e.target.getAttribute('url') + encodeURIComponent(e.target.value);
      });
    };
  };

  readiedCallback() {
    let init = this.self.getAttribute('init');
    if (Reflect.has(this, init)) Reflect.get(this, init).call(this);
  };

  constructor(self) {
    this.self = self;
    this.inited = false;
    this.root = document.getElementById('root');
    this.main = document.getElementById('main');
    this.master = document.getElementById('master');
    this.dialog = document.getElementById('dialog');
    this.miniMessage = document.getElementById('miniMessage');
  };
};