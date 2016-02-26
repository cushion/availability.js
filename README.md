# Availability.js
Availability badge with data from [cushionapp.com](http://cushionapp.com)

## Basic Usage

#### Simple Ribbon

![](https://raw.githubusercontent.com/cushion/availability.js/master/examples/ribbon.gif)

Include the following in your html, and replace your user ID in the `data-user` attribute on the script tag.

~~~ html
<link href="availability.css" rel="stylesheet">
<script src="availability.js" data-user="$YOUR_USER_ID"></script>
~~~

#### Contextual Badge

![](https://raw.githubusercontent.com/cushion/availability.js/master/examples/badge.gif)

Same as the ribbon above, but add an `data-availability-badge` attribute where you want the badge displayed.

~~~ html
<link href="availability.css" rel="stylesheet">
<script src="availability.js" data-user="$YOUR_USER_ID"></script>

<p>I'm currently <span data-availability-badge></span>.</p>
~~~

## Building a custom renderer

It's possible to change the appearance of the badge and the ribbon using CSS but if that's too limiting you can define your own render function to assemble custom HTML, draw with canvas, or even play a silly video.

Within the renderer function `this` is bound to an [`Availabilty` object](#availability-object). The function should handle all logic on it's own, and no return value is required. Here's an example of a simple gif renderer:

~~~ javascript
function gifRenderer () {
  var img = document.querySelector('.image')
  if (this.isAvailable())   img.src = 'http://i.giphy.com/urhcoANPxB3K8.gif'
  if (this.isUnavailable()) img.src = 'http://i.giphy.com/O4caHIyGGVTW.gif'
  if (this.isSoon())        img.src = 'http://i.giphy.com/ErLimaUL0blbW.gif'
}
Availability.display({ user: '$YOUR_USER_ID', renderer: gifRenderer })
~~~

![](https://raw.githubusercontent.com/cushion/availability.js/master/examples/giphy.gif)


## Availability object

An Availability object is bound to `this` within a renderer function, and has the following attributes:

1. `this.availability`: A string with a value of `available`, `soon`, `unavailable` or `private`
2. `this.date`: A date object, or null if the above is `unavailable` or `private`
3. `this.hours`: A number ≥ 0, representing the number of hours of availability
4. `this.user`: Basic user info, including `nickname`, `color`, and `referral_code`

There are also some helper functions:

##### `this.month()`

Returns the month name of `this.date`.

##### `this.monthShort()`

Returns the month name of `this.date` shortened to 3–5 characters.

##### `this.isAvailable()`

##### `this.isUnvailable()`

##### `this.isSoon()`

##### `this.isPrivate()`

##### `this.referralUrl()`

Returns users referral link.



## Renderers

##### `Availability.badge({options})`

Takes an options hash, and display's a badge.

- `options.user`: A user ID
- `options.container`: An element to appended the badge too
- `options.href`: Optional, if set the badge will link to this url, defaults to your referral url (to unset use `null`)


##### `Availability.ribbon({options})`

Takes an options hash, and display's a ribbon.

- `options.user`: The user ID
- `options.container`: Optional, an element to appended the ribbon too, `document.body` by default
- `options.href`: Optional, if set the badge will link to this url, defaults to your referral url (to unset use `null`)


##### `Availability.display({options})`

Takes an options hash and runs the given `renderer`.

- `options.user`: The user ID
- `options.renderer`: A [renderer function](#building-a-custom-renderer)
