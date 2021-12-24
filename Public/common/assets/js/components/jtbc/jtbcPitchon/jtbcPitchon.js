export default class jtbcPitchon extends HTMLElement {
  static get observedAttributes() {
    return ['pitchon'];
  };

  set pitchon(value) {
    this.currentPitchon = value;
    this.render();
  };

  get pitchon() {
    let currentPitchon = this.currentPitchon;
    if (currentPitchon == null)
    {
      let currentURL = location.href;
      let url = new URL(currentURL);
      if (url.searchParams.has('pitchon'))
      {
        currentPitchon = url.searchParams.get('pitchon');
      }
      else if (currentURL.includes('#'))
      {
        let virtualUrl = currentURL.substring(currentURL.indexOf('#') + 1);
        let virtualParams = new URLSearchParams(virtualUrl);
        if (virtualParams.has('pitchon')) currentPitchon = virtualParams.get('pitchon');
      };
      currentPitchon = currentPitchon ?? this.getAttribute('pitchon_default') ?? this.parentNode.getAttribute('pitchon_default');
    };
    return currentPitchon;
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
        this.currentPitchon = newVal;
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
    this.currentPitchon = null;
  };
};