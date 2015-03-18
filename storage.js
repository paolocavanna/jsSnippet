/**
 * @namespace MYAPP
 * @class ManageStorage
 * Wrapper layer for WebStorage management.
 * @param  {Object} app App global namespace
 */
(function(app){

	"use strict";

	var ManageStorage = {};

	ManageStorage.opt = {
		storage: localStorage
	};

	/**
	 * @method  execute
	 * Abstract calls to native WebStorage methods
	 * to avoid browsers' quirks (expecially mobile borwsers in private mode).
	 * @param  {String} operation Storage method
	 * @param  {String} item      Storage item name
	 * @param  {Object} data      Data to feed storage item
	 * @example
	 * app.ManageStorage.execute("setItem", "itemName", {
	 *     foo: "bar"
	 * });
	 *
	 * app.ManageStorage.execute("getItem", "itemName");
	 */
	ManageStorage.execute = function(operation, item, data){

		try {

			if ( typeof data !== "undefined" ) {

				if ( typeof data === "object" ) {

					switch(operation){

						case "setItem":

							data = JSON.stringify(data);

							this.opt.storage[operation](item, data);

							break;

						case "getItem":

							data = JSON.parse(data);

							this.opt.storage[operation](item, data);

							break;

						default:

					}

				} else {

					console.warn("Data supplied to WebStorage must be a valid JSON object");

				}

			} else {

				this.opt.storage[operation](item);

			}

		} catch(e) {

			Storage.prototype["_" + operation] = Storage.prototype[operation];
			Storage.prototype[operation] = function() {};

			console.warn("WARNING: if you are browsing in private mode, WebStorage is not available");

		}

	};

	/**
	 * @method  key
	 * Map WebStorage `key` method
	 * @param  {Number} i Loop index
	 * @return {Function}   Execute method
	 */
	ManageStorage.key = function(i){

		return this.opt.storage.key(i);

	};

	/**
	 * @method getLength Get storage length
	 * @return {Number}
	 */
	ManageStorage.getLength = function(){

		return this.opt.storage.length;

	};

	ManageStorage.check = function(id){

		if ( id in this.opt.storage ){

			return true;

		}

		return false;

	};

	/**
	 * @method  flush Clear storage utility.
	 * If no argument is passed, the entire storage will be cleared.
	 */
	ManageStorage.flush = function(){

		var arg = $.makeArray(arguments);

		if ( arg.length > 0 ) {

			$.each($.proxy(function(index, value){

				this.action.call(this, "removeItem", value);

			}), this);

		} else {

			this.opt.storage.clear();

		}

	};

	app.ManageStorage = ManageStorage;

})(MYAPP);