/** 
	@title NexusUI API
	@overview NexusUI is a JS toolkit for easily designing musical interfaces for mobile apps and web browsers, with emphasis on rapid prototyping (nexusDrop) and integration with Max/MSP (nexusUp).
	@author Ben Taylor, Jesse Allison, Yemin Oh
 	@copyright (c) 2014
 	@license MIT
 */ 
 
var somecode;



/** 

	@class nx

	Central nexusUI manager with shared utility functions for all nexusUI objects

*/

var nx = function() {

	
	var manager = this;
	
	// new manager properties
	
	this.nxObjects = new Array();
	this.nxThrottlePeriod = 20;
	this.elemTypeArr = new Array();
	this.aniItems = new Array();
	this.editmode = false;
	this.isErasing = false;
	this.isResizing = false;
	this.showLabels = false;
	this.oscIp = "127.0.0.1";
	canvasgridy = 10;
	canvasgridx = 10;
	this.starttime = new Date().getTime();
	

	/** 
		@method colorize
		@param {which part of ui to change, i.e. "accent" "fill", "border"} [aspect]
		@param {hex or rgb color code} [color]
		Change the color of all nexus objects, by aspect ([fill, accent, border, accentborder]
		
		```js
		nx.colorize("border", "#000000")
		```

	**/

	this.colorize = function(aspect, newCol) {
		
		if (!newCol) {
			// just sending in a color value colorizes the accent
			newCol = aspect;
			aspect = "accent";
		}
		
		eval("manager.colors."+aspect+" = '"+newCol+"';");
		
		for (i=0;i<this.nxObjects.length;i++) {
			eval("this.nxObjects[i].colors."+aspect+" = '"+newCol+"';");
			this.nxObjects[i].draw();
		}
	}
	
	this.addNxObject = function(newObj) {
		this.nxObjects.push(newObj);
	}
	
	this.setNxThrottlePeriod = function(newThrottle) {
		manager.nxThrottlePeriod = newThrottle;
		for (i=0;i<manager.nxObjects.length;i++) {
			manager.nxObjects[i].nxThrottlePeriod = manager.nxThrottlePeriod;
		}
	}
	
	
	/* old manager properties and methods */

	this.is_touch_device = ('ontouchstart' in document.documentElement)?true:false;

	this.canvasOffset = function(left, top) {
		this.left = left;
		this.top = top;
	}

	this.findPosition = function(element) {
	    var body = document.body,
	        win = document.defaultView,
	        docElem = document.documentElement,
	        box = document.createElement('div');
	    box.style.paddingLeft = box.style.width = "1px";
	    body.appendChild(box);
	    var isBoxModel = box.offsetWidth == 2;
	    body.removeChild(box);
	    box = element.getBoundingClientRect();
	    var clientTop  = docElem.clientTop  || body.clientTop  || 0,
	        clientLeft = docElem.clientLeft || body.clientLeft || 0,
	        scrollTop  = win.pageYOffset || isBoxModel && docElem.scrollTop  || body.scrollTop,
	        scrollLeft = win.pageXOffset || isBoxModel && docElem.scrollLeft || body.scrollLeft;
	    return {
	        top : box.top  + scrollTop  - clientTop,
	        left: box.left + scrollLeft - clientLeft
	  	};
	}

	// *******************
	//	nxTransmit
	// *******************
		
	// Transmit code that sends ui data to various destinations set by the transmissionProtocol variable
	// TODO: why does this work and not self unless self is passed in???  
	
		// Set Transmission Protocol for all nx objects
	this.setTransmissionProtocol = function (setting) {
		for (i=0;i<this.nxObjects.length;i++) {
			this.nxObjects[i].transmissionProtocol = setting;
		}	
	}

	this.sendsTo = function (setting) {
		for (i=0;i<this.nxObjects.length;i++) {
			this.nxObjects[i].transmissionProtocol = setting;
		}	
	}
	
		// Set Transmist Command for all nx objects
	this.setTransmitCommand = function (setting) {
		for (i=0;i<this.nxObjects.length;i++) {
			this.nxObjects[i].transmitCommand = setting;
		}	
	}

	this.setAjaxPath = function (setting) {
		for (i=0;i<this.nxObjects.length;i++) {
			this.nxObjects[i].transmitCommand = setting;
		}	
	}

	this.logOSC = false

	this.printOSC = function() {
		$("body").append('<div style="background-color:#eee;padding:10px;margin-top:20px;font-family:courier;font-size:12pt">OSC Output <input type="button" value="View Code for this UI" onclick=\'window.open("view-source:" + window.location.href)\' style="font-size:12pt;float:right"></input></div>')
		$("body").append('<div id="debug" style="padding:10px;clear:both;height:630px;font-size:15pt;background-color:#ddd;color:#777;overflow:hidden;font-family:courier"></div>')
		self.logOSC = true;



	}
	
	this.nxTransmit = function (data) {

		if (self.logOSC) {
			if (Array.isArray(data)) {
				data = data.join();
				data = data.replace(/\,/g," ");
			}
			if ((typeof data == "object") && (data !== null)) {
				for (var key in data) {
					if ((typeof data[key] == "object") && (data[key] !== null)) {
						for (var key2 in data[key]) {
							$("#debug").prepend(this.oscName+"/"+key+"/"+key2+" "+data[key][key2]+"<br>");
						}
					} else {
						$("#debug").prepend(this.oscName+"/"+key+" "+data[key]+"<br>");
					}
				}
			} else if (typeof data == "number" || typeof data == "string") {
				$("#debug").prepend(this.oscName+" "+data+"<br>");
			}
		}	


		
		if (this.transmissionProtocol == "none") {
			
		} else if (this.transmissionProtocol == "node") {


			if ((typeof data == "object") && (data !== null)) {
				for (var key in data) {

					var nodemsg = {}
					nodemsg['oscName'] = this.oscName+"/"+key;
					nodemsg['value'] = data[key]

		    		socket.emit('nx', nodemsg)

				}
			} else if (typeof data == "number" || typeof data == "string") {
				var nodemsg = {}
				nodemsg['oscName'] = this.oscName;
				nodemsg['value'] = data

		    	socket.emit('nx', nodemsg);
			}

			

			var vismsg = {
				'phone': thisUser.name,
				'oscName': this.oscName,
				'data': data
			}

			socket.emit('orcvis', vismsg);
			
		} else if (this.transmissionProtocol == "ajax") {
			// transmitCommand is the ajax url to send to, oscName is the osc call, uiIndex is used if you have multiple buttons/dials/etc, data is data
			//   If you want to have a callback function to respond to the method, you could send that as a final parameter.
			// console.log("nxTransmit: ", this.transmitCommand, this.oscName, this.uiIndex, data);
			

			if ((typeof data == "object") && (data !== null)) {
				for (var key in data) {
					if ((typeof data[key] == "object") && (data[key] !== null)) {
						for (var key2 in data[key]) {
							this.ajaxTransmit(this.transmitCommand, this.oscName+"/"+key+"/"+key2, this.uiIndex, data[key][key2], manager.oscIp);
						}
					} else {
						this.ajaxTransmit(this.transmitCommand, this.oscName+"/"+key, this.uiIndex, data[key], manager.oscIp);
					}
				}
			} else if (typeof data == "number" || typeof data == "string") {
				this.ajaxTransmit(this.transmitCommand, this.oscName, this.uiIndex, data, manager.oscIp);
			}

			
		//	console.log("transmitCommand="+this.transmitCommand+" oscName="+this.oscName+" uiIndex="+this.uiIndex+" data="+data);
		} else if (this.transmissionProtocol == "ios") {
			//window.alert(data);
			this.iosTransmit(this.transmitCommand, this.oscName, this.uiIndex, data);
			// nexus://hipno/data/1:x:2:y
			// window.location.href = send_data;
			// window.location.replace('nexus://hi');
			//window.location = 'nexus://this/is/goofy';
			//document.location = 'http://google.com';
		} else if (this.transmissionProtocol == "android") {
			
		} else if (this.transmissionProtocol == "local" || this.transmissionProtocol == "js" ) {
				// sender, receiver, parameter, data //
			this.localTransmit(data);
			this.response(data);
		}
		
	}

	this.allTraffic = function(obj, data) {


	}
	
		// globalLocalTransmit (and localTransmit) is the function to send data to other js objects. 
		//   it requires a localObjectFrom, localObject, localParameter and data
	this.globalLocalTransmit = function (localObjectFrom, localObject, localParameter, data) {
		// console.log("Global " + localObjectFrom + " to " + localObject, localParameter, data);
		//eval(localObject + "."+ localParameter + "=" + data);
	}
	
	/*
		TODO Update to be globalAjaxTransmit which can be overwritten on an object by object basis.
				Follow globalLocalTransmit as an example
	*/
	
	// ajaxTransmit is the function to send info back to the server. 
	// it requires a command and an osc_name (by default it is the name of the canvas id) and data
	this.ajaxTransmit = function (ajaxCommand, oscName, uiIndex, data, oscIp, callbackFunction) {
		if (this.ajaxRequestType == "post") {
			//console.log(oscIp);
			if (uiIndex) {
				$.post(ajaxCommand, {oscName: oscName, oscIp: oscIp, id: uiIndex, data: data});
			} else {
				$.post(ajaxCommand, {oscName: oscName, oscIp: oscIp, data: data});
			}
		} else if (this.ajaxRequestType == "get") {
			if (uiIndex) {
				$.ajax(ajaxCommand, {oscName: oscName, id: uiIndex, data: data});
			} else {
				$.ajax(ajaxCommand, {oscName: oscName, data: data});
			}
		}
	}
	
	//iosTransmit is the function to send osc commands as urls to be captured by the browser.
	this.iosTransmit = function (command, osc_name, id, data) {
		console.log(data)
		if ((typeof data == "object") && (data !== null)) {
			for (var key in data) {
				if ((typeof data[key] == "object") && (data[key] !== null)) {
					for (var key2 in data[key]) {
						var osc_message = "nexus://default?" + this.oscName+"/"+key+"/"+key2 + "=" + data[key][key2];
						window.location.href = osc_message;
					}
				} else {
					var osc_message = "nexus://default?" + this.oscName+"/"+key + "=" + data[key];
					window.location.href = osc_message;
				}
			}
		} else if (typeof data == "number" || typeof data == "string") {
			var osc_message = "nexus://default?" + this.oscName + "=" + data;
			window.location.href = osc_message;
		}
	}
	
	//androidTransmit is the function to send osc commands as urls to be captured by the browser.
	this.androidTransmit = function (command, osc_name, id, data) {
		
	}
	
	
	
	//event listeners
	this.getHandlers = function(self) {
		if (manager.is_touch_device) {
			 self.canvas.ontouchstart = self.preTouch;
			 self.canvas.ontouchmove = self.nxThrottle(self.preTouchMove, self.nxThrottlePeriod);
			 self.canvas.ontouchend = self.preTouchRelease;
		} else {
			 self.canvas.addEventListener("mousedown", self.preClick, false);
		}
	}
	
	
	//replaces Point
	this.point = function(x,y){
		this.x = x;
		this.y = y;
	}

	this.getCursorPosition = function(e, canvas_offset) {
		var x;
	  var y;
	  if (e.pageX != undefined && e.pageY != undefined) {
			x = e.pageX;
			y = e.pageY;
	  } else {
			x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	  }
		x -= canvas_offset.left;
	  	y -= canvas_offset.top;
		var click_position = new nx.point(x,y);
		click_position.touches = [ {x: x, y: y }];
		return click_position;
	}

	this.getTouchPosition = function(e, canvas_offset) {
		var x;
		var y;
		x = e.targetTouches[0].pageX;
		y = e.targetTouches[0].pageY;
		x -= canvas_offset.left;
	  	y -= canvas_offset.top;
		var click_position = new nx.point(x,y);
		console.log("touches="+e.touches.length);
		console.log("target="+e.targetTouches.length);
		console.log("changed="+e.changedTouches.length);

	//	if (e.targetTouches.length>1) {
		click_position.touches = new Array();
		for (var i=0;i<e.targetTouches.length;i++) {
			 click_position.touches.push({
				x: e.targetTouches[i].pageX - canvas_offset.left,
				y: e.targetTouches[i].pageY - canvas_offset.top
			});
		/*	click_position.touches[i] = new Object();
			click_position.touches[i].x = e.targetTouches[i].pageX;
			click_position.touches[i].y = e.targetTouches[i].pageY; */
		}
		// fill rest of touches array with 0s? debating doing this...
	/*	for (var i=click_position.touches.length;i<5;i++) {
			click_position.touches.push({
				x: e.targetTouches[i].pageX,
				y: e.targetTouches[i].pageY
			});
		} */
	//	}
		return click_position;
	}

	this.nxThrottle = function(func, wait) {
	    var timeout;
	    return function() {
	        var context = this, args = arguments;
	        if (!timeout) {
	            // the first time the event fires, we setup a timer, which 
	            // is used as a guard to block subsequent calls; once the 
	            // timer's handler fires, we reset it and create a new one
	            timeout = setTimeout(function() {
	                timeout = null;
	                try {
	               		func.apply(context, args);
	               	} catch (err) {
	               		console.log(err);
	               	}
	            }, wait);
	        }
	    }
	}

	//replaces to_cartesian
	this.toCartesian = function(radius, angle){
		var cos = Math.cos(angle);
		var sin = Math.sin(angle);
		var point = new nx.point(radius*cos, radius*sin*-1);
		return point;
	}

	//replaces to_polar
	this.toPolar = function(x,y) {
		var r = Math.sqrt(x*x + y*y);

		var theta = Math.atan2(y,x);
		if (theta < 0.) {
			theta = theta + (2 * Math.PI);
		}
		var polar = new nx.point(r, theta);

		return polar;
	}

	this.clip = function(value, low, high) {
		var clipped_value = Math.min(high, Math.max(low, value));
		return clipped_value;
	}

	this.text = function(context, text, position) {
		if (!position) {
			position = [10 , 10];
		}
		with(context) {
			beginPath();
				// fillStyle = "#000";
				font = "bold 12px sans-serif";
				fillText(text,position[0],position[1]);
			closePath();
		}
	}

	this.drawLabel = function() {
		if (manager.showLabels) {
			with(this.context) {
				globalAlpha = 0.9;
				fillStyle = this.colors.fill;
				fillRect(this.width-100,this.height-20,100,20);
				globalAlpha = 1;
				beginPath();
					fillStyle = this.colors.border;
					font = "bold 15px courier";
					textAlign = "center";
					fillText(this.oscName,this.width-50,this.height-5);
					textAlign = "left";
				closePath();
			}
		}
	}
	
	this.boolToVal = function(somebool) {
		if (somebool) {
			return 1;
		} else {
			return 0;
		}
	}
	
	this.prune = function(data, scale) {
		var scale = Math.pow(10,scale);
		if (typeof data=="number") {
			data = Math.round( data * scale ) / scale;
		} else if (data instanceof Array) {
			for (var i=0;i<data.length;i++) {
				if (typeof data[i]=="number") {
					data[i] = Math.round( data[i] * scale ) / scale;
				}
			}
		}
		return data;

	}
	
	
	this.scale = function(inNum, inMin, inMax, outMin, outMax) {
		outNum = (((inNum - inMin) * (outMax - outMin)) / (inMax - inMin)) + outMin;
		return outNum;	
	}
		
	this.invert = function (inNum) {
		return manager.scale(inNum, 1, 0, 0, 1);
	}
	
	this.mtof = function(midi) {
		var freq = Math.pow(2, ((midi-69)/12)) * 440;
		return freq;
	}



	/*  
	 * 		GUI
	 */
	
	this.colors = { 
			"accent": "#ff5500", 
			"fill": "#f5f5f5", 
			"border": "#999", //aaa 
			"accentborder": "#aa2200",
			"black": "#000",
			"white": "#FFF",
			"highlight": "rgba(255,85,0,0.5)"
	};
	
	/* Global GUI Function Library*/
		
	this.randomNum = function(scale) {
		var randNum = Math.floor(Math.random() * scale);
		return randNum;
	} 
	
	this.randomColor = function() {
		var randCol = "rgb(" + this.randomNum(250) + "," + this.randomNum(250) + "," + this.randomNum(250) + ")";
		return randCol;
	}
	
	this.hexToRgb = function(hex, a) {
		// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
	        return r + r + g + g + b + b;
	    });
	
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		if (!a) {
			a = 0.5;
		}
		
		    var r = parseInt(result[1], 16);
		    var g = parseInt(result[2], 16);
		    var b = parseInt(result[3], 16);

	    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
	}
	
	this.makeRoundRect = function(ctx,xpos,ypos,wid,hgt,depth) {
		var x1 = xpos;
		var y1 = ypos;
		var x2 = wid+x1;
		var y2 = hgt+y1;
		//var depth = 6;
		if (!depth) {
			depth = 2; // prev 4
		}
		
		ctx.beginPath();
		ctx.moveTo(x1+depth, y1); //TOP LEFT
		ctx.lineTo(x2-depth, y1); //TOP RIGHT
		ctx.quadraticCurveTo(x2, y1, x2, y1+depth);
		ctx.lineTo(x2, y2-depth); //BOTTOM RIGHT
		ctx.quadraticCurveTo(x2, y2, x2-depth, y2);
		ctx.lineTo(x1+depth, y2); //BOTTOM LEFT
		ctx.quadraticCurveTo(x1, y2, x1, y2-depth);
		ctx.lineTo(x1, y1+depth); //TOP LEFT
		ctx.quadraticCurveTo(x1, y1, x1+depth, y1);
		ctx.closePath();
	}
	
	
	this.isInside = function(clickedNode,currObject) {
		if (clickedNode.x > currObject.xpos && clickedNode.x < (currObject.xpos+currObject.wid) && clickedNode.y > currObject.ypos && clickedNode.y < (currObject.ypos+currObject.hgt)) {
			return true;	
		} else {
			return false;	
		}
	}
	
	
	this.blockMove = function(e) {	    	
	    // enables page touch events unless touching a canvas	
	  	if (e.target.tagName == 'CANVAS') {
	        e.preventDefault();
	    }
	}
	
	
	/* animation functions */
	
	this.startPulse = function() {
		manager.pulseInt = setInterval("nx.pulse()", 30);
	}
	
	this.stopPulse = function() {
		clearInterval(manager.pulseInt);
	}
	
	this.pulse = function() {
		for (var i=0;i<manager.aniItems.length;i++) {
			manager.aniItems[i]();
		}
	}
	
	this.bounce = function(posIn, borderMin, borderMax, delta) {
		if (posIn > borderMin && posIn < borderMax) {
			return delta;
		} else if (posIn <= borderMin) {
			return Math.abs(delta);	
		} else if (posIn >= borderMax) {
			return Math.abs(delta) * (-1);
		}
	}
	
	
	this.addStylesheet = function() {
		var htmlstr = '<style>'
					+ 'select {'
					+ 'background: transparent;'
		   			+ '-webkit-appearance: none;'
		   			+ 'width: 150px;'
		   			+ 'padding: 5px 5px;'
		   			+ 'font-size: 16px;'
		   			+ 'color:#888;'
		   			+ 'border: solid 2px #CCC;'
		   			+ 'border-radius: 6;'
		   			+ 'outline: black;'
		   			+ 'cursor:pointer;'
		   			+ 'background-color:#F7F7F7;'
		   			+ 'font-family:gill sans;'
		   			+ '}'
		   			+ ''
		   			+ 'body {'
		   		//	+ 'user-select: none;'
		   		//	+ '-moz-user-select: none;'
		   		//	+ '-webkit-user-select: none;'
		   		//	+ 'cursor:pointer;'
		   			+ '}'
		   			+ ''
		   			+ 'canvas { cursor:pointer; }'
		   			+ '</style>';
		$("body").append(htmlstr);
	}
	
	this.wrapText = function(context, text, x, y, maxWidth, lineHeight) {
		if (text) {
	        var words = text.split(' ');
	        var line = '';

	        for(var n = 0; n < words.length; n++) {
	          var testLine = line + words[n] + ' ';
	          var metrics = context.measureText(testLine);
	          var testWidth = metrics.width;
	          if (testWidth > maxWidth && n > 0) {
	            context.fillText(line, x, y);
	            line = words[n] + ' ';
	            y += lineHeight;
	          }
	          else {
	            line = testLine;
	          }
	        }
	        context.fillText(line, x, y);

		}
      }

      this.metas = document.getElementsByTagName('meta');

	  this.setViewport = function(scale) {
	    for (i=0; i<manager.metas.length; i++) {
	      if (manager.metas[i].name == "viewport") {
	        manager.metas[i].content = "minimum-scale="+scale+", maximum-scale="+scale;
	      }
	    }
	  }


	  this.highlightEditedObj = function() {
	//  	$("canvas").css("border", "solid 1px #ccc");
	  	$("canvas").css("z-index", 1);
	 // 	$("#"+globaldragid).css("border", "solid 2px black");
	  	$("#"+globaldragid).css("z-index", 2);
	  }


	  this.setLabels = function(onoff) {
	  	if (onoff=="on") {
	  		manager.showLabels = true;
	  	} else {
	  		manager.showLabels = false;
	  	}
		for (var i=0;i<manager.nxObjects.length;i++) {
			manager.nxObjects[i].draw()
		}
	  }

	  this.saveCanv = function(ui) {
		var data = ui.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
		window.location.href = data
	  };


	
}


