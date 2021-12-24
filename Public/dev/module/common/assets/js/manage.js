export default class manage {
  initSetting() {
    if (this.inited != true)
    {
      let that = this;
      let scarf = this.self.parentNode.querySelector('.scarf');
      scarf.delegateEventListener('select[name=tableName]', 'change', function(){
        that.main.href = this.getAttribute('url') + '&genre=' + encodeURIComponent(this.parentNode.getAttribute('genre')) + '&tableName=' + encodeURIComponent(this.value);
      });
      this.inited = true;
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