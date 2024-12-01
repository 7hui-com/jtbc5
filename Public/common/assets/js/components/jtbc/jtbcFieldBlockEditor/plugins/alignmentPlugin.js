export default class alignmentPlugin {
  static get isTune() {
    return true;
  };

  #alignment = 'left';
  #alignmentCSS = {
    'left': 'ce-tune-alignment--left',
    'center': 'ce-tune-alignment--center',
    'right': 'ce-tune-alignment--right',
  };
  #alignmentSettings = [
    {
      'name': 'left',
      'icon': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M17 7L5 7"></path><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M17 17H5"></path><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M13 12L5 12"></path></svg>',
    },
    {
      'name': 'center',
      'icon': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M18 7L6 7"></path><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M18 17H6"></path><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M16 12L8 12"></path></svg>',
    },
    {
      'name': 'right',
      'icon': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M19 7L7 7"></path><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M19 17H7"></path><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M19 12L11 12"></path></svg>',
    },
  ];
  #wrapper = null;

  wrap(blockContent) {
    let result = document.createElement('div');
    result.append(blockContent);
    result.classList.toggle(this.#alignmentCSS[this.#alignment]);
    this.#wrapper = result;
    return result;
  };

  render() {
    let result = document.createElement('div');
    this.#alignmentSettings.map(align => {
      let button = document.createElement('button');
      button.classList.add(this.api.styles.settingsButton);
      button.innerHTML = align.icon;
      button.setAttribute('type', 'button');
      button.classList.toggle(this.api.styles.settingsButtonActive, align.name === this.#alignment);
      result.appendChild(button);
      return button;
    }).forEach((element, index, elements) => {
      element.addEventListener('click', () => {
        this.#alignment = this.#alignmentSettings[index].name;
        elements.forEach((el, i) => {
          let name = this.#alignmentSettings[i].name;
          this.#wrapper.classList.toggle(this.#alignmentCSS[name], name === this.#alignment);
          el.classList.toggle(this.api.styles.settingsButtonActive, name === this.#alignment);
        });
        this.block.dispatchChange();
      });
    });
    return result;
  };

  save() {
    return {
      'alignment': this.#alignment,
    };
  };

  constructor({data, api, config, block}) {
    this.api = api;
    this.config = config || {};
    this.block = block;
    this.data = data || {'alignment': this.#alignment};
    this.#alignment = this.data.alignment;
  };
};