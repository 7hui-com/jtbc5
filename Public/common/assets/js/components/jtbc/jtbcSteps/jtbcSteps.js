export default class jtbcSteps extends HTMLElement {
  static get observedAttributes() {
    return ['max-step', 'current-step', 'clickable'];
  };

  #maxStep = 10;
  #currentStep = 0;
  #clickable = 'none';

  get maxStep() {
    return this.#maxStep;
  };

  get currentStep() {
    return this.#currentStep;
  };

  get clickable() {
    return this.#clickable;
  };

  set maxStep(maxStep) {
    let newMaxStep = Number.parseInt(maxStep);
    if (Number.isNaN(newMaxStep)) newMaxStep = 10;
    this.#maxStep = newMaxStep;
  };

  set currentStep(currentStep) {
    let newCurrentStep = Number.parseInt(currentStep);
    if (Number.isNaN(newCurrentStep)) newCurrentStep = 0;
    this.#currentStep = newCurrentStep;
    this.#changeStep();
  };

  set clickable(clickable) {
    if (['none', 'all', 'finished', 'unfinished'].includes(clickable))
    {
      this.#clickable = clickable;
      this.container.setAttribute('clickable', clickable);
    }
    else
    {
      throw new Error('Unexpected value');
    };
  };

  #changeStep() {
    if (this.ready === true)
    {
      let currentStep = this.currentStep;
      this.container.querySelectorAll('div.step').forEach(el => {
        if (Number.parseInt(el.getAttribute('step')) <= currentStep)
        {
          el.classList.add('on');
          el.querySelectorAll('slot').forEach(slot => {
            slot.assignedElements().forEach(ael => ael.setAttribute('step', 'on'));
          });
        }
        else
        {
          el.classList.remove('on');
          el.querySelectorAll('slot').forEach(slot => {
            slot.assignedElements().forEach(ael => ael.setAttribute('step', 'off'));
          });
        };
      });
    };
  };

  #initEvents() {
    let that = this;
    let container = this.container;
    container.delegateEventListener('div.step', 'click', function(){
      let targetStep = this.getAttribute('i');
      let targetStepStatus = this.classList.contains('on')? 'finished': 'unfinished';
      that.dispatchEvent(new CustomEvent('changestep', {'detail': {'targetStep': targetStep, 'targetStepStatus': targetStepStatus}, 'bubbles': true}));
    });
  };

  render() {
    let isDone = false;
    let container = this.container.empty();
    for (let i = 1; i < this.maxStep; i ++)
    {
      if (isDone === false)
      {
        if ('step' + i + 'title' in this.dataset)
        {
          let step = document.createElement('div');
          let jStepNumber = document.createElement('div');
          let tStepNumberSlot = document.createElement('slot');
          let bStepTitle = document.createElement('div');
          let cStepSubTitle = document.createElement('div');
          step.classList.add('step');
          step.setAttribute('step', i);
          jStepNumber.classList.add('number');
          tStepNumberSlot.setAttribute('name', 'number-' + i);
          tStepNumberSlot.innerText = i;
          jStepNumber.append(tStepNumberSlot);
          bStepTitle.classList.add('title');
          bStepTitle.innerText = this.dataset['step' + i + 'title'];
          cStepSubTitle.classList.add('subtitle');
          if ('step' + i + 'subtitle' in this.dataset)
          {
            cStepSubTitle.innerText = this.dataset['step' + i + 'subtitle'];
          };
          step.append(jStepNumber, bStepTitle, cStepSubTitle);
          container.append(step);
        }
        else
        {
          isDone = true;
        };
      };
    };
    this.#changeStep();
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'max-step':
      {
        this.maxStep = newVal;
        break;
      };
      case 'current-step':
      {
        this.currentStep = newVal;
        break;
      };
      case 'clickable':
      {
        this.clickable = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.render();
    this.#initEvents();
  };

  constructor() {
    super();
    this.ready = false;
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    shadowRoot.innerHTML = `<style>@import url('${importCssUrl}');</style><container clickable="none" style="display:none"></container>`;
    this.container = shadowRoot.querySelector('container');
  };
};