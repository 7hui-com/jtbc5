export default class manageUninstall {
  initUninstall() {
    if (this.inited != true)
    {
      this.inited = true;
      let popup = this.self.parentNode.querySelector('.dialogPopup');
      popup.delegateEventListener('form', 'submitend', e => {
        let res = e.detail.res;
        res.json().then(data => {
          if (data.code == 1)
          {
            this.leftmenu?.fetch();
          };
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
    this.leftmenu = document.getElementById('leftmenu');
  };
};