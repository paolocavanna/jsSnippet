/**
 * MOPAR Reserved Area Modules v2.2.2
 *
 * © 2013-2014 Domino
 *
 * @author Andrea Blasio (andrea.blasio{at}domino.it)
 *
 * @dependencies {String} base_url
 *               {String} mopar_market market iso identifier (e.g.: 'it')
 *               {String} mopar_marketcode market code identifier (e.g.: '1000')
 *               {String} mopar_respath relative path to portal resources (e.g.: '/Resources/')
 *               {String} mopar_brand brand identifier (e.g.: 'Owner')
 *               {String} mopar_brandcode brand code (e.g.: '83')
 *               {String} mopar_language language iso identifier (e.g.: 'it')
 *               {String} mopar_languagecode mopar language code (e.g.: '5')
 *               {String} myMoparRegistrationURL url of brand-specific user registration page (e.g.: 'https://owner.mopar.eu/it/it/fiatregistration')
 *               {String} mopar_lang language iso identifier (e.g.: 'it')
 *               {String} eGarageServiceDomainUrl egarage web service url (e.g.: 'https://owner.mopar.eu/eGarageService.svc')
 *               {String} privacy_id_entity privacy brand identity identifier // to be redefined
 *               {String} privacy_disclaimer_code privacy disclaimer code // to be redefined
 *               {String} privacy_source privacy portal identifier // to be redefined
 *
 * @cookies mrd		(mopar referral data)
 *						---> contains info concerning the referring *.mopar.eu branded portal
 *			mflru	(mopar failed login redirect url)
 *						---> registration page url
 *			dbg		(debug mode)
 *						---> toggles debug mode (0|1)
 *                           deleted by default upon referring brand overlay display
 *			sso		(referring sso portal brand code)
 *						---> stores the referring sso portal brand code;
 *                           see loader_ok.js for further insight
 *			tgt		(target loader destination)
 *						---> stores the target loader destination identifier;
 *                           see loader_ok.js for further insight 
 *			JOGInfo	(server generated at login)
 *						---> stores currently authenticated user's data
 *	 
 * @module MOPAR
 */

if (typeof MOPAR === "undefined") {

	var MOPAR = {};

}

if (typeof JOG === "undefined") {

	var JOG = {};

}

