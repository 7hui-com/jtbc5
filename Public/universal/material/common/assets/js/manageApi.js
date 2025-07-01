import fetcher from '../../../../../common/assets/js/library/http/fetcher.js';

export default class manageApi {
  initExplorer() {
    if (this.inited != true)
    {
      this.inited = true;
      let popup = this.self.parentNode.querySelector('.dialogPopup');
      let materialExplorer = popup.querySelector('.materialExplorer');
      if (materialExplorer != null)
      {
        let page = null;
        let fileGroup = null;
        let keyword = null;
        let order = null;
        let inputTimeout = null;
        let listTemplate = materialExplorer.querySelector('template.listTemplate');
        materialExplorer.addEventListener('update', function(){
          let searchParams = new URLSearchParams('type=explorer');
          if (fileGroup != null) searchParams.set('filegroup', fileGroup);
          if (keyword != null) searchParams.set('keyword', keyword);
          if (order != null) searchParams.set('order', order);
          if (page != null) searchParams.set('page', page);
          materialExplorer.querySelector('.listTemplate').setAttribute('url', this.getAttribute('baseurl') + '?' + searchParams.toString());
        });
        materialExplorer.delegateEventListener('.tab tabtitle', 'click', function(){
          this.parentNode.querySelectorAll('tabtitle').forEach(el => {
            el.classList.remove('on');
          });
          this.classList.add('on');
          fileGroup = this.getAttribute('value');
          materialExplorer.dispatchEvent(new CustomEvent('update'));
        });
        materialExplorer.delegateEventListener('input.keyword', 'input', function(){
          clearTimeout(inputTimeout);
          inputTimeout = setTimeout(() => {
            keyword = this.value;
            materialExplorer.querySelector('.list').setAttribute('keyword', keyword);
            materialExplorer.dispatchEvent(new CustomEvent('update'));
          }, 1000);
        });
        materialExplorer.delegateEventListener('.order dd', 'click', function(){
          let parent = this.parentNode.parentNode;
          parent.querySelector('em').innerText = this.innerText;
          order = this.getAttribute('value');
          materialExplorer.dispatchEvent(new CustomEvent('update'));
        });
        materialExplorer.delegateEventListener('.list', 'renderend', function(){
          let filelist = this.querySelector('.filelist');
          if (filelist != null)
          {
            materialExplorer.classList.remove('hide');
            if (filelist.childNodes.length === 0)
            {
              materialExplorer.querySelector('.list').classList.remove('on');
              materialExplorer.querySelector('.listEmpty').classList.add('on');
            }
            else
            {
              materialExplorer.querySelector('.list').classList.add('on');
              materialExplorer.querySelector('.listEmpty').classList.remove('on');
            };
          };
          this.parentNode.scrollTop = '0px';
        });
        materialExplorer.delegateEventListener('.list item', 'click', function(){ this.classList.toggle('on'); });
        materialExplorer.delegateEventListener('jtbc-pagination', 'gotopage', e => {
          page = e.detail.page;
          materialExplorer.dispatchEvent(new CustomEvent('update'));
        });
        popup.delegateEventListener('button.ok', 'click', () => {
          let selected = [];
          let selectedID = [];
          materialExplorer.querySelectorAll('.list item.on').forEach(el => {
            let param = JSON.parse(el.getAttribute('param'));
            param.uploadid = 0;
            selected.push(param);
            selectedID.push(param.id);
          });
          this.dialog.callbackArgs.push(selected);
          if (selectedID.length != 0)
          {
            let fetchman = new fetcher(materialExplorer.getAttribute('with-global-headers'));
            fetchman.fetch(materialExplorer.getAttribute('updateurl') + '&idList=' + encodeURIComponent(selectedID.join(',')));
          };
        });
        listTemplate.fetch();
        listTemplate.removeAttribute('mt');
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
    this.currentUploading = false;
    this.root = document.getElementById('root');
    this.main = document.getElementById('main');
    this.master = document.getElementById('master');
    this.dialog = document.getElementById('dialog');
    this.miniMessage = document.getElementById('miniMessage');
  };
};