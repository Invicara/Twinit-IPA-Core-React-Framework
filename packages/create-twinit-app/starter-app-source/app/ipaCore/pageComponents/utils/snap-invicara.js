/*
 * Snap.js - This version of snap has specific code for the SidePanel, it is not the original snap.js
 * 
 * 
 * Copyright 2013, Jacob Kelley - http://jakiestfu.com/
 * Released under the MIT Licence
 * http://opensource.org/licenses/MIT
 *
 * Github:  http://github.com/jakiestfu/Snap.js/
 * Version: 1.9.3
 * 
 */
/*jslint browser: true*/
/*global define, module, ender*/
(function(win, doc) {
    'use strict';
    var Snap = Snap || function(userOpts) {
      var settings = {
          element: null,
          bottomElement: null,
          dragger: null,
          disable: 'none',
          addBodyClasses: true,
          hyperextensible: true,
          resistance: 0.5,
          flickThreshold: 50,
          transitionSpeed: 0.3,
          easing: 'ease',
          maxPosition: 266,
          minPosition: -266,
          tapToClose: true,
          touchToDrag: true,
          slideIntent: 40, // degrees
          minDragDistance: 5,
          adjustContentWidth: true    // adjust main content panel width when side panel is open
        },
        cache = {
          simpleStates: {
            opening: null,
            towards: null,
            hyperExtending: null,
            halfway: null,
            flick: null,
            translation: {
              absolute: 0,
              relative: 0,
              sinceDirectionChange: 0,
              percentage: 0
            }
          }
        },
        eventList = {},
        twinitUtils = {
          hasTouch: ('ontouchstart' in doc.documentElement || win.navigator.msPointerEnabled),
          eventType: function(action) {
            var eventTypes = {
              down: (twinitUtils.hasTouch ? 'touchstart' : 'mousedown'),
              move: (twinitUtils.hasTouch ? 'touchmove' : 'mousemove'),
              up: (twinitUtils.hasTouch ? 'touchend' : 'mouseup'),
              out: (twinitUtils.hasTouch ? 'touchcancel' : 'mouseout')
            };
            return eventTypes[action];
          },
          page: function(t, e){
            return (twinitUtils.hasTouch && e.touches.length && e.touches[0]) ? e.touches[0]['page'+t] : e['page'+t];
          },
          klass: {
            has: function(el, name){
              return (el.className).indexOf(name) !== -1;
            },
            add: function(el, name){
              if(!twinitUtils.klass.has(el, name) && settings.addBodyClasses){
                el.className += " "+name;
              }
            },
            remove: function(el, name){
              if(settings.addBodyClasses){
                el.className = (el.className).replace(name, "").replace(/^\s+|\s+$/g, '');
              }
            }
          },
          dispatchEvent: function(type) {
            if (typeof eventList[type] === 'function') {
              return eventList[type].call();
            }
          },
          vendor: function(){
            var tmp = doc.createElement("div"),
              prefixes = 'webkit Moz O ms'.split(' '),
              i;
            for (i in prefixes) {
              if (typeof tmp.style[prefixes[i] + 'Transition'] !== 'undefined') {
                return prefixes[i];
              }
            }
          },
          transitionCallback: function(){
            return (cache.vendor==='Moz' || cache.vendor==='ms') ? 'transitionend' : cache.vendor+'TransitionEnd';
          },
          canTransform: function(){
            return typeof settings.element.style[cache.vendor+'Transform'] !== 'undefined';
          },
          deepExtend: function(destination, source) {
            var property;
            for (property in source) {
              if (source[property] && source[property].constructor && source[property].constructor === Object) {
                destination[property] = destination[property] || {};
                twinitUtils.deepExtend(destination[property], source[property]);
              } else {
                destination[property] = source[property];
              }
            }
            return destination;
          },
          angleOfDrag: function(x, y) {
            var degrees, theta;
            // Calc Theta
            theta = Math.atan2(-(cache.startDragY - y), (cache.startDragX - x));
            if (theta < 0) {
              theta += 2 * Math.PI;
            }
            // Calc Degrees
            degrees = Math.floor(theta * (180 / Math.PI) - 180);
            if (degrees < 0 && degrees > -180) {
              degrees = 360 - Math.abs(degrees);
            }
            return Math.abs(degrees);
          },
          events: {
            addEvent: function addEvent(element, eventName, func) {
              if (element.addEventListener) {
                return element.addEventListener(eventName, func, false);
              } else if (element.attachEvent) {
                return element.attachEvent("on" + eventName, func);
              }
            },
            removeEvent: function addEvent(element, eventName, func) {
              if (element.addEventListener) {
                return element.removeEventListener(eventName, func, false);
              } else if (element.attachEvent) {
                return element.detachEvent("on" + eventName, func);
              }
            },
            prevent: function(e) {
              if (e.preventDefault) {
                e.preventDefault();
              } else {
                e.returnValue = false;
              }
            }
          },
          parentUntil: function(el, attr) {
            var isStr = typeof attr === 'string';
            while (el.parentNode) {
              if (isStr && el.getAttribute && el.getAttribute(attr)){
                return el;
              } else if(!isStr && el === attr){
                return el;
              }
              el = el.parentNode;
            }
            return null;
          }
        },
        action = {
          translate: {
            get: {
              matrix: function(index) {
  
                if( !twinitUtils.canTransform() ){
                  return parseInt(settings.element.style.left, 10);
                } else {
                  var matrix = win.getComputedStyle(settings.element)[cache.vendor+'Transform'].match(/\((.*)\)/),
                    ieOffset = 8;
                  if (matrix) {
                    matrix = matrix[1].split(',');
                    if(matrix.length===16){
                      index+=ieOffset;
                    }
                    return parseInt(matrix[index], 10);
                  }
                  return 0;
                }
              }
            },
            easeCallback: function(){
              settings.element.style[cache.vendor+'Transition'] = '';
              if (settings.bottomElement) {
                settings.bottomElement.style[cache.vendor+'Transition'] = '';
              }
              cache.translation = action.translate.get.matrix(4);
              cache.easing = false;
              clearInterval(cache.animatingInterval);
  
              if(cache.easingTo===0){
                twinitUtils.klass.remove(doc.body, 'snapjs-right');
                twinitUtils.klass.remove(doc.body, 'snapjs-left');
              }
  
              twinitUtils.dispatchEvent('animated');
              twinitUtils.events.removeEvent(settings.element, twinitUtils.transitionCallback(), action.translate.easeCallback);
            },
            easeTo: function(n) {
  
              if( !twinitUtils.canTransform() ){
                cache.translation = n;
                action.translate.x(n);
              } else {
                cache.easing = true;
                cache.easingTo = n;
  
                settings.element.style[cache.vendor+'Transition'] = 'all ' + settings.transitionSpeed + 's ' + settings.easing;
  
                if (settings.bottomElement) {
                  settings.bottomElement.style[cache.vendor+'Transition'] = 'all ' + settings.transitionSpeed + 's ' + settings.easing;
                }
  
                cache.animatingInterval = setInterval(function() {
                  twinitUtils.dispatchEvent('animating');
                }, 1);
  
                twinitUtils.events.addEvent(settings.element, twinitUtils.transitionCallback(), action.translate.easeCallback);
                action.translate.x(n);
              }
              if(n===0){
                settings.element.style[cache.vendor+'Transform'] = '';
                if (settings.bottomElement) {
                  settings.bottomElement.style[cache.vendor+'Transform'] = '';
                }
              }
              action.translate.adjustContentWidth(n);
            },
            // New BottomPanel animation support; jl 05/08/2019
            easeUp: function(open) {
              cache.easing = true;
              cache.easingUp = true;
  
              settings.element.style[cache.vendor+'Transition'] = 'all ' + settings.transitionSpeed + 's ' + settings.easing;
  
              cache.animatingInterval = setInterval(function() {
                twinitUtils.dispatchEvent('animating');
              }, 1);
  
              twinitUtils.events.addEvent(settings.element, twinitUtils.transitionCallback(), action.translate.easeCallback);
              if (open) {
                const elementBottomDimension = settings.elementBottomDimension ?
                    settings.elementBottomDimension : 350;
                settings.element.style.bottom = elementBottomDimension;
              } else {
                settings.element.style.bottom = 0;
              }
            },
  
            adjustContentWidth: function (n) {
              if (!settings.adjustContentWidth) {
                return;
              } else {
                var el = settings.element, bottomEl = settings.bottomElement;
  
                if (n === 0) {
                  el.style.width = win.innerWidth;  // assume content pane is full width!
                  el.style.left = 0;
                  if (bottomEl) {
                    bottomEl.style.width = win.innerWidth;  // assume content pane is full width!
                    bottomEl.style.left = 0;
                  }
  
                } else if (n > 0 && el.clientWidth > 680) {
                  el.style.left = 0;    // In case right panel was open
                  el.style.width = el.clientWidth - n;
                  if (bottomEl) {
                    bottomEl.style.left = 0;    // In case right panel was open
                    bottomEl.style.width = bottomEl.clientWidth - n;
                  }
                } else if (n < 0 && el.clientWidth > 680) {
                  // In this case, the left is already translated so it needs to be offset back.
                  el.style.width = el.clientWidth + n;
                  el.style.left = -n;
                  if (bottomEl) {
                    bottomEl.style.width = bottomEl.clientWidth + n;
                    bottomEl.style.left = -n;
                  }
                }
              }
            },
  
            x: function(n) {
              if( (settings.disable==='left' && n>0) ||
                (settings.disable==='right' && n<0)
              ){ return; }
  
              if( !settings.hyperextensible ){
                if( n===settings.maxPosition || n>settings.maxPosition ){
                  n=settings.maxPosition;
                } else if( n===settings.minPosition || n<settings.minPosition ){
                  n=settings.minPosition;
                }
              }
  
              n = parseInt(n, 10);
              if(isNaN(n)){
                n = 0;
              }
  
              if( twinitUtils.canTransform() ){
                var theTranslate = 'translate3d(' + n + 'px, 0,0)';
                settings.element.style[cache.vendor+'Transform'] = theTranslate;
                if (settings.bottomElement) {
                  settings.bottomElement.style[cache.vendor+'Transform'] = theTranslate;
                }
              } else {
                settings.element.style.width = (win.innerWidth || doc.documentElement.clientWidth)+'px';
  
                settings.element.style.left = n+'px';
                settings.element.style.right = '';
              }
            }
          },
          drag: {
            listen: function() {
              cache.translation = 0;
              cache.easing = false;
              twinitUtils.events.addEvent(settings.element, twinitUtils.eventType('down'), action.drag.startDrag);
              twinitUtils.events.addEvent(settings.element, twinitUtils.eventType('move'), action.drag.dragging);
              twinitUtils.events.addEvent(settings.element, twinitUtils.eventType('up'), action.drag.endDrag);
            },
            stopListening: function() {
              twinitUtils.events.removeEvent(settings.element, twinitUtils.eventType('down'), action.drag.startDrag);
              twinitUtils.events.removeEvent(settings.element, twinitUtils.eventType('move'), action.drag.dragging);
              twinitUtils.events.removeEvent(settings.element, twinitUtils.eventType('up'), action.drag.endDrag);
            },
            startDrag: function(e) {
              // No drag on ignored elements
              var target = e.target ? e.target : e.srcElement,
                ignoreParent = twinitUtils.parentUntil(target, 'data-snap-ignore');
  
              if (ignoreParent) {
                twinitUtils.dispatchEvent('ignore');
                return;
              }
  
  
              if(settings.dragger){
                var dragParent = twinitUtils.parentUntil(target, settings.dragger);
  
                // Only use dragger if we're in a closed state
                if( !dragParent &&
                  (cache.translation !== settings.minPosition &&
                    cache.translation !== settings.maxPosition
                  )){
                  return;
                }
              }
  
              twinitUtils.dispatchEvent('start');
              settings.element.style[cache.vendor+'Transition'] = '';
              cache.isDragging = true;
              cache.hasIntent = null;
              cache.intentChecked = false;
              cache.startDragX = twinitUtils.page('X', e);
              cache.startDragY = twinitUtils.page('Y', e);
              cache.dragWatchers = {
                current: 0,
                last: 0,
                hold: 0,
                state: ''
              };
              cache.simpleStates = {
                opening: null,
                towards: null,
                hyperExtending: null,
                halfway: null,
                flick: null,
                translation: {
                  absolute: 0,
                  relative: 0,
                  sinceDirectionChange: 0,
                  percentage: 0
                }
              };
            },
            dragging: function(e) {
              if (cache.isDragging && settings.touchToDrag) {
  
                var thePageX = twinitUtils.page('X', e),
                  thePageY = twinitUtils.page('Y', e),
                  translated = cache.translation,
                  absoluteTranslation = action.translate.get.matrix(4),
                  whileDragX = thePageX - cache.startDragX,
                  openingLeft = absoluteTranslation > 0,
                  translateTo = whileDragX,
                  diff;
  
                // Shown no intent already
                if((cache.intentChecked && !cache.hasIntent)){
                  return;
                }
  
                if(settings.addBodyClasses){
                  if((absoluteTranslation)>0){
                    twinitUtils.klass.add(doc.body, 'snapjs-left');
                    twinitUtils.klass.remove(doc.body, 'snapjs-right');
                  } else if((absoluteTranslation)<0){
                    twinitUtils.klass.add(doc.body, 'snapjs-right');
                    twinitUtils.klass.remove(doc.body, 'snapjs-left');
                  }
                }
  
                if (cache.hasIntent === false || cache.hasIntent === null) {
                  var deg = twinitUtils.angleOfDrag(thePageX, thePageY),
                    inRightRange = (deg >= 0 && deg <= settings.slideIntent) || (deg <= 360 && deg > (360 - settings.slideIntent)),
                    inLeftRange = (deg >= 180 && deg <= (180 + settings.slideIntent)) || (deg <= 180 && deg >= (180 - settings.slideIntent));
                  if (!inLeftRange && !inRightRange) {
                    cache.hasIntent = false;
                  } else {
                    cache.hasIntent = true;
                  }
                  cache.intentChecked = true;
                }
  
                if (
                  (settings.minDragDistance>=Math.abs(thePageX-cache.startDragX)) || // Has user met minimum drag distance?
                  (cache.hasIntent === false)
                ) {
                  return;
                }
  
                twinitUtils.events.prevent(e);
                twinitUtils.dispatchEvent('drag');
  
                cache.dragWatchers.current = thePageX;
                // Determine which direction we are going
                if (cache.dragWatchers.last > thePageX) {
                  if (cache.dragWatchers.state !== 'left') {
                    cache.dragWatchers.state = 'left';
                    cache.dragWatchers.hold = thePageX;
                  }
                  cache.dragWatchers.last = thePageX;
                } else if (cache.dragWatchers.last < thePageX) {
                  if (cache.dragWatchers.state !== 'right') {
                    cache.dragWatchers.state = 'right';
                    cache.dragWatchers.hold = thePageX;
                  }
                  cache.dragWatchers.last = thePageX;
                }
                if (openingLeft) {
                  // Pulling too far to the right
                  if (settings.maxPosition < absoluteTranslation) {
                    diff = (absoluteTranslation - settings.maxPosition) * settings.resistance;
                    translateTo = whileDragX - diff;
                  }
                  cache.simpleStates = {
                    opening: 'left',
                    towards: cache.dragWatchers.state,
                    hyperExtending: settings.maxPosition < absoluteTranslation,
                    halfway: absoluteTranslation > (settings.maxPosition / 2),
                    flick: Math.abs(cache.dragWatchers.current - cache.dragWatchers.hold) > settings.flickThreshold,
                    translation: {
                      absolute: absoluteTranslation,
                      relative: whileDragX,
                      sinceDirectionChange: (cache.dragWatchers.current - cache.dragWatchers.hold),
                      percentage: (absoluteTranslation/settings.maxPosition)*100
                    }
                  };
                } else {
                  // Pulling too far to the left
                  if (settings.minPosition > absoluteTranslation) {
                    diff = (absoluteTranslation - settings.minPosition) * settings.resistance;
                    translateTo = whileDragX - diff;
                  }
                  cache.simpleStates = {
                    opening: 'right',
                    towards: cache.dragWatchers.state,
                    hyperExtending: settings.minPosition > absoluteTranslation,
                    halfway: absoluteTranslation < (settings.minPosition / 2),
                    flick: Math.abs(cache.dragWatchers.current - cache.dragWatchers.hold) > settings.flickThreshold,
                    translation: {
                      absolute: absoluteTranslation,
                      relative: whileDragX,
                      sinceDirectionChange: (cache.dragWatchers.current - cache.dragWatchers.hold),
                      percentage: (absoluteTranslation/settings.minPosition)*100
                    }
                  };
                }
                action.translate.x(translateTo + translated);
              }
            },
            endDrag: function(e) {
              if (cache.isDragging) {
                twinitUtils.dispatchEvent('end');
                var translated = action.translate.get.matrix(4);
  
                // Tap Close
                if (cache.dragWatchers.current === 0 && translated !== 0 && settings.tapToClose) {
                  twinitUtils.dispatchEvent('close');
                  twinitUtils.events.prevent(e);
                  action.translate.easeTo(0);
                  cache.isDragging = false;
                  cache.startDragX = 0;
                  return;
                }
  
                // Revealing Left
                if (cache.simpleStates.opening === 'left') {
                  // Halfway, Flicking, or Too Far Out
                  if ((cache.simpleStates.halfway || cache.simpleStates.hyperExtending || cache.simpleStates.flick)) {
                    if (cache.simpleStates.flick && cache.simpleStates.towards === 'left') { // Flicking Closed
                      action.translate.easeTo(0);
                    } else if (
                      (cache.simpleStates.flick && cache.simpleStates.towards === 'right') || // Flicking Open OR
                      (cache.simpleStates.halfway || cache.simpleStates.hyperExtending) // At least halfway open OR hyperextending
                    ) {
                      action.translate.easeTo(settings.maxPosition); // Open Left
                    }
                  } else {
                    action.translate.easeTo(0); // Close Left
                  }
                  // Revealing Right
                } else if (cache.simpleStates.opening === 'right') {
                  // Halfway, Flicking, or Too Far Out
                  if ((cache.simpleStates.halfway || cache.simpleStates.hyperExtending || cache.simpleStates.flick)) {
                    if (cache.simpleStates.flick && cache.simpleStates.towards === 'right') { // Flicking Closed
                      action.translate.easeTo(0);
                    } else if (
                      (cache.simpleStates.flick && cache.simpleStates.towards === 'left') || // Flicking Open OR
                      (cache.simpleStates.halfway || cache.simpleStates.hyperExtending) // At least halfway open OR hyperextending
                    ) {
                      action.translate.easeTo(settings.minPosition); // Open Right
                    }
                  } else {
                    action.translate.easeTo(0); // Close Right
                  }
                }
                cache.isDragging = false;
                cache.startDragX = twinitUtils.page('X', e);
              }
            }
          }
        },
        init = function(opts) {
          if (opts.element) {
            twinitUtils.deepExtend(settings, opts);
            cache.vendor = twinitUtils.vendor();
            action.drag.listen();
          }
        };
      /*
       * Public
       */
      this.open = function(side) {
        twinitUtils.dispatchEvent('open');
        twinitUtils.klass.remove(doc.body, 'snapjs-expand-left');
        twinitUtils.klass.remove(doc.body, 'snapjs-expand-right');
  
        if (side === 'left') {
          cache.simpleStates.opening = 'left';
          cache.simpleStates.towards = 'right';
          twinitUtils.klass.add(doc.body, 'snapjs-left');
          twinitUtils.klass.remove(doc.body, 'snapjs-right');
          action.translate.easeTo(settings.maxPosition);
        } else if (side === 'right') {
          cache.simpleStates.opening = 'right';
          cache.simpleStates.towards = 'left';
          twinitUtils.klass.remove(doc.body, 'snapjs-left');
          twinitUtils.klass.add(doc.body, 'snapjs-right');
          action.translate.easeTo(settings.minPosition);
        } else if (side === 'bottom') {
          cache.simpleStates.opening = 'bottom';
          twinitUtils.klass.add(doc.body, 'snapjs-bottom');
          action.translate.easeUp(true);
        }
      };
      this.close = function() {
        twinitUtils.dispatchEvent('close');
        action.translate.easeTo(0);
      };
      this.closeBottom = function() {
        twinitUtils.dispatchEvent('close');
        action.translate.easeUp(false);
  
      };
      this.expand = function(side){
        var to = win.innerWidth || doc.documentElement.clientWidth;
  
        if(side==='left'){
          twinitUtils.dispatchEvent('expandLeft');
          twinitUtils.klass.add(doc.body, 'snapjs-expand-left');
          twinitUtils.klass.remove(doc.body, 'snapjs-expand-right');
        } else {
          twinitUtils.dispatchEvent('expandRight');
          twinitUtils.klass.add(doc.body, 'snapjs-expand-right');
          twinitUtils.klass.remove(doc.body, 'snapjs-expand-left');
          to *= -1;
        }
        action.translate.easeTo(to);
      };
  
      this.on = function(evt, fn) {
        eventList[evt] = fn;
        return this;
      };
      this.off = function(evt) {
        if (eventList[evt]) {
          eventList[evt] = false;
        }
      };
  
      this.enable = function() {
        twinitUtils.dispatchEvent('enable');
        action.drag.listen();
      };
      this.disable = function() {
        twinitUtils.dispatchEvent('disable');
        action.drag.stopListening();
      };
  
      this.settings = function(opts){
        twinitUtils.deepExtend(settings, opts);
      };
  
      this.state = function() {
        // Now supports multiple panel and bottom open; jl 05/08/2019
        var state,
          fromLeft = action.translate.get.matrix(4);
        if (fromLeft === settings.maxPosition) {
          state = 'left';
        } else if (fromLeft === settings.minPosition) {
          state = 'right';
        } else {
          state = 'closed';
        }
        if (parseInt(settings.element.style.bottom)) {
          state = state + " bottom";
        }
        return {
          state: state,
          info: cache.simpleStates
        };
      };
      init(userOpts);
    };
    if ((typeof module !== 'undefined') && module.exports) {
      module.exports = Snap;
    }
    if (typeof ender === 'undefined') {
      this.Snap = Snap;
    }
    if ((typeof define === "function") && define.amd) {
      define("snap", [], function() {
        return Snap;
      });
    }
  }).call(this, window, document);