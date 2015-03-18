/**
 * @module MYAPP
 * @class manageLoadEvent Use a unique wrapper for functions to be fired on load,
 *        to be able to call the wrapper both on standard onload event
 *        and in SP's own _spBodyOnLoadFunctionNames callback
 */
MYAPP.manageLoadEvent = function manageLoadEvent(){

	"use strict";

};

/**
 * onload function for SP and non-SP environments
 */
if ( typeof _spBodyOnLoadFunctionNames !== "undefined" ) {

	//SP version
	_spBodyOnLoadFunctionNames.push("MYAPP.manageLoadEvent");


} else {

	// Non SP version
	window.onload = MYAPP.manageLoadEvent;

}