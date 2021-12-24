export default class jtbcFieldCityPicker2 extends HTMLElement {
  static get observedAttributes() {
    return ['separator', 'value', 'disabled'];
  };

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    let result = '';
    let container = this.container;
    let provinceEl = container.querySelector('select.province');
    let cityEl = container.querySelector('select.city');
    if (provinceEl != null && cityEl != null)
    {
      if (provinceEl.value != '' && cityEl.value != '')
      {
        result = provinceEl.value + this.currentSeparator + cityEl.value;
      };
    };
    return result;
  };

  get disabled() {
    return this.currentDisabled;
  };

  get province() {
    let result = null;
    let currentValue = this.currentValue;
    if (currentValue.trim() != '')
    {
      if (this.currentSeparator != '')
      {
        result = currentValue.substring(0, currentValue.indexOf(this.currentSeparator));
      }
      else
      {
        Object.keys(this.officialData).forEach(item => {
          if (currentValue.indexOf(item) == 0)
          {
            result = item;
          };
        });
      };
    };
    return result;
  };

  get city() {
    let result = null;
    let currentProvince = this.province;
    let currentValue = this.currentValue;
    if (currentProvince != null)
    {
      if (this.currentSeparator != '')
      {
        result = currentValue.substring(currentValue.indexOf(this.currentSeparator) + this.currentSeparator.length);
      }
      else
      {
        result = currentValue.substring(currentProvince.length);
      };
    };
    return result;
  };

  set value(value) {
    this.currentValue = value;
    this.resetOptions();
  };

  set disabled(disabled) {
    if (disabled == true)
    {
      this.container.classList.add('disabled');
    }
    else
    {
      this.container.classList.remove('disabled');
    };
    this.currentDisabled = disabled;
  };

  initEvents() {
    let that = this;
    let container = this.container;
    container.delegateEventListener('select.province', 'change', function(){
      that.resetCityOptions(this.value);
    });
  };

  resetOptions() {
    let container = this.container;
    let provinceEl = container.querySelector('select.province');
    let province = document.createElement('select');
    province.classList.add('province');
    province.options.add(new Option(this.textProvince, ''));
    Object.keys(this.officialData).forEach(item => {
      if (this.province != item)
      {
        province.options.add(new Option(item, item));
      }
      else
      {
        province.options.add(new Option(item, item, false, true));
      };
    });
    if (provinceEl != null)
    {
      provinceEl.replaceWith(province);
    }
    else
    {
      container.insertBefore(province, container.querySelector('span.box'));
    };
    this.resetCityOptions(this.province);
  };

  resetCityOptions(province) {
    let container = this.container;
    let cityEl = container.querySelector('select.city');
    let city = document.createElement('select');
    city.classList.add('city');
    city.options.add(new Option(this.textCity, ''));
    if (Object.keys(this.officialData).includes(province))
    {
      this.officialData[province].forEach(item => {
        if (this.province == province && this.city == item)
        {
          city.options.add(new Option(item, item, false, true));
        }
        else
        {
          city.options.add(new Option(item, item));
        };
      });
    };
    if (cityEl != null)
    {
      cityEl.replaceWith(city);
    }
    else
    {
      container.insertBefore(city, container.querySelector('span.box'));
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    let container = this.container;
    let input = container.querySelector('input.date');
    switch(attr) {
      case 'separator':
      {
        this.currentSeparator = newVal;
        this.resetOptions();
        break;
      }
      case 'value':
      {
        this.value = newVal;
        break;
      };
      case 'disabled':
      {
        this.disabled = this.hasAttribute('disabled')? true: false;
        break;
      };
    };
  };

  connectedCallback() {
    this.resetOptions();
    this.ready = true;
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.substring(0, import.meta.url.lastIndexOf('.')) + '.css';
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none"><span class="box"></span><div class="mask"></div></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
    this.currentValue = '';
    this.currentSeparator = '';
    this.currentDisabled = false;
    this.textProvince = '=省=';
    this.textCity = '=市/区=';
    this.officialData = {'北京市':['东城区','西城区','朝阳区','丰台区','石景山区','海淀区','门头沟区','房山区','通州区','顺义区','昌平区','大兴区','怀柔区','平谷区','密云区','延庆区'],'天津市':['和平区','河东区','河西区','南开区','河北区','红桥区','东丽区','西青区','津南区','北辰区','武清区','宝坻区','滨海新区','宁河区','静海区','蓟州区'],'河北省':['石家庄市','唐山市','秦皇岛市','邯郸市','邢台市','保定市','张家口市','承德市','沧州市','廊坊市','衡水市'],'山西省':['太原市','大同市','阳泉市','长治市','晋城市','朔州市','晋中市','运城市','忻州市','临汾市','吕梁市'],'内蒙古自治区':['呼和浩特市','包头市','乌海市','赤峰市','通辽市','鄂尔多斯市','呼伦贝尔市','巴彦淖尔市','乌兰察布市','兴安盟','锡林郭勒盟','阿拉善盟'],'辽宁省':['沈阳市','大连市','鞍山市','抚顺市','本溪市','丹东市','锦州市','营口市','阜新市','辽阳市','盘锦市','铁岭市','朝阳市','葫芦岛市'],'吉林省':['长春市','吉林市','四平市','辽源市','通化市','白山市','松原市','白城市','延边朝鲜族自治州'],'黑龙江省':['哈尔滨市','齐齐哈尔市','鸡西市','鹤岗市','双鸭山市','大庆市','伊春市','佳木斯市','七台河市','牡丹江市','黑河市','绥化市','大兴安岭地区'],'上海市':['黄浦区','徐汇区','长宁区','静安区','普陀区','虹口区','杨浦区','闵行区','宝山区','嘉定区','浦东新区','金山区','松江区','青浦区','奉贤区','崇明区'],'江苏省':['南京市','无锡市','徐州市','常州市','苏州市','南通市','连云港市','淮安市','盐城市','扬州市','镇江市','泰州市','宿迁市'],'浙江省':['杭州市','宁波市','温州市','嘉兴市','湖州市','绍兴市','金华市','衢州市','舟山市','台州市','丽水市'],'安徽省':['合肥市','芜湖市','蚌埠市','淮南市','马鞍山市','淮北市','铜陵市','安庆市','黄山市','滁州市','阜阳市','宿州市','六安市','亳州市','池州市','宣城市'],'福建省':['福州市','厦门市','莆田市','三明市','泉州市','漳州市','南平市','龙岩市','宁德市'],'江西省':['南昌市','景德镇市','萍乡市','九江市','新余市','鹰潭市','赣州市','吉安市','宜春市','抚州市','上饶市'],'山东省':['济南市','青岛市','淄博市','枣庄市','东营市','烟台市','潍坊市','济宁市','泰安市','威海市','日照市','临沂市','德州市','聊城市','滨州市','菏泽市'],'河南省':['郑州市','开封市','洛阳市','平顶山市','安阳市','鹤壁市','新乡市','焦作市','濮阳市','许昌市','漯河市','三门峡市','南阳市','商丘市','信阳市','周口市','驻马店市','济源市'],'湖北省':['武汉市','黄石市','十堰市','宜昌市','襄阳市','鄂州市','荆门市','孝感市','荆州市','黄冈市','咸宁市','随州市','恩施土家族苗族自治州','仙桃市','潜江市','天门市','神农架林区'],'湖南省':['长沙市','株洲市','湘潭市','衡阳市','邵阳市','岳阳市','常德市','张家界市','益阳市','郴州市','永州市','怀化市','娄底市','湘西土家族苗族自治州'],'广东省':['广州市','韶关市','深圳市','珠海市','汕头市','佛山市','江门市','湛江市','茂名市','肇庆市','惠州市','梅州市','汕尾市','河源市','阳江市','清远市','东莞市','中山市','潮州市','揭阳市','云浮市'],'广西壮族自治区':['南宁市','柳州市','桂林市','梧州市','北海市','防城港市','钦州市','贵港市','玉林市','百色市','贺州市','河池市','来宾市','崇左市'],'海南省':['海口市','三亚市','三沙市','儋州市','五指山市','琼海市','文昌市','万宁市','东方市','定安县','屯昌县','澄迈县','临高县','白沙黎族自治县','昌江黎族自治县','乐东黎族自治县','陵水黎族自治县','保亭黎族苗族自治县','琼中黎族苗族自治县'],'重庆市':['万州区','涪陵区','渝中区','大渡口区','江北区','沙坪坝区','九龙坡区','南岸区','北碚区','綦江区','大足区','渝北区','巴南区','黔江区','长寿区','江津区','合川区','永川区','南川区','璧山区','铜梁区','潼南区','荣昌区','开州区','梁平区','武隆区','城口县','丰都县','垫江县','忠县','云阳县','奉节县','巫山县','巫溪县','石柱土家族自治县','秀山土家族苗族自治县','酉阳土家族苗族自治县','彭水苗族土家族自治县'],'四川省':['成都市','自贡市','攀枝花市','泸州市','德阳市','绵阳市','广元市','遂宁市','内江市','乐山市','南充市','眉山市','宜宾市','广安市','达州市','雅安市','巴中市','资阳市','阿坝藏族羌族自治州','甘孜藏族自治州','凉山彝族自治州'],'贵州省':['贵阳市','六盘水市','遵义市','安顺市','毕节市','铜仁市','黔西南布依族苗族自治州','黔东南苗族侗族自治州','黔南布依族苗族自治州'],'云南省':['昆明市','曲靖市','玉溪市','保山市','昭通市','丽江市','普洱市','临沧市','楚雄彝族自治州','红河哈尼族彝族自治州','文山壮族苗族自治州','西双版纳傣族自治州','大理白族自治州','德宏傣族景颇族自治州','怒江傈僳族自治州','迪庆藏族自治州'],'西藏自治区':['拉萨市','日喀则市','昌都市','林芝市','山南市','那曲市','阿里地区'],'陕西省':['西安市','铜川市','宝鸡市','咸阳市','渭南市','延安市','汉中市','榆林市','安康市','商洛市'],'甘肃省':['兰州市','嘉峪关市','金昌市','白银市','天水市','武威市','张掖市','平凉市','酒泉市','庆阳市','定西市','陇南市','临夏回族自治州','甘南藏族自治州'],'青海省':['西宁市','海东市','海北藏族自治州','黄南藏族自治州','海南藏族自治州','果洛藏族自治州','玉树藏族自治州','海西蒙古族藏族自治州'],'宁夏回族自治区':['银川市','石嘴山市','吴忠市','固原市','中卫市'],'新疆维吾尔自治区':['乌鲁木齐市','克拉玛依市','吐鲁番市','哈密市','昌吉回族自治州','博尔塔拉蒙古自治州','巴音郭楞蒙古自治州','阿克苏地区','克孜勒苏柯尔克孜自治州','喀什地区','和田地区','伊犁哈萨克自治州','塔城地区','阿勒泰地区','石河子市','阿拉尔市','图木舒克市','五家渠市','北屯市','铁门关市','双河市','可克达拉市','昆玉市','胡杨河市']};
    this.initEvents();
  };
};