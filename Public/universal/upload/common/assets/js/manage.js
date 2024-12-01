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
      scarf.delegateEventListener('span.copy', 'click', function(){
        let self = this;
        if (navigator.clipboard == undefined)
        {
          that.miniMessage.push(self.getAttribute('message-failed'));
        }
        else
        {
          navigator.clipboard.writeText(self.getAttribute('fileurl')).then(function(){
            that.miniMessage.push(self.getAttribute('message-succeed'));
          }, function(){
            that.miniMessage.push(self.getAttribute('message-failed'));
          });
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