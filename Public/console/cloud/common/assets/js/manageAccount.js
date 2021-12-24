export default class manageAccount {
  initModify() {
    if (this.inited != true)
    {
      this.inited = true;
      let popup = this.self.parentNode.querySelector('.dialogPopup');
      popup.delegateEventListener('div.mainBox', 'renderend', function(){
        this.querySelectorAll('div.loading').forEach(el => {
          el.remove();
        });
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