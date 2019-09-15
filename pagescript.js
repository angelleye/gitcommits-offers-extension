/**
 * GitCommits Communicator Bridge
 */
var stepmoment = 1;
var faloader = '<i class="fa fa-spinner fa-spin"></i>';
/**
 * Window Listener to send data when extension is ready
 */
window.addEventListener('EXT_PAGE_MESSAGE_LISTENER', function callback(event) {
    console.log('/***** Communication Ready - Posting Message *****/', window.__INITIAL_STATE__,event, event.data);
    var payload = {};
    if(stepmoment===1 || event.detail.action === 'init_vars')
        payload =  window.__INITIAL_STATE__;
    else
        payload = event.detail;

    switch(payload.action){
        case 'authentication':
            window.postMessage(payload, '*');
            window.extensionobj.authentication_msg=faloader + ' Authentication is in progress...';
            window.extensionobj.authentication_status=0;
            break;
        case 'auth_response':
            window.extensionobj.authentication_status= payload.loggedin;
            break;
        default:
            console.log('/***** Unknown action. ABORTING REQUEST *****/')
    }

}, false);

/**
 * Authentication Successfull Listener
 */
window.addEventListener('EXT_PAGE_AUTH_LISTENER', function callback(event) {
    console.log('/***** EXT_PAGE_AUTH_LISTENER - auth successfull *****/', event);
    window.extensionobj.authentication_status= true;
}, false);

/**
 * Authentication Not Successfull Listener
 */
window.addEventListener('EXT_PAGE_AUTH_FAILED_LISTENER', function callback(event) {
    console.log('/***** EXT_PAGE_AUTH_FAILED_LISTENER - auth Unsuccessfull *****/');
    window.extensionobj.authentication_status= false;
}, false);
console.log('/*** Window Listener Registration Successfull ***/');