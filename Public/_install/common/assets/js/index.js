export default class index {
  #timeoutHandler;

  install() {
    let that = this;
    if (that.inited != true)
    {
      that.inited = true;
      let container = document.querySelector('div.install');
      let formEl = container.querySelector('form.form');
      const gotoStep = step => {
        container.querySelector('div.msg').innerText = '';
        container.querySelectorAll('div.step span').forEach(span => {
          if (span.index() == step)
          {
            span.classList.add('on');
          }
          else
          {
            span.classList.remove('on');
          };
        });
        container.querySelectorAll('div.tab_content div.item').forEach(div => {
          if (div.index() == step)
          {
            div.classList.add('on');
          }
          else
          {
            div.classList.remove('on');
          };
        });
        container.querySelectorAll('div.bottom_bar div.item').forEach(div => {
          if (div.index() == step)
          {
            div.classList.add('on');
          }
          else
          {
            div.classList.remove('on');
          };
        });
      };
      container.delegateEventListener('form.form', 'submitend', e => {
        let res = e.detail.res;
        let self = e.currentTarget;
        if (res.ok)
        {
          res.json().then(data => {
            if (data.code == 1)
            {
              nap(6000).then(() => {
                location.href = data.redirect_url;
              });
            }
            else
            {
              gotoStep([4001, 4002, 4003, 4031, 4041].includes(data.code)? 2: 3);
              self.querySelector('button.step-3-done').classList.remove('locked');
              that.#timeoutHandler = setTimeout(() => {
                self.querySelector('div.msg').innerText = '';
              }, 5000);
            };
            self.querySelector('div.msg').innerText = data.message;
          });
        };
      });
      container.delegateEventListener('input.agree', 'change', function(e){
        let self = e.currentTarget;
        if (this.checked)
        {
          self.querySelector('button.step-1-next').classList.remove('hide');
        }
        else
        {
          self.querySelector('button.step-1-next').classList.add('hide');
        };
      });
      container.delegateEventListener('button.step-1-next', 'click', function(){ gotoStep(2); });
      container.delegateEventListener('button.step-2-prev', 'click', function(){ gotoStep(1); });
      container.delegateEventListener('button.step-2-next', 'click', function(){ gotoStep(3); });
      container.delegateEventListener('button.step-3-prev', 'click', function(){ gotoStep(2); });
      container.delegateEventListener('button.step-3-done', 'click', function(e){
        let self = e.currentTarget;
        if (!this.classList.contains('locked'))
        {
          formEl.submit();
          this.classList.add('locked');
          clearTimeout(that.#timeoutHandler);
          this.parentElement.parentElement.classList.remove('on');
          self.querySelector('div.msg').innerText = this.getAttribute('loading');
        };
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
  };
};