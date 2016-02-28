# Availability.js

The Availability Badge allows [Cushion](http://cushionapp.com) users to display their availability on their own website. The badge is tied directly to the availability data in Cushion, so it will automatically update when the user’s status changes.

## Basic Usage

#### Ribbon

![](https://raw.githubusercontent.com/cushion/availability.js/master/examples/ribbon.gif)

Include the following code in your HTML, and replace `$YOUR_USER_ID` with your user ID, which can be found in the [Availability Badge’s add-on page](https://my.cushionapp.com/add-ons/availability-badge).

~~~ html
<link href="//static.cushionapp.com/availability.css" rel="stylesheet">
<script src="//static.cushionapp.com/availability.js" data-user="$YOUR_USER_ID"></script>
~~~

#### Badge

![](https://raw.githubusercontent.com/cushion/availability.js/master/examples/badge.gif)

Include the same code from the ribbon example above, but add an `data-availability-badge` attribute to the element you’d like the badge to be displayed within.

~~~ html
<link href="//static.cushionapp.com/availability.css" rel="stylesheet">
<script src="//static.cushionapp.com/availability.js" data-user="$YOUR_USER_ID"></script>

<p>I'm currently <span data-availability-badge></span>.</p>
~~~

## Customizing the Badge

#### Styling with CSS

The appearance of both the badge and ribbon can be modified using CSS. Simply include your CSS after the code that loads the Availability Badge stylesheet and use [availability.css](availability.css) as a reference for class names:

~~~ css
<style>
  .availability-ribbon__text {
    font-weight: bold;
  }

  .availability-ribbon.unavailable .availability-ribbon__banner {
    fill: red;
  }
</style>
~~~

#### Building a Custom Badge

If CSS is too limiting, you can also define your own function to assemble custom HTML, draw with canvas, or even play a silly video.

To start, only include the Javascript on your page:

~~~ html
<script src="//static.cushionapp.com/availability.js"></script>
~~~

Then, use the `Availabilty.display` function to define your user ID and render function:

~~~ javascript
Availability.display({ user: '$YOUR_USER_ID', render: function() {} })
~~~

Inside the `render` function, `this` is bound to an [`Availabilty` object](#availability-object). The function should handle all logic on its own, and no return value is required.

> **Note:** To make sure everything has loaded before executing your code, place it before the closing `</body>` tag, or within a [`DOMContentLoaded`](https://developer.mozilla.org/en-US/docs/Web/Events/DOMContentLoaded) listener (`$(document).ready` in jQuery).

Here’s an example of a simple GIF badge:

~~~ javascript
function renderGIF () {
  var img = document.querySelector('.image')
  if (this.isAvailable())   img.src = 'http://i.giphy.com/urhcoANPxB3K8.gif'
  if (this.isUnavailable()) img.src = 'http://i.giphy.com/O4caHIyGGVTW.gif'
  if (this.isSoon())        img.src = 'http://i.giphy.com/ErLimaUL0blbW.gif'
}

Availability.display({ user: '$YOUR_USER_ID', render: renderGIF })
~~~

![](https://raw.githubusercontent.com/cushion/availability.js/master/examples/giphy.gif)



## Availability object

The Availability object is bound to `this` within a render function and has the following attributes:

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



## API

##### `Availability.badge({options})`

Takes an options hash and display's a badge.

- `options.user`: A user ID
- `options.container`: An element to appended the badge too
- `options.href`: Optional, if set the badge will link to this url, defaults to your referral url (to unset use `null`)


##### `Availability.ribbon({options})`

Takes an options hash and display's a ribbon.

- `options.user`: A user ID
- `options.container`: Optional, an element to appended the ribbon too, `document.body` by default
- `options.href`: Optional, if set the badge will link to this url, defaults to your referral url (to unset use `null`)


##### `Availability.display({options})`

Takes an options hash and runs the given `render` function.

- `options.user`: A user ID
- `options.render`: A [render function](#building-a-custom-display)


## Troubleshooting

##### My availability isn’t updating

Availability data is heavily cached, so if your availability changes, the badge will reflect the change within an hour.
