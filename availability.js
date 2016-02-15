;(function () {
  "use strict";

  var MINUTE = 60000
  var HOUR = MINUTE * 60
  var DAY = HOUR * 24
  var WEEK = DAY * 7
  var MONTH = DAY * 30
  var YEAR = DAY * 365
  var BASE_URL = window.__availability_base_url || 'https://my.cushionapp.com'
  var AVAILABLE = 'available'
  var UNAVAILABLE = 'unavailable'
  var SOON = 'soon'

  var  Availability = function (opts) {
    this.baseUrl = BASE_URL
    this.renderer = function noop () {}

    if (opts !== null && typeof opts === 'object') {
      if (opts.user) this.user = opts.user
      if (opts.renderer) this.renderer = opts.renderer
      if (opts.baseUrl) this.baseUrl = opts.baseUrl
    } else {
      this.user = opts
    }

    if (!this.user) console.error('Must specify a user')
  }

  Availability.prototype.render = function () {
    var xhr = new XMLHttpRequest()
    xhr.addEventListener('load', onLoad(this.renderer.bind(this)))
    xhr.open('GET', this.baseUrl + '/api/v1/users/' + this.user + '/availability')
    xhr.send()
  }

  function parseDate (date) {
    date = date.split('-')

    var year = parseInt(date[0])
    var month = parseInt(date[1]) - 1
    var day = parseInt(date[2])

    return new Date(year, month, day)
  }

  function onLoad (fn) {
    return function () {
      if (this.status !== 200) return console.error('Could not load users availability.', this.status)

      var data = JSON.parse(this.response)

      if (null === data.availability) return fn(UNAVAILABLE, null, 0)

      var date = parseDate(data.availability.available_on)
      var hours = data.availability.hours_per_week
      var availability = Availability.utils.availability(date)

      return fn(availability, date, hours)
    }
  }

  Availability.utils = {}

  Availability.utils.availability = function (date) {
    var diff = date - Date.now()
    if (date && diff < MONTH) return AVAILABLE
    if (date && diff < YEAR) return SOON
    return UNAVAILABLE
  }

  Availability.utils.monthAbbr = function (date) {
    switch (date.getMonth()) {
    case 0:  return 'Jan'
    case 1:  return 'Feb'
    case 2:  return 'March'
    case 3:  return 'April'
    case 4:  return 'May'
    case 5:  return 'June'
    case 6:  return 'July'
    case 7:  return 'Aug'
    case 8:  return 'Sept'
    case 9:  return 'Oct'
    case 10: return 'Nov'
    case 11: return 'Dec'
    }
  }

  Availability.utils.month = function (date) {
    switch (date.getMonth()) {
    case 0:  return 'January'
    case 1:  return 'February'
    case 2:  return 'March'
    case 3:  return 'April'
    case 4:  return 'May'
    case 5:  return 'June'
    case 6:  return 'July'
    case 7:  return 'August'
    case 8:  return 'September'
    case 9:  return 'October'
    case 10: return 'November'
    case 11: return 'December'
    }
  }

  function merge (a, b) {
    var c = {}
    for (var attr in a) { c[attr] = a[attr] }
    for (var attr in b) { c[attr] = b[attr] }
    return c
  }

  function createNestedElement (parent, el) {
    var attrs = Array.prototype.slice.call(arguments, 2)
    var newElement = document.createElementNS(parent.namespaceURI, el)
    parent.appendChild(newElement)
    if (attrs.length > 0) {
      attrs.unshift(newElement)
      setAttributes.apply(this, attrs)
    }
    return newElement
  }

  function setAttributes (el) {
    var attrs = Array.apply(null, arguments).slice(1)
    for (var i = attrs.length - 1; i >= 0; i--) {
      if (attrs[i].length === 3) {
        el.setAttributeNS.apply(el, attrs[i])
      } else {
        el.setAttribute.apply(el, attrs[i])
      }
    }
    return el
  }

  Availability.ribbon = function (options) {
    var container = options.container || document.body

    function relative (availability, date) {
      switch (availability) {
      case AVAILABLE: return 'Available'
      case SOON: return 'Available in ' + Availability.utils.monthAbbr(date)
      case UNAVAILABLE: return 'Not Available'
      }
    }

    function renderer (availability, date) {
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      setAttributes(svg,
        ['width', '150px'],
        ['height', '150px'],
        ['style', 'position: absolute; top: 0; right: 0;'],
        ['class', 'availability-ribbon ' + 'availability--' + availability]
      )

      var defs = createNestedElement(svg, 'defs')
      var path = createNestedElement(defs, 'path',
        ['d', 'M17,0 L150,133 Z'],
        ['id', 'text_path']
      )

      var banner = createNestedElement(svg, 'path',
        ['d', 'M0,0 L50,0 L150,100 L150,150 L0,0 Z'],
        ['class', 'availability-banner']
      )

      var text = createNestedElement(svg, 'text',
        ['font-size', 16],
        ['text-anchor', 'middle'],
        ['class', 'availability-text'],
        ['x', 96]
      )

      var textPath = createNestedElement(text, 'textPath',
        ['http://www.w3.org/1999/xlink', 'xlink:href', '#text_path']
      )
      textPath.textContent = relative(availability, date)

      container.appendChild(svg)
    }

    new Availability(merge(options, { renderer: renderer })).render()
  }

  Availability.badge = function (options) {
    var container = options.container

    function relative (availability, date) {
      switch (availability) {
      case AVAILABLE: return 'available'
      case SOON: return 'booked until ' + Availability.utils.month(date)
      case UNAVAILABLE: return 'unavailable'
      }
    }

    function renderer (availability, date) {
      var badge = createNestedElement(container, 'span',
        ['class', 'availability-badge ' + 'availability--' + availability]
      )
      badge.innerText = relative(availability, date)
    }

    new Availability(merge(options, { renderer: renderer })).render()
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Availability
  } else {
    window.Availability = Availability
    var el = document.querySelector('script[data-user]')
    if (!el) return
    var user = el.getAttribute('data-user')
    var badge = document.querySelector('[data-availability-badge]')
    if (badge) {
      Availability.badge({ user: user, container: badge })
    } else {
      Availability.ribbon({ user: user })
    }
  }
})();
