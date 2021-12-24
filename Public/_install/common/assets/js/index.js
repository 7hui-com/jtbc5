export default class index {
  install() {
    if (this.inited != true)
    {
      let installEl = document.querySelector('div.install');
      let formEl = installEl.querySelector('form.form');
      const gotoStep = step => {
        installEl.querySelector('div.msg').innerText = '';
        installEl.querySelectorAll('div.step span').forEach(span => {
          if (span.index() == step)
          {
            span.classList.add('on');
          }
          else
          {
            span.classList.remove('on');
          };
        });
        installEl.querySelectorAll('div.tab_content div.item').forEach(div => {
          if (div.index() == step)
          {
            div.classList.add('on');
          }
          else
          {
            div.classList.remove('on');
          };
        });
        installEl.querySelectorAll('div.bottom_bar div.item').forEach(div => {
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
      installEl.delegateEventListener('form.form', 'submitend', e => {
        let res = e.detail.res;
        if (res.ok)
        {
          res.json().then(data => {
            if (data.code == 1)
            {
              setTimeout(function(){
                location.href = data.redirect_url;
              }, 3000);
            }
            else
            {
              gotoStep([4001, 4002, 4003, 4031, 4041].includes(data.code)? 2: 3);
              installEl.querySelector('div.msg').innerText = data.message;
              installEl.querySelector('button.step-3-done').classList.remove('locked');
            };
          });
        };
      });
      installEl.delegateEventListener('input.agree', 'change', function(){
        if (this.checked)
        {
          installEl.querySelector('button.step-1-next').classList.remove('hide');
        }
        else
        {
          installEl.querySelector('button.step-1-next').classList.add('hide');
        };
      });
      installEl.delegateEventListener('button.step-1-next', 'click', function(){ gotoStep(2); });
      installEl.delegateEventListener('button.step-2-prev', 'click', function(){ gotoStep(1); });
      installEl.delegateEventListener('button.step-2-next', 'click', function(){ gotoStep(3); });
      installEl.delegateEventListener('button.step-3-prev', 'click', function(){ gotoStep(2); });
      installEl.delegateEventListener('button.step-3-done', 'click', function(){
        if (!this.classList.contains('locked'))
        {
          formEl.submit();
          this.classList.add('locked');
          this.parentElement.parentElement.classList.remove('on');
          installEl.querySelector('div.msg').innerText = this.getAttribute('loading');
        };
      });
      this.inited = true;
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