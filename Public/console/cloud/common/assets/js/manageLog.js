export default class manageLog {
  initList() {
    if (this.inited != true)
    {
      this.inited = true;
      let that = this;
      let popup = this.self.parentNode.querySelector('.dialogPopup');
      let ppLogEl = popup.querySelector('.ppLog');
      if (ppLogEl != null)
      {
        let page = null;
        let typeString = null;
        ppLogEl.querySelector('div.mainBox').addEventListener('update', function(){
          let searchParams = new URLSearchParams('type=list');
          if (typeString != null) searchParams.set('type_string', typeString);
          if (page != null) searchParams.set('page', page);
          ppLogEl.querySelector('.listTemplate').setAttribute('url', this.getAttribute('baseurl') + '?' + searchParams.toString());
        });
        ppLogEl.delegateEventListener('div.mainBox tabtitle', 'click', function(){
          this.parentNode.querySelectorAll('tabtitle').forEach(el => {
            el.classList.remove('on');
          });
          this.classList.add('on');
          page = null;
          typeString = this.getAttribute('value');
          ppLogEl.querySelector('div.mainBox').dispatchEvent(new CustomEvent('update'));
        });
        ppLogEl.delegateEventListener('div.mainBox .list', 'renderend', function(){
          if (this.querySelectorAll('tbody tr').length == 0)
          {
            this.classList.add('hidden');
            this.nextElementSibling.classList.add('on');
          }
          else
          {
            this.classList.remove('hidden');
            this.nextElementSibling.classList.remove('on');
          };
          this.parentNode.scrollTop = '0px';
        });
        ppLogEl.delegateEventListener('div.mainBox span.downgrade', 'click', function(){
          let downgradeId = this.getAttribute('downgrade_id');
          ppLogEl.querySelectorAll('tr.item').forEach(el => {
            el.classList.add('dim');
          });
          ppLogEl.querySelectorAll('tr.downgrade').forEach(el => {
            el.classList.remove('on');
          });
          let itemTr = ppLogEl.querySelector('tr.item-' + downgradeId);
          let downgradeTr = ppLogEl.querySelector('tr.downgrade-' + downgradeId);
          if (itemTr != null && downgradeTr != null)
          {
            let newTDElement = document.createElement('td');
            let downgradeTemplate = popup.querySelector('template.downgrade');
            itemTr.classList.remove('dim');
            newTDElement.classList.add('content');
            newTDElement.setAttribute('colspan', 3);
            newTDElement.append(downgradeTemplate.content.cloneNode(true));
            newTDElement.loadComponents().then(() => {
              downgradeTr.classList.add('on');
              downgradeTr.scrollIntoView(false);
              downgradeTr.querySelector('td.content').replaceWith(newTDElement);
              downgradeTr.querySelector('template').setAttribute('url', downgradeTemplate.getAttribute('url') + '&downgrade_id=' + encodeURIComponent(this.getAttribute('downgrade_id')) + '&downgrade_type=' + encodeURIComponent(this.getAttribute('downgrade_type')) + '&downgrade_genre=' + encodeURIComponent(this.getAttribute('downgrade_genre')) + '&zip_path=' + encodeURIComponent(this.getAttribute('downgrade_zip_path')));
            });
          };
        });
        ppLogEl.delegateEventListener('div.mainBox tr.downgrade form', 'submitend', e => {
          e.detail.res.json().then(data => {
            if (data.code != 1)
            {
              this.miniMessage.push(data.message);
            }
            else
            {
              this.miniMessage.push(data.message);
              ppLogEl.querySelector('div.mainBox').dispatchEvent(new CustomEvent('update'));
            };
          });
        });
        ppLogEl.delegateEventListener('div.mainBox tr.downgrade em.compare', 'click', function(){
          fetch(this.getAttribute('url')).then(res => res.ok? res.json(): {}).then(data => {
            if (data.code == 1)
            {
              that.dialog.fullpage(data.fragment);
            };
          });
        });
        ppLogEl.delegateEventListener('div.mainBox jtbc-pagination', 'gotopage', e => {
          page = e.detail.page;
          ppLogEl.querySelector('div.mainBox').dispatchEvent(new CustomEvent('update'));
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
    this.inited = false;
    this.root = document.getElementById('root');
    this.main = document.getElementById('main');
    this.master = document.getElementById('master');
    this.dialog = document.getElementById('dialog');
    this.miniMessage = document.getElementById('miniMessage');
  };
};