export default class manage {
  initList() {
    if (this.inited != true)
    {
      this.inited = true;
      let that = this;
      let parentNode = this.self.parentNode;
      parentNode.querySelectorAll('template').forEach(el => {
        el.fetch();
        el.addEventListener('rendercomplete', () => {
          let chiefEl = parentNode.querySelector('div.chief');
          chiefEl.addEventListener('renderend', e => {
            let self = e.target;
            if (self.classList.contains('ppContainer'))
            {
              let itemList = self.querySelector('div.ppItemList');
              self.querySelector('div.ppItemLoading').classList.add('hide');
              if (self.getAttribute('category') == 'package' && itemList != null)
              {
                itemList.delegateEventListener('div.icon', 'mouseover', function(){
                  let img = this.querySelector('img');
                  let boxHeight = Number.parseInt(this.offsetHeight);
                  if (img != null)
                  {
                    let imgHeight = Number.parseInt(img.offsetHeight);
                    if (boxHeight != 0 && imgHeight != 0 && imgHeight > boxHeight)
                    {
                      img.style.transitionDuration = ((imgHeight - boxHeight) / 150) + 's';
                      img.style.transform = 'translateY(-' + (imgHeight - boxHeight) + 'px)';
                    };
                  };
                });
                itemList.delegateEventListener('div.icon', 'mouseout', function(){
                  let img = this.querySelector('img');
                  if (img != null)
                  {
                    img.style.transform = 'translateY(0px)';
                  };
                });
              };
            };
          });
          chiefEl.delegateEventListener('select[name=filter]', 'change', function(){
            that.main.href = this.getAttribute('url') + encodeURIComponent(this.value);
          });
          chiefEl.delegateEventListener('select[name=order_by]', 'change', function(){
            that.main.href = this.getAttribute('url') + encodeURIComponent(this.value);
          });
        });
      });
    };
  };

