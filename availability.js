"use strict";


// Constants
// ===============================================

var MONTH = 2628000000 // as seconds
var BASE_URL = global.__availability_base_url || 'https://my.cushionapp.com'
var AVAILABLE = 'available'
var UNAVAILABLE = 'unavailable'
var SOON = 'soon'
var PRIVATE = 'private'



// Availability object
// ===============================================

var Availability = function () {
  this.user = {}
  this.date = null
  this.hours = 0
  this.availability = UNAVAILABLE
}

Availability.prototype.isAvailable = function () { return AVAILABLE === this.availability }
Availability.prototype.isUnavailable = function () { return UNAVAILABLE === this.availability }
Availability.prototype.isSoon = function () { return SOON === this.availability }
Availability.prototype.isPrivate = function () { return PRIVATE === this.availability }

Availability.prototype.monthShort = function () {
  if (!this.date) return
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
  if (!this.date) return
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

Availability.prototype.referralUrl = function () {
  if (this.user && this.user.referral_code) {
    return 'http://get.cushionapp.com/' + this.user.referral_code
  }
}



// Main display function
// ===============================================

function display (options) {
  if (!options.user) return console.error('Must specify a user')
  if (!options.render) return console.error('Must specify a render function')

  var availability = new Availability()

  // AJAX Request
  var xhr = new XMLHttpRequest()
  xhr.addEventListener('load', onLoad(availability, options.render))
  xhr.open('GET', BASE_URL + '/api/v1/users/' + options.user + '/availability')
  xhr.send()

  return availability
}

function onLoad (availability, render) {
  return function () {
    switch (this.status) {
    default: return console.error('Cushion API Error', this.status)
    case 404: return console.error('That user ID wasnt found')
    case 401:
      console.error('Enable the Availability Badge: ' + BASE_URL + '/add-ons/availability-badge')
      availability.availability = PRIVATE
      break
    case 200:
      var data = JSON.parse(this.response)
      if (data.user) availability.user = data.user
      if (data.availability) {
        availability.date = parseDate(data.availability.available_on)
        availability.hours = data.availability.hours_per_week
        availability.availability = determineAvailability(availability.date)
      }
      break
    }
    return render.call(availability)
  }
}


// Helpers
// ===============================================

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



// Ribbon display
// ===============================================

function ribbon (options) {
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

  options.render = function () {
    if (href === undefined) href = this.referralUrl()

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    setAttributes(svg,
      ['width', '150px'],
      ['height', '160px'],
      ['style', 'position: absolute; top: 0; right: 0;'],
      ['class', 'availability-ribbon ' + this.availability]
    )

    var defs = createNestedElement(svg, 'defs')
    createNestedElement(defs, 'path',
      ['d', 'M17,0 L150,133 Z'],
      ['id', 'availability_path']
    )
    createNestedElement(defs, 'path',
      ['d', 'M0,17 L183,200 Z'],
      ['id', 'power_path']
    )
    createNestedElement(svg, 'path',
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

  return display(options)
}



// Contextual Badge display
// ===============================================

function badge (options) {
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

  options.render = function () {
    if (href === undefined) href = this.referralUrl()

    var badge = createNestedElement(container, (href ? 'a' : 'span'),
      ['class', 'availability-badge ' + this.availability]
    )

    if (href) {
      badge.href = href
      badge.target = '_blank'
    }
    badge.textContent = relative.call(this)
  }

  return display(options)
}



// Exports
// ===============================================

exports.display = display
exports.badge = badge
exports.ribbon = ribbon

if (typeof window !== 'undefined' && global === window) {
  // If we're running in the browser set up automatically
  document.addEventListener('DOMContentLoaded', function () {
    var el = document.querySelector('script[data-user]')
    if (!el) return
    var user = el.getAttribute('data-user')
    var badgeEl = document.querySelector('[data-availability-badge]')
    if (badgeEl) {
      badge({ user: user, container: badgeEl })
    } else {
      ribbon({ user: user })
    }
  })
}
