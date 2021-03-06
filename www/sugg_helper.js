(function( $ ) {
"use strict";

$.fn.mobileSuggHelper = function(inputSuggArray, options) {
	// parameters from input context
	var suggestionArray = inputSuggArray;
	var targetSuggInput = null; //taken from $(this) in return-initializer
	
	var conf = $.extend({}, $.fn.mobileSuggHelper.defaults, options); 
	
	var privPopupSuggestionObj = null;
	var isPopupHidden = true;
	
	// initializing events
	var initEvents = function () {
		targetSuggInput.keydown(function(event) {
		handleKeyDownPriv(event, this);
		});
	
		$(window).resize(function() {
			// handle resizing of window, passing true as param meaning resize event only
			if (!isPopupHidden) {
				correctSizeAndPosOfPopup(true);
				grayOut(true, {zindex: 1});//re-painting gray area
			}
		});
	};
	
	var handleKeyDownPriv = function (event, inputField) {
		var keyCode = ('which' in event) ? event.which : event.keyCode;
		var backspaceCode = 8;
		
		var filter = inputField.value;
		console.log('keycode=' + keyCode);
		
		//backspace scenario
		if (keyCode === backspaceCode) {
			if (filter.length > 0) {
				filter = filter.substring(0, filter.length - 1);
			}
			
			// empty string - doing nothing with backspace
		} else {
			var char = String.fromCharCode(keyCode);
			filter += char;
		}
		
		console.log("Filter = " + filter);
		if (filter !== '') {
			// getting results only if filter is set
			displaySuggestionPopup(suggestionArray, filter);
		} else {
			// when filter is empty we can hide address popup
			console.log("Filter is empty or too long. Ignoring");
			hideSuggestionPopup(true);
		}
	};
	
	//address popup should be hidden when
	// a: there are no results
	// b: when filter is empty
	var hideSuggestionPopup = function (hide) {
		isPopupHidden = hide;

		if (hide) {
			getPopupSuggestionObj().css('visibility', 'hidden');
			grayOut(false);
		} else {
			getPopupSuggestionObj().css('visibility', 'visible');
			//making background gray, so popup will be visible
			grayOut(true, {zindex: 1});
		}
	};

	var displaySuggestionPopup = function(suggestionArray, filterValue) {
		// display the address information for all contacts
		console.log("Filter value: " + filterValue);

		var areResultsToShow = false;
		var resultsAfterFiltering = [];
		var i = 0;
		
		//at first addin only to temporary list
		for (i = 0; i < suggestionArray.length; i++) {
			// comparing last filter value and ignoring results that names not beginning with
			// filter (less results to show and also less confusing for user)
			if (suggestionArray[i] &&
				suggestionArray[i].toLowerCase().indexOf( filterValue.toLowerCase() ) === 0) {
				
				resultsAfterFiltering.push(suggestionArray[i]);
				areResultsToShow = true;
			}
		} // end of suggestions
		
		// clearing prev results and real adding
		clearPopup();
		if (areResultsToShow) {
			for (i = 0; i < resultsAfterFiltering.length; i++) {
				addRowEntryToPopup(resultsAfterFiltering[i], true);
			}		 
		} else {
			if (filterValue.length === 0) {
				// filter is empty, hiding popup
				hideSuggestionPopup(true);
				return;
			}
			
			addRowEntryToPopup("No results", false);
		}
		
		// showing popup
		console.log("Some results exists. Showing contacts popup");
		hideSuggestionPopup(false);
	};
    
	var createSuggestionPopupDivIfNeeded = function () {
		// jQuery always returns an object, so different checking is needed
		if (!privPopupSuggestionObj) {
			console.log("Creating object for suggestion popup");
			var popupSuggestionHtmlName = conf.popupSuggestionQId.substr(1);
			var suggestionDivHtml = "<div id=" + popupSuggestionHtmlName + "></div>";
			$("body").append(suggestionDivHtml);
			
			privPopupSuggestionObj = $(conf.popupSuggestionQId);
			privPopupSuggestionObj.css(conf.popupHolderCss);
			
			// setting correct left position to be right in line with input
			var positionInputLeft = targetSuggInput.position().left;
			privPopupSuggestionObj.css('left', positionInputLeft);
			
			//... and also width of suggestion popup
			privPopupSuggestionObj.css('width',  targetSuggInput.width());
			
			//enabling 'nice scroll' if available
			if (conf.useNiceScrollbar) {
				privPopupSuggestionObj.niceScroll({autohidemode:true});
			}
		}

		return privPopupSuggestionObj;
	};
	
	var correctTopPositionOfPopup = function () {
		var topNew = targetSuggInput.position().top; 
		
		if (conf.popOnTop) {
			topNew = topNew - conf.inputEntryTopMargin - getPopupSuggestionObj().height();
		} else {
			topNew += targetSuggInput.outerHeight(true);
		}
		
		getPopupSuggestionObj().css('top', topNew);
		console.log("Top: " + topNew + " Heigth popup: " + getPopupSuggestionObj().height() +
				" pos input top:" +
				targetSuggInput.position().top);
	};

	var handleHeightOfPopup = function () {
		// NOTE: use height from css in case of problems
		var heightDiff = $('.' + conf.rowEntryCssClass).height();
		
		var heightNew = getPopupSuggestionObj().height();
		// getting max available space on top - it will be equal to top position
		// of input field
		var positionInputTop = targetSuggInput.position().top;
		
		// if maxNumberOfSuggElements is defined, then using that value of max elements
		// insted counting and using whole space above manually. Then user of that library
		// is responsible for keeping content in the screen
		var possibleVisiblePopupHeigth = 0;

		// counting max space for popup
		if (conf.popOnTop) {
			possibleVisiblePopupHeigth = positionInputTop -
							(heightDiff + conf.inputEntryTopMargin);
		} else {
			possibleVisiblePopupHeigth = $(window).height() -
						positionInputTop -
						targetSuggInput.outerHeight(true) -
						heightDiff; // to allow some space below
		}

		if (heightNew <= (possibleVisiblePopupHeigth - heightDiff)) {
			heightNew = heightNew + heightDiff;

			if (!conf.useNiceScrollbar) {
				// sets overflow to hidden by default
				getPopupSuggestionObj().css('overflow', 'hidden');
			}
		} else {
			console.log("Content reached max possible size");
			heightNew = possibleVisiblePopupHeigth;

			if (!conf.useNiceScrollbar) {
				getPopupSuggestionObj().css('overflow', 'auto');
			}
		}

		getPopupSuggestionObj().height(heightNew);
	};

	var correctSizeAndPosOfPopup = function (resizeEventOnly) {
		// handling popup size issue
		// constants. Simple visualisation of problem is below
		//
		// ######### var heightDiff
		// # popup #
		// ######### var inputEntryTopMargin 
		// @input text
		//
		// var inputEntryTopMargin 

		// setting correct left position to be right in line with input
		var positionInputLeft = targetSuggInput.position().left;
		getPopupSuggestionObj().css('left', positionInputLeft);
			
		//... and also width of suggestion popup
		getPopupSuggestionObj().css('width',  targetSuggInput.outerWidth(false)); //false means no-margin
		
		if (resizeEventOnly) {
			correctTopPositionOfPopup();
			return;
		}
		
		handleHeightOfPopup();
		correctTopPositionOfPopup();
		
		if (conf.useNiceScrollbar) {
			// notyfying about size change - scrollbar will be have correct size
			getPopupSuggestionObj().getNiceScroll().resize();
		}
		
	};

	var addRowEntryToPopup = function (name, clickable) {
		createSuggestionPopupDivIfNeeded();

		var contactRow = '<div class="' + conf.rowEntryCssClass + '"';
		var rowId = 'suggestion_'+ name;
		contactRow += ' id="'+ rowId + '">';

		contactRow += name;
		contactRow += '</div>';

		getPopupSuggestionObj().append(contactRow);

		if (clickable) {
			document.getElementById(rowId).addEventListener("click", 
				function() {onEmailRowClicked(name);},
				false);
		}

		// correcting size and position
		correctSizeAndPosOfPopup();
	};

	function onEmailRowClicked(name) {
		console.log("suggestion row clicked:"  + name);

		targetSuggInput.val(name);

		//when row is clicked it means that we can safely close popup
		hideSuggestionPopup(true);
	}

	var clearPopup = function () {
		console.log("clear popup: ");
		getPopupSuggestionObj().html('');
		getPopupSuggestionObj().height(0);
	};

	var getPopupSuggestionObj = function() {
		if (!privPopupSuggestionObj) {
			privPopupSuggestionObj = createSuggestionPopupDivIfNeeded();
		}

		return privPopupSuggestionObj;
	};

	var grayOut = function (vis, opts) {
	// NOTE: snippet received from http://www.hunlock.com/blogs/Snippets:_Howto_Grey-Out_The_Screen
	
		// Pass true to gray out screen, false to ungray
		// options are optional.  This is a JSON object with the following (optional) properties
		// opacity:0-100         // Lower number = less grayout higher = more of a blackout 
		// in any order.  Pass only the properties you need to set.
		var options = opts || {};
		var hideOnClick = options.hideOnclick || false;
		var zindex = options.zindex || 50;
		var opacity = options.opacity || 70;
		var opaque = (opacity / 100);
		var bgcolor = options.bgcolor || '#000000';

		if (!conf.shadowBackgroundMode) {
			// shadowBackgound mode disabled - doing nothing
			return;
		}
	
		var input_zindex = targetSuggInput.css('z-index');
		if (isNaN(input_zindex) || input_zindex < 2) {
		console.error("Error. When using 'shadowBackgroundMode' target text input entry 'z-index' css property has to be larget than '1'.\nOtherwise tex-input field will be shadowed!\nPlease fix your css for input field or stop using shadowBackgroundMode. It can be done by passing {shadowBackgroundMode : false} as second param to .mobileSuggHelper() on plugin init.");
		}

		var dark = document.getElementById('darkenScreenObject');
		if (!dark) {
			var tbody = document.getElementsByTagName("body")[0];
			var tnode = document.createElement('div');           // Create the layer.
			tnode.style.position='absolute';                 // Position absolutely
			tnode.style.top='0px';                           // In the top
			tnode.style.left='0px';                          // Left corner of the page
			tnode.style.overflow='hidden';                   // Try to avoid making scroll bars
			tnode.style.display='none';                      // Start out Hidden
			tnode.id='darkenScreenObject';                   // Name it so we can find it later
			tbody.appendChild(tnode);                            // Add it to the web page
			dark = document.getElementById('darkenScreenObject');  // Get the object.
		}
		
		if (!vis) {
			dark.style.display='none';
			return;
		}
		
		// Calculate the page width and height
		var pageWidth='100%';
		var pageHeight='100%';
		
		if( document.body && ( document.body.scrollWidth || document.body.scrollHeight ) ) {
			pageWidth = document.body.scrollWidth+'px';
			pageHeight = document.body.scrollHeight+'px';
		} else if( document.body.offsetWidth ) {
			pageWidth = document.body.offsetWidth+'px';
			pageHeight = document.body.offsetHeight+'px';
		}
		
		//set the shader to cover the entire page and make it visible.
		dark.style.opacity=opaque;                      
		dark.style.MozOpacity=opaque;                   
		dark.style.filter='alpha(opacity='+opacity+')'; 
		dark.style.zIndex=zindex;        
		dark.style.backgroundColor=bgcolor;  
		dark.style.width= pageWidth;
		dark.style.height= pageHeight;
		dark.style.display='block';
	
		if (hideOnClick) {
			//adding ontouch close
			addEventListener("click", 
			function() {document.getElementById('darkenScreenObject').style.display='none';},
			false);
		}
	};

	// initializing css automagically
	var initSuggHelperCss = function () {
		// moving here css style to achieve simple plugin use, don't need to include
		// separate css file
		$("<style type='text/css'> \
		div.suggRow { \
			background-color: white; \
			border-top: 1px solid  #999999; \
			border-left: 1px solid  #999999; \
			border-right: 1px solid  #999999; \
			color: #999999; \
			height: 45px; \
			font: 18px Verdana, Arial, Helvetica, sans-serif; \
			padding-left: 5px; \
			-webkit-box-align: center; \
			display: -webkit-box; \
			}\
			\
		</style>").appendTo("head");
	};

	return this.filter( "input" ).each(function() {
		// constructor
		targetSuggInput = $(this);
		createSuggestionPopupDivIfNeeded();
		initEvents();
		initSuggHelperCss();
	});
};

// plugin defaults
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
	};

}( jQuery ));