import proxyCreator from '../../../library/proxy/proxyCreator.js';

export default class jtbcTemplate extends HTMLTemplateElement {
  static get observedAttributes() {
    return ['data', 'mode', 'target', 'url'];
  };

  #data = {};
  #dataProxy = null;
  #mode = 'standard';
  #parentEl = null;
  #silentMode = false;
  #target = null;
  #URL = null;

  get data() {
    let result = this.#dataProxy;
    if (result == null)
    {
      let proxy = new proxyCreator(() => this.update());
      result = this.#dataProxy = proxy.create(this.#data);
    };
    return result;
  };

  get mode() {
    return this.#mode;
  };

  get target() {
    return this.#target;
  };

  get url() {
    return this.#URL;
  };

  set data(data) {
    this.#data = data;
    let rootNode = this.getRootNode({'composed': true});
    if (rootNode instanceof DocumentFragment)
    {
      this.#silentMode = true;
    }
    else
    {
      this.update();
    };
  };

  set mode(mode) {
    if (['standard', 'target'].includes(mode))
    {
      this.#mode = mode;
    }
    else
    {
      throw new Error('Unexpected value');
    };
  };

  set target(target) {
    this.#target = target;
  };

  getDataByKey(key, appointedData) {
    let resultData = null;
    let currentData = appointedData ?? this.#data;
    if (currentData != null)
    {
      const getData = currentKey => {
        let tempData = currentData;
        currentKey.split('.').forEach(item => {
          if (tempData != null)
          {
            tempData = tempData.hasOwnProperty(item)? tempData[item]: null;
          };
        });
        return tempData;
      };
      if (key.indexOf(',') == -1) resultData = getData(key);
      else
      {
        resultData = {};
        key.split(',').forEach(item => {
          resultData[item.substring(item.lastIndexOf('.') + 1)] = getData(item);
        });
      };
    };
    return resultData;
  };

