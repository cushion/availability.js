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

A render function can accept three arguments:

~~~
function (availability, date, hours)
~~~

1. `availability`: A string with a value of `available`, `soon`, `unavailable` or `private`
2. `date`: A date object, or null if the above is `unavailable` or `private`
3. `hours`: A number ≥ 0, representing the number of hours of availability

The function should handle all logic on it's own, but there are some [utility functions](#functions) to deal with dates.

Defining and using your renderer

~~~ javascript
function coolRenderer (availability, date, hours) {
  // Your code
}
new Availability({ user: '$YOUR_USER_ID', renderer: coolRenderer }).render()
~~~


## Functions

##### `Availability.month(date)`

Takes a date object and returns the corresponding month name.

##### `Availability.monthShort(date)`

Takes a date object and returns the corresponding month name shortened to 3–5 characters.

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

##### `new Availability({options})`

Takes an options hash and returns an Availability object.

- `options.user`: The user ID
- `options.renderer`: A [renderer function](#building-a-custom-renderer)

##### `Availability.prototype.render()`

Calls the `renderer` function.