(function(APP, global, printMsg, GetUrlParam, pad, reverseDate){

/**
 * WARNING:
 *
 * allows to dynamically switch between production
 * and test endpoints
 *
 * @module MOPAR
 * @property isProductionEnvironment 
 * @type Boolean
 */

// Inherit the value from super-global variable "isProductionEnvironment" set on the parent page.
APP.isProductionEnvironment = (typeof (isProductionEnvironment) !== 'undefined' ? !!isProductionEnvironment : false);

/**
 * encapsulates application constant and dynamic global settings
 *
 * @module MOPAR
 * @submodule _CONFIGURATION_
 */

APP._CONFIGURATION_ = {
	
	/**********************************************************/
	/* general                                                */
	/**********************************************************/
	
	/**
	 * defines correspondencies between MOC native
	 * IETF language tags and IAM ISO_3166_1_alpha_2 required standard
	 * See: http://it.wikipedia.org/wiki/ISO_3166-1_alpha-2
	 *
	 * @property IETF_to_ISO_3166_1_alpha_2 
	 * @type Object
	 */
	 
	IETF_to_ISO_3166_1_alpha_2: {
		
		"it": "it",
		"es": "es",
		"be": "be",
		"fr": "fr",
		"uk": "gb",
		"de": "de",
		"nl": "nl",
		"pl": "pl",
		"pt": "pt",
		"se": "sv",
		"ie": "ie",
		"at": "at",
		"gr": "gr",
		"ch": "ch",
		"ru": "ru",
		"za": "za",
		"ma": "ma",
		"hu": "hu",
		"cz": "cs",
		"sk": "sk", 
		"rs": "rs"
		
	},
	
	/**
	 * defines constant values associated with
	 * user statuses
	 *
	 * @property userStatus
	 * @type Object
	 */
	 
	userStatus: {
	
		// case: local login.
		IS_LOCAL: "0",
		// case: social login attempt of an unknown user
		IS_UNKNOWN: "21",
		// case: either local or social login attempt by a user
		// already registered in a FCA portal
		IS_FCA: "30",
		// case: either local or social login attempt by a user
		// already registered in the MOC (Mopar) platform
		IS_MOC: "31"
	
	},

	/**
	 * defines constant values associated with
	 * user types.
	 *
	 * @property userType
	 * @type Object
	 */
	userType: {
		ENTHUSIAST: "1",
		OWNER: "2",
		LIFETIME: "3"
	},
	
	/**
	 * defines constant values associated with
	 * vin validation statuses
	 *
	 * @property vinStatus
	 * @type Object
	 */
	
	vinStatus: {
		
		EPER_VALIDATED: "1",
		CRM_VALIDATED: "2",
		SYNTAX_CHECK_VALIDATED: "3",
		NOT_VALIDATED: "4"
	
	},

	Errors: {
		JOG_SERVICE: {
			DUPLICATE_USERNAME: "-5011",
			MEMBERSHIP_VALIDATE: {
				UNKNOWN_CARD: "1000",
				UNKNOWN_CARD_4_USERNAME: "1002",
				WRONG_PASSWORD: "1"
			}
		},
		INTERNAL: {
			AUTHENTICATION_FAILED: "authentication_failed",
			SOCIAL_LOGIN_PREFILL: "21",
			FCA_LOGIN_PREFILL: "30",
			MOC_LOGIN_PREFILL: "31"
		}
	},
	
	/**
	 * jeep brand code
	 *
	 * @property JEEP_BRAND_CODE
	 * @type String
	 */
	
	JEEP_BRAND_CODE: "57",
	
	/**
	 * ePer LANG parameter is dynamically set at runtime;
	 * defines exceptional correspondencies between mopar_lang values
	 * and ePer service LANG parameter value;
	 *
	 * @property ePerLanguageHashMap
	 * @type Object
	 */
	
	ePerLanguageHashMap: {
		
		// english
		"en": "en-US",
		// czech
		"cs": "cs-CZ",
		// danish
		"da": "da-DK",
		// greek
		"el": "el-GR",
		// norwegian
		"nn": "nn-NO",
		// slovenian
		"sl": "sl-SI",
		// swedish
		"sv": "sv-SE"
	
	},
	
	/**
	 * defines eGarage3.0 <privacyFlag /> string contraints
	 * and default settings; see Privacy class for further insight
	 *
	 * @property privacy 
	 * @type Object
	 */
	
	privacy: {
	
		channelStrLength: 27,
		defaultChannelsHash: {
		
			"1": "U",
			"2": "U",
			"3": "U",
			"4": "U",
			"C": "U",
			"P": "U",
			"G": "U",
			"E": "U"
			
		},
		
		idIdentity: privacy_identity,
		disclaimerCode: privacy_disclaimer_code,
		source: privacy_source
		
	},
	
	/**
	 * defines sso settings: Ping Federate/IAM endpoints and related parameters
	 *
	 * @property SSO 
	 * @type Object
	 */
	
	SSO: {
		
		// ping / siteminder login endpoints
		SITEMINDER_AGENT_ENDPOINT: (APP.isProductionEnvironment) ?
			"https://sso.extra.chrysler.com/siteminderagent/forms/customlogin.fcc" :
					"https://sso-stg.extra.chrysler.com/siteminderagent/forms/customlogin.fcc",
				
		LOGIN_FORM_TARGET_URL: (APP.isProductionEnvironment) ?
			"https://sso.extra.chrysler.com/cgi-bin/JOGredirect.cgi?env=prd&appID=EMEAFIATJOG&PartnerSpId=https%3A%2F%2Fws-jog.jeep.com%2Ffederation%2FentityID&IdpAdapterId=B2CSM&TargetResource=https%3A%2F%2Fws-jog.jeep.com%2Ffederation%2FentityID" :
					"https://sso-stg.extra.chrysler.com/cgi-bin/JOGredirect.cgi?env=stg&appID=EMEAFIATJOG&PartnerSpId=https://ws-jog.cert.jeep.com/federation/entityID&IdpAdapterId=B2CSM&TargetResource=https%3A%2F%2Fdev-iis.fiat.com%2Fmodule.php%2Fsaml%2Fsp%2Fmetadata.php%2Fdefault-sp",
			
		// IAM endpoint suitable for password change via authentication token after password reset
		IAM_PASSWORD_RESET_ENDPOINT: (APP.isProductionEnvironment) ? "https://lr.fiat.com/IdmB2c/web/ResetPassword" :
				"https://lr-test.fiat.com/IdmB2c/web/ResetPassword",
		
		// note: jog store does not currently have any certification environment: both cert. and prod. target urls point to prod.
		JOGSTORE_TARGET_URL: (APP.isProductionEnvironment) ? "federation.chrysler.com/idp/startSSO.ping?" + 
	                                                       "PartnerSpId=https:%2F%2Fjogstore.jeep.com%2Fgb_en%2Fjog%2Fsso%2Ffederation" + 
						                                   "&IdpAdapterId=#ADAPTER_ID_PARAM_VALUE#" + 
						                                   "&TargetResource=https%3A%2F%2Fjogstore.jeep.com%2F#ISO_3166_1_alpha_2_MARKET#_#LANGUAGE#" :	
				"federation.chrysler.com/idp/startSSO.ping?" + 
			    "PartnerSpId=https:%2F%2Fjogstore.jeep.com%2Fgb_en%2Fjog%2Fsso%2Ffederation" + 
			    "&IdpAdapterId=#ADAPTER_ID_PARAM_VALUE#" + 
			    "&TargetResource=https%3A%2F%2Fjogstore.jeep.com%2F#ISO_3166_1_alpha_2_MARKET#_#LANGUAGE#",
		
		//adapters names: saml assertion to ping 
		IDP_ADAPTER_IDS_HASHMAP: {
		
			"b2c": "B2CSM",
			"linkedin": "LinkedIn",
			"yahoo": "Yahoo",
			"twitter": "Twitter",
			"google": "Googleplus",
			"facebook": "Facebook"
		
		}												   
				
	},
	
	/**
	 * defines application debug status; in order to locally trace
	 * application data on your local machine use the following
	 * Javascript console statements:
	 *
	 * -> turn on debugging mode:  APP.Storage.setCookie("dbg", "1", 365);
	 * -> turn off debugging mode: APP.Storage.deleteCookie("dbg");
	 *
	 * @property debugMode 
	 * @type Boolean
	 */
	
	debugMode: false,
	
	/**
	 * defines ePer JSONP queries maximum time
	 *
	 * @property ePerJSONPServicesTimeout 
	 * @type Number
	 */
	
	ePerJSONPServicesTimeout: 35000,

	/**
	 * defines redirects delay time
	 *
	 * @property redirectsDelay 
	 * @type Number
	 */
	
	redirectsDelay: 3000,
	
	/**********************************************************/
	/* session                                                */
	/**********************************************************/
	
	/**
	 * defines wheter the application should keep session alive
	 *
	 * @property keepSessionAlive 
	 * @type Boolean
	 */
	 
	keepSessionAlive: true,
	
	/**
	 * defines session check query timeout
	 *
	 * @property sessionCheckTimeout 
	 * @type Number
	 */
	
	sessionCheckTimeout: 3500,
	
	/**
	 * defines the time interval (in milliseconds) between every
	 * session refresh attempt
	 *
	 * @property keepSessionAliveInterval 
	 * @type Number
	 */
	 
	keepSessionAliveInterval: 120000,
	
	/**
	 * defines the minimum time interval (in milliseconds) between every
	 * session refresh attempt
	 *
	 * @property minKeepSessionAliveInterval 
	 * @type Number
	 */
	 
	minKeepSessionAliveInterval: 120000,
	
	/**
	 * interval ID of setInterval statement (session renewal)
	 *
	 * @property keepSessionAliveIntervalID 
	 * @type Number
	 */
	
	keepSessionAliveIntervalID: 0,
	
	/**********************************************************/
	/* private eper token                                     */
	/**********************************************************/
	
	/**
	 * defines wheter the application should auto refresh
	 * the private ePer token
	 *
	 * @property autoRenewEperToken 
	 * @type Boolean
	 */
	
	autoRenewEperToken: false,
	
	/**
	 * defines the time interval (in milliseconds) between every
	 * private ePer token refresh attempt
	 *
	 * @property autoRenewEperTokenInterval 
	 * @type Number
	 */
	
	autoRenewEperTokenInterval: 120000,
	
	/**
	 * interval ID of setInterval statement (private ePer token renewal)
	 *
	 * @property autoRenewEperTokenIntervalID 
	 * @type Number
	 */
	
	autoRenewEperTokenIntervalID: 0,

	/**********************************************************/
	/* paths                                                  */
	/**********************************************************/
	
	/**
	 * defines current page base url
	 *
	 * @property baseURL 
	 * @type String
	 */
					
	baseURL: base_url,
	
	/**
	 * defines web services and endpoints URLs;
	 * placeholders are replaced with actual values (retrieved via
	 * globally available cms variables [public area] or "mrd" and "mflru"
	 * cookies [authenticated area]) upon application initialization:
	 * see APP.Settings.update() method for further insight
	 *
	 * @property Paths 
	 * @type Object
	 */
	
	Paths: {
		
		// eGarage
		jogService: global["eGarageServiceDomainUrl"] || global["JogServiceDomainUrl"] || "",
		
		// ePer
		ePer: "https://eper.parts.fiat.com/b2cServices",
		
		// redirect endpoints
		myMoparRegPageRedirectURL: global["myMoparRegistrationURL"] || global["jogRegistrationURL"] || "",
		unauthorizedAccessRedirectURL: global["myMoparRegistrationURL"] || global["jogRegistrationURL"] || ""
	
	},

	/**********************************************************/
	/* cookies                                                */
	/**********************************************************/

	/**
	 * defines application cookies domain
	 *
	 * @property cookieDomain 
	 * @type String
	 */
	 
	cookieDomain: ".jeep.com",
	
	/**
	 * defines application cookies expiration time (expressed in days)
	 *
	 * @property cookiesExpirationTime 
	 * @type Number
	 */
	
	cookiesExpirationTime: 365,
	
	/**
	 * maps brand codes to brand info
	 *
	 * @property brandInfoHashmap 
	 * @type Object
	 */
	
	brandInfoHashmap: {
		
		"00": {
		
			extendedName: "Fiat",
			shortName: "fiat"
		
		},
		
		"57": {
		
			extendedName: "Jeep",
			shortName: "jeep"
		
		},
		
		"66": {
		
			extendedName: "Abarth",
			shortName: "abarth"
		
		},
		
		"70": {
		
			extendedName: "Lancia",
			shortName: "lancia"
		
		},
		
		"83": {
		
			extendedName: "Alfaromeo",
			shortName: "alfaromeo"
		
		},
		
		"77": {
		
			extendedName: "Fiat Professional",
			shortName: "fiatprofessional"
		
		},
		
		"78": {
		
			extendedName: "Camper",
			shortName: "camper"
		
		}
	
	},

	/**********************************************************/
	/* events                                                 */
	/**********************************************************/
	
	/**
	 * defines application event names
	 *
	 * @property Events 
	 * @type Object
	 */
	
	Events: {
	
		/**********************************************************/
		/* application level events                               */
		/**********************************************************/
		
		isBusy: "MOPAR:isBusy", // triggers loading overlay
		isReady: "MOPAR:isReady", // removes loading overlay
		sessionStatusChange: "MOPAR:sessionStatusChange", // broacasted after every session check (e.g.: page load, logout)
		expiredSession: "MOPAR:expiredSession", // broacasted upon positive expired session check
		logout: "MOPAR:logout", // user logout action
		
		/**********************************************************/
		/* web services errors events                             */
		/**********************************************************/
		
		eGarageError: "SERVICES:eGarageError", // broadcasted upon JOGService error positive check
		ePerError: "SERVICES:ePerError", // broadcasted upon ePer error positive check
		internalError: "SERVICES:internalError", // broadcasted upon Janrain error positive check
		
		/**********************************************************/
		/* AU | auth area events                                  */
		/**********************************************************/
		
		AUuserData: "AU:userData", // user data retrieval complete
		AUePERTokenReady: "AU:ePERTokenReady", // ePer private token retrieved
		
		/**********************************************************/
		/* PA | public area events                                */
		/**********************************************************/
		
		PAloginFormSubmit: "PA:loginFormSubmit", // user login form submission
		PAuserPasswordReset: "PA:userPasswordReset", // user password reset action
		PAuserPasswordResetDone: "PA:userPasswordResetDone", // broadcasted upon user password reset action success
		PAuserPasswordRescue: "PA:userPasswordRescue", // user password update action in case of exception (e.g.: user locked)
		PAuserPasswordRescueDone: "PA:userPasswordRescueDone", // broadcasted upon user password update (in case of exception; e.g.: user locked) action success
		PAregisterUser: "PA:registerUser", // registration form submit action
		PAuserRegistrationDone: "PA:userRegistrationDone", // broadcasted upon successful user registration (no double opt-in required)
		PAdoubleOptInRequired: "PA:doubleOptInRequired", // broadcasted upon successful user registration (double opt-in required)
		PAuserProfileCompletionDone: "PA:userProfileCompletionDone", // broadcasted upon successful user profile completion
		
		/* begin current vin verification events */
		PAverifyVin: "PA:verifyVin",
		PAverifyVinSuccess: "PA:verifyVinSuccess",
		PAverifyVinFail: "PA:verifyVinFail",
		PAverifyVinLocal: "PA:verifyVinLocal",
		PAverifyVinLocalSuccess: "PA:verifyVinLocalSuccess",
		PAverifyVinLocalFail: "PA:verifyVinLocalFail",
		/* end current vin verification events */
		
		/* begin new vin verification events */
		PAverifyMultipleVin: "PA:verifyMultipleVin",
		PAverifyMultipleVinResponse: "PA:verifyMultipleVinResponse",
		/* end new vin verification events */
		
		/* begin membership verification events */
		PAverifyMembership: "PA:verifyMembership",
		PAverifyMembershipSuccess: "PA:verifyMembershipSuccess",
		PAverifyMembershipFail: "PA:verifyMembershipFail",
		/* begin membership verification events */
		
		PAhasAuthInfo: "PA:hasAuthInfo", // broadcasted upon Ping/IAM auth info retrieval

		PAuserLoginFail: "PA:userLoginFail",
		PAuserLoginFCASuccess: "PA:userLoginFCASuccess",
		PAuserLoginSocialSuccess: "PA:userLoginUserSocialSuccess",
		PAregistrationDuplicateEmail: "PA:registrationDuplicateEmail"

	},

	/**********************************************************/
	/* constant identifiers                                   */
	/**********************************************************/
	
	/**
	 * defines constants suitable to uniquely
	 * identify different site micro areas
	 *
	 * @property Areas 
	 * @type Object
	 */
	
	Areas: {
	
		isRegisterArea: 1,
		isUserProfile: 2,
		isPasswordResetPage: 3,
		isPasswordChangePage: 4
		
	},
	
	/**********************************************************/
	/* dom identifiers                                        */
	/**********************************************************/	
	
	/**
	 * defines functions suitable to uniquely
	 * identify different site micro and macro areas
	 *
	 * @property AreaIdentifiers 
	 * @type Object
	 */
	
	AreaIdentifiers: {

		isRegisterArea: function isRegisterArea(){
					
			return ($(".lr__page").size() > 0);
		
		},
		
		isUserProfile: function isUserProfile(){
		
			return ($("div.user_profile").size() > 0);
		
		},

		isAuthArea: function isAuthArea(){
			
			return ($("a.profile").size() > 0 || $("#my-cars-header").size() > 0);
		
		},
		
		isPasswordResetPage: function isPasswordResetPage(){
			
			return ($("div.retrieve_pwd_form_wrap").size() > 0);
		
		},
		
		isPasswordChangePage: function isPasswordChangePage(){
			
			return ($("div.reset_pwd").size() > 0);
		
		}
	
	}

};

/**
 * encapsulates and manages global application settings:
 * market, language, brandCode, marketCode, ePerLanguage
 *
 * @module APP
 * @class Settings
 * @static
 */
 
APP.Settings = (function(){
	
	"use strict";
		
		// properties
	var globalSettings,
	
		// methods
		_update,
		_get;
	
	// default global settings
	globalSettings = {
		
		market: global["mopar_market"] || global["jog_market"],
		language: global["mopar_lang"] || global["jog_lang"],
		languageCode: global["mopar_languagecode"] || global["jog_languagecode"],
		brandCode: global["mopar_brandcode"] || global["jog_brandcode"],
		marketCode: global["mopar_marketcode"] || global["jog_marketcode"],
		ePerLanguage: ((global["mopar_lang"] || global["jog_lang"] || "it").toLowerCase() in APP._CONFIGURATION_.ePerLanguageHashMap) ?
							APP._CONFIGURATION_.ePerLanguageHashMap[(global["mopar_lang"] || global["jog_lang"] || "it").toLowerCase()] :
									(global["mopar_lang"] || global["jog_lang"] || "it").toLowerCase() + "-" + (global["mopar_lang"] || global["jog_lang"] || "it").toUpperCase()
	
	};
	
	/**
	 * returns a shallow copy of the global settings object
	 *  
	 * @method _get
	 * @return {Object} shallow copy of the global settings object
	 * @private
	 */
	
	_get = function _get(){
	
		return $.extend({}, globalSettings);
	
	}; // _get()

	/**
	 * updates global settings object, query models, paths with either
	 * globally available cms variables value (public area) or with 
	 * "mrd" and "mflru" cookies values (authenticated area); the "mrd"
	 * cookie is mandatory for the authenticated area to correctly work as 
	 * it specifies market, language and brand values that uniquely identify
	 * the referring brand portal
	 *  
	 * @method _update
	 * @return {Boolean} value indicating wheter the "mrd" cookie was found
	 * @private
	 */
	
	_update = function _update(){
	
		var tempCookieRefData,
			tempCookieRefDataArr,
			tempCookieRedURL,
			tempQueryModels,
			tempQueryModel,
			tempConfigurationPaths,
			tempConfigurationBrandMap,
			i;
		
		// retrieve "mrd" cookie value
		tempCookieRefData = APP.Storage.getCookie("mrd");
		
		// retrieve "mflru" cookie value
		tempCookieRedURL = APP.Storage.getCookie("mflru");
		
		// retrieve a reference to web services queries models object
		tempQueryModels = APP.Services.getModels();
		
		// retrieve a reference to configuration paths object
		tempConfigurationPaths = APP._CONFIGURATION_.Paths;
		
		// retrieve a reference to brand info hashmap object
		tempConfigurationBrandMap = APP._CONFIGURATION_.brandInfoHashmap;
		
		// assignment
		if (tempCookieRefData && ((tempCookieRefDataArr = tempCookieRefData.split("|")).length === 4)) {
			
			// global settings
			globalSettings.market = tempCookieRefDataArr[0].toLowerCase();
			globalSettings.language = tempCookieRefDataArr[1].toLowerCase();
			globalSettings.brandCode = tempCookieRefDataArr[2].toLowerCase();
			globalSettings.marketCode = tempCookieRefDataArr[3].toLowerCase();
			globalSettings.ePerLanguage = ((global["mopar_lang"] || global["jog_lang"]).toLowerCase() in APP._CONFIGURATION_.ePerLanguageHashMap) ?
												APP._CONFIGURATION_.ePerLanguageHashMap[(global["mopar_lang"] || jog_lang).toLowerCase()] :
														(global["mopar_lang"] || global["jog_lang"]).toLowerCase() + "-" + (global["mopar_lang"] || global["jog_lang"]).toUpperCase();
			
		}
		
		// update configuration paths
		for (i in tempConfigurationPaths) {
		
			if (tempConfigurationPaths.hasOwnProperty(i)) {
				
				tempConfigurationPaths[i] = tempConfigurationPaths[i].replace(/#MARKET#/g, globalSettings.market);
				tempConfigurationPaths[i] = tempConfigurationPaths[i].replace(/#LANGUAGE#/g, globalSettings.language);
				tempConfigurationPaths[i] = tempConfigurationPaths[i].replace(/#BRAND_NAME#/g, tempConfigurationBrandMap[globalSettings.brandCode].resetPWDBrandName);
			
			}
		
		}
		
		// update expired session redirect path
		if (tempCookieRedURL) {
		
			tempConfigurationPaths.unauthorizedAccessRedirectURL = tempCookieRedURL;
		
		}
		
		// update services paths
		for (i in tempQueryModels) {
			
			if (tempQueryModels.hasOwnProperty(i)) {
				
				tempQueryModel = tempQueryModels[i];
				
				if (tempQueryModel.url) {
					
					tempQueryModel.url = tempQueryModel.url.replace(/#MARKET#/g, globalSettings.market);
				
				}
			
			}
		
		}
		
		// cast cookie value to a boolean
		return !!tempCookieRefData;
	
	}; // _update()
	
	return {
		
		/**
		 * returns a shallow copy of the global settings object
		 *  
		 * @method get
		 * @return {Object} shallow copy of the global settings object
		 */
		 
		get: _get,
		
		/**
		 * updates global settings object, query models, paths with either
		 * globally available cms variables (public area) or values retrieved
		 * via "mrd" and "mflru" cookies (authenticated area); the "mrd" cookie
		 * is mandatory for the authenticated area to correctly work as it
		 * specifies market, language and brand values that uniquely identify
		 * the referring brand portal
		 *  
		 * @method update
		 * @return {Boolean} value indicating wheter the "mrd" cookie was found
		 */
		
		update: _update
		
	};

}()); // Settings

/**
 * manages console debug output
 *
 * @module APP
 * @class Debug
 * @static
 */

APP.Debug = (function(){
	
	"use strict";
		
		// methods
	var _log,
		_alert;
	
	/**
	 * logs debug info in console
	 *
	 * @method _log
	 * @param {String} content content to be output in console
	 * @param {String} [type] type of content to be output in console
	 * @private
	 */
	
	_log = function _log(content, type){
		
		if (!APP._CONFIGURATION_.debugMode) {
		
			return;
		
		}
		
		if (!console || typeof console.log !== "function") {
		
			return;
		
		}
		
		switch (type) {
			
			case "dir":
				console.dir(content);
				break;
			case "dirxml":
				console.dirxml(content);
				break;
			case "alert":
				alert(content);
				break;
			default:
				content = pad("*** " + content + " ", 80, "-", 2);
				console.log(content);
				break;
		
		};
		
		console.log(" -> " + new Date().toISOString());
	
	}; // _log()
	
	/**
	 * logs debug info in an alert
	 *
	 * @method _alert
	 * @param {String} content content to be output in an alert
	 * @private
	 */
	
	_alert = function _alert(content){
		
		_log(content, "alert");
	
	}; // _alert()

	return {
		
		/**
		 * logs debug info in console
		 *
		 * @method _log
		 * @param {String} content content to be output in console
		 * @param {String} [type] type of content to be output in console
		 */
		
		log: _log,
		
		/**
		 * logs debug info in an alert
		 *
		 * @method _alert
		 * @param {String} content content to be output in an alert
		 */
		
		alert: _alert
	
	}

}());

/**
 * encapsulates, retrieves and renders xml and json templates
 * required in order to query web services (JOGService, eGarage, ePer)
 *
 * @module APP
 * @class Templates
 * @static
 */

APP.Templates = (function(){

	"use strict";
		
		// methods
	var _renderTemplate,
		_getTemplate,
		
		// properties
		JOG_TEMPLATES;
		
		// default assignments
		JOG_TEMPLATES = {};
	
	/**********************************************************/
	/* XML templates                                          */
	/**********************************************************/

	JOG_TEMPLATES.jogServiceValidateMembershipXML = [];
	JOG_TEMPLATES.jogServiceValidateMembershipXML.push("<?xml version=\"1.0\" encoding=\"utf-8\"?>");
	JOG_TEMPLATES.jogServiceValidateMembershipXML.push("<Request xmlns=\"http://schemas.datacontract.org/2004/07/FCA.WebServices.eGarage.Protocols\">");
	JOG_TEMPLATES.jogServiceValidateMembershipXML.push("<membershipCard><![CDATA[#membershipCard#]]></membershipCard>");
	JOG_TEMPLATES.jogServiceValidateMembershipXML.push("<vin><![CDATA[#vin#]]></vin>");
	JOG_TEMPLATES.jogServiceValidateMembershipXML.push("<email><![CDATA[#email#]]></email>");7
	JOG_TEMPLATES.jogServiceValidateMembershipXML.push("<password><![CDATA[#password#]]></password>");
	JOG_TEMPLATES.jogServiceValidateMembershipXML.push("</Request>");
	
	JOG_TEMPLATES.jogServiceCreateUserXML = [];
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<?xml version=\"1.0\" encoding=\"utf-8\"?>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<Request xmlns=\"http://schemas.datacontract.org/2004/07/FCA.WebServices.eGarage.Protocols\">");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<language><![CDATA[#language#]]></language>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<brand><![CDATA[#brand#]]></brand>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<market><![CDATA[#market#]]></market>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<username><![CDATA[#username#]]></username>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<password><![CDATA[#password#]]></password>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<question1><![CDATA[#question1#]]></question1>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<answer1><![CDATA[#answer1#]]></answer1>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<question2><![CDATA[#question2#]]></question2>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<answer2><![CDATA[#answer2#]]></answer2>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<firstName><![CDATA[#firstName#]]></firstName>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<lastName><![CDATA[#lastName#]]></lastName>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<title><![CDATA[#title#]]></title>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<companyName><![CDATA[#companyName#]]></companyName>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<picture><![CDATA[#picture#]]></picture>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<address><![CDATA[#address#]]></address>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<city><![CDATA[#city#]]></city>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<province><![CDATA[#province#]]></province>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<zipCode><![CDATA[#zipCode#]]></zipCode>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<country><![CDATA[#country#]]></country>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<email><![CDATA[#email#]]></email>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<phone1><![CDATA[#phone1#]]></phone1>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<phone2><![CDATA[#phone2#]]></phone2>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<phone3><![CDATA[#phone3#]]></phone3>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<mobilePhone1><![CDATA[#mobilePhone1#]]></mobilePhone1>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<mobilePhone2><![CDATA[#mobilePhone2#]]></mobilePhone2>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<mobilePhone3><![CDATA[#mobilePhone3#]]></mobilePhone3>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<fax><![CDATA[#fax#]]></fax>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<fiscalCode><![CDATA[#fiscalCode#]]></fiscalCode>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<vatNumber><![CDATA[#vatNumber#]]></vatNumber>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<gender><![CDATA[#gender#]]></gender>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<birthdate><![CDATA[#birthdate#]]></birthdate>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<cityOfBirth><![CDATA[#cityOfBirth#]]></cityOfBirth>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<relationship><![CDATA[#relationship#]]></relationship>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<interests><![CDATA[#interests#]]></interests>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<sports><![CDATA[#sports#]]></sports>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<flagPrivacy><![CDATA[#flagPrivacy#]]></flagPrivacy>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<socialId><![CDATA[#socialId#]]></socialId>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<socialProvider><![CDATA[#socialProvider#]]></socialProvider>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<profileUrl><![CDATA[#profileUrl#]]></profileUrl>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<forceDoubleOptIn><![CDATA[#forceDoubleOptIn#]]></forceDoubleOptIn>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<membershipCard><![CDATA[#membershipCard#]]></membershipCard>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<vin><![CDATA[#vin#]]></vin>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<userType><![CDATA[#userType#]]></userType>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<vinStatus><![CDATA[#vinStatus#]]></vinStatus>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<data><![CDATA[#data#]]></data>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("<otherVins>#otherVins#</otherVins>");
	JOG_TEMPLATES.jogServiceCreateUserXML.push("</Request>");
	
	JOG_TEMPLATES.jogServiceCreateUserOtherVinXML = [];
	JOG_TEMPLATES.jogServiceCreateUserOtherVinXML.push("<VinInfo>");
	JOG_TEMPLATES.jogServiceCreateUserOtherVinXML.push("<vin><![CDATA[#vin#]]></vin>");
	JOG_TEMPLATES.jogServiceCreateUserOtherVinXML.push("<status><![CDATA[#vinStatus#]]></status>");
	JOG_TEMPLATES.jogServiceCreateUserOtherVinXML.push("</VinInfo>");
	
	// note: suitable for user profile cache retrieved via 'JOGInfo' cookie
	JOG_TEMPLATES.jogServiceUserProfileXML = [];
	JOG_TEMPLATES.jogServiceUserProfileXML.push("<?xml version=\"1.0\" encoding=\"utf-8\"?>");
	JOG_TEMPLATES.jogServiceUserProfileXML.push("<Request xmlns=\"http://schemas.datacontract.org/2004/07/FCA.WebServices.eGarage.Protocols\">");
	JOG_TEMPLATES.jogServiceUserProfileXML.push("<uid><![CDATA[#uid#]]></uid>");
	JOG_TEMPLATES.jogServiceUserProfileXML.push("<username><![CDATA[#username#]]></username>");
	JOG_TEMPLATES.jogServiceUserProfileXML.push("<firstName><![CDATA[#firstName#]]></firstName>");
	JOG_TEMPLATES.jogServiceUserProfileXML.push("<lastName><![CDATA[#lastName#]]></lastName>");
	JOG_TEMPLATES.jogServiceUserProfileXML.push("<fullName><![CDATA[#fullName#]]></fullName>");
	JOG_TEMPLATES.jogServiceUserProfileXML.push("<language><![CDATA[#language#]]></language>");
	JOG_TEMPLATES.jogServiceUserProfileXML.push("<provider><![CDATA[#provider#]]></provider>");
	JOG_TEMPLATES.jogServiceUserProfileXML.push("</Request>");
	
	JOG_TEMPLATES.jogServiceCompleteUserXML = [];
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<?xml version=\"1.0\" encoding=\"utf-8\"?>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<Request xmlns=\"http://schemas.datacontract.org/2004/07/FCA.WebServices.eGarage.Protocols\">");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<language><![CDATA[#language#]]></language>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<brand><![CDATA[#brand#]]></brand>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<market><![CDATA[#market#]]></market>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<userId><![CDATA[#userId#]]></userId>");	
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<username><![CDATA[#username#]]></username>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<firstName><![CDATA[#firstName#]]></firstName>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<lastName><![CDATA[#lastName#]]></lastName>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<title><![CDATA[#title#]]></title>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<companyName><![CDATA[#companyName#]]></companyName>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<picture><![CDATA[#picture#]]></picture>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<address><![CDATA[#address#]]></address>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<city><![CDATA[#city#]]></city>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<province><![CDATA[#province#]]></province>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<zipCode><![CDATA[#zipCode#]]></zipCode>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<country><![CDATA[#country#]]></country>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<phone1><![CDATA[#phone1#]]></phone1>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<phone2><![CDATA[#phone2#]]></phone2>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<phone3><![CDATA[#phone3#]]></phone3>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<mobilePhone1><![CDATA[#mobilePhone1#]]></mobilePhone1>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<mobilePhone2><![CDATA[#mobilePhone2#]]></mobilePhone2>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<mobilePhone3><![CDATA[#mobilePhone3#]]></mobilePhone3>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<fax><![CDATA[#fax#]]></fax>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<fiscalCode><![CDATA[#fiscalCode#]]></fiscalCode>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<vatNumber><![CDATA[#vatNumber#]]></vatNumber>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<gender><![CDATA[#gender#]]></gender>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<birthdate><![CDATA[#birthdate#]]></birthdate>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<cityOfBirth><![CDATA[#cityOfBirth#]]></cityOfBirth>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<relationship><![CDATA[#relationship#]]></relationship>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<interests><![CDATA[#interests#]]></interests>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<sports><![CDATA[#sports#]]></sports>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<flagPrivacy><![CDATA[#flagPrivacy#]]></flagPrivacy>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<membershipCard><![CDATA[#membershipCard#]]></membershipCard>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<vin><![CDATA[#vin#]]></vin>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<userType><![CDATA[#userType#]]></userType>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<vinStatus><![CDATA[#vinStatus#]]></vinStatus>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<data><![CDATA[#data#]]></data>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("<otherVins>#otherVins#</otherVins>");
	JOG_TEMPLATES.jogServiceCompleteUserXML.push("</Request>");
	
	JOG_TEMPLATES.jogServiceChangePasswordXML = [];
	JOG_TEMPLATES.jogServiceChangePasswordXML.push("<?xml version=\"1.0\" encoding=\"utf-8\"?>");
	JOG_TEMPLATES.jogServiceChangePasswordXML.push("<Request xmlns=\"http://schemas.datacontract.org/2004/07/FCA.WebServices.eGarage.Protocols\">");
	JOG_TEMPLATES.jogServiceChangePasswordXML.push("<oldPassword><![CDATA[#oldPassword#]]></oldPassword>");
	JOG_TEMPLATES.jogServiceChangePasswordXML.push("<newPassword><![CDATA[#newPassword#]]></newPassword>");
	JOG_TEMPLATES.jogServiceChangePasswordXML.push("</Request>");
	
	JOG_TEMPLATES.jogServiceResetPasswordXML = [];
	JOG_TEMPLATES.jogServiceResetPasswordXML.push("<?xml version=\"1.0\" encoding=\"utf-8\"?>");
	JOG_TEMPLATES.jogServiceResetPasswordXML.push("<Request xmlns=\"http://schemas.datacontract.org/2004/07/FCA.WebServices.eGarage.Protocols\">");
	JOG_TEMPLATES.jogServiceResetPasswordXML.push("<language><![CDATA[#language#]]></language>");
	JOG_TEMPLATES.jogServiceResetPasswordXML.push("<market><![CDATA[#market#]]></market>");
	JOG_TEMPLATES.jogServiceResetPasswordXML.push("<brand><![CDATA[#brand#]]></brand>");
	JOG_TEMPLATES.jogServiceResetPasswordXML.push("<username><![CDATA[#username#]]></username>");
	JOG_TEMPLATES.jogServiceResetPasswordXML.push("</Request>");
	
	// template: generic error
	JOG_TEMPLATES.GenericErrorXML = [];
	JOG_TEMPLATES.GenericErrorXML.push("<Request xmlns=\"http://schemas.datacontract.org/2004/07/FCA.WebServices.eGarage.Protocols\">");
	JOG_TEMPLATES.GenericErrorXML.push("xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">");
	JOG_TEMPLATES.GenericErrorXML.push("<Error xmlns:a=\"http://schemas.datacontract.org/2004/07/FGAPortals.WebServices.Exceptions\">");
	JOG_TEMPLATES.GenericErrorXML.push("<a:code>999</a:code>");
	JOG_TEMPLATES.GenericErrorXML.push("<a:description></a:description>");
	JOG_TEMPLATES.GenericErrorXML.push("</Error>");
	JOG_TEMPLATES.GenericErrorXML.push("<code>999</code>");
	JOG_TEMPLATES.GenericErrorXML.push("</Request>");
	
	// template: custom error
	JOG_TEMPLATES.CustomErrorXML = [];
	JOG_TEMPLATES.CustomErrorXML.push("<Request xmlns=\"http://schemas.datacontract.org/2004/07/FCA.WebServices.eGarage.Protocols\">");
	JOG_TEMPLATES.CustomErrorXML.push("xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">");
	JOG_TEMPLATES.CustomErrorXML.push("<Error xmlns:a=\"http://schemas.datacontract.org/2004/07/FGAPortals.WebServices.Exceptions\">");
	JOG_TEMPLATES.CustomErrorXML.push("<a:code>#errorCode#</a:code>");
	JOG_TEMPLATES.CustomErrorXML.push("<a:description></a:description>");
	JOG_TEMPLATES.CustomErrorXML.push("</Error>");
	JOG_TEMPLATES.CustomErrorXML.push("<code>#errorCode#</code>");
	JOG_TEMPLATES.CustomErrorXML.push("</Request>");
	
	// template iam password *change* via authentication token after password *reset*
	JOG_TEMPLATES.IAMPasswordResetHTMLTemplate = [];
	JOG_TEMPLATES.IAMPasswordResetHTMLTemplate.push("<form id='passwordChange' action='#IAM_PASSWORD_RESET_ENDPOINT#' method='POST'>");
	JOG_TEMPLATES.IAMPasswordResetHTMLTemplate.push("<input id='IAMToken' name='tknRstPwd' value='#IAMToken#' type='hidden'>");
	JOG_TEMPLATES.IAMPasswordResetHTMLTemplate.push("<input id='userName' name='username' value='#userName#' type='hidden'>");
	JOG_TEMPLATES.IAMPasswordResetHTMLTemplate.push("<input id='appName' name='app' value='#appName#' type='hidden'>");
	JOG_TEMPLATES.IAMPasswordResetHTMLTemplate.push("<input id='lang' name='lang' value='#lang#' type='hidden'>");
	JOG_TEMPLATES.IAMPasswordResetHTMLTemplate.push("<input id='password' name='password' value='' type='hidden'>");
	JOG_TEMPLATES.IAMPasswordResetHTMLTemplate.push("<input id='repassword' name='repassword' value='' type='hidden'>");
	JOG_TEMPLATES.IAMPasswordResetHTMLTemplate.push("</form>");
	
	/**********************************************************/
	/* HTML templates                                         */
	/**********************************************************/
	
	// template: login form markup
	JOG_TEMPLATES.SSOLoginFormHTML = [];
	JOG_TEMPLATES.SSOLoginFormHTML.push("<form id=\"form_799764\" method=\"post\" action=\"#SITEMINDER_AGENT_ENDPOINT#\">");
	JOG_TEMPLATES.SSOLoginFormHTML.push("<input type=\"hidden\" value=\"\" maxlength=\"255\" name=\"USER\" id=\"username\">");
	JOG_TEMPLATES.SSOLoginFormHTML.push("<input type=\"hidden\" value=\"\" maxlength=\"255\" name=\"PASSWORD\" id=\"pass\">");
	JOG_TEMPLATES.SSOLoginFormHTML.push("<input name=\"target\" type=\"hidden\" id=\"target\" value=\"#LOGIN_FORM_TARGET_URL#\"/>");
	JOG_TEMPLATES.SSOLoginFormHTML.push("<input type=\"hidden\" value=\"\" name=\"pf.ok\">");
	JOG_TEMPLATES.SSOLoginFormHTML.push("<input type=\"hidden\" value=\"\" name=\"pf.cancel\">");
	JOG_TEMPLATES.SSOLoginFormHTML.push("</form>");
	
	/**********************************************************/
	/* JSON templates                                         */
	/**********************************************************/
	
	JOG_TEMPLATES.GenericEPerError = [];
	JOG_TEMPLATES.GenericEPerError.push("{ \"vi\": { \"errorcode\": \"999\" } }");
	
	JOG_TEMPLATES.InvalidVINError = [];
	JOG_TEMPLATES.InvalidVINError.push("{ \"vi\": { \"errorcode\": \"8\" } }");
	
	// private methods
	
	/**
	 * retrieves a template string
	 *  
	 * @method _getTemplate
	 * @param {String} templateName Name of template to be retrieved
	 * @return {String} Xml or Json string
	 * @private
	 */
	 
	_getTemplate = function _getTemplate(templateName){
	
		if (JOG_TEMPLATES.hasOwnProperty(templateName)) {
		
			return JOG_TEMPLATES[templateName].join("");
		
		}
		
	}; // _getTemplate()
	
	/**
	 * renders a template: placeholders are replaced with the corresponding
	 * "templateData" object properties values; empty xml nodes are optionally
	 * removed depending on webservices specs
	 *  
	 * @method _renderTemplate
	 * @param {String} templateString String containing the labelized html or xml tree
	 * @param {Object} templateData Its properties names are matched against the labels
	 *                 contained in "templateString"; matching elements determine
	 *                 the substitution of template labels with the corresponding property values
	 * @return {String} Xml or Json string suitable for either interface updates
	 *                  or Web services queries
	 * @private
	 */
		
	_renderTemplate = function _renderTemplate(templateString, templateData){
	
		var i;
		
		for (i in templateData) {
		
			if (templateData.hasOwnProperty(i)) {
				
				// cast template data to string
				switch (typeof templateData[i]) {
				
					case "number":
						templateData[i] = templateData[i] + "";
						break;
					case "boolean":
						templateData[i] = templateData[i].toString();
						break;
				
				}
				
				if (typeof templateData[i] !== "object" && (!$.trim(templateData[i]) || $.trim(templateData[i]) === "-")) {
					
					templateString = templateString.replace(new RegExp("<\\w+>\(<!\\[CDATA\\[\)?#" + i + "#\(\\]\\]>\)?<\\/\\w+>", "g"), "");
					
				} else if (typeof templateData[i] === "object" && templateData[i] instanceof Nihil) {
					
					templateString = templateString.replace(new RegExp("<\\w+>\(<!\\[CDATA\\[\)?#" + i + "#\(\\]\\]>\)?<\\/\\w+>", "g"), "<" + i + " />");

				} else {
					
					APP.Debug.log(i);
					APP.Debug.log(templateData[i]);
					
					// populate xml nodes
					templateString = templateString.replace(new RegExp("#" + i + "#", "g"), templateData[i]);
				
				}
				
			}
		
		}
		
		// debug
		APP.Debug.log("begin APP.Templates.renderTemplate()");
		APP.Debug.log(templateString);
		APP.Debug.log("end APP.Templates.renderTemplate()");
							
		return templateString;
	
	}; // _renderTemplate()
	
	// public methods
	return {
		
		/**
		 * retrieves a template string
		 *  
		 * @method getTemplate
		 * @param {String} templateName Name of template to be retrieved
		 * @return {String} Xml or Json string
		 */
		
		getTemplate: _getTemplate,
		
		/**
		 * renders a template: placeholders are replaced with the corresponding
		 * "templateData" object properties values; empty xml nodes are optionally
		 * removed depending on webservices specs
		 *  
		 * @method renderTemplate
		 * @param {String} templateString String containing the labelized html or xml tree
		 * @param {Object} templateData Its properties names are matched against the labels
		 *                 contained in "templateString"; matching elements determine
		 *                 the substitution of template labels with the corresponding property values
		 * @return {String} Xml or Json string suitable for either interface updates
		 *                  or Web services queries
		 */
		
		renderTemplate: _renderTemplate
		
	};

}()); // Templates class

/**
 * parses JOGService, eGarage, ePer services xml, json, jsonp responses allowing
 * to check for errors; encapsulates error messages and codes;
 * optionally notifies interface (see isSilent optional parameter)
 *
 * @module APP
 * @class Exceptions
 * @static
 */

APP.Exceptions = (function(){
	
	"use strict";
	
		// methods
	var _hasJogServiceError,
		_hasEPerError,
		_hasInternalOperationError,
		
		// properties
		eGarageErrorMessages,
		ePerErrorMessages,
		userStatusMessages;
		
		/* SAMPLE ERROR RESPONSE **********************************
		
		<Response xmlns="http://schemas.datacontract.org/2004/07/FCA.WebServices.eGarage.Protocols" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
			<Error xmlns:a="http://schemas.datacontract.org/2004/07/FCA.WebServices.Exceptions">
				<a:code>24</a:code>
				<a:description>ProviderError</a:description>
				<a:ProviderException>
				<a:namespace>ns2:WrongInputElement</a:namespace>
				<a:code>-5000</a:code>
				<a:message>Validation error</a:message>
				<a:description>Wrong input parameters passed.</a:description>
				<a:Detail>
					<a:code>-5010</a:code>
					<a:message>Username already in use</a:message>
					<a:description>This username is already in use; you should choose another one.</a:description>
					<a:field>username</a:field>
				</a:Detail>
				</a:ProviderException>
			</Error>
			<code>24</code>
			<userId i:nil="true"></userId>
		</Response>
		
		/**********************************************************/
		
		/**********************************************************/
		/* eGarage3.0                        					  */
		/**********************************************************/
		
		eGarageErrorMessages = {
			
			"default": printMsg("webServices", "genericError"),
			"101": printMsg("webServices", "UknowVehicleId"), // changed ex: "803": printMsg("webServices", "UknowVehicleId")
			"102": printMsg("webServices", "VehicleDeleted"), // NEW ***
			"103": printMsg("webServices", "DuplicateVinNumber"), // changed ex: "801": printMsg("webServices", "DuplicateVinNumber")
			"104": printMsg("webServices", "ImageSizeExceeded"), // changed: "804": printMsg("webServices", "ImageSizeExceeded")
			"200": printMsg("webServices", "NoDealerFound"), // changed ex: "850": printMsg("webServices", "NoDealerFound")
			"201": printMsg("webServices", "UknowDealerId"), // changed ex: "851": printMsg("webServices", "UknowDealerId")
			"202": printMsg("webServices", "DealerDeleted"), // changed ex: "852": printMsg("webServices", "DealerDeleted")
			"203": printMsg("webServices", "DuplicateDealer"), // changed ex: "853": printMsg("webServices", "DuplicateDealer")
			"402": printMsg("webServices", "invalidInput"), // changed ex: "402": printMsg("webServices", "invalidInput")
			"403": printMsg("webServices", "expiredSession"),
			"500": printMsg("webServices", "GenericErrorException"), // changed ex: "500": printMsg("webServices", "UnknowError")
			"600": printMsg("webServices", "DataBaseError"),
			"700": printMsg("webServices", "SocialServerUnavaible"),
			"802": printMsg("webServices", "VehicleDeleted"),
			
			/**********************************************************/
			/* eGarage3.0 / IAM errors           					  */
			/**********************************************************/
			
			"-5010": printMsg("webServices", "DuplicateUser"),
			"-1001": printMsg("webServices", "UnknowUserId"),
			"-1002": printMsg("webServices", "genericError"),
			"-2001": printMsg("webServices", "genericError"),
			"-2002": printMsg("webServices", "genericError"),
			"-2003": printMsg("webServices", "forbiddenForSocialUsers"),
			"-2004": printMsg("webServices", "forbiddenForNotEnabledUsers"),
			"-4000": printMsg("webServices", "genericError"), // Forbidden	You can't perform this operation.
			"-4001": printMsg("webServices", "userNotConfirmed"), // User not confirmed	User has not confirmed registration yet.
			"-4002": printMsg("webServices", "genericError"), // Not connected application	User is not connected to requester application.
			"-5000": printMsg("webServices", "genericError"), // Validation error	Wrong input parameters passed.
			"-5001": printMsg("webServices", "genericError"), // Mandatory field	This field is mandatory, you must provide a value for it (not null and not empty).
			"-5002": printMsg("webServices", "genericError"), // Wrong auth type	Wrong format for authentication type; can be only 'local', 'social' or 'socialDoubleOptIn'.
			"-5003": printMsg("webServices", "genericError"), // Wrong birth date	Wrong format for birth date; format is yyyy-mm-dd.
			"-5004": printMsg("webServices", "genericError"), // Wrong country	Wrong format for country-like field; format must follow ISO 3166-1 alpha-2 code.
			"-5005": printMsg("webServices", "genericError"), // Wrong email	Email not valid.
			"-5006": printMsg("webServices", "genericError"), // Wrong phone	Wrong format for phone-like field; it must have only digits, with optional initial plus (+) symbol.
			"-5007": printMsg("webServices", "genericError"), // Wrong gender	Wrong format for gender; can be only 'F' or 'M'.
			"-5008": printMsg("webServices", "genericError"), // Wrong language	Wrong format for language; format must follow IETF language tag.
			"-5009": printMsg("webServices", "genericError"), // Different passwords	Passwords must be equal.
			"-5011": printMsg("webServices", "DuplicateUserName"), // Email already in use	This email is already in use; you should choose another one.
			"-5012": printMsg("webServices", "genericError"), // Wrong password rules	Password doesn't follow composition rules.
			"-5013": printMsg("webServices", "genericError"), // Mutex violation	Mutual exclusion on fields violated.
			"-5014": printMsg("webServices", "genericError"), // Invalid Q&A number	Invalid question and answer number.
			"-5015": printMsg("webServices", "genericError"), // Unknown social provider	Unknown social provider.
			"-5016": printMsg("webServices", "genericError"), // Wrong application	Impossible to connect a user with a inexistent application.
			"-5017": printMsg("webServices", "NonExistentOldPassword"), // Wrong password	Password not correct.
			"-5018": printMsg("webServices", "genericError"), // Malformed JSON	Passed JSON structure is malformed.
			"-5019": printMsg("webServices", "genericError"), // Unknown search key	Search key provided in the URL is unknown.
			"-5020": printMsg("webServices", "genericError"), // Unknown application parameter	Unknown application parameter passed.
			"-5021": printMsg("webServices", "genericError"), // Empty form	Submitted form parameter is null or empty.
			"-5025": printMsg("webServices", "DuplicateEmailSocialUser"), // This email is already in use for a social user; you should choose another one. Social provider is: b2CSocialFacebookID
			"-5027": printMsg("webServices", "DuplicateEmailNotEnabledUser"), // This email is already in use for a not enabled user.
			"-9000": printMsg("webServices", "genericError"), // Unexpected error	Unexpected internal error.
			"-9998": printMsg("webServices", "genericError"), // Dead service This service is no longer available, please update your client.
			"-9999": printMsg("webServices", "genericError"), // Under development	Service not available, sorry… We are still developing.
			
			/**********************************************************/
			/* custom errors								          */
			/**********************************************************/
			
			// photo galleries 
			"9001": printMsg("photogallery", "IllegalFileType"),
			"9002": printMsg("photogallery", "FileSizeExcess")
		
		};
		
		/**********************************************************/
		/* ePer errors								              */
		/**********************************************************/
		
		ePerErrorMessages = {
		
			"default": printMsg("webServices", "genericError"),
			"8": printMsg("webServices", "VinNotFound")
			
			// further error messages here (see ePer manual)
		
		};
		
		/**********************************************************/
		/* user status errors ("code" and "error" keys values)	  */
		/**********************************************************/
		
		userStatusMessages = {
			
			// siteminder
			"authentication_failed": printMsg("webServices", "wrongCredentials"),
			
			/**********************************************************/
			/* IAM redirect statuses						          */
			/**********************************************************/
			"user_locked_out": printMsg("webServices", "UserLocked"),
			"reg-1": printMsg("webServices", "genericError"),
			"reg0": printMsg("webServices", "registrationTokenExpired"),
			"reg1": printMsg("webServices", "successfulRegistration"),
			"pwd-1": printMsg("webServices", "genericError"),
			"pwd0": printMsg("webServices", "resetPasswordTokenExpired"),
			"pwd1": printMsg("webServices", "successfulPasswordChange"),
			
			/**********************************************************/
			/* SAML assertion statuses						          */
			/**********************************************************/
			
			"10": printMsg("webServices", "MissedInputs"),
			"20": printMsg("webServices", "UnknowUserName"),
			"21": printMsg("webServices", "socialLoginPrefill"),
			"22": printMsg("webServices", "UserDeleted"),
			"23": printMsg("webServices", "DuplicateUserName"),
			"24": printMsg("webServices", "ProviderError"),
			"25": printMsg("webServices", "userNotConfirmed"),
			"26": printMsg("webServices", "userDisabled"),
			"30": printMsg("webServices", "userProfileCompletionRequired"),
			"31": printMsg("webServices", "userProfileCompletionRequired")
		
		};
	
	/**
	 * parses eGarage xml response in order to check for errors;
	 * optionally notifies application interface
	 *  
	 * @method _hasJogServiceError
	 * @param {Object} xmlEGarageResponse eGarage response xml document
	 * @param {Boolean} isSilent Determines wheter to notify interface
	 * @return {Boolean|String} Returns either false or a string describing the error occurred
	 * @private
	 */
	 
	_hasJogServiceError = function _hasJogServiceError(xmlEGarageResponse, isSilent, context){
		
		var eGarageResponseCode,
			eGarageErrorCode,
			IAMErrorDetailCode,
			eGarageErrorMessage;
			
		// default assignments
		eGarageErrorMessage = false;
		
		if (xmlEGarageResponse && typeof xmlEGarageResponse !== "object") {
		
			xmlEGarageResponse = $.parseXML(xmlEGarageResponse);
		
		}
		
		eGarageResponseCode = $.trim($(xmlEGarageResponse).find("Request > code").text()) || $.trim($(xmlEGarageResponse).find("Response > code").text());;
		eGarageErrorCode = $.trim($(xmlEGarageResponse).find("Error").children().first().text());
		IAMErrorDetailCode = $.trim($(xmlEGarageResponse).filterNode("a:Detail").filterNode("a:code").text()) ||
				$.trim($(xmlEGarageResponse).filterNode("a:ProviderException").filterNode("a:code").text());
		
		if ((eGarageResponseCode !== "0" && eGarageResponseCode !== "") ||
				(eGarageErrorCode !== "0" && eGarageErrorCode !== "")) {
			
			/**********************************************************/
			/* begin: errors exceptions; the following error codes do */
			/* trigger specific, custom interface notifications       */
			/**********************************************************/
			
			// no events items exception
			if (eGarageResponseCode === "400" || eGarageErrorCode === "400") {
			
				return;
			
			}
			
			// no dealer found
			if (eGarageResponseCode === "200" || eGarageErrorCode === "200") {
			
				return;
			
			}
			
			// no cars available exception: new egarage
			if (eGarageResponseCode === "100" || eGarageErrorCode === "100") {
				
				if (context === "vinVerifyLocal") {
				
					$(document).trigger(APP._CONFIGURATION_.Events.PAverifyVinLocalFail);
					return true;
				
				} else if (context === "VIN_VERIFY_LOCAL_2") {
				
					return false;
				
				} else {
					
					// APP._CONFIGURATION_.Events.MCcarListEmpty
					
				}
			
			}

			// expired session exception
			if ((eGarageResponseCode === "421" || eGarageErrorCode === "421") ||
					(eGarageResponseCode === "403" || eGarageErrorCode === "403")) {
				
				$(document).trigger(APP._CONFIGURATION_.Events.expiredSession);
			
			}
			
			// duplicate event
			if (eGarageResponseCode === "403" || eGarageErrorCode === "901") {
				
				return;
			
			}
			
			// duplicate dealer
			if (eGarageResponseCode === "203" || eGarageErrorCode === "203") {
					
				$(document).trigger(APP._CONFIGURATION_.Events.DLRduplicateItem);
			
			}

			if (context === "membership_validate") {

				// invalid password
				if (eGarageResponseCode === "1" || eGarageErrorCode === "1") {
						
					return;
				
				}

				// unknown card
				if (eGarageResponseCode === "1000" || eGarageErrorCode === "1000") {
						
					return;
				
				}

				// CardLocked
				if (eGarageResponseCode === "1001" || eGarageErrorCode === "1001") {
						
					return;
				
				}

				// unknown card for username
				if (eGarageResponseCode === "1002" || eGarageErrorCode === "1002") {
						
					return;
				
				}

				// WrongLevel
				if (eGarageResponseCode === "1003" || eGarageErrorCode === "1003") {
						
					return;
				
				}

				// RequiredCard
				if (eGarageResponseCode === "1004" || eGarageErrorCode === "1004") {
						
					return;
				
				}
			}
			
			
			// non-error code
			if (eGarageResponseCode === "11" || eGarageErrorCode === "11") {
					
				return;
			
			}
			
			/**********************************************************/
			/* end: errors exceptions                                 */
			/**********************************************************/
					
			(eGarageErrorMessages.hasOwnProperty(IAMErrorDetailCode)) ? eGarageErrorMessage = eGarageErrorMessages[IAMErrorDetailCode] :
					(eGarageErrorMessages.hasOwnProperty(eGarageResponseCode)) ? eGarageErrorMessage = eGarageErrorMessages[eGarageResponseCode] :
							(eGarageErrorMessages.hasOwnProperty(eGarageErrorCode)) ? eGarageErrorMessage = eGarageErrorMessages[eGarageErrorCode] :
									eGarageErrorMessage = eGarageErrorMessages["default"];
		
		}
		
		// notify JOGService error
		if ((eGarageErrorMessage || eGarageErrorCode) && !isSilent) {
			
			$(document).trigger(APP._CONFIGURATION_.Events.eGarageError, {
				message: eGarageErrorMessage,
				responseCode: eGarageResponseCode,
				errorCode: eGarageErrorCode,
				detailCode: IAMErrorDetailCode
			});
		
		}
		
		return eGarageErrorMessage;
	
	}; // _hasJogServiceError()
	
	/**
	 * parses ePer jsonP response in order to check for errors;
	 * optionally notifies application interface
	 *  
	 * @method _hasEPerError
	 * @param {Object} jsonEPerResponse ePer response jsonP object
	 * @param {Boolean} isSilent Determines wheter to notify interface
	 * @return {Boolean|String} Returns either false or a string describing the error occurred
	 * @private
	 */
	
	_hasEPerError = function _hasEPerError(jsonEPerResponse, isSilent){
	
		var ePerBaseResponseObject,
			ePerErrorCode,
			ePerErrorMessage;
		
		if (jsonEPerResponse) {
		
			ePerBaseResponseObject = jsonEPerResponse["plist"] || // ePer_MP response
			                         jsonEPerResponse["p"]     || // ePer_CL response
									 jsonEPerResponse["vi"]    || // ePer_VD response
									 jsonEPerResponse["ac"]    || // ePer_AC1 response
									 jsonEPerResponse["amc1"]  || // ePer_AC2 (getAMCategoryList) response
									 jsonEPerResponse["amsc1"] || // ePer_AC2 (getAMSubcategoryList) response
									 jsonEPerResponse["amp1"]  || // ePer_AC2 (getAMProductList) response
									 jsonEPerResponse["ampd"];    // ePer_AC2 (getAMProductDetail) response
		
		}
		
		if (ePerBaseResponseObject && ePerBaseResponseObject.hasOwnProperty("errorcode") &&
				((ePerErrorCode = ePerBaseResponseObject["errorcode"]) !== "0")) {
			
			/**********************************************************/
			/* begin: errors exceptions; the following error codes do */
			/* trigger specific, custom interface notifications       */
			/**********************************************************/
			
			// expired ePer token exception
			if (ePerErrorCode === "1") {
				
				$(document).trigger(APP._CONFIGURATION_.Events.expiredSession);
				return;
			
			}
			
			// there isn't valid brand for current model: do not show any overlay
			if (ePerErrorCode === "14") {
				
				$(document).trigger(APP._CONFIGURATION_.Events.isReady);
				return;
			
			}
			
			// brand code is not valid: do not show any overlay
			if (ePerErrorCode === "4") {
				
				$(document).trigger(APP._CONFIGURATION_.Events.isReady);
				return;
			
			}
			
			/**********************************************************/
			/* end: errors exceptions                                 */
			/**********************************************************/
			
			(ePerErrorMessages.hasOwnProperty(ePerErrorCode)) ? ePerErrorMessage = ePerErrorMessages[ePerErrorCode] :
					ePerErrorMessage = ePerErrorMessages["default"];
				
		}
		
		// notify ePer error
		if (ePerErrorMessage && !isSilent) {
			
			$(document).trigger(APP._CONFIGURATION_.Events.ePerError, { message: ePerErrorMessage });
		
		}
		
		return ePerErrorMessage;
	
	}; // _hasEPerError()
	
	/**
	 * parses Siteminder, IAM and SAML assertion statuses in order to check for errors;
	 * optionally notifies application interface
	 *  
	 * @method _hasInternalOperationError
	 * @param {String} errorCode Siteminder, IAM or SAML assertion status code
	 * @param {Boolean} isSilent Determines wheter to notify interface
	 * @return {Boolean|String} Returns either false or a string describing the error occurred
	 * @private
	 */
	 
	_hasInternalOperationError = function _hasInternalOperationError(errorCode, isSilent){
		
		var	internalErrorCode,
			internalErrorMessage;
			
			// default assignments
			internalErrorMessage = false;
		
		// assignment; error codes other than 303 trigger error management
		if (errorCode) {
			
			internalErrorCode = errorCode.toLowerCase();
			
			(userStatusMessages.hasOwnProperty(internalErrorCode)) ? internalErrorMessage = userStatusMessages[internalErrorCode] : internalErrorMessage = false;
		
		}
		
		if (internalErrorMessage && !isSilent) {
			
			$(document).trigger(APP._CONFIGURATION_.Events.internalError, { message: internalErrorMessage, code: internalErrorCode });
		
		}
		
		return internalErrorMessage;
	
	}; // _hasInternalOperationError()
	
	// public methods
	return {
		
		/**
		 * parses eGarage xml response in order to check for errors;
		 * optionally notifies application interface
		 *  
		 * @method hasJogServiceError
		 * @param {Object} xmlEGarageResponse eGarage response xml document
		 * @param {Boolean} isSilent Determines wheter to notify interface
		 * @return {Boolean|String} Returns either false or a string describing the error occurred
		 */
		
		hasJogServiceError: _hasJogServiceError,
		
		/**
		 * parses ePer jsonP response in order to check for errors;
		 * optionally notifies application interface
		 *  
		 * @method hasEPerError
		 * @param {Object} jsonEPerResponse ePer response jsonP object
		 * @param {Boolean} isSilent Determines wheter to notify interface
		 * @return {Boolean|String} Returns either false or a string describing the error occurred
		 */
		
		hasEPerError: _hasEPerError,
		
		/**
		 * parses Janrain querystring response codes in order to check for errors;
		 * optionally notifies application interface
		 *  
		 * @method hasInternalOperationError
		 * @param {Object} queryStringObj authinfo object
		 * @param {Boolean} isSilent Determines wheter to notify interface
		 * @return {Boolean|String} Returns either false or a string describing the error occurred
		 */
		
		hasInternalOperationError: _hasInternalOperationError
	
	};

}());

/**
 * wrapper class to query JOGService, ePer and eGarage
 * web services (via either Ajax or JsonP, depending on platform specs)
 *
 * @module APP
 * @class Services
 * @static
 */
 
APP.Services = (function(){
	
	"use strict";
	
		// properties
	var queryModels,
		
		// methods
		_query,
		_getModels;
	
	queryModels = {

		"EPER_VD": {
			
			url: APP._CONFIGURATION_.Paths.ePer + "/getVehicleData",
			cache: false,
			type: "GET",
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",
			data: null,
			timeout: APP._CONFIGURATION_.ePerJSONPServicesTimeout,
			dataType: "jsonp",
			jsonp: "JSONP"
		
		},
		
		// eGarage 3.0 Platform query models
		"IS_SESSION_ALIVE": {
		
			url: APP._CONFIGURATION_.Paths.jogService + "/user/check",
			cache: false,
			type: "GET",
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",
			data: null,
			success: null,
			error: null
		
		},
		
		"USER_LOGIN": { 
		
			url: APP._CONFIGURATION_.Paths.jogService + "/user/login",
			cache: false,
			type: "POST",
			contentType: "text/xml; charset=UTF-8",
			data: null,
			dataType: "xml",
			success: null,
			error: null
		
		},
		
		"USER_LOGOUT": { 
		
			url: APP._CONFIGURATION_.Paths.jogService + "/user/logout",
			cache: false,
			type: "GET",
			contentType: "text/xml; charset=UTF-8",
			data: "",
			success: null,
			error: null
		
		},
		
		"MEMBERSHIP_VALIDATE": {
		
			url: APP._CONFIGURATION_.Paths.jogService + "/membership/validate",
			cache: false,
			type: "POST",
			contentType: "text/xml; charset=UTF-8",
			data: null,
			dataType: "xml",
			success: null,
			error: null
		
		},
		
		"REGISTER_USER": { 
		
			url: APP._CONFIGURATION_.Paths.jogService + "/user/create",
			cache: false,
			type: "POST",
			contentType: "text/xml; charset=UTF-8",
			data: null,
			dataType: "xml",
			success: null,
			error: null
		
		},
		
		"UPDATE_USER": { 
		
			url: APP._CONFIGURATION_.Paths.jogService + "/user/update",
			cache: false,
			type: "POST",
			contentType: "text/xml; charset=UTF-8",
			data: null,
			dataType: "xml",
			success: null,
			error: null
		
		},
		
		"DELETE_USER": { 
		
			url: APP._CONFIGURATION_.Paths.jogService + "/user/delete",
			cache: false,
			type: "POST",
			contentType: "text/xml; charset=UTF-8",
			data: null,
			success: null,
			error: null
		
		},
		
		"COMPLETE_USER": { 
		
			url: APP._CONFIGURATION_.Paths.jogService + "/user/profile/complete",
			cache: false,
			type: "POST",
			contentType: "text/xml; charset=UTF-8",
			data: null,
			success: null,
			error: null
		
		},
		
		"UPDATE_PASSWORD": { 
		
			url: APP._CONFIGURATION_.Paths.jogService + "/user/password/change",
			cache: false,
			type: "POST",
			contentType: "text/xml; charset=UTF-8",
			data: null,
			success: null,
			error: null
		
		},
		
		"RESET_PASSWORD": { 
		
			url: APP._CONFIGURATION_.Paths.jogService + "/user/password/reset",
			cache: false,
			type: "POST",
			contentType: "text/xml; charset=UTF-8",
			data: null,
			success: null,
			error: null
		
		},
		
		"GET_USER": { 
		
			url: APP._CONFIGURATION_.Paths.jogService + "/user/get",
			cache: false,
			type: "GET",
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",
			data: null,
			success: null,
			error: null
		
		},
		
		"GET_EPER_TOKEN": {
			
			url: APP._CONFIGURATION_.Paths.jogService + "/eper/token",
			cache: false,
			type: "GET",
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",
			data: null,
			success: null,
			error: null
		
		},
		
		"GET_CAR": {
			
			url: APP._CONFIGURATION_.Paths.jogService + "/vehicle/get",
			cache: false,
			type: "GET",
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",
			data: null,
			success: null,
			error: null
		
		},

		"VIN_VERIFY_LOCAL": {

			url: APP._CONFIGURATION_.Paths.jogService + "/legacy/vin/validate?vin=#VIN",
			cache: false,
			type: "GET",
			data: null,
			success: null,
			error: null

		},
		
		"VIN_VERIFY_LOCAL_2": {

			url: APP._CONFIGURATION_.Paths.jogService + "/legacy/vin/validate",
			cache: false,
			type: "GET",
			data: null,
			success: null,
			error: null

		}
		
	};
	
	// private methods
	
	/**
	 * queries eGarage and ePer services
	 *
	 * @method _query
	 * @param {Object} queryModel $.ajax method setup
	 * @param {Object} queryParams Extends "queryModel" object allowing
	 *                 to specify custom handlers and properties (e.g.: callback functions)
	 * @return {Object} $.Ajax Promise object instance
	 * @private
	 */
	 
	_query = function _query(queryModel, queryParams){
	
		var tempQueryParams,
			promise;
		
		if (!(queryModels.hasOwnProperty(queryModel))) {
		
			return;
		
		}
		
		tempQueryParams = $.extend({}, queryModels[queryModel], queryParams);
		
		promise = $.ajax(tempQueryParams);
		
		// manage jsonp errors
		if (tempQueryParams.dataType === "jsonp") {
		
			promise.fail(function(){
			
				APP.Exceptions.hasEPerError(APP.Templates.getTemplate("GenericEPerError"));
			
			});
		
		}
		
		return promise;
		
	}; // _query()
	
	/**
	 * returns a reference to Web services queries models object
	 *
	 * @method _getModels
	 * @return {Object} object containing all services queries models
	 * @private
	 */
	
	_getModels = function _getModels(){
	
		return queryModels;
	
	}; // _getModels()
		
	// public methods
	return {
		
		/**
		 * queries JOGService, ePer and eGarage services
		 *
		 * @method query
		 * @param {Object} queryModel $.ajax method setup
		 * @param {Object} queryParams Extends "queryModel" object allowing
		 *                 to specify custom handlers and properties (e.g.: callback functions)
		 * @return {Object} $.Ajax Promise object instance
		 */
		
		query: _query,
		
		/**
		 * returns a reference to Web services queries models object
		 *
		 * @method getModels
		 * @return {Object} object containing all services queries models
		 */
		
		getModels: _getModels
	
	};

}()); // Services class

/**
 * manages client-side cookies storage
 *
 * @module APP
 * @class Storage
 * @static
 */
 
APP.Storage = (function(){
	
	"use strict";
		
		// methods
	var _initialize,
		_setCookie,
		_getCookie,
		_deleteCookie;
	
	/**
	 * retrieves the specified cookie value
	 *  
	 * @method _getCookie
	 * @param {String} cookieName name of cookie whose value is to be retrieved
	 * @return {String|Null} returns either null or a string containing the value of
	 *                       the specified cookie
	 * @private
	 */
	
	_getCookie = function _getCookie(cookieName){
		
		var nameEQ,
			cookieArray,
			cookieArrayLength,
			tempCookie,
			i;
			
		nameEQ = cookieName + "=";
		cookieArray = document.cookie.split(";");
		cookieArrayLength = cookieArray.length;
		
		for (i = 0; i < cookieArrayLength; i += 1) {
		
			tempCookie = cookieArray[i];
			
			while (tempCookie.charAt(0) === " ") {
			
				tempCookie = tempCookie.substring(1, tempCookie.length);
			
			}
			
			if (tempCookie.indexOf(nameEQ) === 0) {
			
				return tempCookie.substring(nameEQ.length, tempCookie.length);
			
			}
			
		}
		
		return null;
		
	}; // _getCookie()
	
	/**
	 * stores the specified cookie
	 *  
	 * @method _setCookie
	 * @param {String} cookieName name of cookie
	 * @param {String} cookieValue value of cookie
	 * @param {Number} days expiration time of cookie expressed in days
	 * @private
	 */
	
	_setCookie = function _setCookie(cookieName, cookieValue, days){
		
		var date,
			expires;
			
		// default assignments
		expires = "";
		
		if (days) {
		
			date = new Date();
			date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
			expires = "; expires=" + date.toGMTString();
		
		}
		
		document.cookie = cookieName + "=" + cookieValue + expires + ";domain=" +
				APP._CONFIGURATION_.cookieDomain + ";path=/";
		
	}; // _setCookie()
	
	/**
	 * deletes the specified cookie
	 *  
	 * @method _deleteCookie
	 * @param {String} cookieName name of cookie to be deleted
	 * @private
	 */
	
	_deleteCookie = function _deleteCookie(cookieName){
		
		_setCookie(cookieName, "", -1);
	
	}; // _deleteCookie()
	
	/**
	 * sets "mrd" and "mflru" cookies retrieving the default values
	 * from the following globally available variables:
	 * mopar_market, mopar_lang, mopar_brandcode, mopar_marketcode
	 *  
	 * @method _initialize
	 * @private
	 */
	 
	_initialize = function _initialize(){
		
		var referralData,
			tempGlobalSettings,
			tempExpirationTime;
		
		referralData = (global["mopar_market"] || global["jog_market"]) + "|" +
					   (global["mopar_lang"] || global["jog_lang"]) + "|" +
					   (global["mopar_brandcode"] || global["jog_brandcode"]) + "|" +
					   (global["mopar_marketcode"] || global["jog_marketcode"]);
		
		tempGlobalSettings = APP.Settings.get();
		tempExpirationTime = APP._CONFIGURATION_.cookiesExpirationTime;
	
		_setCookie("mrd", referralData, tempExpirationTime);
		
		_setCookie("mflru", APP._CONFIGURATION_.Paths.myMoparRegPageRedirectURL, tempExpirationTime);
	
	}; // _initialize()
	
	return {
		
		/**
		 * stores the specified cookie
		 *  
		 * @method setCookie
		 * @param {String} cookieName Name of cookie
		 * @param {String} cookieValue Value of cookie
		 * @param {Number} days Expiration time of cookie expressed in days
		 */
		
		setCookie: _setCookie,
		
		/**
		 * retrieves the specified cookie value
		 *  
		 * @method getCookie
		 * @param {String} cookieName name of cookie whose value is to be retrieved
		 * @return {String|null} Returns either null or a string containing the value of
		 *                       the specified cookie
		 */
		
		getCookie: _getCookie,
		
		/**
		 * deletes the specified cookie
		 *  
		 * @method deleteCookie
		 * @param {String} cookieName name of cookie to be deleted
		 */
		
		deleteCookie: _deleteCookie,
		
		/** 
		 * sets "mrd" and "mflru" cookies retrieving the default values
		 * from the following globally available variables:
		 * mopar_market, mopar_lang, mopar_brandcode, mopar_marketcode
		 *  
		 * @method initialize
		 */
		
		initialize: _initialize
	
	};

}()); // Storage

/**
 * checks JOGService session validity, manages ePer
 * session token (private and public) retrieval
 *
 * @module APP
 * @class Session
 * @static
 */

APP.Session = (function(){
	
	"use strict";
	
		// properties
	var	sessionCheckQueryParams,
		sessionIsAlive,
		hasErrors,
		ePerTokenQueryParams,
		ePERToken,
		
		// methods
		_isAlive,
		_checkSessionValidity,
		_keepSessionAlive,
		_retrieveEPERToken,
		_getEPERToken,
		_ePERTokenErrorHandler;
	
	// default assignments
	sessionCheckQueryParams = {
	
		success: _sessionCheckSuccessHandler,
		error: _sessionCheckErrorHandler,
		complete: _sessionCheckCompleteHandler,
		timeout: APP._CONFIGURATION_.sessionCheckTimeout
	
	};
		
	ePerTokenQueryParams = {
	
		success: _ePerTokenQuerySuccessHandler(false),
		error: _ePERTokenErrorHandler
	
	};
	
	// At the beginning, we don't know if session is alive or not,
	// because we haven't checked yet.
	sessionIsAlive = undefined;

	/**********************************************************/
	/* custom error handler: prevents aborted calls from      */
	/* firing unwanted error notifications                    */
	/**********************************************************/
	
	_ePERTokenErrorHandler = function _ePERTokenErrorHandler(jqXHR, status){
		
		var xmlResponse;
		
		// abortes calls (e.g.: redirects, page changes) should not trigger any error notification
		if (status === "abort") { return; }
		
		// JOGService service intermittently serves XML data as text/html		
		xmlResponse = (jqXHR.responseXML) ? jqXHR.responseXML :
				(jqXHR.responseText) ? $.parseXML(jqXHR.responseText) : "";
		
		if (xmlResponse && ($(xmlResponse).find("Error").size() > 0)) {
			
			APP.Exceptions.hasJogServiceError(xmlResponse);
		
		} else {
			
			APP.Exceptions.hasJogServiceError(APP.Templates.getTemplate("GenericErrorXML"));
		
		}
	
	}; // _ePERTokenErrorHandler()
	
	/**********************************************************/
	/* session handlers                                       */
	/**********************************************************/
	
	function _sessionCheckSuccessHandler(xmlData){ 
		
		if (!xmlData) {
			
			sessionIsAlive = false;
			return;
		
		}
		
		hasErrors = ($.trim($(xmlData).find("response > code").text()) !== "0" ||
				$(xmlData).find("error").children().length > 0);
		
		(hasErrors) ? sessionIsAlive = false : sessionIsAlive = true;
	
	} // _sessionCheckSuccessHandler()
	
	function _sessionCheckErrorHandler(jqXHR, textStatus, errorThrown) {
		var aborted;
		var timeout;
		var cancelled;

		timeout = (textStatus === "timeout");
		aborted = (textStatus === "abort" || textStatus === "0");
		cancelled = (textStatus === "error" && errorThrown === "");

		// Ignore the error if the request was aborted/cancelled by the user behavior, 
		// or if the server did not respond in time.
		if (timeout || aborted || cancelled) {
			return;
		}

		sessionIsAlive = false;
	
	} // _sessionCheckErrorHandler()
	
	function _sessionCheckCompleteHandler(){
	
		$(document).trigger(APP._CONFIGURATION_.Events.sessionStatusChange);
	
	} // _sessionCheckCompleteHandler()
	
	/**********************************************************/
	/* eper token handlers                                    */
	/**********************************************************/
	
	function _ePerTokenQuerySuccessHandler(isSilent){
		
		// silent version
		if (isSilent) {
			
			return function(xmlData){
				
				if (!APP.Exceptions.hasJogServiceError(xmlData)) {
			
					ePERToken = $(xmlData).find("Response > token").text();
				
				}
				
			};
		
		}
		
		// non-silent version
		return function(xmlData){
		
			if (!APP.Exceptions.hasJogServiceError(xmlData)) {
			
				ePERToken = $(xmlData).find("Response > token").text();
				$(document).trigger(APP._CONFIGURATION_.Events.AUePERTokenReady);
				
			}
			
			if (APP._CONFIGURATION_.autoRenewEperToken) {
			
				APP._CONFIGURATION_.autoRenewEperTokenIntervalID = setInterval(function(){ _retrieveEPERToken(true); },
						APP._CONFIGURATION_.autoRenewEperTokenInterval);
				
			}
			
		};
	
	} // _ePerTokenQuerySuccessHandler()
	
	function _ePerTokenQueryErrorHandler(){
	
		APP.Exceptions.hasJogServiceError(APP.Templates.getTemplate("GenericErrorXML"));
	
	} // _ePerTokenQueryErrorHandler()
	
	/**********************************************************/
	/* private methods                                        */
	/**********************************************************/
	
	/**
	 * queries eGarage in order to check session validity;
	 * a 403 HTTP header is sent back in case of either expired 
	 * or non existent session
	 *  
	 * @method _checkSessionValidity
	 * @param {Boolean} [isSilent] specifies wheter a sessionStatusChange event
	 *                             should be broadcasted upon session check completion
	 * @private
	 */
	 
	_checkSessionValidity = function _checkSessionValidity(isSilent){
		
		if (isSilent) {
			
			sessionCheckQueryParams.complete = null;
		
		} else {
		
			sessionCheckQueryParams.complete = _sessionCheckCompleteHandler;
			
		}
		
		APP.Debug.log("checking/renewing eGarage session");
		
		APP.Services.query("IS_SESSION_ALIVE", sessionCheckQueryParams);
	
	}; // _checkSessionValidity()
	
	/**
	 * queries JOGService in order to keep session alive; specifying a truthy value
	 * for the keepSessionAlive configuration parameter causes this method 
	 * to be intermittently recalled in order to keep current session alive
	 *  
	 * @method _keepSessionAlive
	 * @private
	 */
	
	_keepSessionAlive = function _keepSessionAlive(){
		
		if (APP._CONFIGURATION_.keepSessionAliveInterval >= APP._CONFIGURATION_.minKeepSessionAliveInterval) {
	
			APP._CONFIGURATION_.keepSessionAliveIntervalID = setInterval(function(){ APP.Session.checkSessionValidity(true); },
					APP._CONFIGURATION_.keepSessionAliveInterval);
				
		}
	
	}; // _keepSessionAlive()
	
	/**
	 * allows to check current session validity
	 *  
	 * @method _isAlive
	 * @return {Boolean} Indicates wheter the session is alive
	 * @private
	 */
	
	_isAlive = function _isAlive(){
	
		return sessionIsAlive;
	
	}; // _isAlive()
	
	/**
	 * queries JOGService web service in order to retrieve a
	 * temporary token needed in order to query ePer services
	 *  
	 * @method _retrieveEPERToken
	 * 
	 * @private
	 */
	
	_retrieveEPERToken = function _retrieveEPERToken(isSilent){
	
		APP.Debug.log("retrieving private eper token");

		ePerTokenQueryParams.success = _ePerTokenQuerySuccessHandler(isSilent);

		APP.Services.query("GET_EPER_TOKEN", ePerTokenQueryParams);
	
	}; // _retrieveEPERToken()
	
	/**
	 * allows to get the last stored ePer session token
	 *  
	 * @method _getEPERToken
	 * @return {String} current ePer session token
	 * @private
	 */
	
	_getEPERToken = function _getEPERToken(){
	
		return ePERToken;
		
	}; // _getEPERToken()
	
	/**********************************************************/
	/* public methods                                         */
	/**********************************************************/
	
	return {
		
		/**
		 * queries JOGService Web service in order to check session validity;
		 * a 403 HTTP header is sent back in case of
		 * either expired or non existent session
		 *  
		 * @method checkSessionValidity
		 */
	 
		checkSessionValidity: _checkSessionValidity,
		
		/**
		 * queries JOGService in order to keep session alive; assigning a truthy value
		 * to the keepSessionAlive configuration parameter causes this method 
		 * to be intermittently recalled in order to keep current session alive
		 *  
		 * @method keepSessionAlive
		 */
		
		keepSessionAlive: _keepSessionAlive,
		
		/**
		 * allows to check current session validity
		 *  
		 * @method isAlive
		 * @return {Boolean} Indicates wheter the session is alive
		 */
		
		isAlive: _isAlive,
		
		/**
		 * queries JOGService Web service in order to retrieve a
		 * temporary token needed in order to query ePer services
		 *  
		 * @method retrieveEPERToken
		 */
		
		retrieveEPERToken: _retrieveEPERToken,
		
		/**
		 * allows to get the last stored ePer session token
		 *  
		 * @method getEPERToken
		 * @return {String} current ePer session token
		 */
		
		getEPERToken: _getEPERToken
		
	};

}()); // Session()

/**
 * Manages user's privacy settings
 *
 * @module APP
 * @class Privacy
 * @static
 */

APP.Privacy = (function(){
	
	var	channelStrLength,
		_createFromChannels,
		_getChannels;
	
	// default assignments
	channelStrLength = APP._CONFIGURATION_.privacy.channelStrLength;
	
	/**
	 * @method _createFromChannels
	 * @param {String} str string containing pipe-separated privacy channels pairs [channel_code][channel_grant]| ...
	 *                     see JOGService documentation for further insight; e.g.:
	 *                     <flagPrivacy><![CDATA[1F|2G|3G|4F]]></flagPrivacy>
	 * @return {Object} hash containing privacy key/values enriched with
	 *                  eGarage3.0 mandatory additional data
	 * @private
	 */
	
	_createFromChannels = function _createFromChannels(str){
		
		var	channelsArr,
			channelsArrLength,
			tempPrivacyStr,
			tempPrivacyDate,
			tempPrivacyFullYear,
			tempPrivacyMonth,
			tempPrivacyDay,
			tempPrivacyFullDate,
			tempPrivacyArr,
			i,
			defaultChannelsHash,
			channelsHash,
			channelStr,
			channelKey,
			channelValue;
		
		// default assigments
		tempPrivacyDate = new Date();
		tempPrivacyFullYear = tempPrivacyDate.getUTCFullYear();
		tempPrivacyMonth = ("0" + (tempPrivacyDate.getUTCMonth() + 1)).slice(-2);
		tempPrivacyDay = ("0" + (tempPrivacyDate.getUTCDate())).slice(-2);
		tempPrivacyFullDate = tempPrivacyFullYear + tempPrivacyMonth + tempPrivacyDay;
		tempPrivacyArr = [];
		
		channelsArr = (str || "").split("|");
		channelsArrLength = channelsArr.length;

		defaultChannelsHash = APP._CONFIGURATION_.privacy.defaultChannelsHash;

		channelsHash = {};
		for (i = 0; i < channelsArrLength; i += 1) {
			channelStr = channelsArr[i].toUpperCase();
			channelKey = channelStr.charAt(0);
			channelValue = channelStr.charAt(1);
			channelsHash[channelKey] = channelValue;
		}

		channelsHash = $.extend({}, defaultChannelsHash, channelsHash);
	
		for (i in channelsHash) {
			if (channelsHash.hasOwnProperty(i)) {
				// sample privacy string: 11G000120111208Website500L
				
				tempPrivacyStr = APP._CONFIGURATION_.privacy.idIdentity +
								i.toUpperCase() +
								channelsHash[i].toUpperCase() +
								APP._CONFIGURATION_.privacy.disclaimerCode +
								tempPrivacyFullDate +
								APP._CONFIGURATION_.privacy.source;
				
				/**
				 * add padding trailing spaces: each channel string must mandatorily be 27 chars long;
				 * see APP._CONFIGURATION_.privacy.channelStrLength for further insight
				 */
				
				tempPrivacyStr = pad(tempPrivacyStr, channelStrLength, " ");
				
				if (tempPrivacyStr.length == channelStrLength) {
					
					tempPrivacyArr.push(tempPrivacyStr);
					
					APP.Debug.log("Privacy: _createFromChannels(): creating privacy channel: " + tempPrivacyStr);
					
				} else {
					
					APP.Debug.log("Privacy: _createFromChannels(): skipping malformed privacy channel: " + tempPrivacyStr);
					APP.Debug.log("Privacy: _createFromChannels(): length: " + tempPrivacyStr.length + " | required length: " + channelStrLength);
					
				}
			}
		}
		
		APP.Debug.log("Privacy: _createFromChannels(): computed privacy string: " + tempPrivacyArr.join(""));
		
		return tempPrivacyArr.join("");
	
	}; // _createFromChannels()
	
	/**
	 * @method _getChannels
	 * @param {String} str hash containing privacy key/values
	 * @return {String}
	 * @private
	 */
		
	_getChannels = function _getChannels(str){
		
		var defaultChannelsHash,
			defaultChannels,
			defaultChannelsKeys,
			defaultChannelsLength,
			channelPairRegExp,
			currentStrIndex,
			tempChannelData,
			tempDisclaimerCodeData,
			hasMatchingDisclaimerCode,
			i;
		
		defaultChannels = [];
		defaultChannelsKeys = [];
		defaultChannelsHash = $.extend({}, APP._CONFIGURATION_.privacy.defaultChannelsHash);

		for (i in defaultChannelsHash) {
			if (defaultChannelsHash.hasOwnProperty(i)) {
				defaultChannelsKeys.push(i.toUpperCase());
				defaultChannels.push(i.toUpperCase() + defaultChannelsHash[i]);
			}
		}

		channelPairRegExp = new RegExp('^(' + defaultChannelsKeys.join('|') + ')(F|G|U)$', 'i');

		defaultChannelsLength = defaultChannels.length;
		
		for (i = 0; i < defaultChannelsLength; i += 1) {
			
			currentStrIndex = channelStrLength * i;
			
			/**
			 * each privacy string fragment should *at least*
			 * comprise the first three chars where each channel id
			 * and status are located: e.g.: 1>1G<000120111208WebsiteMopar
			 */
			
			if (str.length > (currentStrIndex + 3)) {
				
				tempChannelData = str.slice(currentStrIndex + 1, currentStrIndex + 3);
				tempDisclaimerCodeData = (str.slice(currentStrIndex + 3, currentStrIndex + 7)).toLowerCase();
				hasMatchingDisclaimerCode = (tempDisclaimerCodeData === APP._CONFIGURATION_.privacy.disclaimerCode);
				
				// check channel consistency
				if (channelPairRegExp.test(tempChannelData) && hasMatchingDisclaimerCode) {
				
					defaultChannels[i] = (str.slice(currentStrIndex + 1, currentStrIndex + 3)).toUpperCase();
				
					APP.Debug.log("Privacy: _getChannels(): has matching disclaimer code: " + hasMatchingDisclaimerCode);
					APP.Debug.log("Privacy: _getChannels(): adding valid channel data: " + tempChannelData);
				
				} else {
					
					APP.Debug.log("Privacy: _getChannels(): skipping invalid channel data: " + tempChannelData);
				
				}
			
			}
		
		}
		
		APP.Debug.log("Privacy: _getChannels(): ");
		APP.Debug.log(defaultChannels);
		
		return defaultChannels.join("|");
		
	}; // _getChannels()
	
	return {
		
		createFromChannels: _createFromChannels,
		getChannels: _getChannels
	
	};

}()); // Privacy

/**
 * manages AuthArea macro and micro areas
 *
 * @module APP
 * @class AuthArea
 * @static
 */
 
APP.AuthArea = (function(){
	
	"use strict";
	
		// methods
	var  _initialize,
		
		// main classes
		ManageEvents,
		ManageInterface,
		ManageData,
		UserProfile;
	
	/**
	 * Manages authenticated area events
	 *
	 * @class ManageEvents
	 * @private
	 * @static
	 */
	 
	ManageEvents = (function(){
		
		var // methods
			_initialize;
		
		/**********************************************************/
		/* handlers                                               */
		/**********************************************************/
		
		/**
		 * manages upper and lower login forms
		 */
		
		function _PAloginFormSubmitHandler(evt, obj){
			
			var tempSSOLoginFormHTMLTemplate,
				tempSSOLoginFormHTMLRenderedTemplate,
				$tempSSOLoginFormElem,
				username,
				password;
			
			// notify interface
			$(document).trigger(APP._CONFIGURATION_.Events.isBusy);
			
			// create and submit login form
			tempSSOLoginFormHTMLTemplate = APP.Templates.getTemplate("SSOLoginFormHTML");
			tempSSOLoginFormHTMLRenderedTemplate = APP.Templates.renderTemplate(tempSSOLoginFormHTMLTemplate, APP._CONFIGURATION_.SSO);
			$tempSSOLoginFormElem = $(tempSSOLoginFormHTMLRenderedTemplate);
			$tempSSOLoginFormElem.find("input[name='USER']").val(obj.username);
			$tempSSOLoginFormElem.find("input[name='PASSWORD']").val(obj.password);
			$("body").append($tempSSOLoginFormElem);
			
			/**
			 * the hidden login form is asynchronously submitted
			 * in order to prevent the abortion of any static resources
			 * being loaded in the background
			 */
			 
			setTimeout(function(){
			
				$tempSSOLoginFormElem.submit();
			
			}, 1000);
		
		} // _PAloginFormSubmitHandler()
		
		/**
		 * manages user registration and auto-login in case of successful query
		 */
		
		function _PAregisterUserHandler(evt, data){

			var processedFormData,
				tempFormXMLTemplate,
				tempFormXMLRenderedTemplate,
				registrationFormQueryParams,
				isSocialUser,
				isIncompleteUser,
				forceDoubleOptIn,
				/* tempVin, */
				ajaxChain,
				ajaxChainObjArr,
				acTempEperTokenQuery,
				acTempEperTokenConfObj,
				acTempEperVDQuery,
				acTempEperVDConfObj,
				acTempCompleteUserParams,
				acTempCompleteUserQuery,
				acTempCompleteUserConfObj,
				acTempRegisterUserParams,
				acTempRegisterUserQuery,
				acTempRegisterUserConfObj,
				tempQueryModels;
			
			// default assignments
			tempQueryModels = APP.Services.getModels();
			ajaxChain = new $.AjaxChain();
			ajaxChainObjArr = [];
			
			// notify interface
			$(document).trigger(APP._CONFIGURATION_.Events.isBusy);
			
			// gather form data
			processedFormData = ManageData.processRegFormData(data);
			isIncompleteUser = (processedFormData.code === APP._CONFIGURATION_.userStatus.IS_FCA) ||
			                   (processedFormData.code === APP._CONFIGURATION_.userStatus.IS_MOC);
			forceDoubleOptIn = processedFormData.forceDoubleOptIn === "true";
			/* tempVin = data.vin; */
			
			// convert channels in eGarage3.0 format
			processedFormData.flagPrivacy = APP.Privacy.createFromChannels(processedFormData.flagPrivacy);
			
			isSocialUser = ManageData.isSocialUser() && !isIncompleteUser;
			
			// pure social users should have their password randomly
			// generated on the server side
			if (isSocialUser) {
				
				// mark form data empty properties: empty xml nodes won't be removed
				processedFormData.password = new Nihil();
			
			}
			
			if (isIncompleteUser) {
			
				tempFormXMLTemplate = APP.Templates.getTemplate("jogServiceCompleteUserXML");
			
			} else {
			
				tempFormXMLTemplate = APP.Templates.getTemplate("jogServiceCreateUserXML");
			
			}
			
			tempFormXMLRenderedTemplate = APP.Templates.renderTemplate(tempFormXMLTemplate, processedFormData);
			
			if (isIncompleteUser) {
			
				APP.Debug.log("begin _PAregisterUserHandler: form data + incomplete user data");
				APP.Debug.log(tempFormXMLRenderedTemplate);
				APP.Debug.log("end _PAregisterUserHandler: form data + incomplete user data");
			
			} else {
				
				APP.Debug.log("begin _PAregisterUserHandler: form data + social data");
				APP.Debug.log(tempFormXMLRenderedTemplate);
				APP.Debug.log("end _PAregisterUserHandler: form data + social data");
			
			}
			
			// JOGService query parameters
			registrationFormQueryParams = {
			
				data: tempFormXMLRenderedTemplate,
				success: registrationFormSubmitSuccessHandler,
				error: ManageData.eGarageQueryErrorHandler
			
			};
			
			if (isIncompleteUser) {
			
				APP.Debug.alert("you are about to complete an existing user: reload page to abort");
			
			} else {
			
				APP.Debug.alert("you are about to register a new " +
						((isSocialUser) ? "*social*" : "*pure JOGService*") +
						" user: reload page to abort");
			
			}

			/**********************************************************/
			/* ajaxChain query models                                 */
			/**********************************************************/

			// ---> /user/complete

			acTempCompleteUserQuery = $.extend({}, tempQueryModels["COMPLETE_USER"]);

			acTempCompleteUserParams = {
				
				data: tempFormXMLRenderedTemplate,
				success: registrationFormSubmitSuccessHandler,
				error: httpErrorHandler
					
			};

			acTempCompleteUserQuery = $.extend(acTempCompleteUserQuery, acTempCompleteUserParams);

			acTempCompleteUserConfObj = {
				
				ajaxSettings: acTempCompleteUserQuery,
				
				hasErrors: function(xmlResponse){
				
					return APP.Exceptions.hasJogServiceError(xmlResponse);
				
				}

			};

			// ---> /user/create

			acTempRegisterUserQuery = $.extend({}, tempQueryModels["REGISTER_USER"]);

			acTempRegisterUserParams = {
				
				data: tempFormXMLRenderedTemplate,
				success: registrationFormSubmitSuccessHandler,
				error: httpErrorHandler

			};

			acTempRegisterUserQuery = $.extend(acTempRegisterUserQuery, acTempRegisterUserParams);

			acTempRegisterUserConfObj = {
				
				ajaxSettings: acTempRegisterUserQuery,
				
				hasErrors: function(xmlResponse){
				
					return APP.Exceptions.hasJogServiceError(xmlResponse);
				
				}

			};
			
			/**********************************************************/
			/* ajaxChain configuration objects                        */
			/**********************************************************/
			
			if (isIncompleteUser) {
				
				ajaxChainObjArr.push(acTempCompleteUserConfObj);
				
			} else {
			
				ajaxChainObjArr.push(acTempRegisterUserConfObj);
			
			}
			
			ajaxChain.enqueue(ajaxChainObjArr);
			// Business errors will be handled by the "hasErrors" ajaxchain callback.
			// HTTP errors will be handled by the "httpErrorHandler" function.
			ajaxChain.dequeue();
			
			/**********************************************************/
			/* handlers                                               */
			/**********************************************************/
			
			function httpErrorHandler(response) {
			
				APP.Exceptions.hasJogServiceError(APP.Templates.getTemplate("GenericErrorXML"));
				
			}
			
			// JOGService query handlers
			function registrationFormSubmitSuccessHandler(xmlResponse){
			
				// begin test overlay
				
				var overlayCustomSettings;
			
				overlayCustomSettings = {
					
					maxWidth: 600,
					
					minWidth: 300
				
				};
				
				// end test overlay
				
				if (!APP.Exceptions.hasJogServiceError(xmlResponse, true)) {
					
					// incomplete user
					
					if (isIncompleteUser) {
						
						// note: remove the PAuserRegistrationDone trigger when ready to switch to PAuserProfileCompletionDone
						$(document).trigger(APP._CONFIGURATION_.Events.PAuserRegistrationDone, processedFormData);
						$(document).trigger(APP._CONFIGURATION_.Events.PAuserProfileCompletionDone, processedFormData);
						$(document).trigger(APP._CONFIGURATION_.Events.isReady);
						
						// setTimeout(function(){ 
							
						// 	overlayCustomSettings.content = printMsg("webServices", "userProfileCompletionSuccessful");
						// 	ManageInterface.showOverlay(true, overlayCustomSettings);
					
						// }, 500);
					
					// social user
					
					} else if (isSocialUser) {
						
						// social user (no verified email)
						
						if (forceDoubleOptIn) {

							$(document).trigger(APP._CONFIGURATION_.Events.PAdoubleOptInRequired, processedFormData);
							$(document).trigger(APP._CONFIGURATION_.Events.isReady);
							
							// setTimeout(function(){ 
								
							// 	overlayCustomSettings.content = printMsg("webServices", "doubleOptInRequired");
							// 	ManageInterface.showOverlay(true, overlayCustomSettings);

							// }, 500);
						
						// social user (verified email)
						
						} else {
							
							$(document).trigger(APP._CONFIGURATION_.Events.PAuserRegistrationDone, processedFormData);
							$(document).trigger(APP._CONFIGURATION_.Events.isReady);
							
							// setTimeout(function(){ 
								
							// 	overlayCustomSettings.content = printMsg("webServices", "successfulSocialRegistration");
							// 	ManageInterface.showOverlay(true, overlayCustomSettings);
							
							// }, 500);
						
						}
						
					} else {
						
						// local user
							
						$(document).trigger(APP._CONFIGURATION_.Events.PAdoubleOptInRequired, processedFormData);
						$(document).trigger(APP._CONFIGURATION_.Events.isReady);
						
						// setTimeout(function(){ 
							
						// 	overlayCustomSettings.content = printMsg("webServices", "doubleOptInRequired");
						// 	ManageInterface.showOverlay(true, overlayCustomSettings);
						
						// }, 500);
					
					}
				
				}
				
				// remove user's data cookie after registration completion
				APP.Storage.deleteCookie("JOGInfo");
				
			} // registrationFormSubmitSuccessHandler()
			
		} // _PAregisterUserHandler()
		
		/**
		 * Manages VIN verification.
		 */
		 
		function _PAverifyVinHandler(evt, data, opts) {

			var tempQueryModels,
				ePerVinVerifyChain,
				ePerVinVerifyChainArr,
				acTempEperTokenQuery,
				acTempEperTokenConfObj,
				acTempEperVDQuery,
				acTempEperVDConfObj,
				verifyVinLocalQuery,
				tempVin,
				market,
				defOpts;

			defOpts = {
			
				verifyLocal: false
				
			};

			opts = $.extend({}, defOpts, opts || {});

			tempQueryModels = APP.Services.getModels();
			ePerVinVerifyChain = new $.AjaxChain();
			ePerVinVerifyChainArr = [];

			data = $.extend({}, data || {});
			tempVin = data.vin;
			market = data.market || APP.Settings.get().market;

			// notify interface
			$(document).trigger(APP._CONFIGURATION_.Events.isBusy);


			function doneHandler(responseArr) {
				var ePerVinVerifySuccess = true;
				var response = responseArr[responseArr.length - 1];

				if (APP.Exceptions.hasEPerError(response, true)) {
					ePerVinVerifySuccess = false;
				}
				
				if (!(response.vi && response.vi.brand_code) || (response.vi && response.vi.brand_code !== APP._CONFIGURATION_.JEEP_BRAND_CODE)) {
					ePerVinVerifySuccess = false;
				}

				// If VIN was found on ePer, validation is ok.
				if (ePerVinVerifySuccess) {
					$(document).trigger(APP._CONFIGURATION_.Events.isReady);
					$(document).trigger(APP._CONFIGURATION_.Events.PAverifyVinSuccess, response);
				}
				else {
					// If requested, search VIN on the CRM.
					if (opts.verifyLocal) {
						verifyLocal();
					}
					else {
						// Otherwise notify a failed search.
						$(document).trigger(APP._CONFIGURATION_.Events.isReady);
						$(document).trigger(APP._CONFIGURATION_.Events.PAverifyVinFail, response);
					}
				}
			}

			function progressHandler(response){
				
				if (!response) { return; }
				
				switch (response.index) {
				
					case 0:
						APP.Debug.log("_PAverifyVinHandler: ajaxChain: /eper/token");
						APP.Debug.log(response.data, "dirxml");
						break;
					case 1:
						APP.Debug.log("_PAverifyVinHandler: ajaxChain: eperVD");
						APP.Debug.log(response.data, "dir");
						break;
				
				}

			}

			function httpErrorHandler(response) {

				// Trigger a generic error.
				APP.Exceptions.hasJogServiceError(APP.Templates.getTemplate("GenericErrorXML"));

			}

			function verifyLocalDoneHandler(xmlResponse) {

				var vinVerifyLocalSuccess = !APP.Exceptions.hasJogServiceError(xmlResponse, false, "vinVerifyLocal");

				// Fail case already handled by "hasJogServiceError" call.
				if (vinVerifyLocalSuccess) {
					$(document).trigger(APP._CONFIGURATION_.Events.isReady);
					$(document).trigger(APP._CONFIGURATION_.Events.PAverifyVinLocalSuccess);
				}

			}

			function verifyLocal() {

				var xhr;

				xhr = $.ajax(verifyVinLocalQuery);
				xhr.success(verifyLocalDoneHandler);

			}

			/**********************************************************/
			/* ajaxChain query models                                 */
			/**********************************************************/

			// ---> /eper/token

			acTempEperTokenQuery = $.extend({error: httpErrorHandler}, tempQueryModels["GET_EPER_TOKEN"]);

			acTempEperTokenConfObj = {
							
				ajaxSettings: acTempEperTokenQuery,
				
				transform: function(data){
					
					var tempTransformObject;
					
					tempTransformObject = {
					
						LANGUAGE: APP.Settings.get().ePerLanguage,
						VIN: tempVin,
						KTCAA: $.trim($(data).find('token').text())
					
					};
					
					return tempTransformObject;
					
				}
				
			};

			acTempEperVDQuery = $.extend({error: httpErrorHandler}, tempQueryModels["EPER_VD"]);

			acTempEperVDConfObj = {
							
				ajaxSettings: acTempEperVDQuery,
				
				/*hasHaltingCapabilities: function(data){
					
					return APP.Exceptions._hasEPerError(data) || !(data.vi && data.vi.brand_code);
				
				},*/
				
				hasErrors: function(data){
					
					/*if (APP.Exceptions.hasEPerError(data) || !(data.vi && data.vi.brand_code)) {
					
						return data;
					
					}
					
					if ((data.vi && data.vi.brand_code !== "57")) {

						return APP.Exceptions.hasEPerError(JSON.parse(APP.Templates.getTemplate("InvalidVINError")));
					
					}*/

				}
				
			};

			// Build the ajax settings that will be used to verify the vin locally.
			verifyVinLocalQuery = $.extend({error: httpErrorHandler}, tempQueryModels["VIN_VERIFY_LOCAL"]);
			// Interpolate tokens.
			verifyVinLocalQuery.url = verifyVinLocalQuery.url.replace('#VIN', tempVin);

			// Ask ePerVD first.
			ePerVinVerifyChainArr.push(acTempEperTokenConfObj);
			ePerVinVerifyChainArr.push(acTempEperVDConfObj);

			ePerVinVerifyChain.enqueue(ePerVinVerifyChainArr);
			ePerVinVerifyChain.then(doneHandler, null, progressHandler);
			ePerVinVerifyChain.dequeue();

		} // _PAverifyVinHandler()
				
		/**
		 * handles multiple vin verification
		 * CRM enabled vin: 1J4NT000000012345
		 * sample call: $(document).trigger(APP._CONFIGURATION_.Events.PAverifyMultipleVin, { vinArr: ["1C4RJFBM0EC170260", "1J4NT000000012345", "1c4rjffm4ec202413"] });
		 */
		
		function _PAverifyMultipleVinHandler(evt, vinObj){
			
			var rawResponses,
				parsedResponses,
				parsedResponseDefaultObj,
				vinArrLength,
				i;
			
			// default assignments
			vinArrLength = 0;
			rawResponses = [];
			parsedResponses = [];
			parsedResponseDefaultObj = {
				
				vin: "",
				isEPerVDValidated: false,
				isCRMValidated: false,
				status: APP._CONFIGURATION_.vinStatus.NOT_VALIDATED
			
			};

			// notify interface
			$(document).trigger(APP._CONFIGURATION_.Events.isBusy);

			function doneHandler(){
			
				var rawValidationArrLength,
					rawValidationItemArrLength,
					tempIsEPerVDValidated,
					tempIsCRMValidated,
					i,
					j;
				
				// note: assignment
				if (rawResponses && (rawValidationArrLength = rawResponses.length)) {
					
					for (i = 0; i < rawValidationArrLength; i += 1) {
					
						rawValidationItemArrLength = rawResponses[i].length
						
						for (j = 0; j < rawValidationItemArrLength; j += 1) {
							
							tempIsEPerVDValidated = tempIsCRMValidated = false;
							
							switch (j) {
								
								case 0:
									tempIsEPerVDValidated = rawResponses[i][j]["vi"] &&
									                        rawResponses[i][j]["vi"].hasOwnProperty("errorcode") &&
							                                $.trim(rawResponses[i][j]["vi"]["errorcode"]) === "0" &&
															$.trim(rawResponses[i][j]["vi"]["brand_code"]) === APP._CONFIGURATION_.JEEP_BRAND_CODE;
									break;
								case 1:
									tempIsCRMValidated = $.trim($(rawResponses[i][j]).find("code").text()) === "0";
									break;
							
							}
						
						}
						
						$.extend(parsedResponses[i], {
							
							isEPerVDValidated: tempIsEPerVDValidated,
							isCRMValidated: tempIsCRMValidated,
							status: (tempIsEPerVDValidated) ? APP._CONFIGURATION_.vinStatus.EPER_VALIDATED :
											(tempIsCRMValidated) ? APP._CONFIGURATION_.vinStatus.CRM_VALIDATED :
													APP._CONFIGURATION_.vinStatus.NOT_VALIDATED
						
						});
					
					}
					
					// notify interface
					$(document).trigger(APP._CONFIGURATION_.Events.PAverifyMultipleVinResponse, { vinArr: parsedResponses });
					
					// debug
					APP.Debug.log(parsedResponses, "dir");
				
				}
				
				// notify interface
				$(document).trigger(APP._CONFIGURATION_.Events.isReady);
				
				// debug
				APP.Debug.log("raw validation responses");
				APP.Debug.log(rawResponses, "dir");
				
			}
			
			// store response array defaults
			if (vinObj.vinArr) {
			
				vinArrLength = vinObj.vinArr.length;
			
			}
			
			for (i = 0; i < vinArrLength; i += 1) {
			
				parsedResponses.push($.extend({}, parsedResponseDefaultObj, { vin: vinObj.vinArr[i] }));
			
			} 
			
			dequeueAjaxChainInstancesArr(createAjaxChainObjectsArr(vinObj.vinArr));
			
			/**********************************************************/
			/* helper functions                                       */
			/**********************************************************/
			
			function dequeueAjaxChainInstancesArr(arr){
				
				var tempAjaxChainInstance;
				
				if (!!arr && arr.length > 0) {
								
					tempAjaxChainInstance = arr.shift();
					tempAjaxChainInstance.then(function(response){
						
						rawResponses.push(response);
						dequeueAjaxChainInstancesArr(arr);
						
						// debug
						APP.Debug.log("APP.Debug.log(response);");
						APP.Debug.log(response);
					
					}, function(){
					
						APP.Exceptions.hasJogServiceError(APP.Templates.getTemplate("GenericErrorXML"));
					
					});
					
					tempAjaxChainInstance.dequeue();
				
				} else {
				
					doneHandler();
				
				}
			
			}
			
			function createAjaxChainObjectsArr(vinArr){
			
				var tempAjaxChainArr,
					vinArrLength,
					i;
				
				// default assignments
				tempAjaxChainArr = [];
				vinArrLength = (vinArr) ? vinArr.length : 0;
				
				for (i = 0; i < vinArrLength; i += 1) {
				
					tempAjaxChainArr.push(createAjaxChainObj(vinArr[i]));
				
				}
				
				return tempAjaxChainArr;
				
			} // createAjaxChainObjectsArr()
			
			function createAjaxChainObj(vin){
			
				var tempAjaxChain,
					tempAjaxChainConfObjectsArr,
					
					tempQueryModels,
					
					acTempEperVDQuery,
					acTempEperVDParams,
					acTempEperVDConfObj,
					
					acTempVerifyVinLocalQuery,
					acTempVerifyVinLocalParams,
					acTempVerifyVinLocalConfObj;
					
				// default assignments
				tempAjaxChainConfObjectsArr = [];
				tempQueryModels = APP.Services.getModels()
				tempAjaxChain = new $.AjaxChain();
	
				// ---> ePerVD

				acTempEperVDQuery = $.extend({}, tempQueryModels["EPER_VD"]);

				acTempEperVDParams = {
					
					data: {
						
						LANGUAGE: APP.Settings.get().ePerLanguage,
						VIN: vin,
						KTCAA: APP.Session.getEPERToken()
						
					}

				};
				
				acTempEperVDQuery = $.extend(acTempEperVDQuery, acTempEperVDParams);

				acTempEperVDConfObj = {

					label: "EPER_VD",
					
					ajaxSettings: acTempEperVDQuery,
					
					hasHaltingCapabilities: function(jsonResponse){
						
						var ePerErrorCode;
						
						if (jsonResponse &&
						    jsonResponse["vi"] &&
							jsonResponse["vi"].hasOwnProperty("errorcode") &&
							((ePerErrorCode = jsonResponse["vi"] ["errorcode"]) === "0")) {
							
							return true;
							
						}
					
					}

				};
				
				// ---> /legacy/vin/validate
				
				acTempVerifyVinLocalQuery = $.extend({}, tempQueryModels["VIN_VERIFY_LOCAL_2"]);
				
				acTempVerifyVinLocalParams = {
				
					data: {
					
						vin: vin
					
					}
				
				};
				
				acTempVerifyVinLocalQuery = $.extend(acTempVerifyVinLocalQuery, acTempVerifyVinLocalParams);
			
				acTempVerifyVinLocalConfObj = {
				
					label: "VIN_VERIFY_LOCAL_2",
				
					ajaxSettings: acTempVerifyVinLocalQuery,
					
					hasErrors: function(xmlResponse){
					
						return APP.Exceptions.hasJogServiceError(xmlResponse, true, "VIN_VERIFY_LOCAL_2");
					
					}
				
				};
				
				APP.Debug.log(acTempEperVDConfObj, "dir");
				APP.Debug.log(acTempVerifyVinLocalConfObj, "dir");
				
				tempAjaxChainConfObjectsArr.push(acTempEperVDConfObj);
				tempAjaxChainConfObjectsArr.push(acTempVerifyVinLocalConfObj);
				
				tempAjaxChain.enqueue(tempAjaxChainConfObjectsArr);
				
				return tempAjaxChain;
				
			}
			
		} // _PAverifyMultipleVinHandler()
		
		/**
		 * handles membership verification by validating card numbers against vin codes.
		 *
		 * sample call: $(document).trigger(APP._CONFIGURATION_.Events.PAverifyMembership, { vin: "", card: "", email: "" });
		 * 
		 * You can use the following card-vin pairs when in certification environment:
		 * 
		 * 1C4RJFKM2EC330106 - 34
		 * 1C4NJDDU7ED582329 - 35
		 * 1C4PJMHY7EW228823 - 36
		 * 1C4RJFKM7EC434168 - 37
		 * 1C4NJDDB5ED667331 - 38
		 * 1C4NJDDU5ED645833 - 39
		 * 1C4BJWL52EL266612 - 40
		 * 1C4RJFKMXEC330113 - 41
		 * 1C4BJWL58DL672487 - 42
		 * 1C4RJFGM2EC365611 - 43
		 * 1C4RJFGM4EC365643 - 43
		 * 1C4NJDDB6ED667337 - 44
		 * 1C4PJMHY0EW293481 - 45
		 * 1C4RJFGM8EC331530 - 46
		 * 1C4RJFKM4EC283533 - 47
		 * 1C4RJFKM4EC312920 - 48
		 * 1C4RJFKM3EC330132 - 49
		 * 1C4RJFGM6EC449642 - 50
		 * 
		 */
		function _PAverifyMembershipHandler(evt, obj){
			
			var membershipVerificationQueryParams,
				xmlTemplateVars,
				tempFormXMLTemplate,
				tempFormXMLRenderedTemplate;

			xmlTemplateVars = {};
			xmlTemplateVars.membershipCard = obj.membershipCard;
			xmlTemplateVars.vin = obj.vin || undefined;
			xmlTemplateVars.email = obj.email || undefined;
			xmlTemplateVars.password = obj.password || undefined;
			
			// render xml template
			tempFormXMLTemplate = APP.Templates.getTemplate("jogServiceValidateMembershipXML");
			tempFormXMLRenderedTemplate = APP.Templates.renderTemplate(tempFormXMLTemplate, xmlTemplateVars);
			
			// set query parameters
			membershipVerificationQueryParams = {
				
				data: tempFormXMLRenderedTemplate,
				success: membershipVerificationSuccessHandler,
				error: ManageData.eGarageQueryErrorHandler
			
			};

			// notify interface
			$(document).trigger(APP._CONFIGURATION_.Events.isBusy);
			
			// query jogservice
			APP.Services.query("MEMBERSHIP_VALIDATE", membershipVerificationQueryParams);
			
			// membership verification query handler
			function membershipVerificationSuccessHandler(xmlResponse){
				var evtData,
					responseCode,
					responseSuccess,
					responseInvalidPassword,
					membershipUserType,
					membershipUserData,
					wasPasswordSubmitted;

				// "obj" stores parameters passed to membership validate request.
				wasPasswordSubmitted = (("password" in obj) && obj.password !== "");

				evtData = {};

				if (!APP.Exceptions.hasJogServiceError(xmlResponse), false, "membership_validate") {
				
					$(document).trigger(APP._CONFIGURATION_.Events.isReady);

					responseCode = $.trim($(xmlResponse).find("Response > code").text());
					responseSuccess = (responseCode === "0");
					responseInvalidPassword = (responseCode === "1");

					evtData.responseCode = responseCode;

					// UserType field is available in both cases: valid triplette or invalid password.
					if (responseSuccess || (wasPasswordSubmitted && responseInvalidPassword)) {
						membershipUserType = $.trim($(xmlResponse).find("Response > userType").text());
					}

					evtData.userType = membershipUserType;

					if (responseSuccess && wasPasswordSubmitted) {

						membershipUserData = {};
						membershipUserData.firstName = $.trim($(xmlResponse).find("Response > firstName").text());
						membershipUserData.lastName = $.trim($(xmlResponse).find("Response > lastName").text());
						membershipUserData.address = $.trim($(xmlResponse).find("Response > address").text());
						membershipUserData.city = $.trim($(xmlResponse).find("Response > city").text());
						membershipUserData.province = $.trim($(xmlResponse).find("Response > province").text());
						membershipUserData.zipCode = $.trim($(xmlResponse).find("Response > zipCode").text());
						membershipUserData.country = $.trim($(xmlResponse).find("Response > country").text());
						membershipUserData.phone = $.trim($(xmlResponse).find("Response > phone").text());
						membershipUserData.mobilePhone = $.trim($(xmlResponse).find("Response > mobilePhone").text());

						evtData.userData = membershipUserData;

					}

					if (responseSuccess) {
						$(document).trigger(APP._CONFIGURATION_.Events.PAverifyMembershipSuccess, evtData);
					}
					else {
						$(document).trigger(APP._CONFIGURATION_.Events.PAverifyMembershipFail, evtData);
					}
				
				}
			
			}
		
		} // _PAverifyMembershipHandler()
		
		/**
		 * manages expired session
		 */
		
		function _expiredSessionHandler(evt){
		
			setTimeout(_logoutHandler, APP._CONFIGURATION_.redirectsDelay);
		
		}
		
		/**
		 * manages user logout and accordingly verifies
		 * session validity
		 */
		
		function _logoutHandler(){
			
			var logoutQueryParams;
			
			// store logout status in a class-wide variable
			// loggedOut = true;
			
			// notify interface
			$(document).trigger(APP._CONFIGURATION_.Events.isBusy);
			
			// JOGService query handlers
			function logoutCompleteHandler(){
			
				/**
				 * check session validity upon logout process completion:
				 * an expired session and a consequent redirect are expected
				 */
				
				APP.Session.checkSessionValidity();
				
				/**
				 * delete user's data cookie
				 */
				
				APP.Storage.deleteCookie("JOGInfo");
			
			} // logoutCompleteHandler()
			
			/**
			 * JOGService query parameters; no error handlers:
			 * expired session exceptions should not be processed
			 */
			
			logoutQueryParams = {

				complete: logoutCompleteHandler
			
			};
			
			// JOGService query
			APP.Services.query("USER_LOGOUT", logoutQueryParams);
		
		} // _logoutHandler()
		
		/**
		 * manages user password reset
		 */
		
		function _PAuserPasswordResetHandler(evt, data){
				
			var formData,
				tempFormXMLTemplate,
				tempFormXMLRenderedTemplate,
				queryParams;
			
			// notify interface
			$(document).trigger(APP._CONFIGURATION_.Events.isBusy);
			
			// gather form data
			formData = {
				
				username: data.email,
				language: APP.Settings.get().language,
				market: APP._CONFIGURATION_.IETF_to_ISO_3166_1_alpha_2[APP.Settings.get().market],
				brand: "Jeep"
			
			};
			
			// render xml template
			tempFormXMLTemplate = APP.Templates.getTemplate("jogServiceResetPasswordXML");
			tempFormXMLRenderedTemplate = APP.Templates.renderTemplate(tempFormXMLTemplate, formData);
			 
			APP.Debug.log("begin _PAuserPasswordResetHandler: rendered xml template");
			APP.Debug.log(tempFormXMLRenderedTemplate);
			APP.Debug.log("end _PAuserPasswordResetHandler: rendered xml template");
			APP.Debug.alert("you are about to reset your password: reload page to abort")
			 
			// JOGService query parameters
			queryParams = {
			
				data: tempFormXMLRenderedTemplate,
				success: passwordResetSuccessHandler,
				error: ManageData.eGarageQueryErrorHandler
			
			};
			
			// JOGService query
			APP.Services.query("RESET_PASSWORD", queryParams);
			
			// JOGService query handlers
			function passwordResetSuccessHandler(xmlResponse){
			
				if (!APP.Exceptions.hasJogServiceError(xmlResponse)) {
				
					$(document).trigger(APP._CONFIGURATION_.Events.isReady);
					// $(document).trigger(APP._CONFIGURATION_.Events.myCarsAreaPasswordResetDone);
					
					// new success event
					$(document).trigger(APP._CONFIGURATION_.Events.PAuserPasswordResetDone);
				
				}
			
			} // passwordResetSuccessHandler()
		
		} // _PAuserPasswordResetHandler()
		
		/**
		 * manages user password rescue (after password reset)
		 */
		 
		function _PAuserPasswordRescue(evt, data){
			
			var formData,
				$tempFormElem;
			
			// notify interface
			$(document).trigger(APP._CONFIGURATION_.Events.isBusy);
			
			// gather form data
			formData = data || {};
			
			$tempFormElem = $("#passwordChange");
			
			if ($tempFormElem.size() > 0) {
			
				$tempFormElem.find("#password").val(data.newPassword);
				$tempFormElem.find("#repassword").val(data.newPassword);
				$tempFormElem.submit();
			
			}
		
		} // _PAuserPasswordRescue()
		
		/**
		 * handles ePer token ready default actions
		 * at macro-area level
		 */
		
		function _AUePerTokenReadyHandler(){
			
			APP.Debug.log("ePer token ready");
		
		} // _AUePerTokenReadyHandler()
		
		/**
		 * handles interface overlays in relation
		 * to application current status (isBusy|isReady)
		 */
		
		function _appStatusHandler(evt, options){
			
			APP.Debug.log("_appStatusHandler");
			
			var tempEvtType,
				tempMode,
				fancyboxConfiguration;
				
				// default assignments
				fancyboxConfiguration = {
				
					closeBtn: false,
					modal: true
				
				};
				
				if (options && options.overlayType === "transparent") {
					
					$.extend(fancyboxConfiguration, {
					
						beforeShow: function(){
						
							$('.fancybox-overlay').addClass('transparent-overlay');
						
						}
					
					});
				
				} else {
					
					$.extend(fancyboxConfiguration, {
					
						beforeShow: null
					
					});
				
				}
			
			tempEvtType = evt.type;
			
			switch (tempEvtType) {
			
				case APP._CONFIGURATION_.Events.isBusy:
					ManageInterface.showOverlay(true, fancyboxConfiguration);
					break;
					
				case APP._CONFIGURATION_.Events.isReady:
					ManageInterface.showOverlay(false, {});
					break;
			
			}
		
		} // _appStatusHandler()
		
		/**********************************************************/
		/* private methods                                        */
		/**********************************************************/
		
		_initialize = function _initialize(){
			
			// application global events
			$(document).on(APP._CONFIGURATION_.Events.isBusy, _appStatusHandler);
			$(document).on(APP._CONFIGURATION_.Events.isReady, _appStatusHandler);
			$(document).on(APP._CONFIGURATION_.Events.logout, _logoutHandler);
			$(document).on(APP._CONFIGURATION_.Events.sessionStatusChange, ManageData.sessionStatusChangeHandler);

			// NOTE: Expired session event is handled by user ui widgets.
			// $(document).on(APP._CONFIGURATION_.Events.expiredSession, _expiredSessionHandler);
			
			// JOGService events
			// $(document).on(APP._CONFIGURATION_.Events.eGarageError, ManageInterface.eGarageErrorHandler);
			
			// ePer events
			$(document).on(APP._CONFIGURATION_.Events.AUePERTokenReady, _AUePerTokenReadyHandler);
			$(document).on(APP._CONFIGURATION_.Events.ePerError, ManageInterface.ePerErrorHandler);
			
			// internal operations events (IAM)
			// $(document).on(APP._CONFIGURATION_.Events.internalError, ManageInterface.internalErrorHandler);
			
			// public area
			$(document).on(APP._CONFIGURATION_.Events.PAloginFormSubmit, _PAloginFormSubmitHandler);
			$(document).on(APP._CONFIGURATION_.Events.PAregisterUser, _PAregisterUserHandler);
			$(document).on(APP._CONFIGURATION_.Events.PAverifyVin, _PAverifyVinHandler);
			$(document).on(APP._CONFIGURATION_.Events.PAverifyMultipleVin, _PAverifyMultipleVinHandler);
			$(document).on(APP._CONFIGURATION_.Events.PAverifyMembership, _PAverifyMembershipHandler);
			$(document).on(APP._CONFIGURATION_.Events.PAuserPasswordReset, _PAuserPasswordResetHandler);
			$(document).on(APP._CONFIGURATION_.Events.PAuserPasswordRescue, _PAuserPasswordRescue);
			
			// auth area
			$(document).on(APP._CONFIGURATION_.Events.AUuserData, ManageData.AUuserDataHandler);
			
		}; // _initialize()
		
		// public methods
		return {
		
			/**
			 * Initializes event listeners
			 *  
			 * @method initialize
			 */
		
			initialize: _initialize
			
		};
	
	}()); // ManageEvents class
	
	/**
	 * Manages interface
	 * @class ManageInterface
	 * @private
	 * @static
	 */
	 
	ManageInterface = (function(){
			
		var _eGarageErrorHandler,
			_ePerErrorHandler,
			_internalErrorHandler,
			_showOverlay,
			_redirect;
			
		/**********************************************************/
		/* private methods                                        */
		/**********************************************************/
		
		/**
		 * Performs redirection to the specified URI
		 *  
		 * @method _redirect
		 * @param {String} URI redirection target uri
		 * @private
		 */
		
		_redirect = function _redirect(URI){
			
			var tempURI = "/";
			
			if (URI) {
			
				tempURI = URI;
			
			}
			
			window.location.href = tempURI;
		
		}; // _redirect()
		
		_showOverlay = function _showOverlay(bool, customSettings){
			
			var layerSettings;

			layerSettings = {
				
				//string: content to be displayed inside the layer
				content: '<img src="/Resources/images/ajax-loader.gif" />',
				//content: '<div>messaggio su <b>layer</b></div>',
				
				//boolean: if set to true, close button will be displayed
				closeBtn: true,
				
				//boolean: if set to true, will disable navigation and closing
				modal: false,
				
				//number: Minimum height fancyBox should be allowed to resize to 
				minHeight: 0,
				
				//number: Minimum width fancyBox should be allowed to resize to
				minWidth: 0
				
			};
			
			if (typeof customSettings === "object") {
			
				$.extend(layerSettings, customSettings);
			
			}
			
			if (bool === true) {
				
				$.fancybox.open(layerSettings);
			
			}
			
			if (bool === false) {
				
				$.fancybox.close();
			
			}
		
		}; //_showOverlay()
		
		_eGarageErrorHandler = function _eGarageErrorHandler(evt, evtData){
			
			var overlayCustomSettings;
			
			overlayCustomSettings = {
				
				maxWidth: 600,
				
				minWidth: 300
			
			};
			
			overlayCustomSettings.content = evtData.message;
			
			_showOverlay(true, overlayCustomSettings);
		
		}; // _eGarageErrorHandler()
		
		_ePerErrorHandler = function _ePerErrorHandler(evt, evtData){
		
			// forward to _eGarageErrorHandler method
			_eGarageErrorHandler(evt, evtData);
		
		}; // _ePerErrorHandler()
		
		_internalErrorHandler = function _internalErrorHandler(evt, evtData){
			
			// forward to _eGarageErrorHandler method
			_eGarageErrorHandler(evt, evtData);
		
		}; // _internalErrorHandler()
		
		/**********************************************************/
		/* public methods                                         */
		/**********************************************************/
		
		return {
			
			/**
			 * Performs redirection to the specified URI
			 *  
			 * @method _redirect
			 * @param {String} URI redirection target uri
			 */
			
			redirect: _redirect,
			showOverlay: _showOverlay,
			eGarageErrorHandler: _eGarageErrorHandler,
			ePerErrorHandler: _ePerErrorHandler,
			internalErrorHandler: _internalErrorHandler
		
		};
	
	}()); // ManageInterface class
	
	/**
	 * Manages data
	 * @class ManageData
	 * @private
	 * @static
	 */
	 
	ManageData = (function(){
	
		// private methods
		var _getAuthInfoResponseParameters,
			_getPingQSPairs,
			_parseTargetParameter,
			_getQSErrorCode,
			_processRegFormData,
			_identifySiteArea,
			_getSiteArea,
			_isAuthArea,
			_isSocialUser,
			_sessionStatusChangeHandler,
			_retrieveCurrentUserData,
			_getCurrentUserData,
			_setCurrentUserData,
			_getCurrentUserAdapter,
			_markEmptyProperties,
			_getPasswordResetPair,
			_getPasswordChangePairs,
			_parseUserDataCookie,
			_AUuserDataHandler,
			_eGarageQueryErrorHandler,
			_ePerQueryErrorHandler,
			_ajaxChainQueryErrorHandler,

			// properties
			currentArea,
			authInfoResponseParameters,
			registrationFormDefaults,
			isSocial,
			isAuthArea,
			currentUserData,
			
			// store a reference to query models
			queryModels,

			// default assignments
			authInfoResponseParameters = false;
			isSocial = false;
			isAuthArea = false;
			currentUserData = false;
			queryModels = APP.Services.getModels(); 
			
			// registration form defaults: includes "hidden" fields
			// specified by social data auth info
			registrationFormDefaults = {
				
				language: APP.Settings.get().language,
				brand: APP.Settings.get().brandCode,
				market: APP._CONFIGURATION_.IETF_to_ISO_3166_1_alpha_2[APP.Settings.get().market],
				username: "",
				password: "",
				question1: "",
				answer1: "",
				question2: "",
				answer2: "",
				firstName: "",
				lastName: "",
				title: "",
				companyName: "",
				picture: "",
				address: "",
				city: "",
				province: "",
				zipCode: "",
				country: "",
				email: "",
				phone1: "",
				phone2: "",
				phone3: "",
				mobilePhone1: "",
				mobilePhone2: "",
				mobilePhone3: "",
				fax: "",
				fiscalCode: "",
				vatNumber: "",
				gender: "",
				birthdate: "",
				cityOfBirth: "",
				relationship: "",
				interests: "",
				sports: "",
				flagPrivacy: "",
				socialId: "",
				socialProvider: "",
				profileUrl: "",
				forceDoubleOptIn: "false",
				membershipCard: "",
				vin: "",
				userType: "",
				vinStatus: ""

			};
			
		// private methods
		_getPingQSPairs = function _getPingQSPairs(){
			
			var queryString,
				queryStringParams,
				queryStringParamsLength,
				tempQueryStringParamArr,
				tempQueryStringParamName,
				tempQueryStringParamValue,
				defaultQueryStringParams,
				queryStringParamsMatches,
				authInfoParamsObjRemappingScheme,
				authInfoResponseParameters,
				hasFullMatch,
				tempName,
				tempSurnameStr,
				tempFullName,
				fullNameArr,
				fullNameArrLength,
				i,
				j,
				QUERYSTRING_PARAMS_MATCHES_THRESHOLD;
				
			// maximum number of missing queystring keys
			QUERYSTRING_PARAMS_MATCHES_THRESHOLD = 20; 
			
			/**
			 * keys passed by default via querystring
			 * in case of login via Janrain widget
			 */
			 
			defaultQueryStringParams = [
				
				"code",
				"organizations",
				"scopes",
				"sports",
				"aboutme",
				"birthday",
				"interest",
				"firstname",
				"preferredusername",
				"picture",
				"religion",
				"userstatus",
				"profilelink",
				"email",
				"address",
				"gender",
				"languagespoken",
				"relationship",
				"uid",
				"fullname",
				"surname",
				"displayname",
				"activities",
				"provider",
				
				/**
				 * querystring parameters passed in case of ko status
				 * siteminder callback
				 */

				"error"
			
			];
			
			// querystring to xml template node name
			authInfoParamsObjRemappingScheme = {
			
				"uid": "socialId",
				"provider": "socialProvider",
				"firstname": "name"
			
			};
			
			queryString = APP.Storage.getCookie("JOGInfo") || "";
			queryStringParamsMatches = 0;
			
			// parse querystring
			// queryStringParams = queryString.slice(1).split("&"); remove '?' char
			queryStringParams = queryString.split("&");
			queryStringParamsLength = queryStringParams.length;
			
			// exit if no querystring parameters exist
			if (!queryStringParamsLength) {
			
				return false;
			
			}
				
			authInfoResponseParameters = {};
			
			APP.Debug.log("begin: _getPingQSPairs(): querystring matches");
		
			for (i = 0; i < queryStringParamsLength; i += 1) {
				
				tempQueryStringParamArr = queryStringParams[i].split("=");
				
				if (tempQueryStringParamArr.length > 0) {
				
					tempQueryStringParamName = (tempQueryStringParamArr[0]) ? $.trim(decodeURIComponent(tempQueryStringParamArr[0])) : "";
					tempQueryStringParamValue = (tempQueryStringParamArr[1]) ? $.trim(decodeURIComponent(tempQueryStringParamArr[1])) : "";
					
					if ($.inArray(tempQueryStringParamName, defaultQueryStringParams) !== -1) {
						
						queryStringParamsMatches += 1;
						
						APP.Debug.log("_getPingQSPairs(): required queystring property match: " + tempQueryStringParamName);
						
						// remap key names to xml labels names
						if (tempQueryStringParamName in authInfoParamsObjRemappingScheme) {
						
							tempQueryStringParamName = authInfoParamsObjRemappingScheme[tempQueryStringParamName];
						
						}
						
						authInfoResponseParameters[tempQueryStringParamName] = tempQueryStringParamValue.replace(/\+/gi, " ").replace(/Not available/i, "");

					} else {
					
						APP.Debug.log("_getPingQSPairs(): required queystring property mismatch: " + tempQueryStringParamName);
						
					}
				
				}
			
			}
			
			APP.Debug.log("_getPingQSPairs(): querystring matches: " + queryStringParamsMatches + " | " + defaultQueryStringParams.length);
			
			/**
			 * note: ping auth response parameters should be returned in the following cases only:
			 * either code = 30 (user incomplete) or code = 1 (user unknown)
			 */
			 
			hasFullMatch = ((queryStringParamsMatches >= (defaultQueryStringParams.length - QUERYSTRING_PARAMS_MATCHES_THRESHOLD)) &&
					(authInfoResponseParameters.code === APP._CONFIGURATION_.userStatus.IS_FCA ||
					 authInfoResponseParameters.code === APP._CONFIGURATION_.userStatus.IS_MOC ||
					 authInfoResponseParameters.code === APP._CONFIGURATION_.userStatus.IS_UNKNOWN));
					
			APP.Debug.log("_getPingQSPairs(): querystring has full match: " + hasFullMatch);
			
			// check and replace non-existent name parameter value
			tempName = $.trim(authInfoResponseParameters.name);
			tempFullName = $.trim(authInfoResponseParameters.fullName);
			
			if (!tempName && tempFullName) {
				
				fullNameArr = tempFullName.split(" ");
				fullNameArrLength = fullNameArr.length;
				
				if (fullNameArrLength > 0) {
				
					authInfoResponseParameters.name = fullNameArr.shift();
					authInfoResponseParameters.surname = fullNameArr.join(" ");
					
				}
			
			}
			
			// user incomplete: remap socialId parameter value to userId
			if (authInfoResponseParameters.code === APP._CONFIGURATION_.userStatus.IS_MOC ||
			    authInfoResponseParameters.code === APP._CONFIGURATION_.userStatus.IS_FCA) {
				
				authInfoResponseParameters.userId = authInfoResponseParameters.socialId;
			
			}
			
			// normalize email parameter value
			if (authInfoResponseParameters.email &&
					authInfoResponseParameters.email.indexOf("@") === -1) {
			
				authInfoResponseParameters.email = "";
			
			}
			
			return (hasFullMatch) ? authInfoResponseParameters : false;
		
		}; // _getPingQSPairs()
		
		_getAuthInfoResponseParameters = function _getAuthInfoResponseParameters(){ 
				
			var pingQueryStringObj;
			
			// default assignments
			pingQueryStringObj = _getPingQSPairs();
			
			/**
			 * both local (in need of profile completion) and social users should be marked as 'social'
			 * whenever the minimum set of auth info key/values is retrieved from the JOGInfo
			 */
			 
			(pingQueryStringObj) ? isSocial = true : isSocial = false;
			
			// debug
			APP.Debug.log("ManageData: _getAuthInfoResponseParameters(): user is social: " + isSocial);
			
			if (pingQueryStringObj) {
			
				// debug
				APP.Debug.log("ManageData: _getAuthInfoResponseParameters(): SAML assertion data:");
				APP.Debug.log(pingQueryStringObj, "dir");
			
			}
				
			return pingQueryStringObj;
			
		}; // _getAuthInfoResponseParameters()
		
		_getQSErrorCode = function _getQSErrorCode(){
		
			var	queryString,
				queryStringParams,
				queryStringParamsLength,
				tempQueryStringParamArr,
				tempQueryStringParamName,
				tempQueryStringParamValue,
				codeParamValue,
				errorParamValue,
				errorCode,
				isIAMError,
				iamErrorCode,
				i;
			
			// default assignments
			iamErrorCode = [];
			
			/**
			 * error codes (via 'code' parameter) can be either passed in the JOGInfo cookie
			 * (cases: failed social login attempt, incomplete user, pending user) or in the querystring
			 * (cases: failed local login)
			 */
			
			queryString = APP.Storage.getCookie("JOGInfo") || (window.location.search).slice(1);
			
			// parse querystring
			queryStringParams = queryString.split("&");
			queryStringParamsLength = queryStringParams.length;
			
			APP.Debug.log("ManageData: _getQSErrorCode():");
			
			for (i = 0; i < queryStringParamsLength; i += 1) {
				
				tempQueryStringParamArr = queryStringParams[i].split("=");
				
				if (tempQueryStringParamArr.length > 0) {
				
					tempQueryStringParamName = ((tempQueryStringParamArr[0]) ? $.trim(decodeURIComponent(tempQueryStringParamArr[0])) : "").toLowerCase();
					tempQueryStringParamValue = ((tempQueryStringParamArr[1]) ? $.trim(decodeURIComponent(tempQueryStringParamArr[1])) : "").toLowerCase();
					
					if (tempQueryStringParamName === "code") {
						
						APP.Debug.log("ManageData: _getQSErrorCode(): 'code' parameter value found:");
						codeParamValue = tempQueryStringParamValue + "";
						APP.Debug.log(codeParamValue);
					
					}
					
					if (tempQueryStringParamName === "error") {
						
						APP.Debug.log("ManageData: _getQSErrorCode(): 'error' parameter value found:");
						errorParamValue = tempQueryStringParamValue + "";
						APP.Debug.log(errorParamValue);
					
					}
					
					if (tempQueryStringParamName === "src") {
					
						iamErrorCode.push(tempQueryStringParamValue);
					
					}
					
					if (tempQueryStringParamName === "status") {
					
						iamErrorCode.push(tempQueryStringParamValue);
					
					}
				
				}
			
			}
			
			if (iamErrorCode.length === 2) { errorParamValue = iamErrorCode.join(""); }
					
			return errorParamValue || codeParamValue;
		
		}; // _getQSErrorCode()
		
		_parseTargetParameter = function _parseTargetParameter(){
		
			var tempTarget,
				isWhitelistedTargetURL;
			
			// note: assignment
			if (tempTarget = decodeURIComponent(GetUrlParam("tgt"))){
				
				/**
				 * check target type: either parameter (e.g.: store) or
				 * whitelisted target url /^(http|https):\/\/ownersgroup(.cert)?.jeep.com/i
				 */
				
				isWhitelistedTargetURL = APP.globals.whiteListedTargetURLRegex.test(tempTarget);
				APP.Debug.log("_parseTargetParameter(): target url is whitelisted: " + isWhitelistedTargetURL);
				
				if (isWhitelistedTargetURL) {
					
					if (APP.Session.isAlive()) {
					
						APP.Debug.log("_parseTargetParameter(): redirect to target URL: " + tempTarget);
						window.location.href = tempTarget;
					
					} else {
						
						APP.Debug.log("_parseTargetParameter(): updating ping/siteminder endpoint TargetResource parameter value: " + tempTarget);
						APP._CONFIGURATION_.SSO.LOGIN_FORM_TARGET_URL = APP._UTILS_.updateQueryStringParameter(APP._CONFIGURATION_.SSO.LOGIN_FORM_TARGET_URL,
						                                                                                       "TargetResource", encodeURIComponent(tempTarget));
						$(".lr__social-links a").each(function(index, object){
						
							$(object).attr("href", APP._UTILS_.updateQueryStringParameter($(object).attr("href"),
						                                                                  "TargetResource", encodeURIComponent(tempTarget)));
						
						});
					
					}
				
				} else {
					
					// allow a maximum of 10 chars to be stored
					tempTarget = (tempTarget.slice(0, 10) || "").toLowerCase();
					APP.Storage.setCookie("tgt", tempTarget);
					
				}
				
			}
			
		}; // _parseTargetParameter()
		
		_getPasswordResetPair = function _getPasswordResetPair(){
			
			var tempMigrationEmail;
			
			tempMigrationEmail = GetUrlParam("migrationemail");
			
			if (tempMigrationEmail) {
			
				$("div.retrieve_pwd_form_wrap input.email").val(tempMigrationEmail);
			
			}
		
		}; // _getPasswordResetPair()
		
		_getPasswordChangePairs = function _getPasswordChangePairs(){
			
			var tempIAMToken,
				tempUserName,
				tempAppName,
				tempLang,
				tempQuerystringParamsObj,
				tempPasswordResetParamsObj,
				IAMPasswordResetHTMLTemplate,
				IAMPasswordResetHTMLRenderedTemplate,
				$passwordChangeFormElem;
			
			// gather IAM querystring parameters values: e.g. BASE_URL/ResetPasswordPage?tknRstPwd={iam_token}&username={username}&app={application}&lang={language}
			tempQuerystringParamsObj = {
			
				IAMToken: GetUrlParam("tknRstPwd"),
				userName: GetUrlParam("username"),
				appName: GetUrlParam("app"),
				lang: GetUrlParam("lang")
			
			};
			
			tempPasswordResetParamsObj = $.extend({}, tempQuerystringParamsObj, APP._CONFIGURATION_.SSO);
			IAMPasswordResetHTMLTemplate = APP.Templates.getTemplate("IAMPasswordResetHTMLTemplate");
			IAMPasswordResetHTMLRenderedTemplate = APP.Templates.renderTemplate(IAMPasswordResetHTMLTemplate, tempPasswordResetParamsObj);
			$passwordChangeFormElem = $(IAMPasswordResetHTMLRenderedTemplate);
			
			$("body").append($passwordChangeFormElem);
		
		}; // _getPasswordChangePairs()
		
		/**********************************************************/
		/* end: new janrain querystring management                */
		/**********************************************************/
		
		/**
		 * merges user submitted data with social data (if available)
		 */
		 
		_processRegFormData = function _processRegFormData(data){
		
			var tempRegistrationFormData,
				tempAuthInfoRespParams,
				tempEmail,
				tempOtherVinsArr,
				tempOtherVinsArrLength,
				tempOtherVinsXMLTemplateFragment,
				tempExtendedFormData,
				i;
			
			// default assignments
			tempOtherVinsXMLTemplateFragment = "";
			tempRegistrationFormData = data || {};
			tempAuthInfoRespParams = _getAuthInfoResponseParameters();
			tempEmail = $.trim(tempAuthInfoRespParams.email);
			
			APP.Debug.log("begin _processRegFormData: user form data");
			APP.Debug.log(data, "dir");
			APP.Debug.log("end _processRegFormData: user form data");
			
			(tempAuthInfoRespParams) ? tempRegistrationFormData.isSocial = "true" : tempRegistrationFormData.isSocial = "false";
			
			// BEGIN: PING
			
			/**
			 * social users without an email address
			 * verified by a social provider should be
			 * forced to perform double opt-in
			 */
			
			(tempAuthInfoRespParams && (!tempEmail || tempEmail.indexOf("@") === -1)) ? tempRegistrationFormData.forceDoubleOptIn = "true" :
					tempRegistrationFormData.forceDoubleOptIn = "false";
			
			// END: PING
			
			tempRegistrationFormData.brand = APP._CONFIGURATION_.brandInfoHashmap[APP.Settings.get().brandCode].shortName;
			
			tempExtendedFormData = $.extend(registrationFormDefaults, tempAuthInfoRespParams, tempRegistrationFormData);
			
			// map old eGarage fields to JOGService
			tempExtendedFormData.question1 = tempExtendedFormData.passwordQuestion;
			tempExtendedFormData.answer1 = tempExtendedFormData.passwordAnswer;
			tempExtendedFormData.firstName = tempExtendedFormData.name;
			tempExtendedFormData.lastName = tempExtendedFormData.surname;
			tempExtendedFormData.mobilePhone1 = tempExtendedFormData.phone2;
			tempExtendedFormData.phone2 = "";
			tempExtendedFormData.fax = tempExtendedFormData.phone3;
			tempExtendedFormData.phone3 = "";
			tempExtendedFormData.birthdate = tempExtendedFormData.birthday;
			tempExtendedFormData.cityOfBirth = tempExtendedFormData.birthplace;
			tempExtendedFormData.flagPrivacy = tempExtendedFormData.channels;
			tempExtendedFormData.profileUrl = tempExtendedFormData.socialProfileLink;
			tempExtendedFormData.email = tempExtendedFormData.username;
			tempExtendedFormData.data = JSON.stringify(tempExtendedFormData.data);
			
			// multiple vin numbers
			tempOtherVinsArr = data.otherVins;
			if (tempOtherVinsArr && (tempOtherVinsArrLength = tempOtherVinsArr.length)) {
				
				for (i = 0; i < tempOtherVinsArrLength; i += 1) {
					
					tempOtherVinsXMLTemplateFragment += APP.Templates.renderTemplate(APP.Templates.getTemplate("jogServiceCreateUserOtherVinXML"), tempOtherVinsArr[i]);
				
				}
			
			}
			
			tempExtendedFormData.otherVins = tempOtherVinsXMLTemplateFragment;
			
			APP.Debug.log("ManageData: _processRegFormData(): extended user form data:");
			APP.Debug.log(tempExtendedFormData, "dir");
			APP.Debug.alert("ManageData: _processRegFormData(): take a chance to see user form basic and extended data in the console log");
			
			return tempExtendedFormData;
			
		}; // _processRegFormData()
		
		_identifySiteArea = function _identifySiteArea(){ 
			
			/**********************************************************/
			/* macro areas: auth area                                 */
			/**********************************************************/
			
			if (APP._CONFIGURATION_.AreaIdentifiers.isAuthArea()) { 

				isAuthArea = true;
				APP.Debug.log("ManageData: _identifySiteArea(): current macro area: isAuthArea");

			}
			
			/**********************************************************/
			/* micro areas                                            */
			/**********************************************************/
			
			if (APP._CONFIGURATION_.AreaIdentifiers.isRegisterArea()) { 

				currentArea = APP._CONFIGURATION_.Areas.isRegisterArea;
				APP.Debug.log("ManageData: _identifySiteArea(): current micro area: isRegisterArea");

			}
			
			if (APP._CONFIGURATION_.AreaIdentifiers.isUserProfile()) { 

				currentArea = APP._CONFIGURATION_.Areas.isUserProfile;
				APP.Debug.log("ManageData: _identifySiteArea(): current micro area: isUserProfile");

			}

			if (APP._CONFIGURATION_.AreaIdentifiers.isPasswordResetPage()) {
			
				currentArea = APP._CONFIGURATION_.Areas.isPasswordResetPage;
				APP.Debug.log("ManageData: _identifySiteArea(): current micro area: password reset page");
			
			}
			
			if (APP._CONFIGURATION_.AreaIdentifiers.isPasswordChangePage()) {
			
				currentArea = APP._CONFIGURATION_.Areas.isPasswordChangePage;
				APP.Debug.log("ManageData: _identifySiteArea(): current micro area: password change page");
			
			}
		
		}; // _identifySiteArea()
		
		_getSiteArea = function _getSiteArea(){
		
			return currentArea;
		
		}; // _getSiteArea()
		
		/**
		 * identifies the current portal macro-area: either authenticated or not
		 */
		
		_isAuthArea = function _isAuthArea(){
		
			return isAuthArea;
		
		}; // _isAuthArea()
		
		/**
		 * gets data in relation to the current
		 * macro and micro areas and notifies changes
		 * to ManageInterface class
		 */
		 
		_sessionStatusChangeHandler = function _sessionStatusChangeHandler(){
		
			var isAlive,
				currentSiteArea,
				isAuthArea,
				authInfoParams;
			
			/**********************************************************/
			/* site status checks                                     */
			/**********************************************************/
			
			// check session status
			isAlive = APP.Session.isAlive();
			
			APP.Debug.log("ManageData: _sessionStatusChangeHandler(): session status: " + isAlive);
			APP.Debug.log("ManageData: _sessionStatusChangeHandler(): performing default actions");
			
			// get current site area
			currentSiteArea = _getSiteArea();
			
			// get current site macro area: either authenticated or not
			isAuthArea = _isAuthArea();
			
			/**********************************************************/
			/* public area default actions                            */
			/**********************************************************/
			
			// remove user's data cookie 'JOGInfo' (ping auth info) whenever browsing out of user registration pages 
			if (/* !isAuthArea &&  */isAlive === false && currentSiteArea !== APP._CONFIGURATION_.Areas.isRegisterArea) {
				
				APP.Debug.log("ManageData: _sessionStatusChangeHandler(): public area: out of registration pages: removing JOGInfo cookie");
				APP.Storage.deleteCookie("JOGInfo");
			
			}
			
			// search for possible authinfo response parameters in the querystring
			// and accordingly notify interface; ping test
			if (currentSiteArea === APP._CONFIGURATION_.Areas.isRegisterArea) {
				
				// retrieve eper token
				APP.Session.retrieveEPERToken();
				
				// parse optional target parameter
				_parseTargetParameter();
				
				// gather auth info parameters and notify interface
				authInfoParams = _getAuthInfoResponseParameters();
				$(document).trigger(APP._CONFIGURATION_.Events.PAhasAuthInfo, authInfoParams);
				
				// check for errors
				// APP.Exceptions.hasInternalOperationError(authInfoParams);
				APP.Exceptions.hasInternalOperationError(_getQSErrorCode());
			
			} 
			
			// password reset
			if (currentSiteArea === APP._CONFIGURATION_.Areas.isPasswordResetPage) {
			
				_getPasswordResetPair();
			
			}
			
			// pure JOGService user validation via double opt-in
			if (currentSiteArea === APP._CONFIGURATION_.Areas.isPasswordChangePage) {
			
				_getPasswordChangePairs();
			
			}
			
			/**********************************************************/
			/* auth area default actions                              */
			/**********************************************************/	
			
			// initialize user profile page management
			if (currentSiteArea === APP._CONFIGURATION_.Areas.isUserProfile) {
				
				UserProfile.initialize();
			
			}
			
			/**********************************************************/
			/* all areas default actions                              */
			/**********************************************************/
			
			// should session be kept alive ?https://owner.cert.APP.eu/it/it/1
			if (isAlive && APP._CONFIGURATION_.keepSessionAlive) {
			
				APP.Session.keepSessionAlive();
			
			}
			
			// always retrieve user data if session is alive:
			// falls back to JOGInfo cookie
			if (isAlive) {
			
				_retrieveCurrentUserData();
			
			}
		
		}; // _sessionStatusChangeHandler()
		
		_retrieveCurrentUserData = function _retrieveCurrentUserData(){
			
			var	ajaxChain,
				ajaxChainObjArr,
			
				acUserDataQuery,
				acUserDataParams,
				acUserDataConfObj;

				// default assignments
				ajaxChain = new $.AjaxChain();
				ajaxChainObjArr = [];
			
			/**********************************************************/
			/* Promise handlers                             	      */
			/**********************************************************/
			
			function doneHandler(response){
				
				var acUserDataResponse;
				
				// store responses
				if (response) {
				
					acUserDataResponse = response[0];
					
				}
				
				// notify other modules of the successful user data retrieval
				$(document).trigger(APP._CONFIGURATION_.Events.AUuserData, acUserDataResponse);
					
			}
			
			function progressHandler(response){
				
				if (!response) { return; }
				
				switch (response.index) {
				
					case 0:
						APP.Debug.log("ManageData: _retrieveCurrentUserData():");
						APP.Debug.log(response.data, "dirxml");
						break;
				
				}
			
			}
			
			/**********************************************************/
			/* ajaxChain query models                                 */
			/**********************************************************/
			
			// ---> user data
			
			acUserDataQuery = $.extend({}, queryModels["GET_USER"]);
			
			acUserDataParams = {
				
				success: function(xmlResponse){
					
					if (xmlResponse && !APP.Exceptions.hasJogServiceError(xmlResponse, true)) {
					
						_setCurrentUserData(xmlResponse);
					
					}
				
				}
			
			};
			
			acUserDataQuery = $.extend(acUserDataQuery, acUserDataParams);
			
			acUserDataConfObj = {
			
				ajaxSettings: acUserDataQuery,
				
				hasCache: function(){
					
					var tempUserProfileData;
					
					tempUserProfileData = _parseUserDataCookie();
					
					APP.Debug.log("ManageData: _retrieveCurrentUserData(): attempting to retrieve user profile data from JOGInfo cookie");
					
					if (tempUserProfileData) {
				
						_setCurrentUserData(tempUserProfileData);
						
						APP.Debug.log("ManageData: _retrieveCurrentUserData(): JOGInfo cookie found");
						return tempUserProfileData;
					
					} else {
					
						APP.Debug.log("ManageData: _retrieveCurrentUserData(): JOGInfo cookie *not* found, falling back to eGarage3.0");
						return false;
					
					}
					
				},
				
				hasErrors: function(xmlResponse){
				
					APP.Exceptions.hasJogServiceError(xmlResponse, true);
				
				}
				
			};
			
			ajaxChain.enqueue([acUserDataConfObj]);
			ajaxChain.then(doneHandler, ManageData.ajaxChainQueryErrorHandler, progressHandler);
			ajaxChain.dequeue();
		
		}; // _retrieveCurrentUserData()
		
		_getCurrentUserData = function _getCurrentUserData(){
		
			return currentUserData;
		
		}; // _getCurrentUserData()
		
		_setCurrentUserData = function _setCurrentUserData(xmlResponse){
		
			currentUserData = xmlResponse;
			
			APP.Debug.log("ManageData: _setCurrentUserData(): setting user data");
		
		}; // _setCurrentUserData()
		
		_getCurrentUserAdapter = function _getCurrentUserAdapter(){
		
			var tempUserData,
				tempUserAdapterArr,
				tempUserAdapter,
				tempIdpAdapterId;
			
			tempUserData = _getCurrentUserData();
			
			tempUserAdapterArr = $.trim($(tempUserData).find("provider").text()).toLowerCase().match(/^(b2c)|(linkedin)|(yahoo)|(twitter)|(google)|(facebook)$/gi);
			
			if (tempUserAdapterArr && tempUserAdapterArr.length > 0) {
			
				tempUserAdapter = tempUserAdapterArr[0];
				
				if (APP._CONFIGURATION_.IDP_ADAPTER_IDS_HASHMAP.hasOwnProperty(tempUserAdapter)) {
					
					tempIdpAdapterId = APP._CONFIGURATION_.IDP_ADAPTER_IDS_HASHMAP[tempUserAdapter]
				
				}
			
			}
			
			return tempIdpAdapterId;
			
		}; // _getCurrentUserAdapter()
		
		_isSocialUser = function _isSocialUser(){
		
			return isSocial;
		
		}; // _isSocialUser()
		
		_eGarageQueryErrorHandler = function _eGarageQueryErrorHandler(jqXHR, status){
		
			var xmlResponse;
			
			if (status === "abort" || status == "0") { return; }
		 	
			try {
			
				// JOGService service intermittently serves XML data as text/html			
				xmlResponse = (jqXHR.responseXML) ? jqXHR.responseXML :
					(jqXHR.responseText) ? $.parseXML(jqXHR.responseText) : "";
			
				if (xmlResponse && ($(xmlResponse).find("Error").size() > 0)) {
					
					APP.Exceptions.hasJogServiceError(xmlResponse);
				
				} else {
					
					APP.Exceptions.hasJogServiceError(APP.Templates.getTemplate("GenericErrorXML"));
				
				}
			
			} catch (e) {
			
				APP.Exceptions.hasJogServiceError(APP.Templates.getTemplate("GenericErrorXML"));
			
			}
		
		}; // _eGarageQueryErrorHandler()
		
		_ePerQueryErrorHandler = function _ePerQueryErrorHandler(){
			
			APP.Exceptions.hasEPerError(JSON.parse(APP.Templates.getTemplate("GenericEPerError")));
		
		} // _ePerQueryErrorHandler()
		
		/**
		 * @method _ajaxChainQueryErrorHandler
		 * @param {Array} AjaxChain response array 
		 * @private
		 */
		_ajaxChainQueryErrorHandler = function _ajaxChainQueryErrorHandler(responseArray){
			
			var failedCallResponse;
			
			// note: assignment
			if (responseArray && (failedCallResponse = responseArray[responseArray.length - 1])) {
				
				// detect jqXHR object
				if (typeof failedCallResponse.getResponseHeader === "function") {
					
					ManageData.eGarageQueryErrorHandler(failedCallResponse, failedCallResponse.status);
				
				// detect plain object
				} else if (typeof failedCallResponse === "object"){
					
					APP.Exceptions.hasEPerError(failedCallResponse);
				
				} else {
				
				// fallback
					APP.Exceptions.hasJogServiceError(APP.Templates.getTemplate("GenericErrorXML"));
				
				}

			} else {
			
				APP.Exceptions.hasJogServiceError(APP.Templates.getTemplate("GenericErrorXML"));
			
			}

		}; // _ajaxChainQueryErrorHandler()
		
		/**
		 * NEW VERSION: triggers auth area default actions
		 * upon logged user data successful retrieval
		 *
		 * @method _AUuserDataHandler
		 * @private
		 */
		
		_AUuserDataHandler = function _AUuserDataHandler(){
			
			// useful in order to make further queries dependent on user data
			var currentSiteArea;
			
			// get site micro-area
			currentSiteArea = _getSiteArea();
			
			// trigger further actions in relation to current site micro-area
			switch (currentSiteArea) {
					
				case APP._CONFIGURATION_.Areas.isRegisterArea:
						APP.Debug.log("ManageData: _AUuserDataHandler(): current area: isRegisterArea");
						APP.Session.retrieveEPERToken();
						break;
			
			}
		
		}; // _AUuserDataHandler()
		
		/**
		 * @method _markEmptyProperties
		 * @param {Object} obj object whose properties will be examined and
		 *                            possibly set to a Nihil instance in case
		 *                            of falsy and/or (optionally) markers (e.g.: "-")
		 * @param {Boolean} stripMarkers defines wheter markers should be replaced with
		 *                               and empty string
		 * @private
		 */
		
		_markEmptyProperties = function _markEmptyProperties(obj, stripMarkers){
			
			var tempObj,
				tempVal,
				i;
			
			if (obj && typeof obj === "object") {
			
				tempObj = $.extend({}, obj);
			
			} else {
			
				return;
			
			}
			
			for (i in tempObj) {
			
				if (tempObj.hasOwnProperty(i)) {
					
					tempVal = $.trim(tempObj[i]);
					
					if (!tempVal || (tempVal === "-" && stripMarkers)) {
					
						tempObj[i] = new Nihil();
					
					}
				
				}
			
			}
			
			return tempObj;
		
		}; // _markEmptyProperties()
		
		/**
		 * @method _parseUserDataCookie
		 * @return {Object} xml document (see jogServiceUserProfileXML template)
		 * @private
		 */
		 
		_parseUserDataCookie = function _parseUserDataCookie(){
		
			var userDataCookieVal,
				userDataObj,
				queryStringParams,
				tempQueryStringParamArr,
				tempQueryStringParamName,
				tempQueryStringParamValue,
				queryStringParamsLength,
				qsToXMLTemplateHashMap,
				tempUserProfileXMLTemplate,
				tempUserProfileXMLRenderedTemplate,
				tempUserProfileXMLDoc,
				i;
			
			// default assignments
			tempUserProfileXMLDoc = null;
			qsToXMLTemplateHashMap = {
			
				"email": "username",
				"languagespoken": "language",
				"firstname": "firstName",
				"uid": "uid",
				"surname": "lastName",
				"fullname": "fullName",
				"provider": "provider"
			
			};
			
			userDataCookieVal = APP.Storage.getCookie("JOGInfo") || "";
			
			// parse querystring
			// queryStringParams = userDataCookieVal.slice(1).split("&");
			queryStringParams = userDataCookieVal.split("&");
			queryStringParamsLength = queryStringParams.length;
			
			if (queryStringParamsLength > 1) {
				
				userDataObj = {};
				
				for (i = 0; i < queryStringParamsLength; i += 1) {
					
					tempQueryStringParamArr = queryStringParams[i].split("=");
					
					if (tempQueryStringParamArr.length > 0) {
						
						tempQueryStringParamName = ((tempQueryStringParamArr[0]) ? $.trim(decodeURIComponent(tempQueryStringParamArr[0])) : "").toLowerCase();
						
						// remap param names
						if (qsToXMLTemplateHashMap.hasOwnProperty(tempQueryStringParamName)) {
						
							tempQueryStringParamName = qsToXMLTemplateHashMap[tempQueryStringParamName];
						
						}
						
						tempQueryStringParamValue = (tempQueryStringParamArr[1]) ? $.trim(decodeURIComponent(tempQueryStringParamArr[1])) : "";
						userDataObj[tempQueryStringParamName] = tempQueryStringParamValue/* .replace(/\+/gi, " ").replace(/Not available/i, "") */;
						APP.Debug.log(tempQueryStringParamName);
						APP.Debug.log(tempQueryStringParamValue);

					}
				
				}
				
				tempUserProfileXMLTemplate = APP.Templates.getTemplate("jogServiceUserProfileXML");
				tempUserProfileXMLRenderedTemplate = APP.Templates.renderTemplate(tempUserProfileXMLTemplate, userDataObj);
				tempUserProfileXMLDoc = $.parseXML(tempUserProfileXMLRenderedTemplate);
				
				APP.Debug.log("ManageData: _parseUserDataCookie(): remapped user data retrieved from JOGInfo");
				APP.Debug.log(tempUserProfileXMLDoc, "dirxml");
			
			}
			
			return tempUserProfileXMLDoc;
		
		}; // _parseUserDataCookie()
		
		return {
			
			getAuthInfoResponseParameters: _getAuthInfoResponseParameters,			
			processRegFormData: _processRegFormData,
			identifySiteArea: _identifySiteArea,
			getSiteArea: _getSiteArea,
			sessionStatusChangeHandler: _sessionStatusChangeHandler,
			isAuthArea: _isAuthArea,
			isSocialUser: _isSocialUser,
			getCurrentUserData: _getCurrentUserData,
			setCurrentUserData: _setCurrentUserData,
			getCurrentUserAdapter: _getCurrentUserAdapter,
			markEmptyProperties: _markEmptyProperties,
			eGarageQueryErrorHandler: _eGarageQueryErrorHandler,
			ePerQueryErrorHandler: _ePerQueryErrorHandler,
			ajaxChainQueryErrorHandler: _ajaxChainQueryErrorHandler,
			AUuserDataHandler: _AUuserDataHandler,
		
		};
	
	}()); // ManageData class

	/**********************************************************/
	/* begin AuthArea initialization                          */
	/**********************************************************/
	
	// private methods
	_initialize = function _initialize(){
		
		// check debug mode status
		APP._CONFIGURATION_.debugMode = APP.Storage.getCookie("dbg");
		
		// temporary contest initialization
		
		// where am i ? identify auth area subsection
		ManageData.identifySiteArea();
		
		/**
		 * set default cookies upon landing on non-authenticated area pages
		 */
		
		if (!ManageData.isAuthArea()) {
			
			APP.Debug.log("AuthArea: _initialize(): writing 'mrd' and 'mflru' cookies");
			APP.Storage.initialize();

		}
		
		/**
		 * check for "mrd" cookie existence
		 * and accordingly update application settings:
		 * market|language|brandcode|marketcode
		 */
		
		APP.Debug.log("AuthArea: _initialize(): updating application settings");
		APP.Settings.update();
		
		// initialize event listeners
		ManageEvents.initialize();
		
		// check wheter the session is alive
		APP.Session.checkSessionValidity();
	
	}; // _initialize()
	
	/**********************************************************/
	/* AuthArea public methods                                */
	/**********************************************************/

	return {
		
		// class initialization
		initialize: _initialize,
		
		getSiteArea: ManageData.getSiteArea,
		
		// ping auth info response parameters
		hasAuthInfo: ManageData.getAuthInfoResponseParameters,
		
		getCurrentUserAdapter: ManageData.getCurrentUserAdapter/* ,

		ManageInterface: ManageInterface
 */	
	};

}()); // AuthArea class

/********************************************************************/
/* begin: eper services error callback                              */
/********************************************************************/

window.error = function ePerErrorHandler(jsonResponse){
	
	APP.Debug.log("window.error(): ePerErrorHandler(): ePer jsonp error");
	APP.Exceptions.hasEPerError(jsonResponse);

} // ePerErrorHandler()

/********************************************************************/
/* end: eper services error callback                                */
/********************************************************************/

/********************************************************************/
/* begin: utility constructors                                      */
/********************************************************************/

/**
 * instances of Nihil constructors are used as placeholder values
 * of objects suitable for xml templates population; whenever a
 * Nihil instance is encountered, the APP.Templates.renderTemplate
 * method creates and empty node instead of applying the default
 * node removal behaviour
 */
 
function Nihil(){}

/********************************************************************/
/* end: utility constructors                                        */
/********************************************************************/

}(JOG, this, JOG._UTILS_.printMsgs, JOG._UTILS_.getUrlParam, JOG._UTILS_.pad, JOG._UTILS_.reverseDate));