  update() {
    switch(this.mode) {
      case 'standard':
      {
        this.render();
        break;
      };
      case 'target':
      {
        if (this.target != null)
        {
          this.getRootNode().querySelectorAll(this.target).forEach(el => {
            let newTemplate = document.createElement('template');
            newTemplate.setAttribute('is', 'jtbc-template');
            newTemplate.setAttribute('data', JSON.stringify(this.#data));
            newTemplate.innerHTML = this.innerHTML;
            el.innerHTML = newTemplate.outerHTML;
          });
        };
        break;
      };
    };
  };

  render() {
    let data = this.#data;
    if (data != null)
    {
      let eIndex = 0;
      this.temporary = [];
      let content = this.content;
      let tempElement = document.createElement('element');
      content.querySelectorAll('[src]').forEach(el => {
        el.renameAttribute('src', 'jtbc-original-src');
      });
      tempElement.append(content);
      let contentHTML = tempElement.innerHTML;
      tempElement.querySelectorAll('template').forEach(el => {
        if (el.hasAttribute('is'))
        {
          eIndex += 1;
          let currentIs = el.getAttribute('is');
          if (currentIs == String.fromCharCode(106, 116, 98, 99, 45) + 'template')
          {
            if (el.hasAttribute('key'))
            {
              let currentData = this.getDataByKey(el.getAttribute('key'));
              if (currentData != null)
              {
                el.setAttribute('key-data', currentData instanceof Object? JSON.stringify(currentData): currentData);
              };
            };
            let temporary = document.createElement('temporary');
            temporary.setAttribute('e-index', eIndex);
            el.replaceWith(temporary);
            this.temporary[eIndex] = el;
          };
        };
      });
      tempElement.addEventListener('render', () => {
        let hasLoop = false;
        let documentRange = document.createRange();
        let documentFragment = document.createDocumentFragment();
        let documentTarget = documentFragment;
        let loopHTML = tempElement.innerHTML;
        const htmlEncode = str => str.replace(/[&<>"]/g, tag => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[tag] || tag));
        const objectHtmlEncode = obj => {
          let result = obj;
          if (obj != null)
          {
            if (Array.isArray(obj))
            {
              let newArray = [];
              obj.forEach(item => {
                newArray.push(objectHtmlEncode(item));
              });
              result = newArray;
            }
            else
            {
              let newObject = {};
              Object.keys(obj).forEach(key => {
                let value = obj[key];
                let valueType = typeof(value);
                let newValue = value;
                if (valueType == 'string')
                {
                  newValue = htmlEncode(value);
                }
                else if (valueType == 'object')
                {
                  newValue = value != null? objectHtmlEncode(value): '';
                };
                newObject[key] = newValue;
              });
              result = newObject;
            };
          };
          return result;
        };
        const conditionCheckUp = (el, condition) => {
          let nextEl = el.nextElementSibling;
          if (condition == true)
          {
            while (nextEl)
            {
              if (nextEl.hasAttribute('elseif') || nextEl.hasAttribute('else'))
              {
                let oldNextEl = nextEl;
                nextEl = oldNextEl.nextElementSibling;
                oldNextEl.remove();
              }
              else
              {
                nextEl = null;
              };
            };
          }
          else if (condition == false)
          {
            while (nextEl)
            {
              if (nextEl.hasAttribute('elseif'))
              {
                if (nextEl.getAttribute('elseif') == 'true')
                {
                  conditionCheckUp(nextEl, true);
                  nextEl.removeAttribute('elseif');
                  nextEl = null;
                }
                else
                {
                  let oldNextEl = nextEl;
                  nextEl = oldNextEl.nextElementSibling;
                  oldNextEl.remove();
                };
              }
              else if (nextEl.hasAttribute('else'))
              {
                conditionCheckUp(nextEl, true);
                nextEl.removeAttribute('else');
                nextEl = null;
              }
              else
              {
                nextEl = null;
              };
            };
            el.remove();
          };
        };
        const itemTrigger = (item, html) => {
          const compare = (a, b) => {
            let result = 0;
            if (a < b) result = 1;
            else if (a > b) result = -1;
            return result;
          };
          const customEvent = (...args) => {
            let customEvent = new CustomEvent(args[0], {
              bubbles: true,
              cancelable: false,
              detail: {res: args, result: null},
            });
            this.parentNode.dispatchEvent(customEvent);
            return customEvent.detail.result;
          };
          const getParent = node => {
            if (!node.hasOwnProperty('attr'))
            {
              let attr = {};
              Array.from(node.attributes).forEach(item => {
                attr[item.name] = htmlEncode(item.value);
              });
              Object.defineProperty(node, 'attr', {value: attr});
            };
            return node;
          };
          const getParam = node => {
            let result = {};
            Array.from(node.attributes).forEach(item => {
              result[item.name] = item.value === 'true'? true: false;
            });
            return result;
          };
          const markKeywords = (text, keywords) => {
            if (keywords != null)
            {
              keywords.split(' ').forEach(keyword => {
                text = text.replace(keyword, '<mark>' + keyword + '</mark>');
              });
            };
            return text;
          };
          const reachConsensus = (...args) => {
            let result = true;
            args.forEach(arg => {
              if (!arg)
              {
                result = false;
              };
            });
            return result;
          };
          const selfie = data => {
            let selfieResult = '';
            if (data instanceof Object)
            {
              let selfieEl = document.createElement('template');
              selfieEl.setAttribute('is', 'jtbc-template');
              selfieEl.setAttribute('data', JSON.stringify(data));
              selfieEl.innerHTML = contentHTML;
              selfieResult = selfieEl.outerHTML;
            };
            return selfieResult;
          };
          const renderHelper = {
            'compare': compare,
            'content': content,
            'customEvent': customEvent,
            'htmlEncode': htmlEncode,
            'markKeywords': markKeywords,
            'parent': getParent(this.parentNode),
            'param': getParam(this.parentNode),
            'raw': item,
            'reachConsensus': reachConsensus,
            'selfie': selfie,
            'this': this,
            'v': v => v ?? '',
          };
          let keysArray = Object.keys(item).map(key => '$' + key);
          let valuesArray = Object.values(item).map(value => {
            let result = value;
            let valueType = typeof(value);
            if (valueType == 'string')
            {
              result = htmlEncode(value);
            }
            else if (valueType == 'object')
            {
              result = value != null? objectHtmlEncode(value): '';
            };
            return result;
          });
          keysArray.push('$', 'return `' + html.replace(/\\/g, '\\\\').replace(/\`/g, '\\`') + '`;');
          valuesArray.push(renderHelper);
          return new Function(...keysArray)(...valuesArray);
        };
        const itemRender = item => {
          if (documentTarget.nodeType == 1)
          {
            documentTarget.insertAdjacentHTML('beforeend', itemTrigger(item, loopHTML));
          }
          else if (documentTarget.nodeType == 11)
          {
            documentTarget.append(documentRange.createContextualFragment(itemTrigger(item, loopHTML)));
          };
          documentTarget.querySelectorAll('temporary').forEach(el => {
            let newTemplate = this.temporary[el.getAttribute('e-index')].cloneNode(true);
            el.replaceWith(newTemplate);
            if (!newTemplate.hasAttribute('key-data'))
            {
              if (!newTemplate.hasAttribute('data') && newTemplate.hasAttribute('key'))
              {
                let currentData = this.getDataByKey(newTemplate.getAttribute('key'), item);
                if (currentData != null)
                {
                  newTemplate.setAttribute('data', currentData instanceof Object? JSON.stringify(currentData): currentData);
                };
              };
            }
            else
            {
              newTemplate.setAttribute('data', newTemplate.getAttribute('key-data'));
            };
          });
        };
        ['loop', '[isloop]'].forEach(loop => {
          if (tempElement.querySelectorAll(loop).length == 1)
          {
            if (hasLoop == false)
            {
              hasLoop = true;
              let newLoop = tempElement.querySelector(loop);
              let newLoopTagName = newLoop.tagName;
              let newLoopPlaceholder = document.createElement(newLoopTagName);
              loopHTML = newLoop.innerHTML;
              Array.from(newLoop.attributes).forEach(item => {
                let itemValue = item.value;
                if (!itemValue.includes('$'))
                {
                  newLoopPlaceholder.setAttribute(item.name, itemValue);
                }
                else
                {
                  newLoopPlaceholder.setAttribute(item.name, itemTrigger({}, itemValue));
                };
              });
              newLoop.replaceWith(newLoopPlaceholder);
              documentFragment = documentRange.createContextualFragment(itemTrigger({}, tempElement.innerHTML));
              documentTarget = documentFragment.querySelector(loop);
            };
          };
        });
        if (!Array.isArray(data)) itemRender(data);
        else
        {
          let index = -1;
          data.forEach(item => {
            index += 1;
            item['_index'] = index;
            itemRender(item);
          });
        };
        if (documentTarget.nodeType == 1)
        {
          if (documentTarget.hasAttribute('isloop'))
          {
            documentTarget.removeAttribute('isloop');
          }
          else documentTarget.pullout();
        };
        documentFragment.querySelectorAll('[if]').forEach(el => {
          if (el.getAttribute('if') == 'true')
          {
            conditionCheckUp(el, true);
            el.removeAttribute('if');
          }
          else
          {
            conditionCheckUp(el, false);
          };
        });
        documentFragment.querySelectorAll('[jtbc-original-src]').forEach(el => {
          el.renameAttribute('jtbc-original-src', 'src');
        });
        this.#parentEl = this.parentNode;
        this.replaceWith(documentFragment);
      });
      tempElement.loadComponents().then(() => {
        if (this.parentNode != null)
        {
          tempElement.dispatchEvent(new CustomEvent('render'));
        };
      });
    };
  };

  fetch() {
    if (this.locked == false && this.url != null)
    {
      this.locked = true;
      this.dispatchEvent(new CustomEvent('fetchstart'));
      fetch(this.url).then(res => {
        let result = {};
        if (res.ok) result = res.json();
        else
        {
          this.dispatchEvent(new CustomEvent('fetcherror', {detail: {res: res}}));
        };
        return result;
      }).then(data => {
        if (Number.isInteger(data.code))
        {
          this.setAttribute('code', data.code);
          if (data.code == 1) this.data = data.data;
        };
        this.dispatchEvent(new CustomEvent('fetchend'));
        this.locked = false;
      });
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'data':
      {
        this.data = JSON.parse(newVal);
        break;
      };
      case 'mode':
      {
        this.mode = newVal;
        break;
      };
      case 'target':
      {
        this.target = newVal;
        break;
      };
      case 'url':
      {
        this.#URL = newVal;
        if (!this.hasAttribute('mt'))
        {
          this.fetch();
        };
        break;
      };
    };
  };

  connectedCallback() {
    if (this.#silentMode == true)
    {
      this.#silentMode = false;
      this.data = this.#data;
    };
  };

  disconnectedCallback() {
    let parentEl = this.#parentEl;
    this.dispatchEvent(new CustomEvent('rendercomplete', {detail: {parentNode: parentEl}}));
    parentEl?.dispatchEvent(new CustomEvent('rendercomplete'));
    parentEl?.dispatchEvent(new CustomEvent('renderend', {bubbles: true}));
  };

  constructor() {
    super();
    this.locked = false;
    this.temporary = [];
  };
};