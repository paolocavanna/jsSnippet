/**
 * @namespace MYAPP
 * @class ManageStorage Set up availability check.
 * Wrapper layer for WebStorage management.
 * @param  {Object} app App global namespace
 */
(function(app){

	"use strict";

	var ManageStorage = {};

	ManageStorage.opt = {
		storage: localStorage
	};

	ManageStorage._available;

	ManageStorage.isAvailable = function() {

		var storageAvailable, storageWritable;

		if ( this._available !== undefined ) {

			return this._available;

		}

		storageAvailable = (this.opt.storage !== undefined) && (typeof(JSON) !== "undefined");

		if ( storageAvailable ) {

			try {

				this.opt.storage.setItem("storage:test", "test");
				storageWritable = true;
				this.opt.storage.removeItem("storage:test");

			} catch (e) {
				storageWritable = false;
			}

			this._available = storageWritable;

		}

		else {

			this._available = false;

		}

		return this._available;

	};

	app.ManageStorage = ManageStorage;

})(MYAPP);

/**
 * @namespace MYAPP
 * @class ManageStorage Init all module's methods after availability checking.
 * Wrapper layer for WebStorage management.
 * @param  {Object} module WebStorage module
 */
(function(module){

	if ( module.isAvailable() ) {

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
		module.execute = function(operation, item, data){

			if ( typeof operation === "undefined" ) {

				console.warn("operation not defined in ManageStorage.execute");

				return;
			}

			switch(operation){

				case "setItem":

					data = JSON.stringify(data);

					this.opt.storage.setItem(item, data);

					break;

				case "getItem":

					return JSON.parse(this.opt.storage.getItem(item));

					break;

				case "removeItem":

					this.opt.storage.removeItem(item);

					break;

				default:

			}

		};

		/**
		 * @method  key
		 * Map WebStorage `key` method
		 * @param  {Number} i Loop index
		 * @return {Function}   Execute method
		 */
		module.key = function(i){

			return this.opt.storage.key(i);

		};

		/**
		 * @method getLength Get storage length
		 * @return {Number}
		 */
		module.getLength = function(){

			return this.opt.storage.length;

		};

		module.check = function(id){

			if ( id in this.opt.storage ){

				return true;

			}

			return false;

		};

		/**
		 * @method  flush Clear storage utility.
		 * If no argument is passed, the entire storage will be cleared.
		 */
		module.flush = function(){

			var arg = $.makeArray(arguments);

			if ( !~arg.length ) {

				$.each($.proxy(function(index, value){

					this.action.call(this, "removeItem", value);

				}), this);

			} else {

				this.opt.storage.clear();

			}

		};

	} else {

		console.warn("WARNING: if you are browsing in private mode, WebStorage is not available");

	}

})(MYAPP.ManageStorage);