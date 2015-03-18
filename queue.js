/**
 * @module MYAPP
 * @method  queue Utility to avoid callback nightmare and call functions in the desired sequence
 * @param  {Array} funcs Array of functions to be executed
 * @param  {Object} scope Context of the functions
 * @see  http://krasimirtsonev.com/blog/article/7-lines-JavaScript-library-for-calling-asynchronous-functions
 * @example
 * MYAPP.queue([
		$.proxy(MYAPP.menuItem.success, MYAPP.menuItem),
		$.proxy(MYAPP.modelSlider.success, MYAPP.modelSlider),
		$.proxy(MYAPP.modelSelect.success, MYAPP.modelSelect)
	]);
 */
MYAPP.queue = function(funcs, scope) {

	(function next() {

		if ( funcs.length > 0 ) {

			funcs.shift().apply(scope || {}, [next].concat(Array.prototype.slice.call(arguments, 0)));

		}

	})();

};