  initDetail() {
    if (this.inited != true)
    {
      this.inited = true;
      let that = this;
      let parentNode = this.self.parentNode;
      let autostart = this.self.getAttribute('autostart');
      let dialogPopup = parentNode.querySelector('div.dialogPopup');
      dialogPopup.addEventListener('renderend', function(){
        this.querySelector('div[content=loading]')?.classList.add('hide');
        if (autostart == 'true')
        {
          this.querySelector('button.b4.install')?.click();
        };
      });
      dialogPopup.delegateEventListener('.screenshots', 'clicked', function(e){
        let clickedTarget = e.detail.target;
        if (clickedTarget.classList.contains('screenshot'))
        {
          let screenshots = [];
          if (that.imagePreviewer != null)
          {
            clickedTarget.getRootNode().querySelectorAll('img.screenshot').forEach(el => {
              screenshots.push({'fileurl': el.getAttribute('src'), 'selected': el == clickedTarget? true: false});
            });
            that.imagePreviewer.popup(screenshots);
          };
        };
      });
      dialogPopup.delegateEventListener('div.installation', 'monitor', function(){
        setTimeout(() => {
          if (this.isConnected && this.querySelectorAll('div.qrcode').length == 1)
          {
            let installBtn = this.parentNode.querySelector('button.install');
            if (installBtn != null && !installBtn.hasAttribute('monitoring'))
            {
              installBtn.setAttribute('monitoring', 'true');
              fetch(installBtn.getAttribute('prepare_url')).then(res => res.ok? res.json(): {}).then(data => {
                installBtn.removeAttribute('monitoring');
                if (data.code == 200)
                {
                  installBtn.dispatchEvent(new CustomEvent('start', {bubbles: true, detail: {data: data.data}}));
                };
              });
            };
            this.dispatchEvent(new CustomEvent('monitor', {bubbles: true}));
          };
        }, 6000);
      });
      dialogPopup.delegateEventListener('div.installation', 'submitend', function(e){
        let res = e.detail.res;
        if (res.ok)
        {
          res.json().then(data => {
            if (data.code == 1)
            {
              that.leftmenu?.fetch();
              that.rightmenu?.fetch();
              that.dialog.alert(data.message);
            }
            else
            {
              that.miniMessage.push(data.message);
              this.parentNode.querySelectorAll('button.install').forEach(btn => btn.classList.remove('locked'));
            };
            if (data.code == 4201)
            {
              this.querySelector('p.agree')?.scrollIntoView({block: 'end', behavior: 'smooth'});
            };
          });
        };
      });
      dialogPopup.delegateEventListener('button.install', 'start', e => {
        let btn = e.target;
        let data = e.detail.data;
        let installationEl = dialogPopup.querySelector('div.installation');
        let template = parentNode.querySelector('template.installation_' + data.content.category);
        if (installationEl != null && template != null)
        {
          let realTemplate = document.importNode(template, true);
          realTemplate.removeAttribute('class');
          realTemplate.setAttribute('is', 'jtbc-template');
          installationEl.classList.add('on');
          installationEl.html(realTemplate.outerHTML).then(() => {
            installationEl.querySelectorAll('template').forEach(tpl => {
              tpl.parentNode.addEventListener('renderend', function(){
                if (data.content.category == 'module')
                {
                  let currentParam = JSON.parse(data.content.param);
                  Object.keys(currentParam).forEach(key => {
                    this.querySelectorAll('[name="' + key + '"]').forEach(el => {
                      if (el.getAttribute('role') == 'field')
                      {
                        el.setAttribute('value', currentParam[key]);
                      };
                    });
                  });
                };
              });
              tpl.setAttribute('data', JSON.stringify(data));
            });
          });
          btn.setAttribute('class', 'b2 install');
          btn.innerText = btn.getAttribute('text_confirm');
        };
      });
      dialogPopup.delegateEventListener('button.install', 'click', function(){
        if (!this.classList.contains('locked'))
        {
          if (this.classList.contains('b1'))
          {
            let cloudservice = that.root.querySelector('div.topbar')?.querySelector('cloudservice');
            if (cloudservice != null)
            {
              cloudservice.dispatchEvent(new CustomEvent('popup'));
            };
          }
          else if (this.classList.contains('b2'))
          {
            let installationEl = dialogPopup.querySelector('div.installation');
            if (installationEl != null && installationEl.classList.contains('on'))
            {
              let formEl = installationEl.querySelector('form.form');
              if (!formEl.isLocked())
              {
                this.classList.add('locked');
                formEl.submit();
              };
            };
          }
          else
          {
            this.classList.add('locked');
            this.innerText = this.getAttribute('text_loading');
            let installationEl = dialogPopup.querySelector('div.installation');
            fetch(this.getAttribute('prepare_url')).then(res => res.ok? res.json(): {}).then(data => {
              let code = data.code;
              let message = data.message;
              if (code == 1)
              {
                this.classList.add('hide');
                let template = parentNode.querySelector('template.pay');
                if (installationEl != null && template != null)
                {
                  let realTemplate = document.importNode(template, true);
                  realTemplate.removeAttribute('class');
                  realTemplate.setAttribute('is', 'jtbc-template');
                  installationEl.html(realTemplate.outerHTML).then(() => {
                    installationEl.classList.add('on');
                    installationEl.querySelectorAll('template').forEach(tpl => tpl.setAttribute('data', JSON.stringify(data.data)));
                  });
                };
                installationEl.dispatchEvent(new CustomEvent('monitor', {bubbles: true}));
              }
              else if (code == 2)
              {
                this.classList.add('hide');
                let template = parentNode.querySelector('template.payagain');
                if (installationEl != null && template != null)
                {
                  let realTemplate = document.importNode(template, true);
                  realTemplate.removeAttribute('class');
                  realTemplate.setAttribute('is', 'jtbc-template');
                  installationEl.html(realTemplate.outerHTML).then(() => {
                    installationEl.classList.add('on');
                    installationEl.querySelectorAll('template').forEach(tpl => tpl.setAttribute('data', JSON.stringify(data.data)));
                  });
                };
                installationEl.dispatchEvent(new CustomEvent('monitor', {bubbles: true}));
              }
              else if (code == 200)
              {
                this.dispatchEvent(new CustomEvent('start', {bubbles: true, detail: {data: data.data}}));
              }
              else if (code == 4004)
              {
                this.setAttribute('class', 'b1 install');
                this.innerText = message;
              }
              else
              {
                this.classList.remove('locked');
                this.innerText = this.getAttribute('text');
                that.miniMessage.push(message);
              };
            });
          };
        };
      });
      parentNode.querySelectorAll('template').forEach(el => { if (el.getAttribute('mt') == 'true'){ el.fetch(); };});
    };
  };

  readiedCallback() {
    let init = this.self.getAttribute('init');
    if (Reflect.has(this, init)) Reflect.get(this, init).call(this);
  };

  constructor(self) {
    this.self = self;
    this.param = [];
    this.inited = false;
    this.currentHash = null;
    this.root = document.getElementById('root');
    this.main = document.getElementById('main');
    this.dialog = document.getElementById('dialog');
    this.leftmenu = document.getElementById('leftmenu');
    this.rightmenu = document.getElementById('rightmenu');
    this.miniMessage = document.getElementById('miniMessage');
    this.imagePreviewer = document.getElementById('imagePreviewer');
  };
};