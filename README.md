fortunewheel
============

jQuery plugin for creating "Wheel of Fortune" styled input texts (separating chars)

Example For Use:

	$(document).ready(function(){
		$("input.wof").fortuneWheel({
			/*
			//Optional values and their defaults
			placeholder: null, 					// The element to put the characters in
			pattern: [], 						// The pattern of the text - can also be provided using data-pattern on the element
			hideElem: true, 					// Hide the original element
			wordSpace: 15, 						// Space between words in pixels (uses margin)
			spaceClass: "word-space",			// Class added to the last char in every word (except the last word)
			showCaretSymbol: false, 			// Whether to show the caret symbol on the char focused
			allowBlanks: true,					// If falsy - no char is allowed to be empty in the middle
			blurOnLastChar: false, 				// Whether to blur out of the last characters when it is filled with value
			placeholderClass: 'fortune-wheel',	// class added to the characters holder
			eventFull: 'change-full', 			// name for event triggered (after change) when the pattern is full
			eventNotFull: 'change-not-full', 	// name for event triggered (after change) when the pattern is not full yet
			allowNumbers: false, 				// Whether to allow numbers input (doesn't work well when in RTL)
			trimValue: true, 					// Whether to trim the result when it is returned
			filledClass: 'filled', 				// A class added to input when it is fill
			*/
			//restrict: "א-תa-zA-Z",				// Regular expression's set of characthers allowed to be entered
			byWords: true,						// Split the pattern to words instead of chars
			full: function(val){ 				// Callback when full
				$("#result_demo").text("Full: "+val);
			},
			partial: function(val){ 			//callback when change partially
				$("#result_demo").text("NOT FULL");
			}
		});
	});

	
When the HTML is:

	<input type="text" class="wof" data-pattern="[2,3,2]" />
	<div id="result_demo"></div>
	
	

In order to destroy the plugin from a specific input you can call

	$("input.wof").fortuneWheel("destroy")
	
