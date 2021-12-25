export default class manage {
  bindLangEvents()
  {
    let that = this;
    let scarf = this.self.parentNode.querySelector('.scarf');
    if (scarf != null)
    {
      let langSelector = 'input[name=lang_option]';
      scarf.delegateEventListener(langSelector, 'click', function(){
        if (!this.checked)
        {
          if (scarf.querySelectorAll(langSelector + ':checked').length == 0)
          {
            this.checked = true;
            that.dialog.alert(scarf.getAttribute('text-lang-1'));
          };
        };
      });
    };
  };

  bindPermissionEvents()
  {
    let scarf = this.self.parentNode.querySelector('.scarf');
    if (scarf != null)
    {
      scarf.delegateEventListener('input[name=permission]', 'update', function(){
        let permission = {};
        let genre = scarf.querySelectorAll('input.genre');
        genre.forEach(el => {
          if (el.checked)
          {
            let sub = [];
            let segment = {};
            let currentGenre = el.value;
            let p = el.parentNode.parentNode;
            let genreSub = p.querySelectorAll('input.sub');
            let genreSegmentCategory = p.querySelector('input.segment_category');
            genreSub.forEach(s => { if (s.checked) sub.push(s.value); });
            if (genreSegmentCategory != null)
            {
              segment['category'] = genreSegmentCategory.value? JSON.parse(genreSegmentCategory.value): [];
            };
            permission[currentGenre] = {'sub': sub, 'segment': segment};
          };
        });
        this.value = JSON.stringify(permission);
      });
      scarf.delegateEventListener('input.genre', 'sync', function(){
        let genre = this.value;
        let checked = this.checked;
        if (checked == true && genre.indexOf('/') != -1)
        {
          let currentFolder = null;
          let folderArr = genre.split('/');
          folderArr.forEach(folder => {
            if (currentFolder == null) currentFolder = folder;
            else currentFolder += '/' + folder;
            scarf.querySelectorAll("input.genre[value='" + currentFolder + "']").forEach(el => {
              el.checked = true;
            });
          });
        };
      });
      scarf.delegateEventListener('input.genre', 'click', function(){
        let genre = this.value;
        let checked = this.checked;
        let p = this.parentNode.parentNode;
        let nextEl = p.nextElementSibling;
        p.querySelectorAll('input.sub').forEach(el => { el.checked = checked; });
        if (nextEl != null)
        {
          nextEl.querySelectorAll('input.genre').forEach(el => { el.checked = checked; });
          nextEl.querySelectorAll('input.sub').forEach(el => { el.checked = checked; });
        };
        if (checked == true)
        {
          this.dispatchEvent(new CustomEvent('sync', {bubbles: true}));
        };
        scarf.querySelector('input[name=permission]').dispatchEvent(new CustomEvent('update', {bubbles: true}));
      });
      scarf.delegateEventListener('input.sub', 'click', function(){
        if (this.checked)
        {
          let p = this.parentNode.parentNode;
          p.querySelectorAll('input.genre').forEach(el => {
            el.checked = true;
            el.dispatchEvent(new CustomEvent('sync', {bubbles: true}));
          });
        };
        scarf.querySelector('input[name=permission]').dispatchEvent(new CustomEvent('update', {bubbles: true}));
      });
    };
  };

  initAdd() {
    if (this.inited != true)
    {
      this.inited = true;
      this.bindLangEvents();
      this.bindPermissionEvents();
    };
  };

  initEdit() {
    if (this.inited != true)
    {
      this.inited = true;
      this.bindLangEvents();
      this.bindPermissionEvents();
      let scarf = this.self.parentNode.querySelector('.scarf');
      let template = scarf.querySelector('template');
      const getPermission = () => {
        let permission = {};
        let permissionEl = scarf.querySelector('input[name=permission]');
        if (permissionEl != null) permission = JSON.parse(permissionEl.value);
        return permission;
      };
      scarf.delegateEventListener('div.permission', 'selectGenre', e => {
        let genre = e.detail.res[1];
        let permission = getPermission();
        if (permission.hasOwnProperty(genre))
        {
          e.detail.result = true;
        }
        else
        {
          e.detail.result = false;
        };
      });
      scarf.delegateEventListener('div.permission', 'getSegmentCategory', e => {
        let result = '';
        let genre = e.detail.res[1];
        let permission = getPermission();
        if (permission.hasOwnProperty(genre))
        {
          let segmentCategory = permission[genre]?.segment?.category;
          if (Array.isArray(segmentCategory))
          {
            result = JSON.stringify(segmentCategory);
          };
        };
        e.detail.result = result;
      });
      scarf.delegateEventListener('div.permission p.genre', 'selectGenreSub', e => {
        let name = e.detail.res[1];
        let genre = e.detail.res[2];
        let permission = getPermission();
        if (permission.hasOwnProperty(genre))
        {
          let item = permission[genre];
          if (item.hasOwnProperty('sub'))
          {
            if (item.sub.includes(name))
            {
              e.detail.result = true;
            }
            else
            {
              e.detail.result = false;
            };
          };
        };
      });
      template.setAttribute('url', scarf.getAttribute('url'));
    };
  };

  initSelectCategory() {
    if (this.inited != true)
    {
      this.inited = true;
      let that = this;
      let langSelector = 'input[name=lang_option]';
      let popup = this.dialog.shadowRoot.querySelector('.dialogPopup');
      let langElements = this.main.querySelectorAll(langSelector);
      let firstLang = this.main.querySelector(langSelector + ':checked');
      if (popup != null && firstLang != null)
      {
        let tinyForm = popup.querySelector('.tinyForm');
        let firstTemplate = popup.querySelector('template');
        tinyForm.delegateEventListener('.tabtitle', 'renderend', function(){
          this.querySelectorAll('tabtitle').forEach(el => {
            langElements.forEach(lel => {
              if (el.getAttribute('value') == lel.getAttribute('value'))
              {
                if (lel.checked == false)
                {
                  el.classList.add('disabled');
                };
              };
            });
          });
        });
        tinyForm.delegateEventListener('.tabcontent', 'renderend', function(){
          let genre = this.getAttribute('genre');
          let segmentCategory = that.main.querySelector("input.segment_category[genre='" + genre + "']");
          tinyForm.querySelector("tabtitle[value='" + firstLang.value + "']")?.click();
          tinyForm.querySelectorAll('.treeSelector').forEach(el => {
            el.value = segmentCategory.value;
          });
        });
        tinyForm.delegateEventListener('button.ok', 'click', function(){
          let selected = [];
          let genre = this.getAttribute('genre');
          let segmentCategory = that.main.querySelector("input.segment_category[genre='" + genre + "']");
          tinyForm.querySelectorAll('.treeSelector').forEach(el => {
            if (el.value)
            {
              selected = selected.concat(JSON.parse(el.value));
            };
          });
          segmentCategory.value = JSON.stringify(selected);
          that.main.querySelector('input[name=permission]').dispatchEvent(new CustomEvent('update', {bubbles: true}));
        });
        firstTemplate.setAttribute('url', tinyForm.getAttribute('url'));
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
    this.root = document.getElementById('root');
    this.main = document.getElementById('main');
    this.master = document.getElementById('master');
    this.dialog = document.getElementById('dialog');
    this.miniMessage = document.getElementById('miniMessage');
  };
};