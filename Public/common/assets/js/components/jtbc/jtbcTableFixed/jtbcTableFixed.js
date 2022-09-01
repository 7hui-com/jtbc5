export default class jtbcTableFixed extends HTMLElement {
  static get observedAttributes() {
    return ['left', 'right', 'thead', 'tfoot', 'width', 'height'];
  };

  #left = 0;
  #right = 0;
  #thead = false;
  #tfoot = false;
  #changed = false;
  #param = {
    'left': this.#left,
    'right': this.#right,
    'thead': this.#thead,
    'tfoot': this.#tfoot,
  };

  get left() {
    return this.#left;
  };

  get right() {
    return this.#right;
  };

  get thead() {
    return this.#thead;
  };

  get tfoot() {
    return this.#tfoot;
  };

  set left(left) {
    if (isFinite(left))
    {
      this.#left = Math.max(0, Number.parseInt(left));
      if (this.ready === true)
      {
        this.reset();
      };
    }
    else
    {
      throw new Error('Unexpected value');
    };
  };

  set right(right) {
    if (isFinite(right))
    {
      this.#right = Math.max(0, Number.parseInt(right));
      if (this.ready === true)
      {
        this.reset();
      };
    }
    else
    {
      throw new Error('Unexpected value');
    };
  };

  set thead(thead) {
    this.#thead = thead === true? true: false;
    if (this.ready === true)
    {
      this.reset();
    };
  };

  set tfoot(tfoot) {
    this.#tfoot = tfoot === true? true: false;
    if (this.ready === true)
    {
      this.reset();
    };
  };

  #hasChanged() {
    let result = false;
    if (this.#changed === true)
    {
      result = true;
    }
    else
    {
      if (this.#param['left'] != this.#left)
      {
        result = true;
      }
      else if (this.#param['right'] != this.#right)
      {
        result = true;
      }
      else if (this.#param['thead'] != this.#thead)
      {
        result = true;
      }
      else if (this.#param['tfoot'] != this.#tfoot)
      {
        result = true;
      };
    };
    return result;
  };

  #isStickable(el) {
    let result = false;
    let position = null;
    let currentIndex = el.index();
    let totalCount = el.parentElement.childElementCount;
    if (this.left != 0)
    {
      if (currentIndex == 1)
      {
        position = 'left';
      }
      else if (currentIndex <= this.left)
      {
        let currentEl = el;
        let columnCount = 1;
        while (currentEl.previousElementSibling != null)
        {
          currentEl = currentEl.previousElementSibling;
          if (!currentEl.hasAttribute('colspan'))
          {
            columnCount += 1;
          }
          else
          {
            columnCount += Number.parseInt(currentEl.getAttribute('colspan'));
          };
        };
        position = columnCount <= this.left? 'left': null;
      };
    };
    if (position == null && this.right != 0)
    {
      if (currentIndex == totalCount)
      {
        position = 'right';
      }
      else
      {
        let currentEl = el;
        let columnCount = 1;
        while (currentEl.nextElementSibling != null)
        {
          currentEl = currentEl.nextElementSibling;
          if (!currentEl.hasAttribute('colspan'))
          {
            columnCount += 1;
          }
          else
          {
            columnCount += Number.parseInt(currentEl.getAttribute('colspan'));
          };
        };
        position = columnCount <= this.right? 'right': null;
      };
    };
    if (position != null)
    {
      result = true;
      el.setAttribute('position', position);
    };
    return result;
  };

  #resetPosition(el) {
    let slot = el.querySelector('slot');
    slot.assignedElements({flatten: true}).forEach(el => {
      if (el.tagName == 'TABLE')
      {
        el.querySelectorAll('th.sticky, td.sticky').forEach(item => {
          if (item.hasAttribute('position'))
          {
            let position = item.getAttribute('position');
            if (position == 'left')
            {
              let leftPixel = 0;
              let currentEl = item;
              while (currentEl.previousElementSibling != null)
              {
                currentEl = currentEl.previousElementSibling;
                leftPixel += currentEl.offsetWidth;
              };
              item.style.left = leftPixel + 'px';
              let nextItem = item.nextElementSibling;
              if (nextItem == null || nextItem.getAttribute('position') != 'left')
              {
                item.setAttribute('fence', 'left');
              }
              else
              {
                item.removeAttribute('fence');
              };
            }
            else if (position == 'right')
            {
              let rightPixel = 0;
              let currentEl = item;
              while (currentEl.nextElementSibling != null)
              {
                currentEl = currentEl.nextElementSibling;
                rightPixel += currentEl.offsetWidth;
              };
              item.style.right = rightPixel + 'px';
              let prevItem = item.previousElementSibling;
              if (prevItem == null || prevItem.getAttribute('position') != 'right')
              {
                item.setAttribute('fence', 'right');
              }
              else
              {
                item.removeAttribute('fence');
              };
            };
          };
        });
      };
    });
  };

  #resetPinStatus(el) {
    let slot = el.querySelector('slot');
    let clientWidth = Math.round(el.clientWidth);
    let clientHeight = Math.round(el.clientHeight);
    let scrollTop = Math.round(el.scrollTop);
    let scrollLeft = Math.round(el.scrollLeft);
    let scrollWidth = Math.round(el.scrollWidth);
    let scrollHeight = Math.round(el.scrollHeight);
    slot.assignedElements({flatten: true}).forEach(el => {
      if (el.tagName == 'TABLE')
      {
        if (scrollTop > 0)
        {
          el.setAttribute('pin-head', 'true');
        }
        else
        {
          el.removeAttribute('pin-head');
        };
        if (scrollLeft > 0)
        {
          el.setAttribute('pin-left', 'true');
        }
        else
        {
          el.removeAttribute('pin-left');
        };
        if (scrollTop + clientHeight < scrollHeight)
        {
          el.setAttribute('pin-foot', 'true');
        }
        else
        {
          el.removeAttribute('pin-foot');
        };
        if (scrollLeft + clientWidth < scrollWidth)
        {
          el.setAttribute('pin-right', 'true');
        }
        else
        {
          el.removeAttribute('pin-right');
        };
      };
    });
  };

  #stick() {
    if (this.ready === true && this.#hasChanged())
    {
      this.#changed = false;
      let slot = this.container.querySelector('slot');
      const setSticky = table => {
        if (table.tagName == 'TABLE')
        {
          table.querySelectorAll('thead').forEach(el => {
            if (this.thead === true)
            {
              el.classList.add('sticky');
            }
            else
            {
              el.classList.remove('sticky');
            };
          });
          table.querySelectorAll('tfoot').forEach(el => {
            if (this.tfoot === true)
            {
              el.classList.add('sticky');
            }
            else
            {
              el.classList.remove('sticky');
            };
          });
          table.querySelectorAll('tr').forEach(el => {
            Array.from(el.children).forEach(cl => {
              if (this.#isStickable(cl))
              {
                cl.classList.add('sticky');
              }
              else
              {
                cl.classList.remove('sticky');
              };
            });
          });
        };
      };
      slot.assignedElements({flatten: true}).forEach(el => setSticky(el));
      this.#param = {'left': this.#left, 'right': this.#right, 'thead': this.#thead, 'tfoot': this.#tfoot};
    };
  };

  #initEvents() {
    let container = this.container;
    this.resizeObserver = new ResizeObserver(entries => {
      Array.from(entries).forEach(entry => {
        this.#resetPinStatus(entry.target);
        this.#resetPosition(entry.target);
      });
    });
    this.resizeObserver.observe(container);
    container.addEventListener('scroll', e => this.#resetPinStatus(e.target));
  };

  reset(changed = false) {
    this.#changed = changed;
    if (this.#hasChanged())
    {
      this.#stick();
      this.#resetPinStatus(this.container);
      this.#resetPosition(this.container);
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'left':
      {
        this.left = newVal;
        break;
      };
      case 'right':
      {
        this.right = newVal;
        break;
      };
      case 'thead':
      {
        this.thead = this.hasAttribute('thead')? true: false;
        break;
      };
      case 'tfoot':
      {
        this.tfoot = this.hasAttribute('tfoot')? true: false;
        break;
      };
      case 'width':
      {
        this.style.width = isFinite(newVal)? newVal + 'px': newVal;
        break;
      };
      case 'height':
      {
        this.style.height = isFinite(newVal)? newVal + 'px': newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.#stick();
    this.#initEvents();
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.substring(0, import.meta.url.lastIndexOf('.')) + '.css';
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none"><slot></slot></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
  };
};