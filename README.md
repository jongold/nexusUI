# Nexus UI

**Authors:** Ben Taylor, Jesse Allison, Yemin Oh

**Overview:** NexusUI is a JS toolkit for easily designing musical interfaces for mobile apps and web browsers, with emphasis on rapid prototyping and integration with Max/MSP.

**Project Site:** http://nexusosc.com

**License:** NexusUI is licensed as open source software under the terms of the "New BSD License", http://creativecommons.org/licenses/BSD/


### How to Use NexusUI

Download and link to nexusUI.js and jQuery.js in the head of your HTML document

```html
<script src="jquery.js"></script>
<script src="nexusUI.js"></script>
```


Add an HTML5 canvas to your page with a valid nx attribute.

```html
<canvas nx="dial"></canvas>
```

 It will automatically be converted into a touch-compatible dial that outputs OSC. Several server options are included with NexusUI (see Servers folder), or OSC can be used in the browser to control Web Audio.

 Valid Nexus objects include: dial, position, keyboard, button, toggle, slider, multislider, matrix, select, tilt, metroball, pixels, colors, sandbox, joints, comment, message, number, banner, multitouch.

 See [nexusosc.com](http://www.nexusosc.com) for examples and tutorials. 

