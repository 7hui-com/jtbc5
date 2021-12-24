export default class jtbcPagination extends HTMLElement {
  static get observedAttributes() {
    return ['current-page', 'total-page', 'url', 'maxlength'];
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
        let maxlength = this.maxlength;
        let currentPage = this.currentPage;
        let totalPage = this.totalPage;
        currentPage = Math.min(Math.max(1, currentPage), totalPage);
        let prevPage = Math.max(1, currentPage - 1);
        let nextPage = Math.min(totalPage, currentPage + 1);
        this.container.querySelectorAll('.pagination').forEach(el => { el.classList.remove('on'); });
        if (maxlength == 1)
        {
          this.container.querySelector('.tiny').classList.add('on');
        }
        else
        {
          let startPage = Math.max(1, currentPage - Math.floor(maxlength / 2));
          let endPage = Math.min(totalPage, startPage + maxlength -1);
          while (startPage > 1 && (endPage - startPage + 1) < maxlength) startPage -= 1;
          this.container.querySelector('em.page').innerHTML = '';
          for (let p = startPage; p <= endPage; p ++)
          {
            let newPageElement = document.createElement('span');
            newPageElement.classList.add('page');
            newPageElement.innerText = p;
            newPageElement.setAttribute('page', p);
            if (p == currentPage) newPageElement.classList.add('on');
            this.container.querySelector('em.page').append(newPageElement);
          };
          this.container.querySelector('.normal').classList.add('on');
        };
        this.container.querySelectorAll('span.first').forEach(el => {
          el.setAttribute('page', 1);
          if (currentPage == 1) el.classList.add('off');
          else el.classList.remove('off');
        });
        this.container.querySelectorAll('span.prev').forEach(el => {
          el.setAttribute('page', prevPage);
          if (currentPage == 1) el.classList.add('off');
          else el.classList.remove('off');
        });
        this.container.querySelectorAll('span.last').forEach(el => {
          el.setAttribute('page', totalPage);
          if (currentPage == totalPage) el.classList.add('off');
          else el.classList.remove('off');
        });
        this.container.querySelectorAll('span.next').forEach(el => {
          el.setAttribute('page', nextPage);
          if (currentPage == totalPage) el.classList.add('off');
          else el.classList.remove('off');
        });
        this.container.querySelectorAll('span.info').forEach(el => { el.innerHTML = currentPage + '<em>/</em>' + totalPage; });
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
      case 'maxlength':
      {
        this.maxlength = Math.max(1, Number.parseInt(newVal));
        this.render();
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
    this.maxlength = 7;
    let that = this;
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.substring(0, import.meta.url.lastIndexOf('.')) + '.css';
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <container>
        <div class="pagination tiny"><span class="first page"><jtbc-svg name="pagination_first"></jtbc-svg></span><span class="prev page"><jtbc-svg name="pagination_prev"></jtbc-svg></span><span class="info"></span><span class="next page"><jtbc-svg name="pagination_next"></jtbc-svg></span><span class="last page"><jtbc-svg name="pagination_last"></jtbc-svg></span></div>
        <div class="pagination normal"><span class="info"></span><span class="first page"><jtbc-svg name="pagination_first"></jtbc-svg></span><span class="prev page"><jtbc-svg name="pagination_prev"></jtbc-svg></span><em class="page"></em><span class="next page"><jtbc-svg name="pagination_next"></jtbc-svg></span><span class="last page"><jtbc-svg name="pagination_last"></jtbc-svg></span></div>
      </container>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.container = shadowRoot.querySelector('container');
    this.container.delegateEventListener('span.page', 'click', function(){
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
    Array.from(shadowRoot.children).forEach(el => { el.loadComponents(); });
  };
};