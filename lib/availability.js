(function (window, document) {
  var MINUTE = 60000;
  var HOUR = MINUTE * 60;
  var DAY = HOUR * 24;
  var WEEK = DAY * 7;
  var MONTH = DAY * 30;
  var YEAR = DAY * 365;
  var BASE_URL = 'https://my.cushionapp.com';
  var AVAILABLE = 'available';
  var UNAVAILABLE = 'unavailable';
  var SOON = 'soon';

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
    switch (this.availability(date)) {
    case AVAILABLE: return 'Available';
    case SOON: return 'Available in ' + month(date);
    case UNAVAILABLE: return 'Unavailable';
    }
  }

  Availability.prototype.availability = function (date) {
    var diff = date - Date.now();
    if (date && diff < MONTH) return AVAILABLE;
    if (date && diff < YEAR) return SOON;
    return UNAVAILABLE;
  }

  Availability.prototype.request = function () {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', onLoad(this.renderer.bind(this)));
    xhr.addEventListener('error', onError);
    xhr.open('GET', this.baseUrl + '/api/v1/users/' + this.user + '/availability');
    xhr.send();
  }

  function genericRenderer (date, hours) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    setAttributes(svg,
      ['width', '150px'],
      ['height', '150px'],
      ['style', 'position: absolute; top: 0; right: 0;'],
      ['class', 'availability-ribbon ' + 'availability--' + this.availability(date)]
    );

    var defs = createNestedElement(svg, 'defs');
    var path = createNestedElement(defs, 'path',
      ['d', 'M17,0 L150,133 Z'],
      ['id', 'text_path']
    );

    var banner = createNestedElement(svg, 'path',
      ['d', 'M0,0 L50,0 L150,100 L150,150 L0,0 Z'],
      ['class', 'availability-banner']
    );

    var text = createNestedElement(svg, 'text',
      ['font-size', 16],
      ['text-anchor', 'middle'],
      ['class', 'availability-text'],
      ['x', 96]
    );

    var textPath = createNestedElement(text, 'textPath',
      ['http://www.w3.org/1999/xlink', 'xlink:href', '#text_path']
    );
    textPath.textContent = this.relativeAvailability(date);

    var styles
    document.body.appendChild(svg);
  }

  function onLoad (fn) {
    return function () {
      if (this.status !== 200) return onError(this.status);
      var data = JSON.parse(this.response);
      if (null === data.availability) return fn(null, 0);
      var date = new Date(data.availability.available_on);
      var hours = data.availability.hours_per_week;
      return fn(date, hours);
    }
  }

  function onError (e) {
    console.log('Error: ', e);
  }

  function month (date) {
    switch (date.getMonth()) {
    case 0:  return 'Jan';
    case 1:  return 'Feb';
    case 2:  return 'Mar';
    case 3:  return 'Apr';
    case 4:  return 'May';
    case 5:  return 'Jun';
    case 6:  return 'Jul';
    case 7:  return 'Aug';
    case 8:  return 'Sep';
    case 9:  return 'Oct';
    case 10: return 'Nov';
    case 11: return 'Dec';
    }
  }

  function createNestedElement (el, name) {
    var attrs = Array.prototype.slice.call(arguments, 2);
    var newElement = document.createElementNS(el.namespaceURI, name);
    el.appendChild(newElement);

    if (attrs.length > 0) {
      attrs.unshift(newElement);
      setAttributes.apply(this, attrs);
    }

    return newElement;
  }

  function setAttributes (el) {
    var attrs = Array.apply(null, arguments).slice(1);
    for (var i = attrs.length - 1; i >= 0; i--) {
      var attrArgs = attrs[i];
      if (attrArgs.length === 3) {
        el.setAttributeNS.apply(el, attrArgs);
      } else {
        el.setAttribute.apply(el, attrArgs);
      }
    }
    return el;
  }

})(window, document);
