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
            this.main.reload();
            this.dialog.close();
            this.leftmenu?.fetch();
          }
          else if (data.code == 4003)
          {
            this.dialog.alert(data.message);
          }
          else
          {
            this.miniMessage.push(data.message);
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
    this.dialog = document.getElementById('dialog');
    this.miniMessage = document.getElementById('miniMessage');
    this.leftmenu = document.getElementById('leftmenu');
  };
};