;(function () {
  "use strict";

  var MINUTE = 60000
  var HOUR = MINUTE * 60
  var DAY = HOUR * 24
  var MONTH = DAY * 30
  var BASE_URL = window.__availability_base_url || 'https://my.cushionapp.com'
  var AVAILABLE = 'available'
  var UNAVAILABLE = 'unavailable'
  var SOON = 'soon'
  var PRIVATE = 'private'

  var  Availability = function (opts) {
    if (opts !== null && typeof opts === 'object') {
      this.user = opts.user
      this.renderer = opts.renderer.bind(this)
    }
    this.date = null
    this.hours = 0
    this.availability = UNAVAILABLE
  }

  Availability.prototype.render = function () {
    if (!this.user) return console.error('Must set a user')
    if (!this.renderer) return console.error('Must set a renderer')

    var xhr = new XMLHttpRequest()
    xhr.addEventListener('load', onLoad(this))
    xhr.open('GET', BASE_URL + '/api/v1/users/' + this.user + '/availability')
    xhr.send()
  }

  Availability.prototype.isAvailable = function () { return AVAILABLE === this.availability }
  Availability.prototype.isUnavailable = function () { return UNAVAILABLE === this.availability }
  Availability.prototype.isSoon = function () { return SOON === this.availability }
  Availability.prototype.isPrivate = function () { return PRIVATE === this.availability }

  Availability.prototype.monthShort = function () {
    switch (this.date.getMonth()) {
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

  Availability.prototype.month = function () {
    switch (this.date.getMonth()) {
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

  function parseDate (date) {
    date = date.split('-')

    var year = parseInt(date[0])
    var month = parseInt(date[1]) - 1
    var day = parseInt(date[2])

    return new Date(year, month, day)
  }

  function determineAvailability (date) {
    var diff = date - Date.now()
    if (date && diff < MONTH) return AVAILABLE
    if (date && diff < (10 * MONTH)) return SOON
    return UNAVAILABLE
  }

  function onLoad (context) {
    return function () {
      switch (this.status) {
      default: return console.error('Cushion API Error', this.status)
      case 404: return console.error('That user ID wasnt found')
      case 401:
        console.error('Change the Availabilty badge setting to `public`: ' + BASE_URL + '/preferences#availability')
        context.availability = PRIVATE
        break
      case 200:
        var data = JSON.parse(this.response)
        if (data.availability) {
          context.date = parseDate(data.availability.available_on)
          context.hours = data.availability.hours_per_week
          context.availability = determineAvailability(context.date)
        }
        break
      }
      return context.renderer()
    }
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



  // Ribbon renderer
  Availability.ribbon = function (options) {
    var container = options.container || document.body
    var href = options.href

    function relative () {
      switch (this.availability) {
      case AVAILABLE: return 'Available'
      case SOON: return 'Available in ' + this.monthShort()
      case UNAVAILABLE: return 'Not Available'
      case PRIVATE: return 'Error'
      }
    }

    options.renderer = function renderer () {
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      setAttributes(svg,
        ['width', '150px'],
        ['height', '160px'],
        ['style', 'position: absolute; top: 0; right: 0;'],
        ['class', 'availability-ribbon ' + this.availability]
      )

      var defs = createNestedElement(svg, 'defs')
      var availabilityPath = createNestedElement(defs, 'path',
        ['d', 'M17,0 L150,133 Z'],
        ['id', 'availability_path']
      )
      var powerPath = createNestedElement(defs, 'path',
        ['d', 'M0,17 L183,200 Z'],
        ['id', 'power_path']
      )

      var banner = createNestedElement(svg, 'path',
        ['d', 'M0,0 L50,0 L150,100 L150,150 L0,0 Z'],
        ['class', 'availability-ribbon__banner']
      )

      var availabilityText = createNestedElement(svg, 'text',
        ['font-size', 16],
        ['text-anchor', 'middle'],
        ['class', 'availability-ribbon__text'],
        ['x', 96]
      )
      var availabilityTextPath = createNestedElement(availabilityText, 'textPath',
        ['http://www.w3.org/1999/xlink', 'xlink:href', '#availability_path']
      )
      availabilityTextPath.textContent = relative.call(this)

      var powerText = createNestedElement(svg, 'text',
        ['font-size', 12],
        ['text-anchor', 'right'],
        ['class', 'availability-ribbon__power'],
        ['x', 90]
      )
      var powerTextPath = createNestedElement(powerText, 'textPath',
        ['http://www.w3.org/1999/xlink', 'xlink:href', '#power_path']
      )
      powerTextPath.textContent = 'powered by Cushion'

      if (href) {
        var a = createNestedElement(container, 'a', ['href', href], ['target', '_blank'])
        a.appendChild(svg)
      } else {
        container.appendChild(svg)
      }
    }

    new Availability(options).render()
  }



  // Badge renderer
  Availability.badge = function (options) {
    var container = options.container
    var href = options.href

    function relative () {
      switch (this.availability) {
      case AVAILABLE: return 'available'
      case SOON: return 'booked until ' + this.month()
      case UNAVAILABLE: return 'unavailable'
      case PRIVATE: return 'error'
      }
    }

    options.renderer = function renderer () {
      var badge = createNestedElement(container, (href ? 'a' : 'span'),
        ['class', 'availability-badge ' + this.availability]
      )
      if (href) {
        badge.href = href
        badge.target = '_blank'
      }
      badge.innerText = relative.call(this)
    }

    new Availability(options).render()
  }



  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Availability
  } else {
    window.Availability = Availability
    window.onload = function () {
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
  }
})();
