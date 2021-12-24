export default class manage {
  initSelector() {
    if (this.inited != true)
    {
      let that = this;
      let popup = this.self.parentNode.querySelector('.dialogPopup');
      let selectGenre = popup.querySelector('select[name=genre]');
      let selectFile = popup.querySelector('select[name=file]');
      let apiurl = popup.getAttribute('apiurl');
      const loadFile = function() {
        let genres = popup.querySelectorAll('select[name=genre],select[name=genre-child]');
        that.selectedGenre = genres[genres.length - 1].value;
        fetch(apiurl + '&mode=file&genre=' + encodeURIComponent(that.selectedGenre)).then(res => res.ok? res.json(): {}).then(data => {
          popup.querySelectorAll('select').forEach(el => { el.disabled = false; });
          if (data.code == 1)
          {
            let fileList = data.data.fileList;
            selectFile.options.length = 0;
            if (fileList.length == 0)
            {
              selectFile.disabled = true;
              selectFile.options.add(new Option(popup.getAttribute('text-file-empty'), ''));
            }
            else
            {
              fileList.forEach(file => {
                selectFile.options.add(new Option(file.filename, file.filename));
              });
            };
          };
        });
      };
      fetch(apiurl + '&mode=genre').then(res => res.ok? res.json(): {}).then(data => {
        if (data.code == 1)
        {
          let genreList = data.data.genreList;
          selectGenre.options.add(new Option('/', ''));
          genreList.forEach(genre => {
            selectGenre.options.add(new Option(genre.title + '[' + genre.genre + ']', genre.genre));
          });
          loadFile();
        };
      });
      popup.delegateEventListener('select[name=genre],select[name=genre-child]', 'change', function(){
        let currentValue = this.value;
        let currentText = this.options[this.selectedIndex].text;
        popup.querySelectorAll('select').forEach(el => { el.disabled = true; });
        const removeGenreChild = function(el) {
          let currentLi = el.parentNode;
          let currentNextLi = currentLi.nextElementSibling;
          while (currentNextLi.classList.contains('child'))
          {
            let tempLi = currentNextLi;
            currentNextLi = tempLi.nextElementSibling;
            tempLi.remove();
          };
        };
        if (currentText == '/')
        {
          removeGenreChild(this);
          loadFile();
        }
        else
        {
          fetch(apiurl + '&mode=genre&genre=' + encodeURIComponent(currentValue)).then(res => res.ok? res.json(): {}).then(data => {
            if (data.code == 1)
            {
              removeGenreChild(this);
              let genreList = data.data.genreList;
              if (genreList.length != 0)
              {
                let template = popup.querySelector('template[name=genre-child]');
                let currentLi = this.parentNode;
                currentLi.parentNode.insertBefore(template.content.cloneNode(true), currentLi.nextElementSibling);
                let selectGenreChild = currentLi.nextElementSibling.querySelector('select[name=genre-child]');
                selectGenreChild.options.add(new Option('/', currentValue));
                genreList.forEach(genre => {
                  selectGenreChild.options.add(new Option(genre.title + '[' + genre.genre + ']', genre.genre));
                });
              };
              loadFile();
            };
          });
        };
      });
      popup.delegateEventListener('button.submit', 'click', function(){
        let selectedFile = selectFile.value;
        if (selectedFile.indexOf('.jtbc') == -1) that.miniMessage.push(this.getAttribute('text-message-1'));
        else
        {
          that.dialog.close().then(() => {
            selectedFile = selectedFile.substring(0, selectedFile.length - 5);
            that.main.href = popup.getAttribute('basehref') + '&genre=' + encodeURIComponent(that.selectedGenre) + '&file=' + encodeURIComponent(selectedFile);
          });
        };
      });
      this.inited = true;
    };
  };

  initAdd() {
    if (this.inited != true)
    {
      let popup = this.self.parentNode.querySelector('.dialogPopup');
      popup.delegateEventListener('button.submit', 'click', () => {
        let form = popup.querySelector('form');
        form.setAttribute('href', form.getAttribute('basehref') + encodeURIComponent(form.querySelector('input[name=node]').value));
      });
      this.inited = true;
    };
  };

  initList() {
    if (this.inited != true)
    {
      let that = this;
      let scarf = this.self.parentNode.querySelector('.scarf');
      scarf.delegateEventListener('select[name=node]', 'change', function(){
        that.main.href = this.parentNode.getAttribute('url') + encodeURIComponent(this.value);
      });
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
    this.selectedGenre = null;
    this.root = document.getElementById('root');
    this.main = document.getElementById('main');
    this.master = document.getElementById('master');
    this.dialog = document.getElementById('dialog');
    this.miniMessage = document.getElementById('miniMessage');
  };
};