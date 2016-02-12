# availability.js
Availability badge with data from cushionapp.com

### Usage

Basic Ribbon

~~~ html
<link href="css/style.css" rel="stylesheet" />
<script src="availability.js" data-user="$YOUR_USER_ID"></script>
~~~

Contextual Badge

~~~ html
<link href="css/style.css" rel="stylesheet" />
<script src="availability.js"></script>

<p>I'm currently <span class="container"></span>.</p>

<script>
  Availability.badge({
    user: '$YOUR_USER_ID',
    container: document.querySelector('.container')
  })
</script>
~~~

Custom renderer

~~~ html
<script src="availability.js"></script>
<script>
  new Availability({
    user: '$YOUR_USER_ID',
    renderer: function (availability, date, hours) {
      // render stuff
    }
  }).render()
</script>
~~~
