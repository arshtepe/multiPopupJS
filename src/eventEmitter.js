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