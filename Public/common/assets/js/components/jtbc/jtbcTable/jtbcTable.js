export default class jtbcTable extends HTMLTableElement {
  static get observedAttributes() {
    return ['credentials', 'mode'];
  };

  #credentials = 'same-origin';
  #mode = 'form';
  #credentialsList = ['include', 'same-origin', 'omit'];
  #modeList = ['form', 'json'];

  get credentials() {
    return this.#credentials;
  };

  get mode() {
    return this.#mode;
  };

  set credentials(credentials) {
    if (this.#credentialsList.includes(credentials))
    {
      this.#credentials = credentials;
    }
    else
    {
      throw new Error('Unexpected value');
    };
  };

  set mode(mode) {
    if (this.#modeList.includes(mode))
    {
      this.#mode = mode;
    }
    else
    {
      throw new Error('Unexpected value');
    };
  };

  #getFetchParams(identity, checked) {
    let mode = this.#mode;
    let result = {'method': 'post', 'credentials': this.#credentials};
    if (mode == 'form')
    {
      let params = new URLSearchParams();
      if (identity != null)
      {
        params.append('identity', identity);
      };
      if (Array.isArray(checked))
      {
        checked.forEach(item => {
          params.append('id[]', item);
        });
      };
      result.body = params.toString();
      result.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
    }
    else if (mode == 'json')
    {
      result.headers = 'application/json';
      let body = {'id': Array.isArray(checked)? checked: []};
      if (identity != null)
      {
        body['identity'] = identity;
      };
      result.body = JSON.stringify(body);
    };
    return result;
  };

  getRowElement(el) {
    let target = el.parentNode;
    while(target.tagName.toLowerCase() != 'tr')
    {
      target = target.parentNode;
    };
    return target;
  };

  getAllSelectors() {
    let result = null;
    let selectors = this.querySelectorAll('td input[role=selector]');
    if (selectors.length != 0)
    {
      result = [];
      selectors.forEach(selector => {
        result.push(selector.value);
      });
    };
    return result;
  };

  getChecked() {
    let result = null;
    let checked = [];
    let hasChecked = false;
    let selectors = this.querySelectorAll('td input[role=selector]');
    selectors.forEach(selector => {
      if (selector.checked)
      {
        hasChecked = true;
        checked.push(selector.value);
      };
    });
    if (hasChecked == true)
    {
      result = checked;
    };
    return result;
  };

  initSortableEvents() {
    let that = this;
    const sortApiConnect = () => {
      let allSelectors = that.getAllSelectors();
      if (Array.isArray(allSelectors) && allSelectors.length != 0)
      {
        let identity = null;
        if (that.draging.hasAttribute('identity'))
        {
          identity = that.draging.getAttribute('identity');
        };
        if (that.getAttribute('sorting') != 'true')
        {
          that.setAttribute('sorting', 'true');
          fetch(that.getAttribute('sortApi'), that.#getFetchParams(identity, allSelectors)).then(res => {
            that.setAttribute('sorting', 'false');
            that.dispatchEvent(new CustomEvent('sorted', {bubbles: true, detail: {res: res}}));
          });
        };
      };
    };
    this.delegateEventListener('thead th[orderby] span.asc', 'click', function(){
      that.dispatchEvent(new CustomEvent('orderby', {bubbles: true, detail: {el: this}}));
    });
    this.delegateEventListener('thead th[orderby] span.desc', 'click', function(){
      that.dispatchEvent(new CustomEvent('orderby', {bubbles: true, detail: {el: this}}));
    });
    this.delegateEventListener('tbody tr', 'dragstart', function(e){
      that.draging = this;
      this.classList.add('draging');
      let dragImage = new Image();
      dragImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII=';
      e.dataTransfer.setDragImage(dragImage, 0, 0);
    });
    this.delegateEventListener('tbody tr', 'dragend', function(){
      that.draging.classList.remove('draging');
      that.dispatchEvent(new CustomEvent('sortend', {bubbles: true}));
      that.querySelectorAll('tr[draggable=true]').forEach(el => { el.draggable = false; });
      if (that.hasAttribute('sortApi')) sortApiConnect();
    });
    this.delegateEventListener('tbody tr', 'dragover', function(e){
      e.preventDefault();
      let target = this;
      let draging = that.draging;
      if (draging != null && target != draging)
      {
        if (draging.rowIndex < target.rowIndex)
        {
          target.after(draging);
        }
        else
        {
          target.before(draging);
        };
      };
    });
    this.delegateEventListener('td[role=draghandle]', 'mousedown', function(){
      that.getRowElement(this).draggable = true;
    });
  };

  initSelectorEvents() {
    let that = this;
    this.delegateEventListener('th input[role=selector]', 'change', function(){
      that.querySelectorAll('td input[role=selector]').forEach(el => {
        el.checked = this.checked;
        el.dispatchEvent(new Event('change', {'bubbles': true}));
      });
    });
    this.delegateEventListener('td input[role=selector]', 'change', function(){
      let tr = that.getRowElement(this);
      let currentType = this.type.toLowerCase();
      if (this.checked == true)
      {
        tr.classList.add('selected');
      }
      else
      {
        tr.classList.remove('selected');
      };
      if (currentType == 'radio')
      {
        that.querySelectorAll('td input[role=selector]').forEach(el => {
          if (this != el)
          {
            let tr = that.getRowElement(el);
            if (el.checked == true)
            {
              tr.classList.add('selected');
            }
            else
            {
              tr.classList.remove('selected');
            };
          };
        });
      };
    });
  };

  startObserve() {
    this.observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(el => {
          if (el.nodeType == 1 && el.tagName.toLowerCase() == 'tr')
          {
            el.querySelectorAll('input[role=selector]').forEach(input => {
              let tr = this.getRowElement(input);
              if (input.checked == true)
              {
                tr.classList.add('selected');
              }
              else
              {
                tr.classList.remove('selected');
              };
            });
          };
        });
      });
    });
    this.observer.observe(this, {childList: true, subtree: true});
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'credentials':
      {
        this.credentials = newVal;
        break;
      };
      case 'mode':
      {
        this.mode = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
  };

  constructor() {
    super();
    this.ready = false;
    this.draging = null;
    this.initSortableEvents();
    this.initSelectorEvents();
    this.startObserve();
  };
};