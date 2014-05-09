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
			},
			isIOS: function(){
				var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );
				return iOS;
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
				byWords: false,
				charSize: 30,
				filledClass: 'filled',
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
		            var val = $.trim($(this).val());
		            var length = $(this).attr("maxlength");
		            if(val.length<length){
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
				$(chars).each(function(){
					var val = $.trim($(this).val()).replace(/\s/g,'').length;
					var maxlength = parseInt($(this).attr("maxlength"));
					$(this).toggleClass(options.filledClass,val>=maxlength);
				});
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
				}).keyup(function(e){
					fullTrigger();
			    }).keydown(function(e){
			        var rtl = isRTL($(this));
			        var pos = $(this).data("pos");
			        var next = getByPos(pos+1);
			        var prev = getByPos(pos-1);
			        switch(e.keyCode){
			            case 46: //delete
			            	if(Browser.isIOS() || option.byWords){
			            		break;
			            	}
			            	if(options.allowBlanks){
			            		$(this).val("").trigger("change");
			            	}
			                return false;
			            case 8: //delete
			            	if(Browser.isIOS()){
			            		return true;
			            	}
			            	var current_val = $(this).val();
			            	if(options.allowBlanks){
			            		$(this).val(current_val.substring(0,current_val.length-1)).trigger("change");
			            	}
			            	if(current_val.length-1<=0){
			            		prev.focus();
			            	}
		            		return false;
			            case 32: //space
			            	if(options.byWords){
			            		break;
			            	}
			            	if(options.allowBlanks){
			            		$(this).val(" ").trigger("change");
			            		next.focus();
			            	}
			            	return false;
			            case 37: //left arrow
			            	if(!options.byWords){
			            		(rtl?next:prev).focus();
			            		return false;
			            	}
			            	return true;
			           case 39: //right arrow
			        	   if(!options.byWords){
			        		   	(rtl?prev:next).focus();
			        		   	return false;
			        	   }
			        	   return true;
			        }
			        
			    }).on(Browser.isAndroid()?"input":"keypress",function(e){
			        var pos = $(this).data("pos");
			        var next = getByPos(pos+1);
			        var keycode = e.keyCode || e.which || 0;
			        var key = String.fromCharCode(keycode);
			        var length = $(this).val().length;
			        var maxlength = parseInt($(this).attr("maxlength"));
			        if(!options.allowNumbers && !isNaN(key)){
			        	return false;
			        }
			        if(options.restrict && keycode!=0 && !(new RegExp('['+options.restrict+']')).test(key)){
			        	return false;
			        }
			        if(key!="" && keycode!=0){
			        	if(options.byWords){
			        		$(this).val(($(this).val()+key).substring(0,maxlength)).trigger("change");
			        	} else {
			        		$(this).val(key).trigger("change");
			        	}
			        }
			        length = $(this).val().length;
			        if(!Browser.isIOS() && next.length==0 && (options.blurOnLastChar || keycode==0)){
			        	$(this).blur();
			        } else {
			        	if(Browser.isAndroid()){
			        		$(this).val($(this).val().substring(0,maxlength));
			        	}
			        	if(Browser.isAndroid() && next.val()!=""){
			        		$(this).blur();
			        	} else {
			        		if(length>=maxlength && !Browser.isIOS()){
			        			next.focus();
			        		}
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
				var bw = !!options.byWords;
		        placeholder.html();
		        var pattern = getPattern();
		        var currentChar = null;
		        
		        for(var i in pattern){
		            if(isNaN(pattern[i])){
		                continue;
		            }
		            var inputs = bw?1:pattern[i];
		            for(var j=0; j<inputs; j++){
		            	var cls = bw?"word":"char";
		            	var maxlength = bw?pattern[i]:1;
		            	currentChar = $('<input type="text" data-pos="'+(chars.length)+'" maxlength="'+maxlength+'" class="'+cls+'" />');
		            	if(!options.showCaretSymbol){
		            		currentChar.attr("readonly","readonly");
		            	}
		            	placeholder.append(currentChar);
		            	currentChar.css({height:options.charSize, width: options.charSize*maxlength, lineHeight: options.charSize+"px"});
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
		    if(Browser.isIOS()){
		    	options.byWords = true;
		    }
			placeholder = initPlaceholder();
			init();
		};
		
	    $(this).filter("input[type=text]").each(function(){
	    	instances.push(new FortuneWheel($(this), options));
	    });
	    return this;
	};
})(jQuery, window, document);