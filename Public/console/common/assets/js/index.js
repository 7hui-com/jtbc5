export default class index {
  login() {
    if (this.locked != true)
    {
      this.locked = true;
      this.root.loadFragment(this.self.getAttribute('login')).then(() => {
        this.locked = false;
      });
    };
  };

  dashboard() {
    if (this.locked != true)
    {
      this.locked = true;
      this.root.loadFragment(this.self.getAttribute('dashboard')).then(() => {
        this.locked = false;
      });
    };
  };

  index() {
    if (this.locked != true)
    {
      this.locked = true;
      fetch(this.self.getAttribute('checkLogin')).then(res => res.ok? res.json(): {}).then(data => {
        this.locked = false;
        if (data.code != 1)
        {
          this.login();
        }
        else
        {
          this.dashboard();
        };
      });
    };
  };

  constructor(self) {
    this.self = self;
    this.locked = false;
    this.root = document.getElementById('root');
    this.index();
  };
};