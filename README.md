## Demo
* https://jsfiddle.net/x8w604f4/6/embedded/result/ - demo ( https://jsfiddle.net/x8w604f4/6/ )
* https://jsfiddle.net/x8w604f4/7/embedded/result/ - animation change demo
* https://jsfiddle.net/x8w604f4/8/embedded/result/ - animation change demo

## Installation
```HTML
<link href="path_to/popup-default.css" rel="stylesheet" type="text/css">
<script src="path_to/multiPopup.min.js"></script>
```

## Features
* Cross browser compatibility
* Without additional libraries
* Easy usage
* Css3 animation
* Easy settings animation

## Browsers Support
* Chrome +
* Firefox + 
* Opera +
* Internet Explorer 10 +


```javascript

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
    var popup = new MultiPopup ({
        window: win,// Link on HTMLElement
        opt_hideButtonCls: "close-button",//Close button element class
        opt_handlerClickCls: "modal-action-button", // if HTMLElement have this class he will 
        opt_isOverlayClickHide: true,// if true when click on overlay, window will close
        useAnimate: false,// if false animation does not use (default true)
        setEndAnimationPosition:  function ( ) { //default function
          var win = this.window,
              top = ( window.innerHeight - win.offsetHeight ) / 2,
              left = ( window.innerWidth - win.offsetWidth ) / 2;
        
          win.style.top = top + "px";
          win.style.left = left + "px";
        },
        modal.setStartAnimationPosition: function() { // Set start position window  before start animation, default at the top at the center outside screen  
            this.window.style.top = -this.window.clientHeight + "px"; //default value
        }
  
 });
 
    /**
     * It shows popup window
     * @param {HTMLElement|string} opt_key - If arguments passed will show window bound to this key
     */
    popup.show( /* opt_key */ ); //show window

    /**
     * It hides popup window
     */
    popup.hide();

    /**
    * Events: show, showed, hide, dataClick ( handles for HTMLElement with className equal parameter opt_handlerClickCls )
    * @param {string} event 
    * @param {function} handler
    * @param {HTMLElement|string} opt_key - binds event to window 
    */
    popup.on( "showed",function () { // bind on popup events
    // this == popup
    }, /*opt_key */ ) ;
    
    popup.on( "dataClick", function ( data ) {
        if( data == "ok" ) {
            alert( "ok" )
        }
    }, loaderWin ); // handles only for loaderWin
 
 
    /** 
    * It removes event handler
    * 
    * @param {string} event 
    * @param {function} opt_handler         - If pass only event, removed all handlers
    * @param {HTMLElement|string} opt_key   - unbind event from window 
    */
    popup.off( "showed", /*opt_handler*/ );
 
 

    /**
     * Add window
     * @param    {string} key
     * @param    {HTMLElement} windowElem
     * @param    {Object=} opt_params
     * @property {string=}      opt_params.opt_hideButtonCls            - Close button HTMLElement class
     * @property {string=}      opt_params.opt_handlerClickCls          - Handles click on HTMLElements with class of this param
     * @property {string=}      opt_params.opt_isOverlayClickHide       - if true then when it is click on overlay, window will close
     * @property {boolean=}     [opt_params.useAnimate=true]            - if false animation does not use
     * @property {function=}    opt_params.setEndWindowPosition         - Function calls before window hides, and function is need set end position
     * @property {function=}    opt_params.setStartAnimationPosition    - Function calls before window shows, and function is need set start position
     */
    popup.addWindow( "windowKey", windowHTMLElement, {
        opt_handlerClickCls: "popup-action-button",
        opt_hideButtonCls: "popup-close-button"
    });

    /**
     * It removes window from list
     * @param {string} key
     * @param {bool} isRemoveWinHTMLElement - If true removes, HTMLElement for window bound to this key.
     *
     * */
    popup.removeWindow ();
    
   /**
    * It sets active window
    * @param  {HTMLElement|string} key
    */
    popup.setActiveWindow ();
    
   /**
    * It sets popup end position in center window
    */
    popup.setBasicEndPosition()

   /**
    * It sets popup window on start position in top center window
    */
    popup.setBasicStartPosition ();
    
    
    /**
    * It removes all handlers and elements, using in popup
    * @param {boolean=} -  if true, will remove popup window HTMLElement
    * */
    popup.destroy( /*opt_removeWindow*/ );


    /**
    * It Set start position window  before starts animation
    */
    popup.setStartAnimationPosition = function() { //
        this.window.style.top = -this.window.clientHeight + "px"; //default value
    };

    /**
    * It sets popup end position
    */
     popup.setEndWindowPosition = function ( ) { //default function
      var win = this.window,
          top = ( window.innerHeight - win.offsetHeight ) / 2,
          left = ( window.innerWidth - win.offsetWidth ) / 2;
    
      win.style.top = top + "px";
      win.style.left = left + "px";
     };

 ```
 
 
## Animation change example

http://jsfiddle.net/x8w604f4/7/

```javascript
 popup.setStartAnimationPosition = function() {
   this.window.style.top = 0 + "px";
 };

  popup.addWindow( "loaderWin", loaderWin,
  {
      setStartWindowPosition: function () {
          var basic = this.setBasicEndPosition();
          this.window.style.top = basic.top - this.window.offsetHeight - 100  + "px";
      },

      setEndWindowPosition: function () {
          this.setBasicEndPosition();
          this.window.style.top = 50 + "px";
      }

  } );

```
 
## Animation change example

http://jsfiddle.net/x8w604f4/8/


```javascript

win.style.transform = "scale(0)";

popup.on( "hide", function ( ) {
  win.style.transform = "scale(0)";
} );

popup.on( "show", function ( ) {
   win.style.transform = "scale(1)";
} );

```

## License

MultiPopupJS is licensed under the MIT License (see LICENSE for details).
 
