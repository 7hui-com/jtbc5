export default class managePopup {
  loadQRCode(el, paymentType) {
    if (!el.classList.contains('locked'))
    {
      el.classList.add('locked');
      let popup = this.self.parentNode.querySelector('.dialogPopup');
      let normalLi = popup.querySelector('li.li-normal');
      fetch(el.getAttribute('url')).then(res => res.ok? res.json(): {}).then(data => {
        if (data.code == 1)
        {
          if (normalLi.classList.contains('hide'))
          {
            normalLi.classList.remove('hide');
            normalLi.parentNode.querySelectorAll('li.li-error').forEach(li => {
              li.classList.add('hide');
            });
          };
          this.uniqueId = data.data.unique_id;
          this.uniqueSign = data.data.unique_sign;
          let qrcodeUrl = data.data.qrcodeurl;
          let price = data.data.price;
          let expireDate = data.data.expire_date;
          let maskBoxEl = popup.querySelector('div.maskBox');
          if (maskBoxEl != null)
          {
            let qrcode = document.createElement('img');
            qrcode.setAttribute('src', qrcodeUrl);
            maskBoxEl.querySelector('div.qrcode').innerHTML = qrcode.outerHTML;
            maskBoxEl.querySelector('b.price').innerText = price;
            maskBoxEl.querySelector('b.expire_date').innerText = expireDate;
            maskBoxEl.classList.add('on');
          };
          this.checkRemotePaymentStatus(paymentType);
        }
        else if (data.code == 4403)
        {
          if (!normalLi.hasAttribute('allwaysshow'))
          {
            normalLi.classList.add('hide');
          };
          normalLi.parentNode.querySelector('li.li-error-' + data.code).classList.remove('hide');
          normalLi.parentNode.querySelector('b.premium_config_path').innerText = data.message;
        }
        else
        {
          this.miniMessage.push(data.message);
        };
        el.classList.remove('locked');
      });
    };
  };

  checkRemotePaymentStatus(paymentType = 'create', uniqueId = null) {
    if (this.dialog.classList.contains('on'))
    {
      let checkUrl = this.self.getAttribute('check_url');
      checkUrl += '&payment_type=' + encodeURIComponent(paymentType);
      checkUrl += '&unique_id=' + encodeURIComponent(this.uniqueId);
      checkUrl += '&unique_sign=' + encodeURIComponent(this.uniqueSign);
      fetch(checkUrl).then(res => res.ok? res.json(): {}).then(data => {
        if (data.code == 1)
        {
          this.dialog.close();
          let topbar = this.root.querySelector('.topbar');
          let cloudService = topbar.querySelector('.cloudservice');
          if (cloudService != null)
          {
            cloudService.dispatchEvent(new CustomEvent('loadurl'));
          };
        }
        else
        {
          if (uniqueId == null || uniqueId == this.uniqueId)
          {
            setTimeout(uniqueId => { this.checkRemotePaymentStatus(paymentType, uniqueId); }, 3000, this.uniqueId);
          };
        };
      });
    };
  };

  initCreate() {
    if (this.inited != true)
    {
      let that = this;
      let popup = this.self.parentNode.querySelector('.dialogPopup');
      popup.delegateEventListener('button.create', 'click', function(){
        that.loadQRCode(this, 'create');
      });
      popup.delegateEventListener('div.maskBox', 'click', e => {
        if (e.target == popup.querySelector('div.maskBox'))
        {
          e.target.classList.remove('on');
        };
      });
      this.inited = true;
    };
  };

  initWelcome() {
    if (this.inited != true)
    {
      let that = this;
      let popup = this.self.parentNode.querySelector('.dialogPopup');
      popup.delegateEventListener('a.renew', 'click', function(){
        that.loadQRCode(this, 'renew');
      });
      popup.delegateEventListener('button.renew', 'click', function(){
        that.loadQRCode(this, 'renew');
      });
      popup.delegateEventListener('button.create', 'click', function(){
        that.loadQRCode(this, 'create');
      });
      popup.delegateEventListener('div.maskBox', 'click', e => {
        if (e.target == popup.querySelector('div.maskBox'))
        {
          e.target.classList.remove('on');
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
    this.uniqueId = null;
    this.uniqueSign = null;
    this.root = document.getElementById('root');
    this.main = document.getElementById('main');
    this.master = document.getElementById('master');
    this.dialog = document.getElementById('dialog');
    this.miniMessage = document.getElementById('miniMessage');
  };
};