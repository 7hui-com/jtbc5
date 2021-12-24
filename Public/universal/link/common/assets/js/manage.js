export default class manage {
  initList() {
    if (this.inited != true)
    {
      let that = this;
      let scarf = this.self.parentNode.querySelector('.scarf');
      scarf.delegateEventListener('select[name=group]', 'change', function(){
        that.main.href = this.getAttribute('url') + encodeURIComponent(this.value);
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
    this.main = document.getElementById('main');
  };
};