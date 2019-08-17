/**
 * This makes communication between the GitCommits website for authentication purpose
 */

setTimeout(function () {
    console.log('/************* GitCommits Extension *************/');
    /*
     * Start connection in content script
     */
    let contentPort = chrome.runtime.connect({
        name: 'GitCommitsConnectionRequest'
    });

    var s = document.createElement('script');
    s.src = chrome.extension.getURL('pagescript.js');

    (document.head || document.documentElement).appendChild(s);
    s.parentNode.removeChild(s);

    //Listen for runtime message
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        console.log('Receiving message from extension: ', message, sender)
        if(message.action === 'COMMUNICATION_READY') {
            /**
             * fire an event to the pagescript
             */
            setTimeout(function () {
                let event = new CustomEvent('EXT_PAGE_MESSAGE_LISTENER', {'detail': {'action':'init_vars'}});
                window.dispatchEvent(event);
            },200);
        }else if(message.action === 'auth_response') {
            /**
             * fire an event to the pagescript
             */
            let event = new CustomEvent('EXT_PAGE_MESSAGE_LISTENER', {'detail': message});
            window.dispatchEvent(event);
            console.log(message.action+' event dispatched');
        }
        sendResponse({'action':'ALL_DONE'});
    });

    window.addEventListener('message', function receiveDuck(event) {
        console.log('sending message to extension: ', event)
        switch(event.data.action) {
            case "authentication":
                //Remove this listener, but you can keep it depend on your case
                // window.removeEventListener('message', receiveDuck, false);
                contentPort.postMessage(event.data);
                break;
        }
    }, false);
},1000);