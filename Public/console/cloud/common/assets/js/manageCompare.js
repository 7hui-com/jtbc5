export default class manageCompare {
  initCompare() {
    if (this.inited != true)
    {
      this.inited = true;
      let that = this;
      let contentRequestor = null;
      let ppCompareEl = this.self.parentNode.querySelector('.ppCompare');
      let contentMonitor = function(){
        let codeDiffEl = ppCompareEl.querySelector('jtbc-code-diff');
        if (that.dialog.shadowRoot.contains(that.self))
        {
          if (codeDiffEl != null)
          {
            let clientHeight = ppCompareEl.querySelector('div.content').clientHeight;
            if (codeDiffEl.codeMirror != null && codeDiffEl.getAttribute('client-height') != clientHeight)
            {
              codeDiffEl.setHeight((clientHeight - 2) + 'px');
              codeDiffEl.setAttribute('client-height', clientHeight);
            };
          };
          contentRequestor = requestAnimationFrame(contentMonitor);
        }
        else
        {
          cancelAnimationFrame(contentRequestor);
        };
      };
      contentRequestor = requestAnimationFrame(contentMonitor);
      ppCompareEl.delegateEventListener('form.form', 'submitend', e => {
        let formEl = e.target;
        let res = e.detail.res;
        res.json().then(data => {
          if (data.code == 1)
          {
            let opinionName = formEl.getAttribute('opinion_name');
            let selectEl = this.dialog.shadowRoot.querySelector('select[name=' + opinionName + ']');
            if (selectEl != null)
            {
              selectEl.value = '1';
              ppCompareEl.querySelector('button.b3').click();
            };
          }
          else
          {
            this.miniMessage.push(data.message);
          };
        });
      });
    };
  };

  readiedCallback() {
    let init = this.self.getAttribute('init');
    if (Reflect.has(this, init)) Reflect.get(this, init).call(this);
  };

  constructor(self) {
    this.self = self;
    this.inited = false;
    this.root = document.getElementById('root');
    this.main = document.getElementById('main');
    this.master = document.getElementById('master');
    this.dialog = document.getElementById('dialog');
    this.miniMessage = document.getElementById('miniMessage');
  };
};