/* Artem Shtepenko https://github.com/cyberua/popupJS */

(function() {
    "use strict";

    var cls = "popup-window-animate";


    var transition = {

        getSupported: function ( ) {

            var val = this.supportedVal;

            if ( val )
                return val;

            var t,
                el = document.createElement( 'fakeelement' ),
                transitions = {
                    'OTransition':'oTransitionEnd',
                    'MozTransition':'transitionend',
                    'WebkitTransition':'webkitTransitionEnd'
                };

            for( t in transitions ){
                if( el.style[t] !== undefined ){
                    return this.supportedVal = transitions[t];
                }
            }

            if( el.style [ 'transition' ] !== undefined ) {
            	return this.supportedVal = 'transitionend';
            }

            return false;
        },

        end: function ( elem,  callback ) {

            var event = this.getSupported();

            if( !event ) {
                callback();
                return false;
            }

            elem.addEventListener ( event, function handler() {
                elem.removeEventListener ( event, handler );
                callback();
            } );
        }
    };
    
    //TODO find and remove global var self

    /**
    * Basic popup object
    *
    * @param {Object} opt_params
    * @property {string}        opt_params.key
    * @property {HTMLElement}   opt_param.window                       - Link for on popup window
    * @property {string=}       opt_params.opt_hideButtonCls           - Close button HTMLElement class
    * @property {string=}       opt_params.opt_handlerClickCls         - Handles click on HTMLElements with class of this param
    * @property {string=}       opt_params.opt_isOverlayClickHide      - if true then when it is click on overlay, window will close
    * @property {boolean=}      [opt_params.useAnimate=true]           - if false animation does not use
    * @property {function=}    opt_params.setEndWindowPosition         - Function calls before window hides, and function is need set end position
    * @property {function=}    opt_params.setStartAnimationPosition    - Function calls before window shows, and function is need set start position
    */
    function multiPopup( opt_params ) {

        var id;

        this._handlers = {};
        this._windows = {};
        this._windowsHTMLElements = [];

        this._transition = transition;

        if ( !isEmpty( opt_params ) &&
            isString( opt_params.key ) &&
            isHTMLElement( opt_params.window ) ) {
            this.addWindow ( opt_params.key, opt_params.window, opt_params );
        }

        this._addOverlay( );

        this.on( "showed", function ( ) {
            this.window.classList.remove( cls )
        } );

        this._resizeHandler = function (){

            if( !this.isOpen ) return;

             clearTimeout( id );
             id = setTimeout(  this._showAnimateWin.bind( this ), 10 );
        }.bind( this );

        window.addEventListener( "resize", this._resizeHandler, false );
    };



    /**
     * Add window
     * @param {string} key
     * @param {HTMLElement} windowElem
     * @param {Object=} opt_params
     * @property {string=}      opt_params.opt_hideButtonCls            - Close button HTMLElement class
     * @property {string=}      opt_params.opt_handlerClickCls          - Handles click on HTMLElements with class of this param
     * @property {string=}      opt_params.opt_isOverlayClickHide       - if true then when it is click on overlay, window will close
     * @property {boolean=}     [opt_params.useAnimate=true]            - if false animation does not use
     * @property {function=}    opt_params.setEndWindowPosition         - Function calls before window hides, and function is need set end position
     * @property {function=}    opt_params.setStartAnimationPosition    - Function calls before window shows, and function is need set start position
     */

    multiPopup.prototype.addWindow = function ( key, windowElem, opt_params ) {

        var obj, self = this;
        opt_params = opt_params || {};

        if ( isEmpty( opt_params.useAnimate ) ) {
            opt_params.useAnimate = true;
        }

        if ( isEmpty( opt_params.opt_useOverlay ) ) {
            opt_params.opt_useOverlay = true;
        }

        if( !isHTMLElement(  windowElem ))
            throw  new TypeError( "Incorrect argument 'modalWindow', expected HTMLElement" );

        obj = this._windows [ key ] = {
            elem: windowElem,
            params: opt_params,
            _handlers: {
                onClick: function ( e ) {
                    onClick.call( windowElem, e, obj, self );
                }
            }
        };
        this._windowsHTMLElements.push ( windowElem );

        //if ( isString ( opt_params.opt_hideButtonCls ) || TODO
          //   isString( opt_params.opt_handlerClickCls ) ) {
            windowElem.addEventListener ( "click", obj._handlers.onClick , false );
      //  }

        windowElem.style.display = "none";
        windowElem.style.position = 'fixed';
        windowElem.style.zIndex = '100000';

        if( !this.window ) {
            this.setActiveWindow( key );
        }

        return this;
    };


    function onClick( e, obj, ctx ) {

        var parent = e.target,
            hideCls = obj.params.opt_hideButtonCls,
            handlerClickCls = obj.params.opt_handlerClickCls;

        while ( parent  !== this.parentNode  ) {

            if( parent.classList.contains( hideCls ) ) {
                return ctx.hide ();
            }

            if ( parent.classList.contains ( handlerClickCls  ) ) {
                ctx.emit( "dataClick", parent.getAttribute( "data-popup-value" ) );
                return;
            }

            parent = parent.parentNode;
        }

    };


    /**
     * It removes window from list
     * @param {string} key
     * @param {bool} isRemoveWinHTMLElement - If true removes, HTMLElement for window bound to this key.
     *
     * */

    multiPopup.prototype.removeWindow = function ( key, isRemoveWinHTMLElement ) {

        if ( !this._windows [ key ] ) return;

        var win = this._windows [ key ].elem,
            index;

        if( key && isHTMLElement( win ) ) {

            if ( win === this.window ) {
                this.hide();
            };

            win.removeEventListener( "click",  this._windows [ key ]._handlers.onClick );

            if ( isRemoveWinHTMLElement === true ) {
                remove( win );
            }

            index = this._windowsHTMLElements.indexOf( win );

            if ( index != -1 ) {
                this._windowsHTMLElements.splice( index, 1 );
            }

            delete this._windows [ key ];
        }

    };


    /**
     * It Sets active window
     * @param  {HTMLElement|string} key
     */

    multiPopup.prototype.setActiveWindow = function ( key ) {

        var self = this,
            obj, keys,
            wins = self._windows;

        if( self.isOpen ) {
            self.on( "hide", function handler () {
                console.log("hide");
               self.setActiveWindow( key );
               self.off( "hide", handler );
            } );

            return;
        }


        if ( !isHTMLElement ( key )
            && wins [ key ] ) {
            var obj = wins [ key ];
        }

        else if( isHTMLElement ( key ) ) {

            keys =  Object.keys( wins );

            for( var i = 0; i < keys.length; i++ ) {
                console.log( key,  wins [ keys [ i ] ].elem );
                if ( wins [ keys [ i ] ].elem === key ) {
                    obj = wins [ keys [ i ] ];
                }
            }

        }


        if( obj &&
            isHTMLElement( obj.elem ) &&
            obj.elem != self.window ) {

            self.hide();
            self._activeWinObject = obj;
            self.window = obj.elem;
        }

    };


    multiPopup.prototype.getWindowParams = function ( key ) {
        if ( this._windows [ key ] )
            return this._windows [ key ].params;
    };


    //	/**
    //	* @param {HTMLElement} window - window HTMLElement
    //	*
    //	*/
    //
    //    Modal.prototype.setWindow = function ( modalWindow ) {
    //
//            if( !isHTMLElement( modalWindow ))
//                throw  new TypeError( "Incorrect argument 'modalWindow', expected HTMLElement" );
    //
    //        this.params = {
    //            useAnimation: true
    //        };
    //
    //        this.destroyWindow();
    //
    //        if ( isString ( this.params.opt_hideButtonCls ) ||
    //            isString(  this.params.opt_handlerClickCls ) ) {
    //            clickHadnler ( this, modalWindow );
    //        }
    //
    //        this.window = modalWindow;
    //        modalWindow.style.display = "none";
    //        modalWindow.style.position = 'fixed';
    //        modalWindow.style.zIndex = '100000';
    //
    //        return this;
    //    };




    /**
     * Events: show, showed, hide, buttonClick ( handled for HTMLElement with className equal parameter opt_handlerClickCls )
     * @param {string} event
     * @param {function} handler
     * @param {HTMLElement|string=} opt_key - binds event to window
     */

    multiPopup.prototype.on = function ( event, handler, opt_key ) {

        if ( this._isDestroyed )
            return;

        if( !this._handlers [ event ] )
            this._handlers [ event ] = [];

        if( !isFunction( handler ) ) {
            throw  new TypeError ( "Argument [handler] must be a Function " )
        }

        if ( !isHTMLElement( opt_key ) &&
            this._windows [ opt_key ] ) {

            opt_key = this._windows [ opt_key ].elem;
        }

        if ( isHTMLElement( opt_key ) &&
            this._windowsHTMLElements.indexOf( opt_key ) != -1 ) {

            this._handlers [ event ].push( {
                target: opt_key,
                handler: handler
            } );

            return;
        }

        this._handlers [ event ].push( handler );

    };

    /**
     * It removes event handler
     *
     * @param {string} event
     * @param {function=} opt_handler         - If pass only event, removed all handlers
     * @param {HTMLElement|string=} opt_key   - unbind event from window
     */
    multiPopup.prototype.off = function ( event, opt_handler, opt_key ) {

        if ( this._isDestroyed )
            return;

        var handlers =  this._handlers[ event ];

        if( !handlers )
            return;

        if( !opt_handler )
            delete  this._handlers [ event ];


        if ( !isHTMLElement ( opt_key ) &&
            this._windows [ opt_key ] ) {
            opt_key = this._windows [ opt_key ].elem;
        }

        if ( !isHTMLElement( opt_key ) ||
            this._windowsHTMLElements.indexOf( opt_key ) != -1 ) {
            opt_key = false;
        }

        for( var i = 0; i < handlers.length; i++) {

            if ( isFunction( handlers [ i ] )  &&
                handlers[ i ] == opt_handler ) {

                handlers.splice( i, 1 );
                return;
            }

            if ( opt_key &&
                handlers [ i ].target === opt_key ) {
                handlers.splice( i, 1 );
            }

        };

    };


    multiPopup.prototype.emit = function ( event ) {
        var self = this,
            handlers =  this._handlers[ event ],
            args = arguments;

        if( !handlers  )
            return;

        setTimeout( function () {

            if ( self._isDestroyed )
                return;

            handlers.forEach( function ( obj ) {

                if ( isFunction( obj ) ) {
                    obj.apply( self, [].slice.call( args, 1 ) );
                }

                else if( obj.target === self.window ) {
                    obj.handler.apply( self, [].slice.call( args, 1 ) );
                }
            } );
        }, 0 );

    };
    multiPopup.prototype.VERSION = [ 2, 0, 0 ];

    /**
     * It sets popup window on start position in top center window
     * @returns {Object}  coords - Set coordinates
     * @property {number} coords.top
     * @property {number} coords.left
     */

    multiPopup.prototype.setBasicStartPosition = function () {
        var win = this.window,
            left = ( window.innerWidth - win.offsetWidth ) / 2;
        win.style.top = - win.clientHeight + "px";
        win.style.left = left + "px";

        return {
            top: - win.clientHeight,
            left: left
        };
    };


    /**
     * It sets popup end position in center window
     * @returns {Object}  coords - Set coordinates
     * @property {number} coords.top
     * @property {number} coords.left
     */

    multiPopup.prototype.setBasicEndPosition = function () {

        var win = this.window,
            top = ( window.innerHeight - win.offsetHeight ) / 2,
            left = ( window.innerWidth - win.offsetWidth ) / 2;

        win.style.top = top + "px";
        win.style.left = left + "px";

        return {
            top: top,
            left: left
        }
    };


    /**
     * It shows popup window
     * @param {HTMLElement|string} opt_key - If arguments passed will show window bound to this key
     */

    multiPopup.prototype.show = function( opt_key )  {

        this.setActiveWindow( opt_key );

        if( this.isOpen ||
            this._isDestroyed ||
            !isHTMLElement ( this.window ) ) return;

        var win = this.window,
            params = this._activeWinObject.params;

        this.emit( "show" );

        if( params.opt_useOverlay ) {
            this.overlay.style.display = "block";
        }

        win.style.display = "block";

        if ( !isFunction( params.setStartWindowPosition ) ) {
            this.setBasicStartPosition();
        }
        else {
            params.setStartWindowPosition.call ( this );
        }

        this._showAnimateWin();

        if( isEmpty( transition ) ||
            !params.useAnimate ||
            !transition.getSupported() ) {

            this.emit( "showed" );
        }

        else {
            transition.end( win, function ( ) {
                this.emit ( "showed" );
            }.bind( this ) );
        }

        return this.isOpen = true;
    };

    /**
     * It hides popup window
     */

    multiPopup.prototype.hide = function() {

        if( !this.isOpen ||
            this._isDestroyed ||
            !isHTMLElement ( this.window ) ) return;

        this.overlay.style.display = "";
        this.window.style.display = "none";

        this.isOpen = false;

        this.emit( "hide" );

        return true;
    };

    /**
    * It removes all handlers and elements, using in multiPopup
    * @param {boolean=} isRemoveWinHTMLElement  -  if true, will remove popup window HTMLElement
    * */

    multiPopup.prototype.destroy = function( isRemoveWinHTMLElement ) {

        if ( this._isDestroyed ) {
            return;
        }

        this._isDestroyed = true;

        Object.keys( this._windows ).forEach( function ( win_key ) {
            this.removeWindow ( win_key, isRemoveWinHTMLElement  );
        }, this );

        window.removeEventListener( "resize", this._resizeHandler );
        this.overlay.removeEventListener( "click", this._hideHandler );
        delete this._handlers;


        remove( this.overlay );
        this._transition = this.window = this.overlay = undefined;
    };


    multiPopup.prototype._showAnimateWin = function ( ) {

        var params = this._activeWinObject.params;

        if( !isFunction( params.setEndWindowPosition ) ) {
            this.setBasicEndPosition();
        }
        else {
            params.setEndWindowPosition.call ( this );
        }

        if( params.useAnimate &&
            !this.isOpen ){
            this.window.classList.add ( cls );
        }
    };

    multiPopup.prototype._addOverlay = function () {

        var overlay = document.createElement( "div" ),
            self = this;

        overlay.className = "popup-overlay";
        this._hideHandler = function() {

            if ( self._activeWinObject.params.opt_isOverlayClickHide ) {
                return self.hide();
            }

        };

        overlay.addEventListener( "click", this._hideHandler, false );
        this.overlay = document.body.appendChild( overlay );
    }


    function remove( elem ) {
        if (  isHTMLElement( elem ) )
            return elem.parentNode.removeChild( elem );
    }

    function isHTMLElement( elem ) {
        return ( typeof elem=== "object" ) &&
            ( elem.nodeType === 1 ) && ( typeof elem.style === "object" ) &&
            ( typeof elem.ownerDocument ==="object" );
    }

    function isString ( str ) {
        return typeof str === "string";
    }

    function isFunction ( fnc ) {
        return typeof  fnc === "function";
    }

    function isEmpty ( obj ) {
        return  obj === undefined ||
                obj === null ||
                obj != obj;
    }





 window.MultiPopup = multiPopup;

}());