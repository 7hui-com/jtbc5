export default class htmlInspector {
  #html = null;
  #rule = null;
  #rules = {
    'tiny': {
      'a': ['href', 'target'],
      'b': [],
      'br': [],
      'code': [],
      'i': [],
      'mark': [],
      'img': ['src', 'alt', 'title'],
      's': [],
      'u': [],
    },
    'block-editor': {
      'a': ['href', 'target'],
      'b': [],
      'br': [],
      'code': ['class'],
      'i': [],
      'mark': ['class'],
      'span': ['style'],
      's': ['class'],
      'u': ['class'],
    },
  };

  check() {
    let result = false;
    let rule = this.#rule;
    let documentRange = document.createRange();
    let fragment = documentRange.createContextualFragment(this.#html);
    if (rule instanceof Object)
    {
      result = true;
      fragment.childNodes.forEach(node => {
        if (node.nodeType != 1 && node.nodeType != 3)
        {
          result = false;
        }
        else
        {
          if (node.nodeType == 1)
          {
            let nodeName = node.nodeName.toLowerCase();
            if (!rule.hasOwnProperty(nodeName))
            {
              result = false;
            }
            else
            {
              let ruleAttrs = rule[nodeName];
              for (let attr of node.attributes)
              {
                if (!ruleAttrs.includes(attr.name))
                {
                  result = false;
                  break;
                };
              };
            };
          };
        };
      });
    };
    return result;
  };

  getFilteredHTML() {
    let result = '';
    let rule = this.#rule;
    let documentRange = document.createRange();
    let fragment = documentRange.createContextualFragment(this.#html);
    const htmlEncode = str => str.replace(/[&<>"]/g, tag => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[tag] || tag));
    if (rule instanceof Object)
    {
      fragment.childNodes.forEach(node => {
        if (node.nodeType != 1 && node.nodeType != 3)
        {
          node.parentNode.removeChild(node);
        }
        else
        {
          if (node.nodeType == 1)
          {
            let nodeName = node.nodeName.toLowerCase();
            if (!rule.hasOwnProperty(nodeName))
            {
              node.remove();
            }
            else
            {
              let ruleAttrs = rule[nodeName];
              for (let attr of node.attributes)
              {
                if (!ruleAttrs.includes(attr.name))
                {
                  node.removeAttribute(attr.name);
                };
              };
              result += node.outerHTML;
            };
          }
          else if (node.nodeType == 3)
          {
            result += htmlEncode(node.nodeValue);
          };
        };
      });
    };
    return result;
  };

  setRule(rule) {
    this.#rule = rule;
  };

  constructor(html, rule = 'tiny') {
    this.#html = html;
    if (this.#rules.hasOwnProperty(rule))
    {
      this.#rule = this.#rules[rule];
    };
  };
};