/**
  * @module MYAPP
  *
*/

if ( typeof MYAPP === "undefined" ) {

	var MYAPP = {};

}

if ( typeof MYAPP.globals === "undefined" ) {

	MYAPP.globals = {};

}

/**
  * @desc APP_ID: ID dell'applicazione
  *       EXTENDEND_PERM: lista dei permessi estesi per acceder alle info utente
  *       CHANNEL_URL: url del file channel.html, utile a FB per accelerare le callback
  * @module MYAPP
  * @submodule globals
  *
*/

MYAPP.globals = {

	APP_ID: "343186159088232", //temp

	EXTENDEND_PERM: "user_birthday, email, user_location, read_insights",

	CHANNEL_URL: "http://www.example.it/channel.html"

};

/**
  * @desc Gestisce l'oggetto response, colleziona tutti i campi form
  *       corrispondenti e li valorizza a seconda della risposta da FB
  * @class MYAPP.fillForm
  * @static
  * @module MYAPP
  *
*/

MYAPP.fillForm = (function(){

	var $name,

		$lastName,

		$town,

		$gender,

		$birthDay,

		$birthMonth,

		$birthYear,

		$email,

		_setSelectValue,

		_populateFileds,

		_gatherElements,

		_init;


	_setSelectValue = function(el, val){

		var eq = 0;

		el.children("option").each(function(index){

			eq = ( $(this).val() === val ) ? index : eq;

		});

		el.val( $gender.children("option:eq(" + eq + ")").val() ).change();

	};

	_populateFileds = function(response){

		console.dir(response);

		var name =  ( response.first_name ) ? response.first_name : "",

			lastName = ( response.last_name ) ? response.last_name : "",

			town =  ( response.location ) ? ( response.location, response.location.name ? response.location.name.split(",")[0] : "" ) : "",

			gender = ( response.gender ) ? response.gender : "",

			birthDay = ( response.birthday ) ? response.birthday.substring(3, 5) : "",

			birthMonth = ( response.birthday ) ? response.birthday.substring(0, 2) : "",

			birthYear = ( response.birthday ) ? response.birthday.substring(6, 10) : "",

			email = ( response.email ) ? response.email : "";


		gender = ( gender === "male" ) ? "M" : "F";

		_setSelectValue($gender, gender);

		_setSelectValue($birthDay, birthDay);

		_setSelectValue($birthMonth, birthMonth);

		_setSelectValue($birthYear, birthYear);

		$name.val(name);

		$lastName.val(lastName);

		$town.val(town);

		$email.val(email);
	};

	_gatherElements = function(){

		$name = $("#i_name");

		$lastName = $("#i_lastName");

		$town = $("#i_town");

		$gender = $("#i_gender");

		$birthDay = $("select.birth-day");

		$birthMonth = $("select.birth-month");

		$birthYear = $("select.birth-year");

		$email = $("#i_email");

	};

	_init = function(response){

		_gatherElements();

		_populateFileds(response);

	};

	return {

		init: _init

	}

})();

/**
  * @desc Metodo per gestire le risposte:
  *       - connesso all'app e a FB;
  *		  - connesso a FB, ma non all'app;
  *		  - non connesso a FB
  *	@module MYAPP
  *
*/

MYAPP.handleResponses = function(response){

	if (response.status === 'connected') {
		// The response object is returned with a status field that lets the app know the current
		// login status of the person. In this case, we're handling the situation where they
		// have logged in to the app.

		FB.api("/me", MYAPP.fillForm.init);

	} else if (response.status === 'not_authorized') {
		// In this case, the person is logged into Facebook, but not into the app, so we call
		// FB.login() to prompt them to do so.

		console.log("not_authorized");

		FB.login(MYAPP.fillForm.init, { scope: MYAPP.globals.EXTENDEND_PERM } );

	} else {
		// In this case, the person is not logged into Facebook, so we call the login()
		// function to prompt them to do so. Note that at this stage there is no indication
		// of whether they are logged into the app. If they aren't then they'll see the Login
		// dialog right after they log in to Facebook.

		console.log("not logged in");

		FB.login(MYAPP.fillForm.init, { scope: MYAPP.globals.EXTENDEND_PERM } );

	}

};

/**
  * @desc Metodo per inizializzare l'oggetto FB
  * 	  e gestire la callback di avvenuta autenticazione
  *	@module MYAPP
  *
*/

MYAPP.initApp = function(){

	FB.init({
        appId: MYAPP.globals.APP_ID, // App ID
        channelUrl: MYAPP.globals.CHANNEL_URL, // Channel File
        status: true, // check login status
        cookie: true, // enable cookies to allow the server to access the session
        xfbml: true // parse XFBML
    });

    FB.Event.subscribe('auth.authResponseChange', MYAPP.handleResponses);

};

/**
  * @desc Caricamento asincrono dello script di FB
  * @param {Object} document
  *	@module MYAPP
  *
*/

(function (d) {

    var js, id = 'facebook-jssdk',

        ref = d.getElementsByTagName('script')[0];

    if (d.getElementById(id)) {
        return;
    }

    js = d.createElement('script');
    js.id = id;
    js.async = true;
    js.src = "//connect.facebook.net/it_IT/all.js#xfbml=1&appId=" + MYAPP.globals.APP_ID;

    ref.parentNode.insertBefore(js, ref);

}(document));

/**
  * @desc Init dell'app delegato all'evento proprietario fbAsyncInit
*/
window.fbAsyncInit = MYAPP.initApp;
