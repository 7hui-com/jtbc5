export default class manage {
  initEdit() {
    if (this.inited != true)
    {
      this.inited = true;
      let scarf = this.self.parentNode.querySelector('.scarf');
      scarf.delegateEventListener('button.replace', 'uploadend', e => {
        let data = e.detail.data;
        if (data.code == 1) this.main.reload();
      });
    };
  };

  initList() {
    if (this.inited != true)
    {
      this.inited = true;
      let that = this;
      let scarf = this.self.parentNode.querySelector('.scarf');
      scarf.delegateEventListener('button.add', 'click', function(){
        this.parentNode.querySelector('input.file').click();
      });
      scarf.delegateEventListener('input.file', 'change', function(){
        let progress = scarf.querySelector('.progress');
        if (progress != null && that.currentUploading != true)
        {
          that.currentUploading = true;
          progress.startUpload(this, () => {}, () => {
            if (progress.uploaded.error === 0)
            {
              that.main.reload();
            }
            else
            {
              progress.scrollIntoView({block: 'end', behavior: 'smooth'});
            };
            that.currentUploading = false; 
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
    this.currentUploading = false;
    this.root = document.getElementById('root');
    this.main = document.getElementById('main');
    this.master = document.getElementById('master');
    this.dialog = document.getElementById('dialog');
    this.miniMessage = document.getElementById('miniMessage');
  };
};