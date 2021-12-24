export default class manageUpgrade {
  initDownloadAndUpgradeEvents() {
    let that = this;
    let popup = this.self.parentNode.querySelector('.dialogPopup');
    let upgradeBox = popup.querySelector('.upgradeBox');
    popup.delegateEventListener('div.step2', 'renderend', function(){
      upgradeBox.classList.add('next');
      upgradeBox.style.height = this.offsetHeight + 'px';
    });
    popup.delegateEventListener('div.step2 form', 'submitend', e => {
      let res = e.detail.res;
      let cloudService = this.root.querySelector('.topbar')?.querySelector('cloudservice');
      if (res.ok)
      {
        res.json().then(data => {
          if (data.code == 1)
          {
            this.dialog.alert(data.message);
            let isWelcome = this.main.querySelector('nav.welcome') == null? false: true;
            if (isWelcome == true)
            {
              this.main.reload();
            };
            if (cloudService != null)
            {
              cloudService.dispatchEvent(new CustomEvent('loadurl'));
            };
          }
          else
          {
            this.miniMessage.push(data.message);
          };
        });
      };
    });
    popup.delegateEventListener('div.step2 em.compare', 'click', function(){
      fetch(this.getAttribute('url')).then(res => res.ok? res.json(): {}).then(data => {
        if (data.code == 1)
        {
          that.dialog.fullpage(data.fragment);
        };
      });
    });
    popup.delegateEventListener('button.download', 'click', function(){
      if (!this.classList.contains('locked'))
      {
        this.classList.add('locked');
        upgradeBox.style.height = upgradeBox.querySelector('div.step1').offsetHeight + 'px';
        fetch(this.getAttribute('url')).then(res => res.ok? res.json(): {}).then(data => {
          if (data.code == 1)
          {
            let step2 = upgradeBox.querySelector('div.step2');
            if (step2 != null)
            {
              let templateURL = step2.getAttribute('url') + '&zip_path=' + encodeURIComponent(data.zip_path);
              if (data.hasOwnProperty('genre'))
              {
                templateURL += '&genre=' + encodeURIComponent(data.genre);
              };
              step2.querySelector('template').setAttribute('url', templateURL);
            };
          }
          else
          {
            that.miniMessage.push(data.message);
          };
          this.classList.remove('locked');
        });
      };
    });
  };

  initKernel() {
    if (this.inited != true)
    {
      this.initDownloadAndUpgradeEvents();
      this.inited = true;
    };
  };

  initPackage() {
    if (this.inited != true)
    {
      this.initDownloadAndUpgradeEvents();
      this.inited = true;
    };
  };

  initModule() {
    if (this.inited != true)
    {
      let popup = this.self.parentNode.querySelector('.dialogPopup');
      let step1 = popup.querySelector('.step1');
      step1.delegateEventListener('i.new', 'click', function(){
        let parentNode = this.parentNode;
        step1.querySelectorAll('.genreList li').forEach(el => {
          if (el.contains(parentNode))
          {
            el.dispatchEvent(new CustomEvent('select', {bubbles: true}));
          };
        });
      });
      step1.delegateEventListener('b.href', 'click', function(){
        let listTemplate = popup.querySelector('.listTemplate');
        let downloadButton = popup.querySelector('button.download');
        if (listTemplate != null && downloadButton != null)
        {
          downloadButton.removeAttribute('url');
          downloadButton.classList.add('locked');
          listTemplate.setAttribute('url', this.getAttribute('url'));
        };
      });
      step1.delegateEventListener('.detect', 'click', function(){
        if (!this.classList.contains('locked'))
        {
          this.classList.add('locked');
          let parentNode = this.parentNode;
          fetch(this.getAttribute('url')).then(res => res.ok? res.json(): {}).then(data => {
            if (data.status == 200)
            {
              parentNode.classList.add('new');
              parentNode.innerText = data.new_version;
              step1.querySelectorAll('.genreList li').forEach(el => {
                if (el.contains(parentNode))
                {
                  el.dispatchEvent(new CustomEvent('select', {bubbles: true}));
                };
              });
            }
            else
            {
              parentNode.classList.add('latest');
              parentNode.innerText = parentNode.getAttribute('latest');
            };
          });
        };
      });
      step1.delegateEventListener('.genreList li', 'select', function(){
        this.parentNode.querySelectorAll('li').forEach(el => {
          el.classList.remove('on');
        });
        this.classList.add('on');
        let downloadButton = popup.querySelector('button.download');
        if (downloadButton != null)
        {
          downloadButton.classList.remove('locked');
          downloadButton.setAttribute('url', downloadButton.getAttribute('baseurl') + '&genre=' + encodeURIComponent(this.getAttribute('genre')));
        };
      });
      this.initDownloadAndUpgradeEvents();
      this.inited = true;
    };
  };

  initPlugin() {
    if (this.inited != true)
    {
      let popup = this.self.parentNode.querySelector('.dialogPopup');
      let step1 = popup.querySelector('.step1');
      step1.delegateEventListener('i.new', 'click', function(){
        let parentNode = this.parentNode;
        step1.querySelectorAll('.genreList li').forEach(el => {
          if (el.contains(parentNode))
          {
            el.dispatchEvent(new CustomEvent('select', {bubbles: true}));
          };
        });
      });
      step1.delegateEventListener('.detect', 'click', function(){
        if (!this.classList.contains('locked'))
        {
          this.classList.add('locked');
          let parentNode = this.parentNode;
          fetch(this.getAttribute('url')).then(res => res.ok? res.json(): {}).then(data => {
            if (data.status == 200)
            {
              parentNode.classList.add('new');
              parentNode.innerText = data.new_version;
              step1.querySelectorAll('.genreList li').forEach(el => {
                if (el.contains(parentNode))
                {
                  el.dispatchEvent(new CustomEvent('select', {bubbles: true}));
                };
              });
            }
            else
            {
              parentNode.classList.add('latest');
              parentNode.innerText = parentNode.getAttribute('latest');
            };
          });
        };
      });
      step1.delegateEventListener('.genreList li', 'select', function(){
        this.parentNode.querySelectorAll('li').forEach(el => {
          el.classList.remove('on');
        });
        this.classList.add('on');
        let downloadButton = popup.querySelector('button.download');
        if (downloadButton != null)
        {
          downloadButton.classList.remove('locked');
          downloadButton.setAttribute('url', downloadButton.getAttribute('baseurl') + '&genre=' + encodeURIComponent(this.getAttribute('genre')));
        };
      });
      this.initDownloadAndUpgradeEvents();
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
    this.uniqueId = null;
    this.uniqueSign = null;
    this.root = document.getElementById('root');
    this.main = document.getElementById('main');
    this.master = document.getElementById('master');
    this.dialog = document.getElementById('dialog');
    this.miniMessage = document.getElementById('miniMessage');
  };
};