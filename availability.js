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
  var PRIVATE = 'private'

  var  Availability = function (opts) {
    if (opts !== null && typeof opts === 'object') {
      this.user = opts.user
      this.renderer = opts.renderer
    }
  }

  Availability.prototype.render = function () {
    if (!this.user) return console.error('Must set a user')
    if (!this.renderer) return console.error('Must set a renderer')

    var xhr = new XMLHttpRequest()
    xhr.addEventListener('load', onLoad(this.renderer))
    xhr.open('GET', BASE_URL + '/api/v1/users/' + this.user + '/availability')
    xhr.send()
  }

  Availability.monthShort = function (date) {
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

  Availability.month = function (date) {
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

  function parseDate (date) {
    date = date.split('-')

    var year = parseInt(date[0])
    var month = parseInt(date[1]) - 1
    var day = parseInt(date[2])

    return new Date(year, month, day)
  }

  function availability (date) {
    var diff = date - Date.now()
    if (date && diff < MONTH) return AVAILABLE
    if (date && diff < YEAR) return SOON
    return UNAVAILABLE
  }

  function onLoad (fn) {
    return function () {
      if (this.status === 401) {
        console.error(
          'Change the Availabilty badge setting to `public`: '
          + BASE_URL + '/preferences#availability'
        )
        return fn(PRIVATE, null, 0)
      }

      if (this.status === 404) return console.error('That user ID wasnt found')
      if (this.status !== 200) return console.error('Cushion API Error', this.status)

      var data = JSON.parse(this.response)

      if (null === data.availability) return fn(UNAVAILABLE, null, 0)

      var date = parseDate(data.availability.available_on)
      var hours = data.availability.hours_per_week
      var avail = availability(date)

      return fn(avail, date, hours)
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

    function relative (availability, date) {
      switch (availability) {
      case AVAILABLE: return 'Available'
      case SOON: return 'Available in ' + Availability.monthShort(date)
      case UNAVAILABLE: return 'Not Available'
      case PRIVATE: return 'Error'
      }
    }

    options.renderer = function renderer (availability, date) {
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      setAttributes(svg,
        ['width', '150px'],
        ['height', '150px'],
        ['style', 'position: absolute; top: 0; right: 0;'],
        ['class', 'availability-ribbon availability--' + availability]
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

    function relative (availability, date) {
      switch (availability) {
      case AVAILABLE: return 'available'
      case SOON: return 'booked until ' + Availability.month(date)
      case UNAVAILABLE: return 'unavailable'
      case PRIVATE: return 'error'
      }
    }

    options.renderer = function renderer (availability, date) {
      var badge = createNestedElement(container, (href ? 'a' : 'span'),
        ['class', 'availability-badge availability--' + availability]
      )
      if (href) {
        badge.href = href
        badge.target = '_blank'
      }
      badge.innerText = relative(availability, date)
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
