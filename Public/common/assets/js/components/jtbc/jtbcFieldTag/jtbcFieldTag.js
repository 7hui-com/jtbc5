export default class jtbcFieldTag extends HTMLElement {
  static get observedAttributes() {
    return ['api', 'credentials', 'value', 'disabled', 'with-global-headers', 'width'];
  };

  #credentials = 'same-origin';
  #disabled = false;
  #credentialsList = ['include', 'same-origin', 'omit'];
  #withGlobalHeaders = null;

  get credentials() {
    return this.#credentials;
  };

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    let result = '';
    if (this.tags.length != 0)
    {
      result = JSON.stringify(this.tags);
    };
    return result;
  };

  get disabled() {
    return this.#disabled;
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

  set value(value) {
    let container = this.container;
    let tagsElement = container.querySelector('div.tags');
    this.tags = [];
    tagsElement.innerHTML = '';
    if (value != '')
    {
      let currentTags = JSON.parse(value);
      if (Array.isArray(currentTags))
      {
        currentTags.forEach(currentTag => {
          this.addNewTag(currentTag);
        });
      };
    };
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    this.container.classList.toggle('disabled', disabled);
  };

  #getFetchParams() {
    let withGlobalHeaders = this.#withGlobalHeaders;
    let result = {'method': 'get', 'credentials': this.#credentials};
    if (withGlobalHeaders != null)
    {
      let broadcaster = getBroadcaster('fetch');
      let state = broadcaster.getState();
      if (state.hasOwnProperty(withGlobalHeaders))
      {
        result.headers = state[withGlobalHeaders];
      };
    };
    return result;
  };

  #initEvents() {
    let that = this;
    let container = this.container;
    let tagElement = container.querySelector('input.tag');
    let tagsElement = container.querySelector('div.tags');
    let hintsElement = container.querySelector('div.hints');
    container.addEventListener('click', () => {
      tagElement.focus();
    });
    tagsElement.delegateEventListener('span', 'click', function(){
      let currentTag = this.getAttribute('tag');
      this.remove();
      that.tags = that.tags.filter((tag) => tag !== currentTag);
    });
    tagElement.addEventListener('focus', (e) => {
      let self = e.target;
      container.classList.add('on');
      self.dispatchEvent(new CustomEvent('resetWidth'));
      clearTimeout(this.blurTimeout);
    });
    tagElement.addEventListener('blur', () => {
      clearTimeout(this.blurTimeout);
      this.blurTimeout = setTimeout(() => {
        tagElement.dispatchEvent(new CustomEvent('newTag'));
        container.classList.remove('on');
        hintsElement.classList.remove('on');
      }, 300);
    });
    tagElement.addEventListener('keyup', e => {
      let which = e.which;
      let self = e.target;
      if (which == 13)
      {
        self.dispatchEvent(new CustomEvent('newTag'));
      }
      else if (which == 38)
      {
        this.selectPrevHint();
      }
      else if (which == 40)
      {
        this.selectNextHint();
      };
    });
    tagElement.addEventListener('keydown', e => {
      let which = e.which;
      let self = e.target;
      if (which == 8)
      {
        let currentTag = self.value.trim();
        if (currentTag == '')
        {
          this.removeLastTag();
          self.dispatchEvent(new CustomEvent('resetWidth'));
        };
      }
      else if (which == 13)
      {
        return false;
      };
    });
    tagElement.addEventListener('input', e => {
      if (this.currentApi != null)
      {
        if (this.currentApiLoading === false)
        {
          let currentValue = e.target.value;
          if (currentValue.trim() == '')
          {
            this.loadHints([]);
          }
          else
          {
            this.currentApiLoading = true;
            let currentApi = this.currentApi + '&tag=' + encodeURIComponent(currentValue);
            fetch(currentApi, this.#getFetchParams()).then(res => res.ok? res.json(): {}).then(data => {
              this.currentApiLoading = false;
              if (data.code == 1)
              {
                let currentTagList = data.data.tags;
                if (Array.isArray(currentTagList))
                {
                  this.loadHints(currentTagList);
                };
              };
            });
          };
        };
      };
    });
    tagElement.addEventListener('newTag', e => {
      let self = e.target;
      let currentTag = self.value.trim();
      if (currentTag != '')
      {
        self.value = '';
        self.style.width = 'auto';
        this.addNewTag(currentTag);
        self.dispatchEvent(new CustomEvent('resetWidth'));
      };
    });
    tagElement.addEventListener('resetWidth', e => {
      let remainWidth = container.clientWidth - tagsElement.clientWidth;
      e.target.style.width = remainWidth > 60? (remainWidth - 10) + 'px': '100%';
    });
    hintsElement.delegateEventListener('li', 'click', function(){
      tagElement.value = '';
      that.addNewTag(this.getAttribute('tag'));
      hintsElement.classList.remove('on');
    });
  };

  addNewTag(tag) {
    let container = this.container;
    let tagsElement = container.querySelector('div.tags');
    if (!this.tags.includes(tag))
    {
      this.tags.push(tag);
      let newTagElement = document.createElement('span');
      let newTagElementEm = document.createElement('em');
      let newTagElementClose = document.createElement('jtbc-svg');
      newTagElementEm.innerText = tag;
      newTagElementClose.name = 'close';
      newTagElement.setAttribute('tag', tag);
      newTagElement.append(newTagElementEm, newTagElementClose);
      tagsElement.append(newTagElement);
    };
  };

  removeLastTag() {
    let container = this.container;
    let tagsElement = container.querySelector('div.tags');
    let lastTag = tagsElement.querySelector('span:last-child');
    if (lastTag != null)
    {
      lastTag.click();
    };
  };

  loadHints(tagList) {
    let container = this.container;
    let hintsElement = container.querySelector('div.hints');
    let hintsUlElement = hintsElement.querySelector('ul');
    hintsUlElement.querySelectorAll('li').forEach(el => {
      el.remove();
    });
    if (tagList.length == 0)
    {
      hintsElement.classList.remove('on');
    }
    else
    {
      hintsElement.classList.add('on');
      tagList.forEach(tag => {
        let newLi = document.createElement('li');
        newLi.setAttribute('tag', tag);
        newLi.innerText = tag;
        hintsUlElement.append(newLi);
      });
    };
  };

  selectPrevHint() {
    let container = this.container;
    let hintsElement = container.querySelector('div.hints');
    let hintsUlElement = hintsElement.querySelector('ul');
    let selectedLi = hintsUlElement.querySelector('li.on');
    let lastLi = hintsUlElement.querySelector('li:last-child');
    let prevLi = selectedLi == null? lastLi: (selectedLi.previousElementSibling ?? lastLi);
    if (prevLi != null)
    {
      hintsUlElement.querySelectorAll('li').forEach(el => {
        if (el == prevLi)
        {
          el.classList.add('on');
          container.querySelector('input.tag').value = el.getAttribute('tag');
        }
        else
        {
          el.classList.remove('on');
        };
      });
    };
  };

  selectNextHint() {
    let container = this.container;
    let hintsElement = container.querySelector('div.hints');
    let hintsUlElement = hintsElement.querySelector('ul');
    let selectedLi = hintsUlElement.querySelector('li.on');
    let firstLi = hintsUlElement.querySelector('li:first-child');
    let nextLi = selectedLi == null? firstLi: (selectedLi.nextElementSibling ?? firstLi);
    if (nextLi != null)
    {
      hintsUlElement.querySelectorAll('li').forEach(el => {
        if (el == nextLi)
        {
          el.classList.add('on');
          container.querySelector('input.tag').value = el.getAttribute('tag');
        }
        else
        {
          el.classList.remove('on');
        };
      });
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'api':
      {
        this.currentApi = newVal;
        break;
      };
      case 'credentials':
      {
        this.credentials = newVal;
        break;
      };
      case 'value':
      {
        this.value = newVal;
        break;
      };
      case 'disabled':
      {
        this.disabled = this.hasAttribute('disabled')? true: false;
        break;
      };
      case 'with-global-headers':
      {
        this.#withGlobalHeaders = newVal;
        break;
      };
      case 'width':
      {
        this.style.width = isFinite(newVal)? newVal + 'px': newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.#initEvents();
    this.dispatchEvent(new CustomEvent('connected', {bubbles: true}));
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none"><div class="tags"></div><input type="text" name="tag" class="tag" /><div class="hints"><ul></ul></div><div class="mask"></div></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.tags = [];
    this.container = shadowRoot.querySelector('div.container');
    this.currentApi = null;
    this.currentApiLoading = false;
    this.blurTimeout = null;
  };
};