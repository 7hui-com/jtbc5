export default class validation {
  static isDate(date) {
    let re = /^(\d{4})\-(\d{2})\-(\d{2})$/;
    return re.test(date);
  };

  static isDateTime(dateTime) {
    let result = false;
    let date = new Date(dateTime);
    let re = /^(\d{4})\-(\d{2})\-(\d{2})\s+(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d$/;
    if (!Number.isNaN(date.getTime()) && re.test(dateTime))
    {
      result = true;
    };
    return result;
  };

  static isDateRange(dateRange) {
    let result = false;
    if (dateRange.includes('~'))
    {
      let dateArr = dateRange.split('~');
      if (dateArr.length == 2)
      {
        let leftDateString = dateArr[0];
        let rightDateString = dateArr[1];
        if (this.isDate(leftDateString) && this.isDate(rightDateString))
        {
          let leftDate = new Date(leftDateString);
          let rightDate = new Date(rightDateString);
          if (leftDate <= rightDate)
          {
            result = true;
          };
        };
      };
    };
    return result;
  };

  static isDateTimeRange(dateTimeRange) {
    let result = false;
    if (dateTimeRange.includes('~'))
    {
      let dateTimeArr = dateTimeRange.split('~');
      if (dateTimeArr.length == 2)
      {
        let leftDateTimeString = dateTimeArr[0];
        let rightDateTimeString = dateTimeArr[1];
        if (this.isDateTime(leftDateTimeString) && this.isDateTime(rightDateTimeString))
        {
          let leftDateTime = new Date(leftDateTimeString);
          let rightDateTime = new Date(rightDateTimeString);
          if (leftDateTime <= rightDateTime)
          {
            result = true;
          };
        };
      };
    };
    return result;
  };

  static isEmail(email) {
    let re = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    return re.test(email);
  };

  static isMobile(mobile) {
    let re = /^1\d{10}$/;
    return re.test(mobile);
  };

  static isName(name) {
    let re = /^[A-Za-z0-9\u0020\u00b7\u4e00-\u9fa5_,.-]+$/u;
    return re.test(name);
  };

  static isNumber(number) {
    let re = /^[0-9]*$/;
    return re.test(number);
  };

  static isNumeric28(numeric28) {
    let result = false;
    if (typeof(numeric28) == 'string')
    {
      if (numeric28.length == 28 && this.isNumber(numeric28))
      {
        result = true;
      };
    };
    return result;
  };

  static isIDCard(IDCard) {
    let result = false;
    let re = /(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    if (re.test(IDCard))
    {
      let checkSum = 0;
      let cardBase = IDCard.substring(0, 17);
      let codeFactor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
      let verifyNumberList = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
      for (let ti = 0; ti < cardBase.length; ti ++)
      {
        checkSum += Number.parseInt(cardBase.substring(ti, ti + 1)) * codeFactor[ti];
      };
      if (IDCard.slice(-1).toUpperCase() === verifyNumberList[checkSum % 11])
      {
        result = true;
      };
    };
    return result;
  };

  static isIPV4(ip) {
    let result = false;
    let ipArr = ip.split('.');
    if (ipArr.length == 4)
    {
      result = true;
      ipArr.forEach(num => {
        if (num.length == 0)
        {
          result = false;
        }
        else
        {
          let current = Number.parseInt(num);
          if (Number.isNaN(current) || current < 0 || current > 255)
          {
            result = false;
          };
        };
      });
    };
    return result;
  };

  static isIPV6(ip) {
    let result = false;
    if (this.isStandardIPv6(ip))
    {
      result = true;
    }
    else if (ip.includes('.') && ip.includes(':'))
    {
      let prefix = ip.substring(0, ip.lastIndexOf(':'));
      let suffix = ip.substring(ip.lastIndexOf(':') + 1);
      if (this.isIPV4(suffix))
      {
        let ipv4Arr = suffix.split('.');
        let p1 = Number.parseInt(ipv4Arr[0]).toString(16);
        let p2 = Number.parseInt(ipv4Arr[1]).toString(16);
        let p3 = Number.parseInt(ipv4Arr[2]).toString(16);
        let p4 = Number.parseInt(ipv4Arr[3]).toString(16);
        if (p2.length === 1)
        {
          p2 = '0' + p2;
        };
        if (p4.length === 1)
        {
          p4 = '0' + p4;
        };
        result = this.isIPV6(prefix + ':' + p1 + p2 + ':' + p3 + p4);
      };
    }
    else if (ip.includes('::'))
    {
      let ipArr = ip.split('::');
      if (ipArr.length === 2)
      {
        let prefix = ipArr[0];
        let suffix = ipArr[1];
        let ipv6Arr = ['0', '0', '0', '0', '0', '0', '0', '0'];
        if (prefix.length != 0)
        {
          let tempArr = prefix.split(':');
          tempArr.forEach((value, key) => ipv6Arr[key] = value);
        };
        if (suffix.length != 0)
        {
          let tempArr = suffix.split(':');
          tempArr.forEach((value, key) => ipv6Arr[ipv6Arr.length - tempArr.length + key] = value);
        };
        result = this.isIPV6(ipv6Arr.join(':'));
      };
    };
    return result;
  };

  static isStandardIPv6(ip) {
    let result = false;
    let ipArr = ip.split(':');
    if (ipArr.length == 8)
    {
      result = true;
      ipArr.forEach(num => {
        if (num.length == 0)
        {
          result = false;
        }
        else
        {
          let current = Number.parseInt(num, 16);
          if (Number.isNaN(current) || current < 0 || current > 65535)
          {
            result = false;
          };
        };
      });
    };
    return result;
  };

  static isTime(time) {
    let re = /^(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d$/;
    return re.test(time);
  };

  static isTimeRange(timeRange) {
    let result = false;
    if (timeRange.includes('~'))
    {
      let timeArr = timeRange.split('~');
      if (timeArr.length == 2)
      {
        let leftTimeString = timeArr[0];
        let rightTimeString = timeArr[1];
        if (this.isTime(leftTimeString) && this.isTime(rightTimeString))
        {
          result = true;
        };
      };
    };
    return result;
  };
};