export default class jtbcDialogImagePreviewer extends HTMLElement {
  async popup(param) {
    let result = null;
    if (this.dialog != null)
    {
      let currentItem = null;
      let imagePreviewer = document.createElement('div');
      imagePreviewer.classList.add('imagePreviewer');
      if (Array.isArray(param))
      {
        let totalPage = param.length;
        const getSelectedItem = arr => {
          let result = null;
          if (Array.isArray(arr))
          {
            arr.forEach((item, index) => {
              item.index = index;
              if (index == 0 || item.selected == true)
              {
                result = item;
              };
            });
          };
          return result;
        };
        const changeImageByIndex = (arr, index, target) => {
          if (Array.isArray(arr))
          {
            let targetItem = null;
            for (let item of arr)
            {
              if (item.index == index)
              {
                targetItem = item;
                break;
              };
            };
            if (targetItem != null)
            {
              currentItem = targetItem;
              target.querySelector('img').src = targetItem.fileurl;
              target.querySelector('div.pages span').innerText = (targetItem.index + 1) + ' / ' + arr.length;
            };
          };
        };
        let selectedItem = getSelectedItem(param);
        if (selectedItem != null)
        {
          currentItem = selectedItem;
          let pages = document.createElement('div');
          let prevBtn = document.createElement('div');
          let nextBtn = document.createElement('div');
          let text = document.createElement('span');
          pages.classList.add('pages');
          pages.setAttribute('total', totalPage);
          prevBtn.classList.add('btn', 'prev');
          await prevBtn.html('<jtbc-svg name="arrow_left"></jtbc-svg>');
          nextBtn.classList.add('btn', 'next');
          await nextBtn.html('<jtbc-svg name="arrow_right"></jtbc-svg>');
          text.innerText = (selectedItem.index + 1) + ' / ' + totalPage;
          pages.append(prevBtn, text, nextBtn);
          if (selectedItem.hasOwnProperty('filename'))
          {
            let title = document.createElement('h3');
            title.classList.add('title');
            title.innerText = selectedItem.filename;
            imagePreviewer.append(title);
          };
          let img = document.createElement('img');
          img.setAttribute('src', selectedItem.fileurl);
          imagePreviewer.append(pages, img);
          result = await this.dialog.popup(imagePreviewer.outerHTML);
          result.querySelector('div.imagePreviewer').delegateEventListener('div.btn', 'click', function(){
            let targetIndex = null;
            let currentIndex = currentItem.index;
            if (this.classList.contains('prev'))
            {
              targetIndex = currentIndex - 1;
              if (targetIndex < 0) targetIndex = (totalPage - 1);
            }
            else
            {
              targetIndex = currentIndex + 1;
              if (targetIndex >= totalPage) targetIndex = 0;
            };
            changeImageByIndex(param, targetIndex, this.parentElement.parentElement);
          });
        };
      }
      else if (typeof(param) == 'string')
      {
        let img = document.createElement('img');
        img.setAttribute('src', param);
        imagePreviewer.append(img);
        result = await this.dialog.popup(imagePreviewer.outerHTML);
      }
      else if (typeof(param) == 'object')
      {
        if (param.hasOwnProperty('filename'))
        {
          let title = document.createElement('h3');
          title.classList.add('title');
          title.innerText = param.filename;
          imagePreviewer.append(title);
        };
        let img = document.createElement('img');
        img.setAttribute('src', param.fileurl);
        imagePreviewer.append(img);
        result = await this.dialog.popup(imagePreviewer.outerHTML);
      };
    };
    return result;
  };

  connectedCallback() {
    this.ready = true;
  };

  constructor() {
    super();
    this.ready = false;
    this.dialog = document.getElementById('previewer') ?? document.getElementById('dialog');
  };
};