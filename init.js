//chrome.runtime.onInstalled.addListener(function() {
/*chrome.storage.sync.set({color: '#3aa757'}, function() {
    console.log("The color is green.");
});

chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {hostEquals: 'github.com', schemes: ['https']},
        })
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
});*/

chrome.runtime.onConnect.addListener(port => {
    console.log('/* Connection Request Received */', port);

    if (port.name === 'GitCommitsConnectionRequest') {

        console.log('/* GitCommitsConnection Request Accepted */');

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            console.log('/* Starting Communication with ContentScript */', tabs[0]);
            chrome.tabs.sendMessage(tabs[0].id, {action: 'COMMUNICATION_READY'}, function(response) {
                console.log('/* Communication Done */',response);
            });
        });

        console.log('/* GitCommits Listener */');
        port.onMessage.addListener(function (request, sender, sendResponse) {
            console.log('/*Message Received - Extension */',request, sender,sendResponse);

            var finalresponse = {'action':'unknown_action', 'message': 'Token authentication failed, please try again.'};

            if(request.action){
                switch (request.action) {
                    case "authentication":
                        var token = request.token;
                        var isValid = verifyToken(token).then(function (isValid) {
                            console.log('isValid',isValid);
                            finalresponse = {'action':'auth_response', 'loggedin': false,'message': 'Token authentication failed, please try again.'};
                            if(typeof isValid.token!=='undefined') {
                                finalresponse = {'action':'auth_response','loggedin': true,'message': 'Authentication successfull'};
                            }

                            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                                console.log('done msg to content',tabs[0]);
                                chrome.tabs.sendMessage(tabs[0].id, finalresponse, function(response) {

                                });
                            });
                        });
                        break;
                    default:
                        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                            console.log('done msg to content',tabs[0]);
                            chrome.tabs.sendMessage(tabs[0].id, finalresponse, function(response) {

                            });
                        });
                }
            }else {
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    console.log('done msg to content',tabs[0]);
                    chrome.tabs.sendMessage(tabs[0].id, finalresponse, function(response) {

                    });
                });
            }

        });
    }
});


/*chrome.runtime.onMessageExternal.addListener( function(request, sender, sendResponse) {
    console.log(request, sender,sendResponse);

    if (request) {
        switch (request.action) {
            case "setToken":
                /*var loggedinstatus = async function(){
                    return await isLoggedIn().then(function (res) {
                        return res
                    });
                };
                let finalresponse = loggedinstatus();
                console.log('loggedinstatus', finalresponse);
                //chrome.tabs.executeScript(   {code: 'window.location="'+request.openUrlInEditor+'"'});*/
//console.log('on message: ',request.user);

/*var token = request.user.token;
var isValid = verifyToken(token).then(function (isValid) {
    if(typeof isValid.token!=='undefined')
        sendResponse({status: true,'loggedin': true});
    else
        sendResponse({status: true,'loggedin': false,'message': 'Token authentication failed, please try again.'});
});

break;
default:
sendResponse({status: false,'message': 'Unknown action, please update the extension.'});
}
}else {
sendResponse({status: false,'message': 'Unsupported Request Parameters.'});
}
});*/

//});

/*chrome.runtime.onConnect.addListener(port => {
    port.onMessage.addListener(msg => {
        // Handle message however you want
        console.log('outside listener', msg)
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => sendResponse('pong'));*/


