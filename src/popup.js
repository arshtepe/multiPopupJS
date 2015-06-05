/* Artem Shtepenko https://github.com/cyberua/popupJS */

(function() {
    "use strict";

    var cls = "popup-window-animate";

    //#include transition.js

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

        //#if transition
        this._transition = transition;
        //#endif

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

    //#include multi.js
    //#include eventEmitter.js

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

        //#if transition
        else {
            transition.end( win, function ( ) {
                this.emit ( "showed" );
            }.bind( this ) );
        }
        //#endif

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


    //#if noComments


//    function getSupportedTransform() {
//        var prefixes = 'transform WebkitTransform MozTransform OTransform msTransform'.split(' '),
//            elem = document.createElement('div');
//
//        for(var i = 0; i < prefixes.length; i++) {
//            if( elem.style[prefixes[i]] !== undefined ) {
//                return prefixes[i];
//            }
//        }
//        return false;
//    }

    //#endif



 window.MultiPopup = multiPopup;

}());