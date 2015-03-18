if (typeof MOPAR === "undefined") {
	var MOPAR = {};
}

if (typeof MOPAR._UTILS_ === "undefined") {
	MOPAR._UTILS_ = {};
}

(function(root) {

var validateForm = {
	form: '',
	callback: '',
	init: function(form, callback, scrollToError, customValidation){
		validateForm.form = form;
		validateForm.callback = callback;
		validateForm.customValidation = customValidation;
		validateForm.scrollToError = scrollToError || false;
		
		validateForm.checkFields();
		// removeErrors() does not work well.
		// validateForm.removeErrors();
	},
	checkFields: function(){
		
		var formOk = true,
			
			validEmail = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,
			
			validDigits = /^\d+$/;

		// Remove all errors.
		// Note: it could be necessary to change the selector depending on field types.
		validateForm.form.find(":input, label, .radio-group").removeClass("error");

		if (typeof(this.customValidation) === 'function') {
			formOk = this.customValidation();
		}
		
		//campo input text obbligatorio
		var requiredTextInput = validateForm.form.find('input[type="text"].required:visible');
		if(requiredTextInput.length){
			requiredTextInput.each(function(){
				var $this = $(this);
				if( $this.val() === '' ){
					$this.addClass("error");
					formOk = false;
				}
			});
		}
		
		//campo input password obbligatorio
		var requiredPwdInput = validateForm.form.find('input[type="password"].required:visible');
		if(requiredPwdInput.length){
			requiredPwdInput.each(function(){
				var $this = $(this);
				if( $this.val() === '' ){
					$this.addClass("error");
					formOk = false;
				}
			});
		}
		
		//campo textarea obbligatorio
		var requiredTextarea = validateForm.form.find('textarea.required:visible');
		if(requiredTextarea.length){
			requiredTextarea.each(function(){
				var $this = $(this);
				if( $this.val() === '' ){
					$this.addClass("error");
					formOk = false;
				}
			});
		}
		
		//campo input checkbox obbligatorio
		var requiredCheckbox = validateForm.form.find('input[type="checkbox"].required:visible');
		if(requiredCheckbox.length){
			requiredCheckbox.each(function(){
				var $this = $(this);
				if( !$this.is(':checked') ){
					$this.addClass("error");
					$this.parent("label").addClass("error");
					formOk = false;
				}
			});
		}
		
		//campo select obbligatorio
		var requiredSelect = validateForm.form.find('select.required:visible');
		if(requiredSelect.length){
			requiredSelect.each(function(){
				var $this = $(this);
				if( $this.val() === '' || $this.val() === '-'){
					$this.addClass("error");
					formOk = false;
				}
			});
		}
		
		//email
		var email = validateForm.form.find('.email:visible');
		if(email.length){
			email.each(function(){
				var $this = $(this);
				if( !validEmail.exec($this.val()) ){
					$this.addClass("error");
					formOk = false;
				}
			})
		}
		
		//solo numeri
		var digits = validateForm.form.find('.digits:visible');
		if(digits.length){
			digits.each(function(){
				var $this = $(this);
				if( $this.val()!= '' && !validDigits.exec($this.val()) ){
					$this.addClass("error");
					formOk = false;
				} else if ( $this.hasClass('brand-forms-registration-year') && $('select.brand-forms-registration-month').val() != '' ) {//registration date between 1900 and current year
					
					var currentYear = new Date().getFullYear();
					if ( parseInt( $this.val(), 10) < 1900 || parseInt( $this.val(), 10) > currentYear ){
						$this.addClass("error");
						formOk = false;
					}
					
				}
			});
		}
		
		//validazione pwd (almeno 8 caratteri) e conferma password
		var password = validateForm.form.find('.password:visible'),
			confirmPassword = validateForm.form.find('.confirm_password:visible');
		
		if(password.length && password.val().length < 8){
			password.addClass("error");
			formOk = false;
		}
		if(password.length && confirmPassword.length){
			if( confirmPassword.val() !== password.val() ){
				confirmPassword.addClass("error");
				formOk = false;
			}
		}
		
		//validazione blocco modifica Password
		var oldPwd = validateForm.form.find('input[name="old_pwd"]:visible'),
			newPwd = validateForm.form.find('input[name="new_pwd"]:visible'),
			confirmNewPwd = validateForm.form.find('input[name="confirm_new_pwd"]:visible');
		
		if(validateForm.form.attr('class') == 'change_password_fields_wrap'){
			
			if( oldPwd.val() === '' ){
				oldPwd.addClass("error");
				formOk = false;
			}
			if( newPwd.val() === '' ){
				newPwd.addClass("error");
				formOk = false;
			}
			if( confirmNewPwd.val() === '' ){
				confirmNewPwd.addClass("error");
				formOk = false;
			}
			if( newPwd.val() !== confirmNewPwd.val() ){
				confirmNewPwd.addClass("error");
				formOk = false;
			}
			
		}
		
		//radio
		var formRadioGroup = validateForm.form.find('.radio-group:visible');
		formRadioGroup.each(function(){
			if ( $(this).find('input[type="radio"]').filter(':checked').length <= 0 ) {
				
				formOk = false;
				
				$(this).closest(".radio-group").addClass("error");
				
			}
		});
		
		//telefono: necessario compilare uno dei due campi (tel fisso o cellulare)
		/* var phoneNumber = validateForm.form.find('.phone_number:visible');
		if(phoneNumber.length){
			var validatePhoneNum = false,
				validatePhoneNumPrefix = false;
			phoneNumber.each(function(){
				var $this = $(this),
					$select = $(this).closest(".row").find("select"),
					$selectOption = $select.find("option:selected");
				
				if($this.val() !== ''){
				
					//validateForm.form.find('.phone_number').removeClass("error");
					validatePhoneNum = true;
					
					if($selectOption.val() === "-") {
					
						validatePhoneNumPrefix = true;
						return false;
					
					}

					return false;//esce dal ciclo
					
				}
				
			});
			
			if(!validatePhoneNum){
				phoneNumber.addClass("error");
				formOk = false;
			}
			
			if(!validatePhoneNumPrefix){
			
				$select.addClass("error");
				formOk = false;
			
			}
		} */
		
		/* phone number */
		var $phoneNumber = validateForm.form.find('.phone_number:visible');
		
		if($phoneNumber.length){
			
			var validRows = 0,
				invalidElements = [];
			
			$phoneNumber.each(function(index, object){
			
				var rowIsValid = false,
					numInvalidElements = 0,
					$phoneNumberInput,
					$phonePrefixSelect;
					
				
				$phoneNumberInput = $(object);
				$phonePrefixSelect = $phoneNumberInput.closest(".row").find("select");
				$selectOption = $phonePrefixSelect.find("option:selected");
				
				if ($.trim($phoneNumberInput.val()) === "" || !validDigits.exec($phoneNumberInput.val()) ) {
				
					//$phoneNumberInput.addClass("error");
					invalidElements.push($phoneNumberInput);
					numInvalidElements++;
				
				}
				
				if ($.trim($selectOption.val()) === "-") {
				
					//$phonePrefixSelect.addClass("error");
					invalidElements.push($phonePrefixSelect);
					numInvalidElements++;
				
				}
				
				if (numInvalidElements === 0) {
				
					validRows++;
				
				}
		
			});
			
			if (validRows === 0) {
				
				for(var i=0; i<invalidElements.length; i+=1){
					invalidElements[i].addClass('error');
				}
				
				formOk = false;
				
			}
		
		}
		
		/* //privato oazienda: necessario esprimere la preferenza scegliendo una delle due opzioni
		var privateCompanyRadio = validateForm.form.find('.choose_private_company:visible');
		if(privateCompanyRadio.length){
			if( !privateCompanyRadio.filter(':checked').length ){
				privateCompanyRadio.parents('label').addClass("error");
				formOk = false;
			}
		} */
		
		//consenso privacy: necessario esprimere la preferenza scegliendo una delle due opzioni
		var privacyRadio = validateForm.form.find('.privacy_radio:visible');
		if(privacyRadio.length){
			if( !privacyRadio.filter(':checked').length ){
				privacyRadio.parents('label').addClass("error");
				formOk = false;
			}
		}
		//consenso privacy: scenario 6 e 7 (DE, PT)
		var privacyCheckbox = validateForm.form.find('.privacy_checkbox:visible');
		if(privacyCheckbox.length){
			privacyCheckbox.each(function(checkbox) {
				if (!$(this).is(':checked')) {
					$(this).parents('label').addClass("error");
					formOk = false;
				}
			});
		}
		//consenso privacy: scenario 3 (FR)
		var privacyRadioFr = validateForm.form.find('.accept_privacy input:visible');
		if (privacyRadio.filter(':checked').val() == "ok"){
			if(privacyRadioFr.length){
				if( privacyRadioFr.filter(':checked').val() !== "ok" ){
					privacyRadioFr.parents('label').addClass("error");
					formOk = false;
				}
			}
		}
		
		if(formOk){
			validateForm.callback();
		}else{
			if (validateForm.scrollToError) {
				$('html, body').animate({ scrollTop: validateForm.form.find('.error:first').parent().offset().top }, 500);
			}
		}
	},
	removeErrors: function(){
		validateForm.form.find('input.error').keyup(function(){
			$(this).removeClass('error');
		});
		
		validateForm.form.find('textarea.error').keyup(function(){
			$(this).removeClass('error');
		});
		
		validateForm.form.find('select.error').change(function(){
			$(this).removeClass('error');
		});
		
		validateForm.form.find('label.error input[type="checkbox"]').click(function(){
			$(this).removeClass('error');
			$(this).parent('label').removeClass('error');
		});
		
		validateForm.form.find('.phone_number').keyup(function(){
			$('select[name="countrycode"]').removeClass('error');
			$('.phone_number').removeClass('error');
		});
		
		validateForm.form.find('.radio-group input').click(function(){
			$(this).closest(".radio-group").removeClass("error");
		});
		
		validateForm.form.find('select[name="countrycode"]').change(function(){
			$('select[name="countrycode"]').removeClass('error');
			$('.phone_number').removeClass('error');
		});
		
		validateForm.form.find('label.error .privacy_radio').click(function(){
			validateForm.form.find('.privacy_radio').parents('label.error').removeClass('error');
		});
		
		validateForm.form.find('label.error .privacy_checkbox').click(function(){
			validateForm.form.find('.privacy_checkbox').parents('label.error').removeClass('error');
		});
		
		validateForm.form.find('label.error .privacy_radio_fr').click(function(){
			validateForm.form.find('.privacy_radio_fr').parents('label.error').removeClass('error');
		});
		
		
	}
}

function clearForm(form){
	form.find(':input').each(function() {
		
		var _this = $(this),
			type = _this.attr('type'),
			tagName = _this.prop('tagName').toLowerCase();
		
		switch(type) {
			case 'text':
			case 'password':
			case 'textarea':
			case 'email':
			case 'phone':
			case 'date':
				_this.val('');
				_this.removeClass('error');
			break;
			case 'checkbox':
				_this.removeAttr('checked');
				_this.removeClass('error');
				_this.closest('label').removeClass('error');
			break;
			case 'radio':
				_this.removeAttr('checked');
				_this.removeClass('error');
				
				_this.closest('.radio-group').removeClass('error');
			break;
		}
		
		if(tagName == 'select'){
			_this.attr({'value':'-'}).find('option[value="-"]').attr({'selected':'selected'});
			_this.removeClass('error');
		}
		
	});
	
}

root.validateForm = validateForm;
root.clearForm = clearForm;

}(JOG._UTILS_));


