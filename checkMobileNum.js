/**
 * @class  checkMobileNum Checks mobile number validation on a market basis
 * @return {Function} Market-specific function
 * @example
 * MYAPP.checkMobileNum[MYAPP_market]
 */
MYAPP.checkMobileNum = (function checkMobileNum(){

	"use strict";

	return {

		/**
		 * Italy
		 * @param  {String} num Mobile number
		 * @return {Boolean}
		 */
		it: function(num){

			if ( num.substring(0, 2) === "03" ) {

				if ( (num !== 10) && (num !== 9) ) {

					return false;

				}

			} else {

				return false;

			}

		},

		/**
		 * France
		 * @param  {String} num Mobile number
		 * @return {Boolean}
		 */
		fr: function(num){

			if ( num.substring(0, 2) === "06" || num.substring(0, 2) === "07" ) {

				if ( num.length === 10 ) {

					return true;

				}

			}

			return false;

		},

		/**
		 * Belgium
		 * @param  {String} num Mobile number
		 * @return {Boolean}
		 */
		be: function(num){

			var startsWith = num.substring(0, 3);

			if ( startsWith === "046" ||
				 startsWith === "047" ||
				 startsWith === "048" ||
				 startsWith === "049"
			) {

				if ( num.length === 10 ) {

					return true;

				}

			}

			return false;

		},

		/**
		 * Netherland
		 * @param  {String} num Mobile number
		 * @return {Boolean}
		 */
		nl: function(num){

			var startsWith = num.substring(0, 3);

			if ( startsWith === "061" ||
				 startsWith === "062" ||
				 startsWith === "063" ||
				 startsWith === "064" ||
				 startsWith === "065" ||
				 startsWith === "068" ||
				 startsWith === "069"
			) {

				if ( num.length === 10 ) {

					return true;

				}

			}

			return false;

		},

		/**
		 * Russia
		 * @param  {String} num Mobile number
		 * @return {Boolean}
		 */
		ru: function(num){

			if ( num.substring(0, 2) === "89" ) {

				if ( num.substring(0, 4) === "8970" || num.substring(0, 4) === "8971" ) {

					return false;

				}

				if ( num.length === 11 ) {

					return true;

				}

			}

			return false;

		},

		/**
		 * Germany
		 * @param  {String} num Mobile number
		 * @return {Boolean}
		 */
		de: function(num){

			var startsWith = num.substring(0, 3);

			if ( startsWith === "015" || startsWith === "016" || startsWith === "017" ) {

				if ( startsWith === "015" ) {

					if ( num.length === 12 )  {

						return true;

					}

				} else {

					if ( num.substring(0, 4) === "0176" ) {

						if ( num.length === 12 )  {

							return true;

						} else {

							return false;

						}

					}

					if ( num.substring(0, 5) === "01609" ) {

						if ( num.length === 12 )  {

							return true;

						} else {

							return false;

						}

					}

					if ( num.length === 11 || num.length === 12 )  {

						return true;

					}

				}

			}

			return false;

		}

	};

})();