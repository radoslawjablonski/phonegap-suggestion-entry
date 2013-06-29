PhoneGap Suggestion (Autocomplete) Entry 
=========================
 

## Initialization

It's quite easy - when we have text-input like this:


    <input data-role="none" id="mailAddrInputField"  type="text"></input>


..and table with suggestions database: 

    var mySuggestionsArray = [ "atestmail1@git.com", "anothertestmail@zzz.net", "testowymail@zuzu.pl", "testemail666@git.com", "testpurposeemail@wp.pl", "zzztest@wp.pl"];

then we have only to call '.mobileSuggHelper' method on text-input object: 

    $('#mailAddrInputField').mobileSuggHelper(mySuggestionsArray);

and that is all what you have do. 

 
*Note: to 'darkening background' effect proper behaviour setting 'z-index' of input is needed. it's value has to be equal or larget than '2' - otherwise input field will be under dark div and this doesn't look very good:) Plugin will also log errors to javascript console about that.*

Sample CSS for input field:

    input#mailAddrInputField { 
        position: relative; 
        z-index: 2; 
    }

*If you don't like this darkening effect, you can turn this off by using configuration options. Handling options is described in paragraph 'Configuration'*


## Configuration structure

Configuration structure looks like that:

	$.fn.mobileSuggHelper.defaults = {
		popupSuggestionQId : '#entrySuggestionPopup',
		shadowBackgroundMode : true,
		inputEntryTopMargin : 0,
		useNiceScrollbar : true,
		popOnTop : true, // if false then popup will be shown below text input
		rowEntryCssClass : 'suggRow',
		popupHolderCss : {
			'position': 'absolute',
			'z-index': '3',
			'visibility': 'hidden',
			'overflow': 'hidden'
		}
	} 

*  popupSuggestionQId - id of popup that shows all possible suggestions
*  shadowBackgroundMode - when disabled, then it won't be dark area in background of suggestion popup
*  inputEntryTopMargin - minum margin between top of the window and suggestions popup top-corner
*  useNiceScrollbar - when enabled, then nicescroll library will be used to handling scrolling (looks nicer)
*  popOnTop - if true, then popup will be shown **above** text input. Otherwise popup will be shown **under** text input
*  rowEntryCssClass - css class id used for every row with data in suggestion popup
*  popupHolderCss - css class data defined for popup container, change those values if it is really needed

## Global configuration

Configuration is possible via 'defaults' property of 'mobileSuggHelper' object. It will
work for all plugin instances. It should be called **BEFORE** target plugin instance for
text-input will be created.

	$.fn.mobileSuggHelper.defaults.shadowBackgroundMode = false;

As you can see, 'shadowBackgroundMode' will be now disabled - there won't be gray
area in background when popup with autocomplete suggestion options will be shown.

## Configuration by init parameter

Configuration defaults structure can be also passed on plugin init for target text-input as a second parameter (first parameter means data that will be used as suggestions database, second is responsible
for configuration)

	$('#mailAddrInputField').mobileSuggHelper(mySuggestionsArray,
											  {popOnTop:false,
											  shadowBackgroundMode:false});
											  
In this example we disabled 'popOnTop' mode, so now suggestions will be shown **under** the
text-input. Also disabled 'shadowBackgroundMode'.
