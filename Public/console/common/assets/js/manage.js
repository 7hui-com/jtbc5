export default class manage {
  initLogin() {
    if (this.inited != true)
    {
      this.inited = true;
      let login = this.root.querySelector('.login');
      let firstStepFrom = login.querySelector('form[step=first]');
      login.querySelectorAll('div.field input[role=field]').forEach(el => {
        el.addEventListener('focus', e => {
          e.target.parentElement.classList.add('on');
        });
        el.addEventListener('blur', e => {
          e.target.parentElement.classList.remove('on');
        });
      });
      firstStepFrom.addEventListener('submitend', e => {
        let res = e.detail.res;
        if (res.ok)
        {
          res.json().then(data => {
            if (data.code == 1)
            {
              this.master.instance.dashboard();
            }
            else
            {
              login.querySelector('.message').innerText = data.message;
              if (data.hasOwnProperty('nextstep'))
              {
                firstStepFrom.parentElement.html(data.nextstep);
              };
            };
          });
        };
      });
    };
  };

  initDashboard() {
    if (this.inited != true)
    {
      this.inited = true;
      let topbar = this.root.querySelector('.topbar');
      let container = this.root.querySelector('.container');
      let cloudService = topbar.querySelector('.cloudservice');
      let leftmenu = container.querySelector('.leftmenu');
      let main = document.getElementById('main');
      let notification = document.getElementById('notification');
      topbar.querySelector('span.menu').addEventListener('click', () => {
        if (topbar.classList.contains('min'))
        {
          topbar.classList.remove('min');
          leftmenu.classList.remove('min');
        }
        else
        {
          topbar.classList.add('min');
          leftmenu.classList.add('min');
        };
      });
      topbar.delegateEventListener('span.lang', 'click', function(){
        let lang = this.getAttribute('lang');
        let langEl = topbar.querySelector('lang');
        if (langEl != null && langEl.getAttribute('lang') != lang)
        {
          if (!langEl.classList.contains('lock'))
          {
            langEl.classList.add('lock');
            let fullURL = langEl.getAttribute('url') + '&lang=' + lang;
            fetch(fullURL).then(res => res.ok? res.json(): {}).then(data => {
              if (data.code == 1)
              {
                let flag = langEl.querySelector('flag');
                if (flag != null)
                {
                  flag.className = 'f' + data.data.currentLang;
                  flag.nextElementSibling.innerText = data.data.currentLangText;
                  let navLastAnchor = container.querySelector('nav a[is=jtbc-anchor]:last-of-type');
                  if (navLastAnchor != null) navLastAnchor.click();
                };
                langEl.setAttribute('lang', data.data.currentLang);
              };
              langEl.classList.remove('lock');
            });
          };
        };
      });
      topbar.delegateEventListener('notification', 'renderend', function(e){
        if (this == e.target)
        {
          if (Number.parseInt(this.querySelector('ul').getAttribute('count')) == 0)
          {
            this.classList.add('hide');
          }
          else
          {
            this.classList.remove('hide');
          };
        };
      });
      leftmenu.delegateEventListener('a.tit', 'click', function(){
        if (!leftmenu.classList.contains('min'))
        {
          let thisEl = this;
          let nextEl = thisEl.nextElementSibling;
          if (nextEl != null)
          {
            if (nextEl.classList.contains('open'))
            {
              thisEl.classList.remove('open');
              nextEl.classList.remove('open');
            }
            else
            {
              thisEl.classList.add('open');
              nextEl.classList.add('open');
            };
          };
        };
      });
      leftmenu.addEventListener('loadChildren', e => {
        let childrenData = e.detail.res[1];
        const formatChildMenu = (arr, index) => {
          let result = null;
          if (Array.isArray(arr) && arr.length != 0)
          {
            let dl = document.createElement('dl');
            dl.setAttribute('rank', index);
            arr.forEach(cl => {
              let dd = document.createElement('dd');
              let anchor = document.createElement('a');
              let text = document.createElement('b');
              let triangle = document.createElement('jtbc-svg');
              anchor.setAttribute('is', 'jtbc-anchor');
              anchor.setAttribute('class', 'tit');
              anchor.setAttribute('genre', cl['genre']);
              anchor.setAttribute('href', cl['link']);
              text.innerText = cl['title'];
              triangle.setAttribute('class', 'triangle');
              triangle.setAttribute('name', 'triangle');
              anchor.append(text);
              anchor.append(triangle);
              dd.append(anchor);
              let myChildMenu = formatChildMenu(cl['children'], index + 1);
              if (myChildMenu != null)
              {
                dd.append(myChildMenu);
                let arrow = document.createElement('jtbc-svg');
                arrow.setAttribute('class', 'arrow');
                arrow.setAttribute('name', 'arrow_down');
                anchor.append(arrow);
              };
              dl.append(dd);
            });
            result = dl;
          };
          return result;
        };
        let result = formatChildMenu(childrenData, 2);
        e.detail.result = result == null? '': result.outerHTML;
      });
      leftmenu.addEventListener('selectmenu', function(){
        this.querySelectorAll('li').forEach(el => { el.classList.remove('on'); });
        this.querySelectorAll('a.tit').forEach(el => { el.classList.remove('on'); });
        let accurateEl = this.querySelector('a.tit[genre="' + this.getAttribute('genre') + '"]');
        if (accurateEl != null)
        {
          accurateEl.classList.add('on');
          this.querySelectorAll('li').forEach(el => {
            if (el.contains(accurateEl))
            {
              el.classList.add('on');
              el.querySelector('a.tit').classList.add('open');
            };
          });
          this.querySelectorAll('dl').forEach(el => {
            if (el.contains(accurateEl))
            {
              el.classList.add('open');
              el.querySelector('a.tit').classList.add('open');
            };
          });
        };
      });
      leftmenu.addEventListener('renderend', function(e){
        if (this == e.target)
        {
          this.dispatchEvent(new CustomEvent('selectmenu'));
        };
      });
      main.addEventListener('fetchstart', () => {
        this.param['main-waiting'] = setTimeout(() => {
          main.parentNode.querySelector('.waiting').classList.add('on');
        }, 500);
      });
      main.addEventListener('fetchend', () => {
        clearTimeout(this.param['main-waiting']);
        main.parentNode.querySelector('.waiting').classList.remove('on');
        location.hash = this.currentHash = '#' + main.href;
      });
      main.addEventListener('fetchdone', () => {
        leftmenu.removeAttribute('genre');
        let varEl = main.querySelector('var');
        if (varEl != null)
        {
          let currentGenre = varEl.getAttribute('genre');
          leftmenu.setAttribute('genre', currentGenre);
        };
        leftmenu.dispatchEvent(new CustomEvent('selectmenu'));
      });
      main.addEventListener('fetcherror', (e) => {
        this.dialog.alert(main.getAttribute('urlerror') + '(' + e.detail.res.status + ')', null, main.getAttribute('ikown'), main.fullURL);
      });
      main.addEventListener('fetchcrash', (e) => {
        this.dialog.alert(main.getAttribute('urlcrash'));
      });
      window.addEventListener('popstate', () => {
        if (location.hash.length == 0)
        {
          location.reload();
        }
        else if (this.currentHash != location.hash)
        {
          main.href = location.hash.substring(1);
        };
      });
      if (notification != null && notification.hasAttribute('refetch'))
      {
        this.notificationInterval = setInterval(() => {
          notification.fetch();
        }, Number.parseInt(notification.getAttribute('refetch')) * 1000);
      };
      if (cloudService != null)
      {
        cloudService.addEventListener('popup', function(){
          if (this.classList.contains('on'))
          {
            this.querySelector('a.link').click();
          };
        });
        cloudService.addEventListener('loadurl', function(){
          if (!this.hasAttribute('loading'))
          {
            this.setAttribute('loading', 'true');
            fetch(this.getAttribute('url')).then(res => res.ok? res.json(): {}).then(data => {
              if (data.code == 1 && data.status == 1)
              {
                this.html(data.fragment).then(() => {
                  this.classList.add('on');
                });
              };
              this.removeAttribute('loading');
            });
          };
        });
        cloudService.dispatchEvent(new CustomEvent('loadurl'));
      };
      main.href = location.hash.substring(1) || main.getAttribute('welcome');
    };
  };

  initModifyPassword() {
    if (this.inited != true)
    {
      this.inited = true;
      let popup = this.dialog.shadowRoot.querySelector('.dialogPopup');
      if (popup != null)
      {
        let form = popup.querySelector('form');
        form.addEventListener('submitend', (e) => {
          let res = e.detail.res;
          if (res.ok)
          {
            res.json().then(data => {
              if (data.code != 1)
              {
                miniMessage.push(data.message);
              }
              else
              {
                this.dialog.alert(data.message);
              };
            });
          };
        });
      };
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
    this.master = document.getElementById('master');
    this.dialog = document.getElementById('dialog');
    this.miniMessage = document.getElementById('miniMessage');
  };
};