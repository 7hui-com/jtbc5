export default class feedback {
  initForm() {
    if (this.inited != true)
    {
      this.inited = true;
      import(this.self.getBasePath() + 'library/field/fieldSerializer.js').then(module => {
        document.querySelectorAll('div.feedback_form').forEach(el => {
          el.delegateEventListener('form.form', 'submit', e => {
            let self = e.target;
            let fieldSerializer = new module.default(self);
            let button = self.querySelector('button.submit');
            if (button != null)
            {
              if (!button.classList.contains('locked'))
              {
                button.classList.add('locked');
                fetch(self.getAttribute('action'), {'method': 'post', 'headers': {'Content-Type': 'application/x-www-form-urlencoded'}, 'body': fieldSerializer.serialize()}).then(res => res.ok? res.json(): {}).then(data => {
                  if (data.code == 1)
                  {
                    self.reset();
                  };
                  button.classList.remove('locked');
                  self.querySelector('div.message').innerText = data.message;
                });
              };
            };
          });
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
  };
};