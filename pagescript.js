/**
 * GitCommits Communicator Bridge
 */

var faloader = '<i class="fa fa-spinner fa-spin"></i>';
/**
 * Window Listener to send data when extension is ready
 */
window.addEventListener('EXT_PAGE_MESSAGE_LISTENER', function callback(event) {
    console.log('/***** Communication Ready - Posting Message *****/', window.__INITIAL_STATE__,event);
    var payload = {};
    if(event.detail.action === 'init_vars')
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

console.log('/*** Window Listener Registration Successfull ***/');