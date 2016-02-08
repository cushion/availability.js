(function (window, doc) {
  var MINUTE = 60000;
  var HOUR   = MINUTE * 60;
  var DAY    = HOUR * 24;
  var WEEK   = DAY * 7;
  var MONTH  = DAY * 30;
  var YEAR   = DAY * 365;
  var BASE_URL = 'https://my.cushionapp.com';

  window.Availability = function (opts) {
    this.baseUrl = BASE_URL;
    this.renderer = genericRenderer;

    if (opts !== null && typeof opts === 'object') {
      if (opts.user) this.user = opts.user;
      if (opts.renderer) this.renderer = opts.renderer.bind(this);
      if (opts.baseUrl) this.baseUrl = opts.baseUrl;
    } else {
      this.user = opts;
    }

    if (null == this.user) throw('Must specify user');
  }

  Availability.prototype.render = function () {
    this.request();
  }

  Availability.prototype.relativeAvailability = function (date) {
    var diff = date - Date.now();
    if (diff < MONTH) {
      return 'Available';
    } else if (diff < YEAR) {
      return 'Available in ' + this.monthShort(date);
    } else {
      return 'Unavailable';
    }
  }

  Availability.prototype.monthShort = function (date) {
    return this.monthLong(date).slice(0, 3)
  }

  Availability.prototype.monthLong = function (date) {
    switch (date.getMonth()) {
    case 0:  return 'January';
    case 1:  return 'February';
    case 2:  return 'March';
    case 3:  return 'April';
    case 4:  return 'May';
    case 5:  return 'June';
    case 6:  return 'July';
    case 7:  return 'August';
    case 8:  return 'September';
    case 9:  return 'October';
    case 10: return 'November';
    case 11: return 'December';
    }
  }

  Availability.prototype.request = function () {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', onLoad(this.renderer.bind(this)));
    xhr.addEventListener('error', onError);
    xhr.open('GET', this.baseUrl + '/api/v1/users/' + this.user + '/availability');
    xhr.send();
  }

  function genericRenderer (date, hours) {
    var availability = document.createElement('span')
    availability.innerText = this.relativeAvailability(date)
    document.body.appendChild(availability)
  }

  function onLoad (fn) {
    return function () {
      if (this.status !== 200) onError(this.status);
      var data = JSON.parse(this.response);
      var date = new Date(data.availability.available_on);
      var hours = data.availability.hours_per_week;
      fn(date, hours);
    }
  }

  function onError (e) {
    console.log('Error: ', e);
  }

})(window, document);
