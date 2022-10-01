export default class jtbcTinyPagination extends HTMLElement {
  static get observedAttributes() {
    return ['current-page', 'total-page', 'url'];
  };

  render() {
    if (this.ready == true)
    {
      if (this.totalPage <= 0)
      {
        this.classList.add('hide');
      }
      else
      {
        this.classList.remove('hide');
        let currentPage = this.currentPage;
        let totalPage = this.totalPage;
        currentPage = Math.min(Math.max(1, currentPage), totalPage);
        let prevPage = Math.max(1, currentPage - 1);
        let nextPage = Math.min(totalPage, currentPage + 1);
        this.container.querySelectorAll('div.prev').forEach(el => {
          el.setAttribute('page', prevPage);
          if (currentPage == 1) el.classList.add('off');
          else el.classList.remove('off');
        });
        this.container.querySelectorAll('div.next').forEach(el => {
          el.setAttribute('page', nextPage);
          if (currentPage == totalPage) el.classList.add('off');
          else el.classList.remove('off');
        });
      };
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'current-page':
      {
        this.currentPage = Number.parseInt(newVal);
        this.render();
        break;
      };
      case 'total-page':
      {
        this.totalPage = Number.parseInt(newVal);
        this.render();
        break;
      };
      case 'url':
      {
        this.url = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.render();
  };

  constructor() {
    super();
    this.ready = false;
    this.currentPage = 1;
    this.totalPage = 1;
    this.url = null;
    let that = this;
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <container style="display:none">
        <div class="tinyPagination">
          <div class="page prev"><slot name="prev"><span class="button prev"><jtbc-svg name="arrow_left"></jtbc-svg></span></slot></div>
          <div class="page next"><slot name="next"><span class="button next"><jtbc-svg name="arrow_right"></jtbc-svg></span></slot></div>
        </div>
      </container>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.container = shadowRoot.querySelector('container');
    this.container.loadComponents().then(function(){
      that.container.delegateEventListener('div.page', 'click', function(){
        let url = that.url;
        let page = Number.parseInt(this.getAttribute('page'));
        if (!this.classList.contains('off') && url != null)
        {
          let newURL = url;
          let target = that.getTarget();
          if (newURL.includes('__page__'))
          {
            newURL = newURL.replace('__page__', page);
          }
          else
          {
            let searchParams = new URLSearchParams(url);
            searchParams.set('page', page);
            newURL = searchParams.toString();
          };
          if (target != null) target.href = newURL;
          else that.dispatchEvent(new CustomEvent('href', {detail: {url: newURL}, bubbles: true}));
        };
        that.dispatchEvent(new CustomEvent('gotopage', {detail: {page: page}, bubbles: true}));
      });
    });
  };
};