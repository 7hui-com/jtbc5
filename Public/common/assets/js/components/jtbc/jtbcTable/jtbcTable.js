export default class jtbcTable extends HTMLTableElement {
  static get observedAttributes() {
    return ['credentials', 'mode', 'with-global-headers'];
  };

  #credentials = 'same-origin';
  #mode = 'form';
  #credentialsList = ['include', 'same-origin', 'omit'];
  #modeList = ['form', 'json'];
  #withGlobalHeaders = null;

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
    let withGlobalHeaders = this.#withGlobalHeaders;
    let result = {'method': 'post', 'credentials': this.#credentials, 'headers': {}};
    if (withGlobalHeaders != null)
    {
      let broadcaster = getBroadcaster('fetch');
      let state = broadcaster.getState();
      if (state.hasOwnProperty(withGlobalHeaders))
      {
        result.headers = state[withGlobalHeaders];
      };
    };
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
      result.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    else if (mode == 'json')
    {
      result.headers['Content-Type'] = 'application/json';
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
    const draging = (x, y) => {
      that.draging.parentNode.querySelectorAll('tr').forEach(tr => {
        if (tr != that.draging)
        {
          let bcr = tr.getBoundingClientRect();
          if (y > bcr.top && y < (bcr.top + bcr.height))
          {
            if (that.draging.rowIndex < tr.rowIndex)
            {
              tr.after(that.draging);
            }
            else
            {
              tr.before(that.draging);
            };
          };
        };
      });
    };
    const dragend = () => {
      if (that.hasAttribute('sortApi'))
      {
        sortApiConnect();
      };
      that.draging.parentNode.querySelectorAll('tr').forEach(tr => {
        that.draging.classList.remove('draging');
      });
    };
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
    this.delegateEventListener('thead th[orderby] span.asc', 'click', function() {
      that.dispatchEvent(new CustomEvent('orderby', {bubbles: true, detail: {el: this}}));
    });
    this.delegateEventListener('thead th[orderby] span.desc', 'click', function() {
      that.dispatchEvent(new CustomEvent('orderby', {bubbles: true, detail: {el: this}}));
    });
    if (isTouchDevice())
    {
      this.delegateEventListener('td[role=draghandle]', 'touchstart', function(e) {
        e.preventDefault();
        if (e.touches.length == 1)
        {
          that.draging = that.getRowElement(this);
          that.draging.classList.add('draging');
          let drag = e => {
            draging(e.touches[0].clientX, e.touches[0].clientY);
          };
          let stop = function(e) {
            dragend();
            document.removeEventListener('touchmove', drag);
            document.removeEventListener('touchend', stop);
          };
          document.addEventListener('touchmove', drag);
          document.addEventListener('touchend', stop);
        };
      });
    }
    else
    {
      this.delegateEventListener('td[role=draghandle]', 'mousedown', function(e) {
        e.preventDefault();
        that.draging = that.getRowElement(this);
        that.draging.classList.add('draging');
        let drag = e => {
          draging(e.clientX, e.clientY);
        };
        let stop = function(e) {
          dragend();
          document.removeEventListener('mousemove', drag);
          document.removeEventListener('mouseup', stop);
        };
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stop);
      });
    };
  };

  initSelectorEvents() {
    let that = this;
    this.delegateEventListener('th input[role=selector]', 'change', function() {
      that.querySelectorAll('td input[role=selector]').forEach(el => {
        el.checked = this.checked;
        el.dispatchEvent(new Event('change', {'bubbles': true}));
      });
    });
    this.delegateEventListener('td input[role=selector]', 'change', function() {
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
      case 'with-global-headers':
      {
        this.#withGlobalHeaders = newVal;
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