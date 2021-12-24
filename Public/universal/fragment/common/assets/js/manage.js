export default class manage {
  initAdd() {
    if (this.inited != true)
    {
      let scarf = this.self.parentNode.querySelector('.scarf');
      scarf.delegateEventListener('input[name=mode]', 'change', function(){
        scarf.querySelectorAll('form item[group=value]').forEach(item => {
          if (item.getAttribute('field') == 'value_' + this.value)
          {
            item.classList.remove('hide');
          }
          else
          {
            item.classList.add('hide');
          };
        });
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