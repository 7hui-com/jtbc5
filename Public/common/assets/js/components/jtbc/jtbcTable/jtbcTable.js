export default class jtbcTable extends HTMLTableElement {
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
        let params = new URLSearchParams();
        allSelectors.forEach(item => { params.append('id[]', item); });
        if (that.draging.hasAttribute('identity'))
        {
          params.append('identity', that.draging.getAttribute('identity'));
        };
        if (that.getAttribute('sorting') != 'true')
        {
          that.setAttribute('sorting', 'true');
          fetch(that.getAttribute('sortApi'), {
            'method': 'post',
            'headers': {'Content-Type': 'application/x-www-form-urlencoded'},
            'body': params.toString(),
          }).then(res => {
            that.setAttribute('sorting', 'false');
            that.dispatchEvent(new CustomEvent('sorted', {bubbles: true, detail: {res: res}}));
          });
        };
      };
    };
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
      let changeEvent = document.createEvent('HTMLEvents');
      changeEvent.initEvent('change', true, true);
      that.querySelectorAll('td input[role=selector]').forEach(el => {
        el.checked = this.checked;
        el.dispatchEvent(changeEvent);
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