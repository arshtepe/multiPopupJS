


describe( "PopupWindow Object", function() {

    var popup,
        id,
        popupElement = document.getElementById( "modal-window" );

    beforeEach( function ( ) {

        var win = document.body.appendChild( popupElement.cloneNode(true) );

        id = win.id = Math.random();

        popup = new MultiPopup();
        popup.addWindow ( id, win, {
            useAnimate: false
        } );

    } );

    it ( "Overlay click hide", function () {

        var params = popup.getWindowParams ( id );
        params.opt_isOverlayClickHide = true;

        popup.show();
        popup.overlay.click();
        expect( popup.overlay.clientHeight ).toBe( 0 );
        expect( popup.window.clientHeight ).toBe( 0 );
        popup.destroy( true );
    } );

    it( "destroy all handlers and elements", function() {
        popup.destroy( );
        expect( popup.overlay ) .toBeUndefined();
    });




    it( "destroy all handlers and elements and window HTMLElement ", function() {
        popup.destroy( true );
        expect( popup.window ) .toBeUndefined();
        expect ( document.getElementById ( id ) ).toBeNull();
    });



    it( "show window", function ( done ) {

        var win = popup.window;
        popup.getWindowParams ( id ).useAnimate = true;


        if( !popup._transition )
            done();

        popup.on( "showed", function () {
            var rect =  win.getBoundingClientRect(),
                top = Math.round( ( window.innerHeight - win.offsetHeight ) / 2  ),
                left = Math.round( (window.innerWidth - win.offsetWidth) / 2 );

            expect ( top ).toBe( Math.round( rect.top ) );
            expect ( left ).toBe( Math.round( rect.left ) );
            popup.destroy( true );
            done();
        } );

        popup.show();

    } );

    it( "show without animate", function ( done ) {

        var win = popup.window;

        popup.show();
        setTimeout( function () {

            var rect =  win.getBoundingClientRect(),
                top = Math.round( ( window.innerHeight - win.offsetHeight ) / 2  ),
                left = Math.round( (window.innerWidth - win.offsetWidth) / 2 );

            expect ( top ).toBe( Math.round( rect.top ) );
            expect ( left ).toBe( Math.round( rect.left ) );
            popup.destroy( true );
            done();

        }, 0 );

    } );

    it( "Show on set position", function ( done ) {

        var win = popup.window,
            params = popup.getWindowParams ( id );

        params.setStartWindowPosition = function () {
            win.style.top = 0;
            expect (  win.getBoundingClientRect().top ).toBe( 0 );
        };

        params.setEndWindowPosition = function () {
            win.style.top = 300 + "px";
        };

        popup.show();

        setTimeout( function () {

            expect ( win.getBoundingClientRect().top ).toBe( 300 );
            popup.destroy( true );
            done();
        }, 0 );

    } );

//    it ( "hide window", function () {
//        popup.show();
//        popup.hide();
//        expect( popup.overlay.clientHeight ).toBe( 0 );
//        expect( popup.window.clientHeight ).toBe( 0 );
//        popup.destroy( true );
//    } );
//
//
//
//
//
    it ( "CloseButton click hide", function () {

        popup.show();
        popup.getWindowParams ( id ).opt_hideButtonCls = "close-button";
        popup.window.querySelector( ".close-button" ).click();

        expect( popup.overlay.clientHeight ).toBe( 0 );
        expect( popup.window.clientHeight ).toBe( 0 );
        popup.destroy( true );
    } );



});

