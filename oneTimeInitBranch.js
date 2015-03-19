// One time init branch example

/**
 * @module MYAPP
 * @method listener
 * Event listener utility
 * @type {Object}
 */
MYAPP.listener = {
	addListener: null,
	removeListener: null
};

/**
 * Init listener utility,
 * doing some cross browser tuning.
 */
if (typeof window.addEventListener === "function") {

	MYAPP.listener.addListener = function(el, type, fn) {
		el.addEventListener(type, fn, false);
	};

	MYAPP.listener.removeListener = function(el, type, fn) {
		el.removeEventListener(type, fn, false);
	};

} else if (typeof document.attachEvent === "function") { // IE

	MYAPP.listener.addListener = function(el, type, fn) {
		el.attachEvent("on" + type, fn);
	};

	MYAPP.listener.removeListener = function(el, type, fn) {
		el.detachEvent("on" + type, fn);
	};

} else { // older browsers

	MYAPP.listener.addListener = function(el, type, fn) {
		el["on" + type] = fn;
	};

	MYAPP.listener.removeListener = function(el, type, fn) {
		el["on" + type] = null;
	};
}