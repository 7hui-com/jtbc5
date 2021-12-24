export default class jtbcDialogImagePreviewer extends HTMLElement {
  async popup(param) {
    if (this.dialog != null)
    {
      let imagePreviewer = document.createElement('div');
      imagePreviewer.classList.add('imagePreviewer');
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
      let result = await this.dialog.popup(imagePreviewer.outerHTML);
      return result;
    };
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