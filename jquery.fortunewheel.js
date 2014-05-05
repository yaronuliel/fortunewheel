/**
 * Wheel of Fortune like input jQuery Plugin
 * Author: Yaron Uliel
 * Copyright: 2014 Social It Tech Marketing
 */
(function($, w, d){
	$.fn.fortuneWheel = function(options){
		var Browser = {
			isAndroid: function(){
				return w.navigator.userAgent.toLowerCase().indexOf("android")>-1;
			}	
		};
		var instances = [];
		var FortuneWheel = function(elem, options){
			var defaultOptions = {
				placeholder: null,
				pattern: [],
				hideElem: true,
				wordSpace: 15,
				spaceClass: "word-space",
				showCaretSymbol: true, //works on chrome only
				placeholderClass: 'fortune-wheel',
				allowNumbers: false,
				trimValue: true,
				allowBlanks: true, 	
				restrict: null, 		// regex for allowed characters
				blurOnLastChar: false,
				eventFull: 'change-full',
				eventNotFull: 'change-not-full',
				full: function(value){}, //callback when full
				partial: function(value){} //callback when change partially
			};
			var instance = this;
			var placeholder = null;
			var chars = [];
			this.isFull = function(){
				var full = true;
				chars.each(function(){
		            var val = $(this).val();
		            if($.trim(val)==""){
		            	full = false;
		            	return false;
		            }
		        });
				return full;
			};
			this.getValue = function(){
		        var text = "";
		        chars.each(function(){
		            var val = $(this).val();
		            text+=(val==""?" ":val);
		            if($(this).hasClass(options.spaceClass)){
		            	text+=" ";
		            };
		        });
		        return options.trimValue?$.trim(text):text;
		    };
			
			function isRTL(elem){
				return $(elem).css("direction").toLowerCase()=="rtl";
			}
			 
			function initPlaceholder(){
				var holder = null;
				if(options.placeholder!=null){
					holder = $(options.placeholder);
				}
				if(!holder || holder.length==0){
					holder = $("<div />");
					$(elem).before(holder);
				}
				holder.html("").addClass(options.placeholderClass);
				return holder;
			}
			function getByPos(pos){
				return $(pos>=0 && pos<chars.length?chars[pos]:null);
			}
			
			function fullTrigger(){
				if(instance.isFull()){
		        	elem.trigger(options.eventFull);
		        	if(typeof(options.full)=="function"){
		        		options.full(instance.getValue());
		        	}
		        } else {
		        	elem.trigger(options.eventNotFull);
		        	if(typeof(options.partial)=="function"){
		        		options.partial(instance.getValue());
		        	}
		        }
			} 
			
			function initEventListeners(){
				$(chars).change(function(){
			        elem.val(instance.getValue());
			        fullTrigger();
			    }).keydown(function(e){
			        var rtl = isRTL($(this));
			        var pos = $(this).data("pos");
			        var next = getByPos(pos+1);
			        var prev = getByPos(pos-1);
			        switch(e.keyCode){
			            case 46: //backspace
			            	if(options.allowBlanks){
			            		$(this).val("").trigger("change");
			            	}
			                return false;
			            case 8: //backspace

			            	if(options.allowBlanks){
			            		$(this).val("").trigger("change");
			            	}
		            		prev.focus();
		            		return false;
			            case 32: //space
			            	if(options.allowBlanks){
			            		$(this).val(" ").trigger("change");
			            		next.focus();
			            	}
			            	return false;
			            case 37: //left arrow
			                (rtl?next:prev).focus();
			                return false;
			           case 39: //right arrow
			                (rtl?prev:next).focus();
			                return false;
			           
			        }
			    }).on(Browser.isAndroid()?"input":"keypress",function(e){
			        var pos = $(this).data("pos");
			        var next = getByPos(pos+1);
			        var keycode = e.keyCode || e.which || 0;
			        var key = String.fromCharCode(keycode);
			        if(!options.allowNumbers && !isNaN(key)){
			        	return false;
			        }
			        if(options.restrict && keycode!=0 && !(new RegExp('['+options.restrict+']')).test(key)){
			        	return false;
			        }
			        if(key!="" && keycode!=0){
			            $(this).val(key).trigger("change");
			        }
			        if(next.length==0 && (options.blurOnLastChar || keycode==0)){
			        	$(this).blur();
			        } else {
			        	if(Browser.isAndroid()){
			        		$(this).val($(this).val().substring(0,1));
			        	}
			        	if(Browser.isAndroid() && next.val()!=""){
			        		$(this).blur();
			        	} else {
			        		next.focus();
			        	}
			        }
			        if(keycode!=0){
			        	return false;
			        }
			    });
				
				if(Browser.isAndroid()){
					chars.focus(function(){
						$(this).val("").trigger("change");
					})
				}
				
				if(!options.allowBlanks){
					var focusclass = "focus"+(Math.floor(Math.random()*100000));
					$(chars).focus(function(e){
						if($(this).val()!="" || $(this).hasClass(focusclass)){
							$(this).removeClass(focusclass);
							return true;
						} else {
							$(chars).each(function(){
								if($(this).val()==""){
									$(this).addClass(focusclass).focus();
									return false;
								}
							});
						}
					});
				}
			}
			
			function getPattern(){
				var from = [];
				if(options.pattern.length>0){
					from = options.pattern;
				} else {
					from = $(elem).data("pattern");
				}
				
				if(typeof(from)=="object"){
					return from;
				} else {
					return from.toString().split(",");
				}
			}
			
			function init(){
		        placeholder.html();
		        var pattern = getPattern();
		        var currentChar = null;
		        
		        for(var i in pattern){
		            if(isNaN(pattern[i])){
		                continue;
		            }
		            for(var j=0; j<pattern[i]; j++){
		            	currentChar = $('<input type="text" data-pos="'+(chars.length)+'" maxlength="1" class="char t" />');
		            	if(!options.showCaretSymbol){
		            		currentChar.attr("readonly","readonly");
		            	}
		            	placeholder.append(currentChar);
		            	chars.push(currentChar);
		            }
		            if(i<pattern.length && currentChar!=null){
		            	currentChar.addClass(options.spaceClass).css((isRTL(placeholder)?"margin-left":"margin-right"),options.wordSpace);
		            }
		        }
		        chars = $(chars).map (function () {return this.toArray(); } );

		        initEventListeners();
		        if(options.hideElem){
		        	elem.hide();
		        }
		        fullTrigger();
		    }
		    
		    options = $.extend(defaultOptions, options);
			placeholder = initPlaceholder();
			init();
		};
		
	    $(this).filter("input[type=text]").each(function(){
	    	instances.push(new FortuneWheel($(this), options));
	    });
	    return this;
	};
})(jQuery, window, document);