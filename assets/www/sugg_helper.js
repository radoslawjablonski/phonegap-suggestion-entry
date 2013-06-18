(function( $ ) {
	
$.fn.mobileSuggHelper = function(inputSuggArray, options) {
	// parameters from input context
	var suggestionArray = inputSuggArray;
	var suggestionHolder = null; //taken from $(this) in return-initializer
	
	var conf = $.extend({}, $.fn.mobileSuggHelper.defaults, options); 
	
	var popupSuggestionQId = '#entrySuggestionPopup';
	var privPopupSuggestionObj = null;
	
	// initializing events
	var initEvents = function () {
		suggestionHolder.keydown(function(event) {
		handleKeyDownPriv(event, this);
		});
	
		$(window).resize(function() {
			// handle resizing of window, passing true as param meaning resize event only
			correctSizeAndPosOfPopup(true);
		});
	};
	
	var handleKeyDownPriv = function (event, inputField) {
		var keyCode = ('which' in event) ? event.which : event.keyCode;
		var backspaceCode = '8';
		
		var filter = inputField.value;
		console.log('keycode=' + keyCode);
		
		//backspace scenario
		if (keyCode == backspaceCode) {
			if (filter.length > 0) {
				filter = filter.substring(0, filter.length - 1);
			}
			
			// empty string - doing nothing with backspace
		} else {
			var char = String.fromCharCode(keyCode);
			filter += char;
		}
		
		console.log("Filter = " + filter);
		if (filter != '' && filter.length <= conf.acceptableMaxFilterLen) {
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
		if (hide == true) {
			getPopupSuggestionObj().css('visibility', 'hidden');
			grayOut(false);
		} else {
	    		getPopupSuggestionObj().css('visibility', 'visible');
	  		//making background gray, so popup will be visible
			grayOut(true, {zindex: 1});
		}
	}
    
	var displaySuggestionPopup = function(suggestionArray, filterValue) {
	        // display the address information for all contacts
		console.log("Filter value: " + filterValue);
    	
		var areResultsToShow = false;
		var resultsAfterFiltering = [];
		
		//at first addin only to temporary list
		for (var i = 0; i < suggestionArray.length; i++) {
			// comparing last filter value and ignoring results that names not beginning with
			// filter (less results to show and also less confusing for user)
			if (suggestionArray[i] != null &&
				suggestionArray[i].toLowerCase().indexOf( filterValue.toLowerCase() ) === 0) {
				
				resultsAfterFiltering.push(suggestionArray[i]);
				areResultsToShow = true;
			}
		} // end of suggestions
		
		if (areResultsToShow == true) {
			// clearing prev results and real adding
			clearPopup();
			for (var i = 0; i < resultsAfterFiltering.length; i++) {
				addSuggestionToPopup(resultsAfterFiltering[i]);
			}
		 
			// showing popup
			console.log("Some results exists. Showing contacts popup");
			hideSuggestionPopup(false);
		} else {
			// no results to show - hiding popup
			hideSuggestionPopup(true);
		}
	};
    
	var createSuggestionPopupDivIfNeeded = function () {
		// jQuery always returns an object, so different checking is needed
		if (privPopupSuggestionObj == null) {
			console.log("Creating object for suggestion popup");
			var popupSuggestionHtmlName = popupSuggestionQId.substr(1);
			var suggestionDivHtml = "<div id=" + popupSuggestionHtmlName + "></div>"; 
			$("body").append(suggestionDivHtml);
			
			privPopupSuggestionObj = $(popupSuggestionQId);
			
			// setting correct left position to be right in line with input
			var positionInputLeft = suggestionHolder.position().left;
			privPopupSuggestionObj.css('left', positionInputLeft);
			
			//... and also width of suggestion popup
			privPopupSuggestionObj.css('width',  suggestionHolder.width());
			
			//enabling 'nice scroll' if available
			if (conf.useNiceScrollbar) {
				privPopupSuggestionObj.niceScroll({autohidemode:true});
			}
		}
		
		return privPopupSuggestionObj;
	};
	
	var correctTopPositionOfPopup = function () {
		var topNew = suggestionHolder.position().top; 
		
		if (true == conf.popOnTop) {
			topNew = topNew - conf.inputEntryTopMargin - getPopupSuggestionObj().height();
		} else {
			topNew += suggestionHolder.outerHeight(true);
		}
		
	  	getPopupSuggestionObj().css('top', topNew);
		console.log("Top: " + topNew + " Heigth popup: " + getPopupSuggestionObj().height() +
				" pos input top:"
				+ suggestionHolder.position().top);
	};
	
	var handleHeightOfPopup = function () {
		// NOTE: use height from css in case of problems
		var heightDiff = $(".suggRow").height();
		
		var heightNew = getPopupSuggestionObj().height();
		// getting max available space on top - it will be equal to top position
		// of input field
		var positionInputTop = suggestionHolder.position().top;
		
		// if maxNumberOfSuggElements is defined, then using that value of max elements
		// insted counting and using whole space above manually. Then user of that library
		// is responsible for keeping content in the screen
		var possibleVisiblePopupHeigth = 0;

		// counting max space for popup
		if (true == conf.popOnTop) {
		    possibleVisiblePopupHeigth = positionInputTop -
							(heightDiff + conf.inputEntryTopMargin);
		} else {
		    possibleVisiblePopupHeigth = $(window).height()
		                                 - positionInputTop
		                                 - suggestionHolder.outerHeight(true)
		                                 - heightDiff; // to allow some space below
		}
		
		if (heightNew <= (possibleVisiblePopupHeigth - heightDiff)) {
			heightNew = heightNew + heightDiff;
			
			if (!conf.useNiceScrollbar) {
				// sets overflow to hidden by default
				getPopupSuggestionObj().css('overflow', 'hidden');
			}
		} else {
			console.log("Content reached max possible size")
		 	heightNew = possibleVisiblePopupHeigth;
			
			if (!conf.useNiceScrollbar) {
				getPopupSuggestionObj().css('overflow', 'auto');
			}
		}
    	
	  	getPopupSuggestionObj().height(heightNew);
	}
	
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
		var positionInputLeft = suggestionHolder.position().left;
		getPopupSuggestionObj().css('left', positionInputLeft);
			
		//... and also width of suggestion popup
		getPopupSuggestionObj().css('width',  suggestionHolder.width());
		
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
	
	var addSuggestionToPopup = function (name) {
		createSuggestionPopupDivIfNeeded();

	  	var contactRow = '<div class="suggRow"';
	  	var rowId = 'suggestion_'+ name;
	  	contactRow += ' id="'+ rowId + '">';
    	
	  	var contactName = '<div class="suggNameVal">' + name + '</div>';
    	
	  	contactRow += name;
	  	contactRow += '</div>';
    	
		getPopupSuggestionObj().append(contactRow);
	  	document.getElementById(rowId).addEventListener("click", 
	    		function() {onEmailRowClicked(name);},
	    		false);
		
		// correcting size and position
		correctSizeAndPosOfPopup();
	};
	
	function onEmailRowClicked(name) {
		console.log("suggestion row clicked:"  + name);
    	
		suggestionHolder.val(name);
    	
		//when row is clicked it means that we can safely close popup
		hideSuggestionPopup(true);
	}
	
	var clearPopup = function () {
		console.log("clear popup: ");
		getPopupSuggestionObj().html('');
		getPopupSuggestionObj().height(0);
	}

	var getPopupSuggestionObj = function() {
		if (privPopupSuggestionObj == null) {
			privPopupSuggestionObj = createSuggestionPopupDivIfNeeded();
		}
		
		return privPopupSuggestionObj;
	};
	
	var grayOut = function (vis, options) {
	      // NOTE: snippet received from http://www.hunlock.com/blogs/Snippets:_Howto_Grey-Out_The_Screen
	    
	      // Pass true to gray out screen, false to ungray
	      // options are optional.  This is a JSON object with the following (optional) properties
	      // opacity:0-100         // Lower number = less grayout higher = more of a blackout 
	      // zindex: #             // HTML elements with a higher zindex appear on top of the gray out
	      // bgcolor: (#xxxxxx)    // Standard RGB Hex color code
	      // grayOut(true, {'zindex':'50', 'bgcolor':'#0000FF', 'opacity':'70'});
	      // Because options is JSON opacity/zindex/bgcolor are all optional and can appear
	      // in any order.  Pass only the properties you need to set.
	      var options = options || {}; 
	      var zindex = options.zindex || 50;
	      var opacity = options.opacity || 70;
	      var opaque = (opacity / 100);
	      var bgcolor = options.bgcolor || '#000000';
	      var dark=document.getElementById('darkenScreenObject');
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
	        dark=document.getElementById('darkenScreenObject');  // Get the object.
	      }
	      if (vis) {
	        // Calculate the page width and height 
	        if( document.body && ( document.body.scrollWidth || document.body.scrollHeight ) ) {
	            var pageWidth = document.body.scrollWidth+'px';
	            var pageHeight = document.body.scrollHeight+'px';
	        } else if( document.body.offsetWidth ) {
	          var pageWidth = document.body.offsetWidth+'px';
	          var pageHeight = document.body.offsetHeight+'px';
	        } else {
	           var pageWidth='100%';
	           var pageHeight='100%';
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
	        
	        //adding ontouch close
	        addEventListener("click", 
	                function() {document.getElementById('darkenScreenObject').style.display='none'},
	                false);
	      } else {
	         dark.style.display='none';
	      }
	    };
	    
	    // initializing css automagically
	    var initSuggHelperCss = function () {
		// moving here css style to achieve simple plugin use, don't need to include
		// separate css file
		$("<style type='text/css'> \
		div#entrySuggestionPopup { \
			position: absolute; \
			z-index: 3; \
			visibility: hidden; \
			overflow: hidden; \
			} \
			\
		div#entrySuggestionPopup div.suggRow { \
			background-color: white; \
			border-bottom: 1px solid  #999999; \
			color: #999999; \
			height: 45px; \
			font: 18px Verdana, Arial, Helvetica, sans-serif; \
			}\
			\
		</style>").appendTo("head")
	    };
	    
	 return this.filter( "input" ).each(function() {
		suggestionHolder = $(this);
		initEvents();
		initSuggHelperCss();
	});
}

// plugin defaults
$.fn.mobileSuggHelper.defaults = {	
	acceptableMaxFilterLen : 10,
	inputEntryTopMargin : 0,
	useNiceScrollbar : true,
	popOnTop : true // if false then popup will be shown below text input
	}
	
}( jQuery ));