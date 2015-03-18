/**
 * Wrapper for window events: used in order to have
 * the possibility to cache DOM nodes.
 * @param  {Object} app App global namespace
 */
(function(app){

	/**
	* wrapper function to boost performance on scrolling
	* @namespace MYAPP
	* @class scrollHandler
	*/
	app.UI.scrollHandler = function(evt){

		// functions to be run

	};

	/**
	 * Attach events to `window` object
	 */
	$(window).on({

		scroll: function(evt){

			if ( app.globals.scrollTimeout ) {

				// clear the timeout, if one is pending
				clearTimeout(app.globals.scrollTimeout);

				app.globals.scrollTimeout = null;
			}

			app.globals.scrollTimeout = setTimeout(function(){

				app.UI.scrollHandler(evt);

			}, 250);

		}

	});

})(MYAPP);