/**
 * Wheel of Fortune like input jQuery Plugin
 * Author: Yaron Uliel
 * Copyright: 2014 Social It Tech Marketing
 */
window.FortuneWheel = {
	getConsoleDebugger: function(){
		return {
			clear: function(){
				console.clear();
			},
			log: function(){
			    var i = -1, l = arguments.length, args = [], fn = 'console.log(args)';
			    while(++i<l){
			        args.push('args['+i+']');
			    };
			    fn = new Function('args',fn.replace(/args/,args.join(',')));
			    fn(arguments);
			}
		}
	},
	getDebugger: function(elem){
		return {
			clear: function(){
				if(elem!=""){
					$(elem).html("");
				}
			}, 
			log: function(){
				if(elem!=""){
					var string = "";
					for(var i in arguments){
						string+=arguments[i].toString();
						if(i<arguments.length-1){
							string+=", ";
						}
					}
					$(elem).append($("<div>").text(string));
				}
			}
		};
	},
	init: function(selector,options){
		$(selector).fortuneWheel(options);
	}
};

(function($, w, d){ 
	var Browser = {
		ua: w.navigator.userAgent.toLowerCase(),
		isAndroid: function(){
			return Browser.ua.indexOf("android")>-1;
		},
		isIOS: function(){
			var iOS = ( Browser.ua.match(/(ipad|iphone|ipod)/g) ? true : false );
			return iOS;
		},
		isOldAndroid: function(){
			return Browser.ua.indexOf("android 2.")>-1 || Browser.ua.indexOf("gecko) version/")>-1;
		},
		isProblematic: function(){
			return Browser.isIOS() || Browser.isOldAndroid();
		}
	};
	var instances = [];
	var FortuneWheel = function(elem, options){
			
			this.getElement = function(){
				return elem;
			}
			
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
				allowBlanks: false,
				allowDeleting: true,
				restrict: null, 		// regex for allowed characters
				blurOnLastChar: false,
				byWords: false,
				charSize: 30,
				filledClass: 'filled',
				eventFull: 'change-full',
				eventNotFull: 'change-not-full',
				//debug: w.FortuneWheel.getDebugger(""),
				full: function(value){}, //callback when full
				partial: function(value){} //callback when change partially
			};
			var instance = this;
			
			elem.data('fortune_wheel', instance);
			
			
			
			var placeholder = null,
				chars = [],
				jQueryChars = [];
			
			this.isFull = function(){
				var full = true;
				$(chars).each(function(){
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
		        $(chars).each(function(){
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
			
			function log(){
				if(options.debug){
					options.debug.log.apply(this, arguments);
				}
			}
			
			function setValue(value){
				var current_value = instance.getValue();
				if(current_value==value){
					return;
				}
				
				var start_val = value.replace(/\s+/g,"");
				var total_chars = 0;
	            $(jQueryChars).each(function(i){
	            	var currentChar = $(this);
	            	var maxlength = parseInt(currentChar.prop("maxlength"));
	            	currentChar.val(start_val.substr(total_chars, maxlength));
	            	total_chars+=maxlength;
	            });
	            
			}

			function initEventListeners(){
				$(chars).change(function(e){
					var new_val = instance.getValue();
					if(new_val!=elem.val()){
						elem.val(new_val);
			        }
			        fullTrigger();
				}).keyup(function(e){
					fullTrigger();
			    });
				if(!Browser.isOldAndroid()){
					$(chars).keydown(function(e){
				        var rtl = isRTL($(this));
				        var pos = $(this).data("pos");
				        var next = getByPos(pos+1);
				        var prev = getByPos(pos-1);
				        switch(e.keyCode){
				            case 46: //delete
				            	if(option.byWords){
				            		break;
				            	}
				            	if(options.allowBlanks){
				            		$(this).val("").trigger("change");
				            	}
				                return false;
				            case 8: //backspace
				            	if(Browser.isProblematic()){
				            		return true;
				            	}
				            	var current_val = $(this).val();
				            	if(options.allowDeleting){
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
				        if(!Browser.isProblematic() && next.length==0 && (options.blurOnLastChar || keycode==0)){
				        	$(this).blur();
				        } else {
				        	if(Browser.isAndroid()){
				        		$(this).val($(this).val().substring(0,maxlength));
				        	}
				        	if(Browser.isAndroid() && next.val()!=""){
				        		$(this).blur();
				        	} else {
				        		if(length>=maxlength && !Browser.isProblematic()){
				        			next.focus();
				        		}
				        	}
				        }
				        if(keycode!=0){
				        	return false;
				        }
				    });
				}
				if(Browser.isAndroid() && !Browser.isOldAndroid()){
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

				$(elem).change(function(){
					var value = $(this).val();
					setValue(value);
				})
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
		        jQueryChars = [];
		        for(var i in pattern){
		            if(isNaN(pattern[i])){
		                continue;
		            }
		            var inputs = bw?1:pattern[i];
		            for(var j=0; j<inputs; j++){
		            	var cls = bw?"word":"char";
		            	var maxlength = bw?pattern[i]:1;
		            	currentChar = $('<input type="text" data-pos="'+(jQueryChars.length)+'" maxlength="'+maxlength+'" class="'+cls+'" />');
		            	if(!options.showCaretSymbol){
		            		currentChar.attr("readonly","readonly"); 
		            	}
		            	placeholder.append(currentChar);
		            	currentChar.css({height:options.charSize, width: options.charSize*maxlength, lineHeight: options.charSize+"px"});
		            	jQueryChars.push(currentChar);
		            }
		            if(i<pattern.length-1 && currentChar!=null){
		            	currentChar.addClass(options.spaceClass).css((isRTL(placeholder)?"margin-left":"margin-right"),options.wordSpace);
		            }
		        }
				setValue(elem.val());
		        chars = $(jQueryChars).map (function () {return this.toArray(); } );

		        initEventListeners();
		        if(options.hideElem){
		        	elem.hide();
		        }
		        fullTrigger();
		    }

		    this.destroy = function(){
		    	$(chars).remove();
		    	elem.show();

		    }
		    
		    options = $.extend(defaultOptions, options);
		    if(Browser.isProblematic()){
		    	options.byWords = true;
		    }
			placeholder = initPlaceholder();
			init();
		};

		FortuneWheel.destroy = function(elem){
			var pos = getInstancePerElement(elem);
			if(pos>-1){
				var instance = instances[pos];
				instance.destroy();
				instances[pos] = null;
			}
			
		};

		function getInstancePerElement(elem){
			var pos = -1;
			if(elem!=null){
				for(var i in instances){
					if(instances[i]!=null && elem.get(0) == instances[i].getElement().get(0)){
						pos = i;
						break;
					}
				}
			}
			return pos;
		}
	$.fn.fortuneWheel = function(options){
	    $(this).filter("input[type=text]").each(function(){
			var elem = $(this);
	    	if(options=="destroy"){
	    		FortuneWheel.destroy(elem);
	    	} else {
	    		var pos = getInstancePerElement(elem);

	    		if(pos==-1){
	    			instances.push(new FortuneWheel(elem, options));
	    		}
	    	}
	    });
	    return this;
	};
})(jQuery, window, document);