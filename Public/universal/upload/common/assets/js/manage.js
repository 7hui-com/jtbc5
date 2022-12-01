export default class manage {
  initList() {
    if (this.inited != true)
    {
      this.inited = true;
      let that = this;
      let scarf = this.self.parentNode.querySelector('.scarf');
      scarf.delegateEventListener('span[type=fileurl]', 'click', function(){
        let fileurl = this.getAttribute('fileurl');
        if (this.getAttribute('filegroup') == '1')
        {
          that.imagePreviewer.popup({'filename': this.innerText, 'fileurl': fileurl});
        }
        else
        {
          that.dialog.alert(scarf.getAttribute('data-tips-previewer'), null, null, fileurl);
        };
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
    this.imagePreviewer = document.getElementById('imagePreviewer');
  };
};