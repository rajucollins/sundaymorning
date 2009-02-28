// ----------------------------------------------------------------------------
// SundayMorning - A jQuery Plugin to translate content
// v 1.0 Beta
// Dual licensed under the MIT and GPL licenses.
// ----------------------------------------------------------------------------
// Copyright (C) 2009 Jay Salvat
// http://sundaymorning.jaysalvat.com/
// ----------------------------------------------------------------------------
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
// ----------------------------------------------------------------------------
(function($) {
    
    $.sundayMorning = function(text, settings, callback) {
        var settings = $.extend({}, $.sundayMorning.defaults, settings);
        translate(settings, function(settings) {
            getGoogleTranslation(text, settings, function(response) {
                callback(response);
            });
        });
    };

    // ------------------------------------------------------

    $.fn.sundayMorningReset = function() {
        return this.each(function() {
			 $(this).unbind('.sundayMorning');					  
		});
	}
	
	$.fn.sundayMorning = function(settings) {
        var settings = $.extend({}, $.sundayMorning.defaults, settings);
        return this.each(function() {
            var $$ = $(this);
            var text = $$.html();
            var originalText = text;
            var originalLang = (settings.source == '') ? getSource($$) : settings.source;
            
            if (settings.source == '') {
                settings.source = getSource($$);
            }

            if (settings.trigger) {        
                //$$.unbind('.sundayMorning');		
                $$.bind(settings.trigger+'.sundayMorning', function(evt) {
					if (settings.ctrlKey != evt.ctrlKey) {
						return false;	
					}
					if (settings.shiftKey != evt.shiftKey) {
						return false;	
					}
                    settings.menuLeft = evt.pageX;
                    settings.menuTop  = evt.pageY;
                    
                    if (settings.destination != '') {
                        if (settings.source == settings.destination) {
                            return false;
                        }
                        
                        if (getSource($$) == settings.destination) {
                            $$.fadeTo('fast', 0.1, function() {    
                                $$.html(originalText);
                                $$.attr('lang', originalLang);
                                $$.fadeTo('fast', 1);
                            });
                            return false;
                        }
                    }
                    translate(settings, function(settings) {
                        contentReplacement($$, text, settings)
                    });
                    evt.preventDefault();
					evt.stopPropagation();
                });
            } else {
                translate(settings, function(settings) {
                    contentReplacement($$, text, settings)
                });
            }
        });
    };

    // ------------------------------------------------------
    
    $.fn.sundayMorningDetection = function(callback) {
        var settings = $.sundayMorning.defaults;
        return this.each(function() {
            var $$ = $(this);
            var text = $$.text();
            getGoogleDetection(text, settings, function(response) {
                callback(response);                                    
            });
        });
    };

    $.sundayMorningDetection = function(text, callback) {
        var settings = $.sundayMorning.defaults;
        getGoogleDetection(text, settings, function(response) {
            callback(response);                                    
        });
    };
    
    // ------------------------------------------------------
    
    $.fn.sundayMorningBubble = function(settings) {
        var settings = $.extend({}, $.sundayMorning.defaults, settings);
        return this.each(function() {
            var $$ = $(this);    
            //$$.unbind('.sundayMorning');
            $$.bind('dblclick.sundayMorning', function(evt) {  
				if (settings.ctrlKey != evt.ctrlKey) {
					return false;	
				}
				if (settings.shiftKey != evt.shiftKey) {
					return false;	
				}
                if (window.getSelection) { 
                    var text = window.getSelection(); 
                } else if (document.getSelection) { 
                    var text = document.getSelection(); 
                } else { 
                    var text = document.selection.createRange().text; 
                }
				text = text.toString();
                if (text.replace(/\W|\d/g, '') == '') {
                    return false;
                }
         
                settings.menuLeft = menuLeft = evt.pageX;
                settings.menuTop  = menuTop  = evt.pageY;

                translate(settings, function(settings) {
                    getGoogleTranslation(text, settings, function(response) {
                        var bubble;
                        bubble = $('<div class="sundayMorning-bubble"><span><b>'+ text +'</b> : '+ response.translation +'</span></div>'); 
                        bubble.css({ 
                            position:'absolute',  
                            left:menuLeft,  
                            top:menuTop 
                        })
                        .hide()
                        .appendTo('body');             
                        ($.browser.msie) ? bubble.show() : bubble.fadeIn('fast');
                        setTimeout( function() { 
                            ($.browser.msie) ? bubble.remove() : bubble.fadeOut('fast', function() { bubble.remove() } );
                        }, settings.delay);
                    });
                });
                evt.preventDefault();
				evt.stopPropagation();
            });
        });
    };

    // ------------------------------------------------------

    $.sundayMorning.translatable = {
        en:'English', 
        ar:'العربية', 
        bg:'български', 
        ca:'català', 
        cs:'česky', 
        da:'Dansk', 
        de:'Deutsch', 
        el:'Ελληνικά', 
        es:'Español', 
        fi:'suomi', 
        fr:'Français', 
        hi:'हिन्दी', 
        hr:'hrvatski', 
        id:'Indonesia', 
        it:'Italiano', 
        iw:'עברית', 
        ja:'日本語', 
        ko:'한국어', 
        lt:'Lietuvių', 
        lv:'latviešu', 
        nl:'Nederlands', 
        no:'norsk', 
        pl:'Polski', 
        pt:'Português', 
        ro:'Română', 
        ru:'Русский', 
        sk:'slovenčina', 
        sl:'slovenščina', 
        sr:'српски', 
        sv:'Svenska', 
        tl:'Filipino', 
        uk:'українська', 
        vi:'Tiếng Việt', 
        CN:'中文 (简体)', 
        TW:'中文 (繁體)'
    }
    
    $.sundayMorning.defaults = {
        apiKey:      'notsupplied',
        delay:       3000,
        menuTop:     50,
        menuLeft:    50,
        trigger:     false,
        source:      '',
        destination: '',
		ctrlKey:     false,
		shiftKey:    false,
        destinationFallback:$.sundayMorning.translatable
    };
        
    // ------------------------------------------------------

    function translate(settings, callback) {
        if (typeof(settings.destination) == 'object') {
            askForDestination(settings, callback);
            return false;
        } else if (settings.destination == '') {
            var lang = '';
            if (navigator.browserLanguage) {
                lang = navigator.browserLanguage;
            } else if (navigator.language) {
                lang = navigator.language;
            }
            var splits = lang.split('-');
            if ($.sundayMorning.translatable[lang]) {
                settings.destination = lang;
            } else if ($.sundayMorning.translatable[splits[0]]) {
                settings.destination = splits[0];
            } else if ($.sundayMorning.translatable[splits[1]]) {
                settings.destination = splits[1];
            } else {
                settings.destination = settings.destinationFallback;
                translate(settings, callback);
                return false;
            }
        }
        callback(settings);
    }
    
    function getGoogleDetection(text, settings, callback) {
        $.ajax({
            url: 'http://ajax.googleapis.com/ajax/services/language/detect',
            dataType: 'jsonp',
            data: { q: ''+ text.substr(0, 5000), 
                    v: '1.0',
                    key: settings.apiKey },
            success: function(response) { 
                if (response.responseStatus != 200) {
                    alert('Translation error: '+response.responseDetails);
                    return false;
                }
                callback({
                    language:     response.responseData.language,
                    isReliable: response.responseData.isReliable,
                    confidence: response.responseData.confidence
                }); 
            }
        });                                                       
    };
    
    function getGoogleTranslation(text, settings, callback) {
        $.ajax({
            url: 'http://ajax.googleapis.com/ajax/services/language/translate',
            dataType: 'jsonp',
            data: { q: ''+ text.substr(0, 5000), 
                    v: '1.0',
                    key: settings.apiKey,
                    langpair: settings.source +'|'+ settings.destination },
            success: function(response) { 
                if (response.responseStatus != 200) {
                    alert('Translation error: '+response.responseDetails);
                    return false;
                }
                callback({
                    translation: response.responseData.translatedText   || '',
                    source:      response.responseData.detectedSourceLanguage || '',
                    destination: settings.destination
                }); 
            }
        });                                                       
    };
    
    function contentReplacement($$, text, settings) {
        $$.fadeTo('fast', 0.1, function() {    
            getGoogleTranslation(text, settings, function(response) {
                $$.html(response.translation);
                $$.attr('lang', response.destination);
                $$.fadeTo('fast', 1);
            });
        });    
    }
    
    function getSource($$) {
        source = $($$).attr('lang');
        if (source) {
            return source;
        }
        return '';
    }
    
    function askForDestination(settings, callback) {
        html = '<div id="sundayMorning-menu"><a class="sundayMorning-close" href="#">X</a><ul>';
        for(index in settings.destination) {
            if (index != settings.source) {
                html += '<li class="sundayMorning-'+ index +'"><a href="#" rel="'+ index +'">'+ settings.destination[index] +'</a></li>';                        
            }
        }
        html += '</ul></div>';    

        var menu = $(html).css({
            position: 'absolute', 
            left: settings.menuLeft, 
            top:  settings.menuTop 
        })
        .appendTo('body');

        $('a.sundayMorning-close', menu).click(function() {
            menu.remove();
            return false;
        });
        
        $('a', menu).click(function() {
            menu.remove();
            settings.destination = $(this).attr('rel');
            callback(settings);
            return false;
        });
    
        setTimeout(function() {
            $('html').one('click', function() {
                menu.remove();
                return false;
            });    
        }, 50);
    };
})(jQuery);