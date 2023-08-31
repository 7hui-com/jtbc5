export default class jtbcPitchon extends HTMLElement {
  static get observedAttributes() {
    return ['pitchon'];
  };

  #pitchon = null;

  get pitchon() {
    let result = this.#pitchon;
    if (result == null)
    {
      let currentURL = location.href;
      let url = new URL(currentURL);
      if (url.searchParams.has('pitchon'))
      {
        result = url.searchParams.get('pitchon');
      }
      else if (currentURL.includes('#'))
      {
        let virtualUrl = currentURL.substring(currentURL.indexOf('#') + 1);
        let virtualParams = new URLSearchParams(virtualUrl);
        if (virtualParams.has('pitchon')) result = virtualParams.get('pitchon');
      };
      result = result ?? this.getAttribute('pitchon_default') ?? this.parentNode.getAttribute('pitchon_default');
    };
    return result;
  };

  set pitchon(pitchon) {
    this.#pitchon = pitchon;
    this.render();
  };

  render() {
    let pitchon = this.pitchon;
    if (pitchon != null)
    {
      this.querySelectorAll('.pitchon').forEach(el => {
        el.classList.remove('pitchon');
      });
      this.querySelectorAll(pitchon).forEach(el => {
        el.classList.add('pitchon');
      });
    };
    return this;
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'pitchon':
      {
        this.pitchon = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.render();
  };

  constructor() {
    super();
    this.ready = false;
  };
};