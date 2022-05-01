export default class jtbcView extends HTMLElement {
  static get observedAttributes() {
    return ['data'];
  };

  #data = {};
  #dataProxy = null;
  #directive = {};
  #rendered = false;
  #template = null;
  #templateTree = [];
  #virtualDOM = null;
  #builtInDirective = ['model', 'html'];

  set data(data) {
    if (Array.isArray(data))
    {
      this.#data = data;
    }
    else if (data instanceof Object)
    {
      this.#data = data;
    }
    else if (typeof data == 'string')
    {
      let dataValue = [];
      try
      {
        dataValue = JSON.parse(data);
      }
      catch (e)
      {
        throw new Error('Unexpected data format');
      };
      this.#data = dataValue;
    };
    this.render();
  };

  get data() {
    let that = this;
    let result = this.#dataProxy;
    if (result == null)
    {
      const addProxy = origin => {
        const addProxy = origin => {
          return new Proxy(origin, {
            'proxies': {},
            get(target, key) {
              let result = null;
              if (key == '__isProxy')
              {
                result = true;
              }
              else if (this.proxies.hasOwnProperty(key))
              {
                result = this.proxies[key];
              }
              else
              {
                result = Reflect.get(target, key.startsWith('$_')? key.substring(2): key);
              };
              return result;
            },
            set(target, key, value) {
              if (value.__isProxy === true)
              {
                this.proxies[key] = value;
              }
              else
              {
                if (Reflect.get(target, key) != value)
                {
                  if (Reflect.set(target, key, value))
                  {
                    that.update();
                  };
                };
              };
              return true;
            },
          });
        };
        const addProxies = proxy => {
          Object.keys(proxy).forEach(key => {
            let value = proxy[key];
            if(typeof value == 'object')
            {
              proxy[key] = addProxies(addProxy(value));
            };
          });
          return proxy;
        };
        return addProxies(addProxy(origin));
      };
      result = this.#dataProxy = addProxy(this.#data);
    };
    return result;
  };

  get rendered() {
    return this.#rendered;
  };

  get template() {
    return this.#template;
  };

  #patchRealElement(el) {
    const getTargetModel = (el, name) => {
      let model = el.virtualNode.model;
      if (name.startsWith(':'))
      {
        model = this.#data;
        name = name.substring(1);
      }
      else if (name.startsWith('^'))
      {
        let modelNode = el;
        while (name.startsWith('^'))
        {
          name = name.substring(1);
          modelNode = modelNode.parentElement;
        };
        model = modelNode.virtualNode.model;
      };
      return {'model': model, 'name': name};
    };
    if (el.hasAttribute('view-html'))
    {
      let viewHTML = el.getAttribute('view-html');
      let targetModel = getTargetModel(el, viewHTML);
      let name = targetModel.name;
      let model = targetModel.model;
      if (typeof model == 'object' && model.hasOwnProperty(name))
      {
        el.html(model[name]);
      };
    }
    else if (el.hasAttribute('view-model'))
    {
      el.addEventListener('input', e => {
        let self = e.currentTarget;
        let viewModel = self.getAttribute('view-model');
        let targetModel = getTargetModel(self, viewModel);
        let name = targetModel.name;
        let model = targetModel.model;
        if (typeof model == 'object')
        {
          model[name] = self.value;
          if (!self.hasAttribute('view-silent')) this.update();
        };
      });
    };
    this.runDirective(el, 'inserted');
  };

  #generateVirtualDOM() {
    let result = [];
    let data = this.#data;
    let templateTree = this.#getTemplateTree();
    if (data.length != 0 && templateTree.length != 0)
    {
      const getChildData = (keys, data) => {
        keys.split('.').forEach(key => {
          if (data instanceof Object)
          {
            data = data.hasOwnProperty(key)? data[key]: null;
          };
        });
        return data;
      };
      const itemGenerator = (data, tree, attrs = {}) => {
        let result = [];
        tree.forEach(node => {
          let virtualNode = { ...node };
          virtualNode.model = data;
          if (node.hasOwnProperty('textContent'))
          {
            virtualNode.textContent = this.#parseTemplateString(node.textContent, data, attrs);
            result.push(virtualNode);
          }
          else
          {
            let childNodes = node.childNodes;
            virtualNode.attributes = { ...node.attributes };
            if (!virtualNode.attributes.hasOwnProperty('forloop'))
            {
              Object.keys(virtualNode.attributes).forEach(key => {
                virtualNode.attributes[key] = this.#parseTemplateString(virtualNode.attributes[key], data, attrs);
              });
              if (virtualNode.attributes.hasOwnProperty('view-html'))
              {
                virtualNode.childNodes = [];
              }
              else if (childNodes.length != 0)
              {
                virtualNode.childNodes = itemGenerator(data, childNodes, attrs);
              };
              result.push(virtualNode);
            }
            else
            {
              Object.keys(virtualNode.attributes).forEach(key => {
                if (key == 'forloop' || key.startsWith('__'))
                {
                  virtualNode.attributes[key] = this.#parseTemplateString(virtualNode.attributes[key], data, attrs);
                };
              });
              let childData = getChildData(virtualNode.attributes.forloop, data);
              delete virtualNode.attributes.forloop;
              if (Array.isArray(childData))
              {
                let index = -1;
                childData.forEach(item => {
                  index += 1;
                  item['_index'] = index;
                  result = result.concat(itemGenerator(item, [virtualNode], virtualNode.attributes));
                });
              };
            };
          };
        });
        return result;
      };
      const conditionCheckUp = virtualDOM => {
        const checkUp = (virtualNode, condition) => {
          const getNextVirtualNode = node => {
            let result = null;
            let started = false;
            for (let i = 0; i < virtualDOM.length; i ++)
            {
              let currentNode = virtualDOM[i];
              if (started === true)
              {
                if (currentNode.hasOwnProperty('attributes'))
                {
                  result = currentNode;
                  break;
                };
              }
              else
              {
                if (Object.is(currentNode, node))
                {
                  started = true;
                };
              };
            };
            return result;
          };
          let nextVirtualNode = getNextVirtualNode(virtualNode);
          if (condition == true)
          {
            delete virtualNode.attributes.if;
            while (nextVirtualNode)
            {
              if (nextVirtualNode.attributes.hasOwnProperty('elseif') || nextVirtualNode.attributes.hasOwnProperty('else'))
              {
                let oldNextVirtualNode = nextVirtualNode;
                nextVirtualNode = getNextVirtualNode(oldNextVirtualNode);
                oldNextVirtualNode.attributes.__deleted = true;
              }
              else
              {
                nextVirtualNode = null;
              };
            };
          }
          else if (condition == false)
          {
            while (nextVirtualNode)
            {
              if (nextVirtualNode.attributes.hasOwnProperty('elseif'))
              {
                if (nextVirtualNode.attributes.elseif == 'true')
                {
                  checkUp(nextVirtualNode, true);
                  delete nextVirtualNode.attributes.elseif;
                  nextVirtualNode = null;
                }
                else
                {
                  let oldNextVirtualNode = nextVirtualNode;
                  nextVirtualNode = getNextVirtualNode(oldNextVirtualNode);
                  oldNextVirtualNode.attributes.__deleted = true;
                };
              }
              else if (nextVirtualNode.attributes.hasOwnProperty('else'))
              {
                checkUp(nextVirtualNode, true);
                delete nextVirtualNode.attributes.else;
                nextVirtualNode = null;
              }
              else
              {
                nextVirtualNode = null;
              };
            };
            virtualNode.attributes.__deleted = true;
          };
        };
        virtualDOM.forEach(virtualNode => {
          if (virtualNode.hasOwnProperty('attributes'))
          {
            if (virtualNode.attributes.hasOwnProperty('if'))
            {
              if (virtualNode.attributes.if == 'true')
              {
                checkUp(virtualNode, true);
              }
              else
              {
                checkUp(virtualNode, false);
              };
            };
            if (virtualNode.childNodes.length != 0)
            {
              virtualNode.childNodes = conditionCheckUp(virtualNode.childNodes);
            };
          };
        });
        return virtualDOM.filter(item => item?.attributes?.__deleted !== true);
      };
      let attrs = this.#getAttributes(this.attributes);
      if (Array.isArray(data))
      {
        let index = -1;
        data.forEach(item => {
          index += 1;
          item['_index'] = index;
          result = result.concat(itemGenerator(item, templateTree, attrs));
        });
      }
      else
      {
        result = itemGenerator(data, templateTree, attrs);
      };
      result = conditionCheckUp(result);
    };
    return result;
  };

  #getAttributes(attrs) {
    let result = {};
    Array.from(attrs).forEach(item => {
      result[item.name] = item.value;
    });
    return result;
  };

  #getTemplateTree() {
    let result = this.#templateTree;
    if (result.length === 0)
    {
      const createNode = node => {
        let result = null;
        if (node instanceof Node)
        {
          if (node.nodeType === 3)
          {
            result = {'id': Symbol(), 'nodeName': node.nodeName.toLowerCase(), 'textContent': node.textContent};
          }
          else
          {
            result = {'id': Symbol(), 'nodeName': node.nodeName.toLowerCase(), 'attributes': this.#getAttributes(node.attributes), 'childNodes': createTree(node)};
          };
        };
        return result;
      };
      const createTree = node => {
        let result = [];
        if (node instanceof Node)
        {
          Array.from(node.childNodes).forEach(item => {
            result.push(createNode(item));
          });
        };
        return result;
      };
      result = this.#templateTree = createTree(this.template);
    };
    return result;
  };

  #parseTemplateString(content, data, attrs = {}) {
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
      this.dispatchEvent(customEvent);
      return customEvent.detail.result;
    };
    const getAttr = key => {
      return attrs.hasOwnProperty(key)? attrs[key]: null;
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
    const getValueFromJSON = (json, key) => {
      let result = null;
      if (typeof json == 'string' && typeof key == 'string')
      {
        if (json.trim() != '')
        {
          let obj = {};
          try
          {
            obj = JSON.parse(json);
          }
          catch(e)
          {
          };
          key.split('->').forEach(item => {
            result = null;
            if (obj.hasOwnProperty(item))
            {
              result = obj = obj[item];
            };
          });
        };
      };
      return result;
    };
    const parseHelper = {
      'compare': compare,
      'customEvent': customEvent,
      'getAttr': getAttr,
      'getValueFromJSON': getValueFromJSON,
      'reachConsensus': reachConsensus,
      'this': this,
    };
    let valuesArray = Object.values(data);
    let keysArray = Object.keys(data).map(key => '$' + key);
    valuesArray.push(parseHelper);
    keysArray.push('$', 'return `' + content.replace(/\\/g, '\\\\').replace(/\`/g, '\\`') + '`;');
    return new Function(...keysArray)(...valuesArray);
  };

  addDirective(name, definition) {
    if (!this.#builtInDirective.includes(name))
    {
      this.#directive[name] = definition;
    }
    else
    {
      throw new Error('Can not add built-in directive');
    };
  };

  diff(currentVirtualDOM, newVirtualDOM) {
    const diff = (a, b) => {
      let result = [];
      let diffMode = 0;
      let aLength = a.length;
      let bLength = b.length;
      let maxLength = Math.max(aLength, bLength);
      if (aLength == 0 && bLength == 0)
      {
        result = null;
      }
      else
      {
        if (aLength != 0 && bLength != 0)
        {
          if (a[0].id != b[0].id && a[aLength - 1].id == b[bLength - 1].id)
          {
            diffMode = 1;
          };
        };
        for (let i = 0; i < maxLength; i ++)
        {
          let aItem = diffMode == 0? a[i]: a[i - (maxLength - aLength)];
          let bItem = diffMode == 0? b[i]: b[i - (maxLength - bLength)];
          if (aItem?.id == bItem?.id)
          {
            bItem.el = aItem.el;
            if (aItem.hasOwnProperty('textContent'))
            {
              if (aItem.textContent != bItem.textContent)
              {
                result.push({'el': aItem.el, 'type': 1, 'textContent': bItem.textContent});
              };
            }
            else
            {
              let isSameAttr = true;
              if (Object.keys(aItem.attributes).length != Object.keys(bItem.attributes).length)
              {
                isSameAttr = false;
              }
              else
              {
                Object.keys(aItem.attributes).forEach(key => {
                  if (aItem.attributes[key] != bItem.attributes[key])
                  {
                    isSameAttr = false;
                  };
                });
              };
              let sameEl = {'el': aItem.el, 'type': 0, 'attributes': {}, 'childNodes': diff(aItem.childNodes, bItem.childNodes)};
              if (isSameAttr !== true)
              {
                sameEl.type = 2;
                sameEl.attributes = bItem.attributes;
              };
              result.push(sameEl);
            };
          }
          else
          {
            if (aItem != undefined && bItem != undefined)
            {
              result.push({'el': aItem.el, 'type': 3, 'node': bItem});
            }
            else if (aItem != undefined && bItem == undefined)
            {
              result.push({'el': aItem.el, 'type': 4});
            }
            else if (aItem == undefined && bItem != undefined)
            {
              result.push({'type': 5, 'node': bItem});
            };
          };
        };
      };
      return result;
    };
    return diff(currentVirtualDOM, newVirtualDOM);
  };

  patch(diffResult) {
    if (diffResult == null)
    {
      this.empty();
    }
    else if (Array.isArray(diffResult))
    {
      const createEl = virtualNode => {
        let el = null;
        if (virtualNode.hasOwnProperty('textContent'))
        {
          el = document.createTextNode(virtualNode.textContent);
          virtualNode.el = el;
        }
        else
        {
          el = document.createElement(virtualNode.nodeName);
          el.virtualNode = virtualNode;
          Object.keys(virtualNode.attributes).forEach(key => {
            if (!key.startsWith('__'))
            {
              el.setAttribute(key, virtualNode.attributes[key]);
            };
          });
          if (virtualNode.childNodes.length != 0)
          {
            virtualNode.childNodes.forEach(childNode => {
              el.appendChild(createEl(childNode));
            });
          };
          this.#patchRealElement(el);
          virtualNode.el = el;
        };
        return el;
      };
      const patch = (diffResult, parentElement) => {
        if (Array.isArray(diffResult))
        {
          diffResult.forEach(item => {
            if (item.type == 1)
            {
              item.el.textContent = item.textContent;
              this.runDirective(item.el.parentElement, 'textChanged');
            }
            else if (item.type == 2)
            {
              let newAttrs = Object.keys(item.attributes);
              let currentAttrs = this.#getAttributes(item.el.attributes);
              Object.keys(currentAttrs).forEach(key => {
                if (!newAttrs.includes(key))
                {
                  item.el.removeAttribute(key);
                }
                else
                {
                  if (item.el.getAttribute(key) != item.attributes[key])
                  {
                    item.el.setAttribute(key, item.attributes[key]);
                  };
                  newAttrs.splice(newAttrs.indexOf(key), 1);
                };
              });
              newAttrs.forEach(key => {
                item.el.setAttribute(key, item.attributes[key]);
              });
              this.runDirective(item.el, 'attrChanged');
            }
            else if (item.type == 3)
            {
              item.el.replaceWith(createEl(item.node));
              this.runDirective(item.el, 'replaced');
            }
            else if (item.type == 4)
            {
              item.el.remove();
              this.runDirective(item.el, 'removed');
            }
            else if (item.type == 5)
            {
              parentElement.appendChild(createEl(item.node));
            };
            if (item.hasOwnProperty('childNodes'))
            {
              patch(item.childNodes, item.el);
            };
          });
        };
      };
      patch(diffResult, this);
    };
  };

  render() {
    let currentVirtualDOM = this.#virtualDOM;
    if (currentVirtualDOM == null)
    {
      let virtualDOM = this.#virtualDOM = this.#generateVirtualDOM();
      let fragment = document.createDocumentFragment();
      const render = (virtualDOM, target) => {
        virtualDOM.forEach(virtualNode => {
          if (virtualNode.hasOwnProperty('textContent'))
          {
            let el = document.createTextNode(virtualNode.textContent);
            target.appendChild(el);
            virtualNode.el = el;
          }
          else
          {
            let el = document.createElement(virtualNode.nodeName);
            el.virtualNode = virtualNode;
            Object.keys(virtualNode.attributes).forEach(key => {
              if (!key.startsWith('__'))
              {
                el.setAttribute(key, virtualNode.attributes[key]);
              };
            });
            if (virtualNode.childNodes.length != 0)
            {
              render(virtualNode.childNodes, el);
            };
            this.#patchRealElement(el);
            target.appendChild(el);
            virtualNode.el = el;
          };
        });
      };
      render(virtualDOM, fragment);
      this.empty().appendChild(fragment);
      this.#rendered = true;
      this.dispatchEvent(new CustomEvent('rendercomplete'));
      this.dispatchEvent(new CustomEvent('renderend', {bubbles: true}));
    }
    else
    {
      let newVirtualDOM = this.#generateVirtualDOM();
      this.patch(this.diff(currentVirtualDOM, newVirtualDOM));
      this.#virtualDOM = newVirtualDOM;
      this.dispatchEvent(new CustomEvent('patchcomplete'));
      this.dispatchEvent(new CustomEvent('patchend', {bubbles: true}));
    };
  };

  runDirective(el, event) {
    let directive = this.#directive;
    let directiveKeys = Object.keys(directive);
    if (directiveKeys.length != 0)
    {
      Array.from(el.attributes).forEach(item => {
        let name = item.name;
        if (name.startsWith('view-'))
        {
          let directiveName = name.substring(5);
          if (!this.#builtInDirective.includes(name))
          {
            if (directive.hasOwnProperty(directiveName))
            {
              let definition = directive[directiveName];
              if (typeof definition == 'object' && definition.hasOwnProperty(event))
              {
                let func = definition[event];
                if (typeof func == 'function') func(el, item.value);
              };
            };
          };
        };
      });
    };
  };

  update() {
    this.dispatchEvent(new CustomEvent('updatestart'));
    this.render();
    this.dispatchEvent(new CustomEvent('updateend'));
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'data':
      {
        this.data = newVal;
        break;
      };
    };
  };

  constructor() {
    super();
    let templates = this.querySelectorAll('template');
    if (templates.length === 1)
    {
      let template = templates[0];
      this.#template = template.content;
      template.remove();
    }
    else
    {
      throw new Error('Unexpected template element');
    };
  };
};