# Availability.js
Availability badge with data from [cushionapp.com](http://cushionapp.com)

## Basic Usage

#### Simple Ribbon

Include the following in your html, and replace your user ID in the `data-user` attribute on the script tag.

~~~ html
<link href="availability.css" rel="stylesheet">
<script src="availability.js" data-user="$YOUR_USER_ID"></script>
~~~

#### Contextual Badge

Same as the ribbon above, but add an `data-availability-badge` attribute where you want the badge displayed.

~~~ html
<link href="availability.css" rel="stylesheet">
<script src="availability.js" data-user="$YOUR_USER_ID"></script>

<p>I'm currently <span data-availability-badge></span>.</p>
~~~

## Building a custom renderer

It's possible to change the appearance of the badge and the ribbon using CSS but if that's too limiting you can define your own render function to assemble custom HTML, draw with canvas, or even play a silly video.

Within the renderer function `this` is bound to the `Availabilty` object which, in addition to the [utility functions](#functions), will have three attributes set:

1. `this.availability`: A string with a value of `available`, `soon`, `unavailable` or `private`
2. `this.date`: A date object, or null if the above is `unavailable` or `private`
3. `this.hours`: A number ≥ 0, representing the number of hours of availability

The function should handle all logic on it's own, no return value is required. Here's an example of a simple gif renderer:

~~~ javascript
function gifRenderer () {
  var img = document.querySelector('.image')
  if (this.isAvailable())   img.src = 'http://i.giphy.com/urhcoANPxB3K8.gif'
  if (this.isUnavailable()) img.src = 'http://i.giphy.com/O4caHIyGGVTW.gif'
  if (this.isSoon())        img.src = 'http://i.giphy.com/ErLimaUL0blbW.gif'
}
new Availability({ user: '$YOUR_USER_ID', renderer: gifRenderer }).render()
~~~


## Functions


##### `new Availability({options})`

Takes an options hash and returns an Availability object.

- `options.user`: The user ID
- `options.renderer`: A [renderer function](#building-a-custom-renderer)

##### `Availability.prototype.render()`

Calls the [`renderer`](#building-a-custom-renderer) function.

##### `Availability.prototype.month()`

Returns the month name of `this.date`.

##### `Availability.prototype.monthShort()`

Returns the month name of `this.date` shortened to 3–5 characters.

##### `Availability.prototype.isAvailable()`

##### `Availability.prototype.isUnvailable()`

##### `Availability.prototype.isSoon()`

##### `Availability.prototype.isPrivate()`

## Builtin renderers

##### `Availability.badge({options})`

Takes an options hash, and display's a badge.

- `options.user`: A user ID
- `options.container`: An element to appended the badge too
- `options.href`: Optional, if set the badge will link to this url


##### `Availability.ribbon({options})`

Takes an options hash, and display's a ribbon.

- `options.user`: The user ID
- `options.container`: Optional, an element to appended the ribbon too, `document.body` by default
- `options.href`: Optional, if set the badge will link to this url

