import components from '../components/components.js';
import broadcaster from '../library/broadcaster/broadcaster.js';

export default class extender {
  #activeZIndex = 7777777;
  #extended = false;

  #addPrototypeToElement() {
    let that = this;
    Element.prototype.appendFragment = async function(fragment, preloadComponents = true) {
      if (fragment instanceof DocumentFragment)
      {
        if (preloadComponents == true)
        {
          for (let cl of fragment.children)
          {
            await cl.loadComponents();
          };
        };
        this.append(fragment);
      }
      else
      {
        throw new Error('Unexpected argument(s)');
      };
      return this;
    };
    Element.prototype.delegateEventListener = function(selector, type, listener) {
      this.addEventListener(type, function(e){
        let match = false;
        let matchTarget = null;
        let elements = this.querySelectorAll(selector);
        for (let i = 0; i < elements.length; i ++)
        {
          let element = elements[i];
          if (element == e.target || element.contains(e.target))
          {
            match = true;
            matchTarget = element;
            break;
          };
        };
        if (match == true)
        {
          listener.call(matchTarget, e);
        }
        else
        {
          for (let i = 0; i < elements.length; i ++)
          {
            let element = elements[i];
            let slotElements = element.querySelectorAll('slot');
            for (let j = 0; j < slotElements.length; j ++)
            {
              let slotElement = slotElements[j];
              slotElement.assignedElements({flatten: true}).forEach(ael => {
                if (match != true)
                {
                  if (ael == e.target || ael.contains(e.target))
                  {
                    match = true;
                    matchTarget = element;
                  };
                };
              });
              if (match == true) break;
            };
            if (match == true) break;
          };
          if (match == true)
          {
            listener.call(matchTarget, e);
          };
        };
      });
    };
    Element.prototype.empty = function() {
      this.innerHTML = '';
      return this;
    };
    Element.prototype.getDirectChildrenByClassName = function(className) {
      let result = [];
      Object.values(this.children).forEach(el => {
        if (el.classList.contains(className))
        {
          result.push(el);
        };
      });
      return result;
    };
    Element.prototype.getDirectChildrenByTagName = function(tagName) {
      let result = [];
      Object.values(this.children).forEach(el => {
        if (tagName.toLowerCase() === el.tagName.toLowerCase())
        {
          result.push(el);
        };
      });
      return result;
    };
    Element.prototype.getQueryString = function(name, attr = 'src') {
      let result = null;
      if (this.hasAttribute(attr))
      {
        let value = this.getAttribute(attr);
        if (value.includes('?'))
        {
          let searchParams = new URLSearchParams(value.substring(value.indexOf('?') + 1));
          if (searchParams.has(name))
          {
            result = searchParams.get(name);
          };
        };
      };
      return result;
    };
    Element.prototype.getTarget = function(name = 'target') {
      let result = null;
      let target = this.getAttribute(name) ?? document.querySelector('base')?.getAttribute('jtbc-default-target');
      if (target == null || target == '#location')
      {
        result = location;
      }
      else if (target == '#null')
      {
        result = null;
      }
      else
      {
        result = document.getElementById(target) ?? this.querySelector(target) ?? this.getRootNode().querySelector(target) ?? document.querySelector(target);
      };
      return result;
    };
    Element.prototype.html = async function(html, preloadComponents = true) {
      let documentRange = document.createRange();
      let contextualFragment = documentRange.createContextualFragment(html);
      return await this.empty().appendFragment(contextualFragment, preloadComponents);
    };
    Element.prototype.index = function() {
      let index = 0;
      let el = this;
      while (el)
      {
        index += 1;
        el = el.previousElementSibling;
      };
      return index;
    };
    Element.prototype.inViewport = function() {
      let result = false;
      let clientRect = this.getBoundingClientRect();
      let browserWidth = document.documentElement.clientWidth;
      let browserHeight = document.documentElement.clientHeight;
      if (clientRect.top < browserHeight && clientRect.bottom > 0 && clientRect.left < browserWidth && clientRect.right > 0)
      {
        result = true;
      };
      return result;
    };
    Element.prototype.loadComponents = async function() {
      const getDependentComponents = el => {
        let components = {};
        if (el.tagName.includes('-'))
        {
          let componentTagName = el.tagName.toLowerCase();
          if (!components.hasOwnProperty(componentTagName))
          {
            components[componentTagName] = {'dir': el.getAttribute('dir'), 'path': el.getAttribute('path')};
          };
        }
        else if (el.hasAttribute('is') && el.getAttribute('is').includes('-'))
        {
          let componentTagName = el.getAttribute('is').toLowerCase();
          if (!components.hasOwnProperty(componentTagName))
          {
            components[componentTagName] = {'extends': el.tagName.toLowerCase(), 'dir': el.getAttribute('dir'), 'path': el.getAttribute('path')};
          };
        };
        Array.from(el.children).forEach(cl => {
          Object.entries(getDependentComponents(cl)).forEach(item => {
            let [key, value] = item;
            if (!components.hasOwnProperty(key)) components[key] = value;
          });
        });
        return components;
      };
      return that.components.load(getDependentComponents(this));
    };
    Element.prototype.loadFragment = async function(url) {
      let result = this;
      let res = await fetch(url);
      let data = await (res.ok? res.json(): {});
      if (data.code == 1)
      {
        result = this.html(data.fragment);
      }
      else
      {
        this.setAttribute('code', data.code);
      };
      return result;
    };
    Element.prototype.renameAttribute = function(oldName, newName) {
      let result = false;
      if (this.hasAttribute(oldName))
      {
        result = true;
        this.setAttribute(newName, this.getAttribute(oldName));
        this.removeAttribute(oldName);
      };
      return result;
    };
    Element.prototype.setAttributes = function(object) {
      if (object instanceof Object)
      {
        Object.keys(object).forEach(key => this.setAttribute(key, object[key]));
      };
      return this;
    };
  };

  #addPrototypeToWindow() {
    let that = this;
    Window.prototype.getActiveZIndex = function() {
      return that.#activeZIndex ++;
    };
    Window.prototype.getBroadcaster = function(channel = null) {
      return that.broadcaster.switch(channel);
    };
    Window.prototype.loadModule = async function(url) {
      return (await import(url)).default;
    };
  };

  extend() {
    let result = false;
    if (this.#extended === false)
    {
      result = true;
      this.#extended = true;
      this.#addPrototypeToWindow();
      this.#addPrototypeToElement();
    };
    return result;
  };

  constructor(ver) {
    this.broadcaster = new broadcaster();
    this.components = new components(ver);
  };
};