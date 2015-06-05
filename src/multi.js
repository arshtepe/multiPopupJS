    //#set multiWindows


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




