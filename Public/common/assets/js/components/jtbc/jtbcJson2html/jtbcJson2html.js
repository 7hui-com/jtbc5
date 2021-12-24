export default class jtbcJson2html extends HTMLElement {
  static get observedAttributes() {
    return ['value'];
  };

  #specialTags = ['hr', 'br', 'img'];
  #allowedTags = ['a', 'b', 'p', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ol', 'ul', 'li', 'hr', 'br', 'em', 'img', 'sub', 'sup', 'del', 'mark', 'strong', 'table', 'tr', 'th', 'td'];
  #allowedGlobalAttributes = ['name', 'class', 'title'];
  #allowedAttributes = {
    'a': ['href', 'target'],
    'p': ['align'],
    'h1': ['align'],
    'h2': ['align'],
    'h3': ['align'],
    'h4': ['align'],
    'h5': ['align'],
    'h6': ['align'],
    'img': ['src', 'border', 'alt'],
    'table': ['width', 'cellspacing', 'cellpadding'],
    'th': ['align', 'rowspan', 'colspan'],
    'td': ['align', 'rowspan', 'colspan'],
  };
  #defaultAttributes = {
    'table': {
      'cellspacing': 1,
      'cellpadding': 5,
    },
  };

  #isVaildContents(contents) {
    let result = false;
    if (Array.isArray(contents))
    {
      result = true;
    }
    else if (contents instanceof Object)
    {
      result = true;
    }
    return result;
  };

  set value(value) {
    this.currentValue = value;
    this.render();
  };

  get value() {
    return this.currentValue;
  };

  addSpecialTags(...tags) {
    if (Array.isArray(tags))
    {
      tags.forEach(tag => {
        if (!this.#specialTags.includes(tag))
        {
          this.#specialTags.push(tag);
        };
      });
    };
  };

  addAllowedTags(...tags) {
    if (Array.isArray(tags))
    {
      tags.forEach(tag => {
        if (!this.#allowedTags.includes(tag))
        {
          this.#allowedTags.push(tag);
        };
      });
    };
  };

  setAllowedAttributes(tag, attrs) {
    let result = false;
    if (this.#allowedTags.includes(tag))
    {
      if (Array.isArray(attrs))
      {
        result = true;
        this.#allowedAttributes[tag] = attrs;
      };
    };
    return result;
  };

  setDefaultAttributes(tag, defaultAttrs) {
    let result = false;
    if (this.#allowedTags.includes(tag))
    {
      if (defaultAttrs instanceof Object)
      {
        result = true;
        this.#defaultAttributes[tag] = defaultAttrs;
      };
    };
    return result;
  };

  render() {
    this.container.innerHTML = '';
    let that = this;
    let contents = this.currentValue? JSON.parse(this.currentValue): [];
    if (!this.#isVaildContents(contents))
    {
      this.currentValue = '';
    }
    else
    {
      let render = function(parentEl, contents)
      {
        let documentFragment = document.createDocumentFragment();
        let appendElement = function(content)
        {
          Object.keys(content).forEach(item => {
            let attrs = null;
            let tagName = item;
            if (item.includes(':'))
            {
              tagName = item.substring(0, item.indexOf(':'));
              attrs = new URLSearchParams(item.substring(item.indexOf(':') + 1));
            };
            if (that.#allowedTags.includes(tagName))
            {
              let newElement = document.createElement(tagName);
              if (attrs != null)
              {
                let allowedAttrs = that.#allowedGlobalAttributes;
                if (that.#allowedAttributes.hasOwnProperty(tagName))
                {
                  allowedAttrs = allowedAttrs.concat(that.#allowedAttributes[tagName]);
                };
                allowedAttrs.forEach(name => {
                  if (attrs.get(name) != null)
                  {
                    newElement.setAttribute(name, attrs.get(name));
                  };
                });
              };
              if (that.#defaultAttributes.hasOwnProperty(tagName))
              {
                let defaultAttrs = that.#defaultAttributes[tagName];
                Object.keys(defaultAttrs).forEach(name => {
                  if (!newElement.hasAttribute(name))
                  {
                    newElement.setAttribute(name, defaultAttrs[name]);
                  };
                });
              };
              let itemContent = that.#specialTags.includes(tagName)? null: content[item];
              if (typeof(itemContent) == 'string')
              {
                newElement.append(itemContent);
              }
              else if(itemContent != null)
              {
                render(newElement, itemContent);
              };
              documentFragment.append(newElement);
            };
          });
        };
        if (Array.isArray(contents))
        {
          contents.forEach(content => {
            if (typeof(content) == 'string')
            {
              documentFragment.append(content);
            }
            else if (content instanceof Object)
            {
              appendElement(content);
            };
          });
        }
        else if (contents instanceof Object)
        {
          appendElement(contents);
        };
        parentEl.append(documentFragment);
      };
      render(this.container, contents);
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'value':
      {
        this.value = newVal;
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
    this.currentValue = '';
    let shadowRoot = this.attachShadow({mode: 'open'});
    let pluginCss = this.getAttribute('plugin_css');
    let importCssUrl = import.meta.url.substring(0, import.meta.url.lastIndexOf('.')) + '.css';
    let shadowRootHTML = `<style>@import url('${importCssUrl}');</style><container style="display:none"></container>`;
    shadowRoot.innerHTML = shadowRootHTML;
    if (pluginCss != null)
    {
      let pluginStyle = document.createElement('link');
      pluginStyle.setAttribute('type', 'text/css');
      pluginStyle.setAttribute('rel', 'stylesheet');
      pluginStyle.setAttribute('href', pluginCss);
      shadowRoot.insertBefore(pluginStyle, this.container);
    };
    this.container = shadowRoot.querySelector('container');
    this.container.addEventListener('click', e => {
      this.dispatchEvent(new CustomEvent('clicked', {bubbles: true, detail: {target: e.target}}));
    });
  };
};