(function(root) {

/**
 *
 *  Javascript string pad
 *  http://www.webtoolkit.info/
 *
 */
 
function pad(str, len, pad, dir) {
	
	var STR_PAD_LEFT = 1;
	var STR_PAD_RIGHT = 2;
	var STR_PAD_BOTH = 3;
 
	if (typeof(len) == "undefined") { var len = 0; }
	if (typeof(pad) == "undefined") { var pad = ' '; }
	if (typeof(dir) == "undefined") { var dir = STR_PAD_RIGHT; }
 
	if (len + 1 >= str.length) {
 
		switch (dir){
 
			case STR_PAD_LEFT:
				str = Array(len + 1 - str.length).join(pad) + str;
			break;
 
			case STR_PAD_BOTH:
				var right = Math.ceil((padlen = len - str.length) / 2);
				var left = padlen - right;
				str = Array(left + 1).join(pad) + str + Array(right+1).join(pad);
			break;
 
			default:
				str = str + Array(len + 1 - str.length).join(pad);
			break;
 
		} // switch
 
	}
 
	return str;
 
}

/**
 * Allows to convert date formats
 * depending on services and forms specs
 */

function reverseDate(dateString, conversionType){
	
	var tempDate;
	
	// default assignments
	tempDate = "";
	
	// from dd/mm/yyyy to yyyy-mm-dd
	if (conversionType === "serviceToForm") {
	   
		tempDate = dateString.split("/");
	   
		/* console.log("begin TEMPDATE LENGTH: ----------------------");
		console.dir(tempDate);
		console.log("end TEMPDATE LENGTH: ------------------------"); */
	   
		if (tempDate && tempDate.length === 3) {
	   
			tempDate = tempDate[2]+ "-" + tempDate[1] + "-" + tempDate[0];
		   
		}
	
	}
   
   
/*     // from mm/dd/yyyy to yyyy-mm-dd
    if (conversionType === "formToService") {
   
        tempDate = dateString.split("/");
       
        console.log("begin TEMPDATE LENGTH: ----------------------");
        console.dir(tempDate);
        console.log("end TEMPDATE LENGTH: ------------------------");
       
        if (tempDate && tempDate.length === 3) {
       
            tempDate = tempDate[2]+ "-" + tempDate[0] + "-" + tempDate[1];
           
        }
   
    }
   
    // from yyyy-mm-dd to mm/dd/yyyy
    if (conversionType === "serviceToForm") {
       
        tempDate = dateString.split("-");
       
        console.log("begin TEMPDATE LENGTH: ----------------------");
        console.dir(tempDate);
        console.log("end TEMPDATE LENGTH: ------------------------");
       
        if (tempDate && tempDate.length === 3) {
       
            tempDate = tempDate[1]+ "/" + tempDate[2] + "/" + tempDate[0];
           
        }
   
    } */
   
    return tempDate;

}

function formatDateServiceToForm(dd, mm, yyyy, separator){
	
	var date;
	
	switch(mopar_market){
		case ''://es. United States, Belize
			date = mm + separator + dd + separator + yyyy;
		break;
		case ''://es. China, Hungary, Iran, Japan, Koreas, Lithuania, Mongolia
			date = yyyy + separator + mm + separator + dd;
		break;
		default:
			date = dd + separator + mm + separator + yyyy;
	}
	
	return date;
}

function formatDateFormToService(dd, mm, yyyy){
	
	var date =  yyyy + '-' + mm + '-' + dd;
	
	return date;
}

root.pad = pad;
root.reverseDate = reverseDate;
root.formatDateFormToService = formatDateFormToService;
root.formatDateServiceToForm = formatDateServiceToForm;

}(JOG._UTILS_));