//var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
 //                             window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;







/************************************************
*  INSTANTIATE NX MANAGER AND CREATE ELEMENTS   *
************************************************/

var nx = new nx();
nx.onload = function() {};

/* this onload function turns canvases into nexus elements,
 * using the canvas's id as its var name */

$(document).ready(function() {

	transformCanvases();
	
	if (nx.is_touch_device) {
		document.addEventListener("touchmove", nx.blockMove, true);
		document.addEventListener("touchstart", nx.blockMove, true);
	}

	//block space key and delete key
//	window.onkeydown = function(e) { 
//	    return !(e.keyCode == 32 || e.keyCode == 46);
//	};

	
	nx.addStylesheet();
	
	nx.onload();

	nx.startPulse();
	
});



function transformCanvases() {

		// get all canvases on the page
	var allcanvi = document.getElementsByTagName("canvas");
	for (i=0;i<allcanvi.length;i++) {
		// if it has an nx attribute, store that in nxId
		var nxId = allcanvi[i].getAttribute("nx");
		var elemCount = 0;
		// find out how many of the same elem type have come before
		// i.e. nx.elemTypeArr will look like [ dial, dial, toggle, toggle ]
		// allowing you to count how many dials already exist on the page
		// and give your new dial the appropriate index and id: dial3
		for (j=0;j<nx.elemTypeArr.length;j++) {
			if (nx.elemTypeArr[j]==nxId) {
				elemCount++;
			}
		}
		// add your new nexus element type to the element list
		nx.elemTypeArr.push(nxId);
		// check to see if it has a pre-given ID
		// and use that as its id if so
		if (!allcanvi[i].id) {
			var idNum = elemCount + 1;
			allcanvi[i].id = nxId + idNum;
		}
		if(nxId) {
			eval(allcanvi[i].id + " = new "+nxId+"('"+allcanvi[i].id+"', '../../servers/nexusPHP/nexusOSCRelay.php', "+idNum+");");
			eval(allcanvi[i].id + ".init()");
		}
	}

}
	
	
	
	
	

