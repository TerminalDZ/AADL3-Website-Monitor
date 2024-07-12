(function() {
	'use strict';

	var css = document.createElement("style");
	var head = document.head;
	head.appendChild(css);

	css.type = 'text/css';

	css.innerText = `* {
		-webkit-user-select: text !important;
		-moz-user-select: text !important;
		-ms-user-select: text !important;
		 user-select: text !important;
	}`;

	var elements = document.querySelectorAll("*");

	for (var i = 0; i < elements.length; i++) {
		if (elements[i].style.userSelect == 'none') {
			elements[i].style.userSelect = 'auto';
		}
	}

	var script = document.createElement('script');
	script.type = 'text/javascript';
	document.body.appendChild(script);

	script.innerHTML =`
		document.oncontextmenu = null;
		document.onselectstart = null;
		document.ondragstart = null;
		document.onmousedown = null;
		document.body.oncontextmenu = null;
		document.body.onselectstart = null;
		document.body.ondragstart = null;
		document.body.onmousedown = null;
		document.body.oncut = null;
		document.body.oncopy = null;
		document.body.onpaste = null;
	`;

	var doc = document;
	var body = document.body;

	var docEvents = [
		doc.oncontextmenu = null,
		doc.onselectstart = null,
		doc.ondragstart = null,
		doc.onmousedown = null
	];

	var bodyEvents = [
		body.oncontextmenu = null,
		body.onselectstart = null,
		body.ondragstart = null,
		body.onmousedown = null,
		body.oncut = null,
		body.oncopy = null,
		body.onpaste = null
	];

	setTimeout(function() {
		document.oncontextmenu = null;
	}, 2000);

	[].forEach.call(['copy', 'cut', 'paste', 'select', 'selectstart'], function(event) {
		document.addEventListener(event, function(e) { 
			e.stopPropagation(); 
		}, true);
	});

	window.addEventListener('contextmenu', function handleEvent(event) {
		event.stopPropagation();
		event.stopImmediatePropagation();
		var handler = new EventHandler(event);
		window.removeEventListener(event.type, handleEvent, true);
		var EventsCallBback = new EventsCall(function() {});
		handler.fire();
		window.addEventListener(event.type, handleEvent, true);
		if (handler.isCanceled && (EventsCallBback.isCalled)) {
			event.preventDefault();
		}
	}, true);

	function EventsCall(callback) {
		this.events = ['DOMAttrModified', 'DOMNodeInserted', 'DOMNodeRemoved', 'DOMCharacterDataModified', 'DOMSubtreeModified'];
		this.bind();
	}

	EventsCall.prototype.bind = function() {
		this.events.forEach(function(event) {
			document.addEventListener(event, this, true);
		}.bind(this));
	};

	EventsCall.prototype.handleEvent = function() {
		this.isCalled = true;
	};

	EventsCall.prototype.unbind = function() {
		this.events.forEach(function(event) {}.bind(this));
	};

	function EventHandler(event) {
		this.event = event;
		this.contextmenuEvent = this.createEvent(this.event.type);
	}

	EventHandler.prototype.createEvent = function(type) {
		var target = this.event.target;
		var event = target.ownerDocument.createEvent('MouseEvents');
		event.initMouseEvent(
			type, this.event.bubbles, this.event.cancelable,
			target.ownerDocument.defaultView, this.event.detail,
			this.event.screenX, this.event.screenY, this.event.clientX, this.event.clientY,
			this.event.ctrlKey, this.event.altKey, this.event.shiftKey, this.event.metaKey,
			this.event.button, this.event.relatedTarget
		);
		return event;
	};

	EventHandler.prototype.fire = function() {
		var target = this.event.target;
		var contextmenuHandler = function(event) {
			event.preventDefault();
		}.bind(this);
		target.dispatchEvent(this.contextmenuEvent);
		this.isCanceled = this.contextmenuEvent.defaultPrevented;
	};

})();