/*****************************
*      OBJECT TEMPLATE       *
*****************************/

function getTemplate(self, target, transmitCommand) {
//	self.nxtype = self.getName();
	//canvas
	self.canvasID = target;
	self.canvas = document.getElementById(target);
	self.context = self.canvas.getContext("2d");
	self.canvas.height = window.getComputedStyle(document.getElementById(target), null).getPropertyValue("height").replace("px","");
	self.canvas.width = window.getComputedStyle(document.getElementById(target), null).getPropertyValue("width").replace("px","");
	self.height = parseInt(window.getComputedStyle(document.getElementById(target), null).getPropertyValue("height").replace("px",""));
	self.width = parseInt(window.getComputedStyle(document.getElementById(target), null).getPropertyValue("width").replace("px",""));
	if (self.width==300 && self.height==150) {
		self.canvas.width = self.defaultSize.width;
		self.canvas.height = self.defaultSize.height;
		self.width = self.defaultSize.width;
		self.height = self.defaultSize.height;
	}
	self.offset = new nx.canvasOffset(nx.findPosition(self.canvas).left,nx.findPosition(self.canvas).top);
	self.center = {
					x: self.width/2, 
					y: self.height/2
				};
	//dimensions
	self.corners = {
						"TLx": 0,
						"TLy": 0,
						"TRx": this.width,
						"TRy": 0,
						"BRx": this.width,
						"BRy": this.height,
						"BLx": 0,
						"BLy": this.height
				};
	//drawing
	self.lineWidth = 2; // prev 3
	self.padding = 2; // prev 2
	//self.colors = nx.colors;
	self.colors = new Object();
	self.colors.accent = nx.colors.accent;
	self.colors.fill = nx.colors.fill;
	self.colors.border = nx.colors.border;
	self.colors.accentborder = nx.colors.accentborder;
	self.colors.black = nx.colors.black;
	self.colors.white = nx.colors.white; 
	self.colors.highlight = nx.colors.highlight;
	self.hexToRgb = nx.hexToRgb;
	//interaction
	self.clickPos = new nx.point(0,0);
	self.clickPos.touches = new Array();
	self.clicked = false;
	self.value = 0;
	self.val = new Object();
	self.nodePos = new Array();	
	self.deltaMove = new Object();
	self.nxThrottlePeriod = nx.nxThrottlePeriod;
	self.nxThrottle = nx.nxThrottle;
	self.isBeingDragged = false;
	self.isBeingResized = false;
	self.label = false;
	//recording
	nx.addNxObject(self);
	self.isRecording = false;
	self.tapeNum = 0;
	self.recorder = null;
	//Transmission
	self.nxTransmit = nx.nxTransmit;
	self.transmissionProtocol = "ajax";  // transmissionProtocol = [none, local, ajax, ios, android]

	self.ajaxRequestType = "post";	// ajaxRequestType = [post, get]
	if (!transmitCommand) {
		self.transmitCommand = "nexusTransmit";
	} else {
		self.transmitCommand = transmitCommand;
	}
	self.oscName = "/"+target;
	
	self.ajaxTransmit = nx.ajaxTransmit;
	self.iosTransmit = nx.iosTransmit;

	if (nx.editmode) {
	//	self.canvas.style.border = "solid 1px #888";
	}
	
	
		// By default localTransmit will call the global nx manager globalLocalTransmit function. It can be individually rewritten.
	self.localTransmit = function(data) {
		nx.globalLocalTransmit(self.canvasID, self.localObject, self.localParameter, data);	
	//	nx.allTraffic(self, data);
	};
	self.response = function(data) {	
		nx.allTraffic(self, data);
	};

	self.sendsTo = function(data) {
		self.transmissionProtocol = data;	
	};

	self.localObject = "dial1";
	self.localParameter = "value";

	//built-in methods
	self.getCursorPosition = nx.getCursorPosition;
	self.getTouchPosition = nx.getTouchPosition;
	self.is_touch_device = ('ontouchstart' in document.documentElement)?true:false;
	self.drawLabel = nx.drawLabel;
	
	self.preClick = function(e) {
		self.offset = new nx.canvasOffset(nx.findPosition(self.canvas).left,nx.findPosition(self.canvas).top);
		//document.addEventListener("mousemove", self.nxThrottle(self.preMove, self.nxThrottlePeriod), false);
		document.addEventListener("mousemove", self.preMove, false);
		document.addEventListener("mouseup", self.preRelease, false);
		self.clickPos = self.getCursorPosition(e, self.offset);
		for (var i=0;i<self.clickPos.touches.length;i++) {
			//self.clickPos.touches[i] == self.getCursorPosition(e, self.offset);
			// NEEDS WORK
		}
		self.clicked = true;
		self.deltaMove.x = 0;
		self.deltaMove.y = 0;
		if (nx.editmode) {
			if (self.clickPos.x>self.width-20 && self.clickPos.y>self.height-20) {
				self.isBeingResized = true;
			} else {
				self.isBeingResized = false;
				self.isBeingDragged = true;
			}
			globaldragid = self.canvasID;
	//		nx.highlightEditedObj(self.canvasID);
			showSettings();
			if (nx.isErasing) {
				self.destroy();
			}
		} else {
			self.click(e);
		}
		document.body.style.userSelect = "none";
		document.body.style.mozUserSelect = "none";
		document.body.style.webkitUserSelect = "none";

		   		//	+ 'user-select: none;'
		   		//	+ '-moz-user-select: none;'
		   		//	+ '-webkit-user-select: none;'
	};
	self.preMove = function(e) {
	//	self.movehandle = 0;
		var new_click_position = self.getCursorPosition(e, self.offset);
		self.deltaMove.y = new_click_position.y - self.clickPos.y;
		self.deltaMove.x = new_click_position.x - self.clickPos.x;
		self.clickPos = new_click_position;
		if (nx.editmode) {
			if (self.isBeingResized) {
				console.log("resizing...")
				self.canvas.width = ~~(self.clickPos.x/(canvasgridx/2))*(canvasgridx/2);
				self.canvas.height = ~~(self.clickPos.y/(canvasgridy/2))*(canvasgridy/2);

				self.canvas.height = window.getComputedStyle(document.getElementById(target), null).getPropertyValue("height").replace("px","");
				self.canvas.width = window.getComputedStyle(document.getElementById(target), null).getPropertyValue("width").replace("px","");
				self.height = parseInt(window.getComputedStyle(document.getElementById(target), null).getPropertyValue("height").replace("px",""));
				self.width = parseInt(window.getComputedStyle(document.getElementById(target), null).getPropertyValue("width").replace("px",""));
				self.center = {
					x: self.width/2, 
					y: self.height/2
				};
				self.corners = {
						"TLx": 0,
						"TLy": 0,
						"TRx": this.width,
						"TRy": 0,
						"BRx": this.width,
						"BRy": this.height,
						"BLx": 0,
						"BLy": this.height
				};

				self.init();
				self.draw();
			} else if (self.isBeingDragged) {
				var matrixy = ~~((e.pageY-self.height/2)/canvasgridy)*canvasgridy;
				var matrixx = ~~((e.pageX-self.width/2)/canvasgridx)*canvasgridx;
				self.canvas.style.top = matrixy+"px";
				self.canvas.style.left = matrixx+"px";
				self.offset = new nx.canvasOffset(nx.findPosition(self.canvas).left,nx.findPosition(self.canvas).top);	
			} 
		} else {
			self.move(e);
		}
	};
	self.preRelease = function(e) {

	//	var new_click_position = self.getCursorPosition(e, self.offset);
	//	self.clickPos = new_click_position;

		document.removeEventListener("mousemove", self.preMove, false);
		self.clicked = false;
		if (nx.editmode) {
			self.isBeingDragged = false;
		} else {
			self.release();
		}
		document.removeEventListener("mouseup", self.preRelease, false);
		document.body.style.userSelect = "text";
		document.body.style.mozUserSelect = "text";
		document.body.style.webkitUserSelect = "text";
	};
	self.preTouch = function(e) {
		self.clickPos = self.getTouchPosition(e, self.offset);
		self.clicked = true;
		self.deltaMove.x = 0;
		self.deltaMove.y = 0;
		if (nx.editmode) {
			if (nx.isResizing) {
				self.isBeingResized = true;
			} else {
				self.isBeingDragged = true;
			}
		//	self.isBeingDragged = true;
			globaldragid = self.canvasID;
		//	nx.highlightEditedObj(self.canvasID);
			showSettings();
			if (nx.isErasing) {
				self.destroy();
			}
		} else {
			self.touch(e);
		}
	};
	self.preTouchMove = function(e) {
		if (self.clicked) {
			var new_click_position = self.getTouchPosition(e, self.offset);
			self.deltaMove.y = new_click_position.y - self.clickPos.y;
			self.deltaMove.x = new_click_position.x - self.clickPos.x;
			self.clickPos = new_click_position;
			if (nx.editmode) {
				if (self.isBeingDragged) {
					var matrixy = ~~((e.targetTouches[0].pageY-self.height/2)/canvasgridy)*canvasgridy;
					var matrixx = ~~((e.targetTouches[0].pageX-self.width/2)/canvasgridx)*canvasgridx;
					self.canvas.style.top = matrixy+"px";
					self.canvas.style.left = matrixx+"px";	
					self.offset = new nx.canvasOffset(nx.findPosition(self.canvas).left,nx.findPosition(self.canvas).top);
				} else if (self.isBeingResized) {
					self.canvas.width = ~~(e.targetTouches[0].pageX/(canvasgridx/2))*(canvasgridx/2);
					self.canvas.height = ~~(e.targetTouches[0].pageY/(canvasgridy/2))*(canvasgridy/2);

					self.canvas.height = window.getComputedStyle(document.getElementById(target), null).getPropertyValue("height").replace("px","");
					self.canvas.width = window.getComputedStyle(document.getElementById(target), null).getPropertyValue("width").replace("px","");
					self.height = parseInt(window.getComputedStyle(document.getElementById(target), null).getPropertyValue("height").replace("px",""));
					self.width = parseInt(window.getComputedStyle(document.getElementById(target), null).getPropertyValue("width").replace("px",""));
					self.center = {
						x: self.width/2, 
						y: self.height/2
					};
					self.corners = {
							"TLx": 0,
							"TLy": 0,
							"TRx": this.width,
							"TRy": 0,
							"BRx": this.width,
							"BRy": this.height,
							"BLx": 0,
							"BLy": this.height
					};

					self.init();
					self.draw();
				}
			} else {
				self.touchMove(e);
			}
		}
	};
	self.preTouchRelease = function(e) {
		if (e.targetTouches.length>=1) {
			var new_click_position = self.getTouchPosition(e, self.offset);
			self.clickPos = new_click_position;
		} else {
			self.clicked = false;
		}

		if (nx.editmode) {
			self.isBeingDragged = false;
			globaldragid = false;
		} else {
			self.touchRelease();
		}
	};
	self.draw = function() {
	}
	self.click = function() {
	}
	self.move = function() {
	}
	self.release = function() {
	}
	self.touch = function() {
		self.click();
	}
	self.touchMove = function() {
		self.move();
	}
	self.touchRelease = function() {
		self.release();
	}
	self.adjustSizeIfDefault = function() {
		if (self.width==300 && self.height==150) {
			self.canvas.width = self.defaultSize.width;
			self.canvas.height = self.defaultSize.height;
			self.width = self.defaultSize.width;
			self.height = self.defaultSize.height;
		}
	}
	self.makeRoundedBG = function() {
		this.bgLeft = this.lineWidth;
		this.bgRight = this.width - this.lineWidth;
		this.bgTop = this.lineWidth;
		this.bgBottom = this.height - this.lineWidth;
		this.bgHeight = this.bgBottom - this.lineWidth;
		this.bgWidth = this.bgRight - this.lineWidth;	
		
		nx.makeRoundRect(self.context, self.bgLeft, self.bgTop, self.bgWidth, self.bgHeight);
	};
	self.erase = function() {
		self.context.clearRect(0,0,self.width,self.height);
	};
	self.hideCursor = function() {
		self.canvas.style.cursor = "none";
	};
	self.showCursor = function() {
		self.canvas.style.cursor = "auto";
	};

	// allow us to get the constructor function name programatically
	//i.e. if element is a dial, this function will return "dial"

	self.getName = function() { 
	   	var funcNameRegex = /function (.{1,})\(/;
	   	var results = (funcNameRegex).exec((this).constructor.toString());
	   	return (results && results.length > 1) ? results[1] : "";
	};

	/** @method set
	@param {parameter/value pairs in object notation} [data]
	@param {(optional) whether or not to transmit after setting} [transmit] 
	Sets the value of an object. 

	```js
		position1.set({
		&nbsp;	x: 100,
		&nbsp;	y: 250
		})
	```

	An optional second argument decides whether the object then transmits its new value.
	```js
		button1.set({
		&nbsp;	press: 100
		}, true)
	```
	*/

	self.set = function(data, transmit) {

		if (typeof self.val == "object" && self.val !== "null") {
			if (typeof data == "object" && data !== "null") {
				for (var key in data) {
					self.val[key] = data[key];
				}
			}
		} else if (typeof self.val == "string" || typeof self.val == "number") {
			if (typeof data == "object" && data !== "null") {
				self.val = data["value"];
				self.draw();
			} else if (typeof data == "string" || typeof data == "number") {
				self.val = data;
			}
		}
		self.draw();
		if (transmit) {
			nx.transmit(self.val)
		}
	}

	self.destroy = function() {
		for (var i=0;i<nx.nxObjects.length;i++) {
			if (nx.nxObjects[i].canvasID==self.canvasID) {
				nx.nxObjects.splice(i,1)
				break;
			}
		}
		for (var i=0;i<nx.elemTypeArr.length;i++) {
			if (nx.elemTypeArr[i]==self.getName()) {
				nx.elemTypeArr.splice(i,1)
				break;
			}
		}
		self.canvas.ontouchmove = null;
		self.canvas.ontouchend = null;
		self.canvas.onclick = null;
		self.canvas.onmousemove = null;
		self.canvas.onmouseoff = null;
		document.removeEventListener("mousemove", self.preMove, false);
		
		document.removeEventListener("mouseup", self.preRelease, false);

		$("#"+self.canvasID).remove();
		
		eval("delete window."+self.canvasID);
		self = null;
	}
	
	
	nx.getHandlers(self);
};

	
	
	
