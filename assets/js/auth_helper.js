
//console = chrome.extension.getBackgroundPage().console;
//console.log(console);
var isLoggedIn = function(callback){
    //var ssset = await chrome.storage.sync.set({'gitcommits_user': 'testing'});
    chrome.storage.sync.get('gitcommits_user', function (res) {
        console.log(res,res.gitcommits_user, typeof callback);
        if(typeof res.gitcommits_user !== 'undefined' && res.gitcommits_user!=null && res.gitcommits_user.token){
            callback(true, res.gitcommits_user);
        }else
            callback(false);
    });
};

async function verifyToken(token) {
    let verifyStatus;
    var response = await axios.post(OPTIONS.apiurl+'/auth/verify', {
        token: token
    })
    .then((response) => {
        if(response.data.status){
            chrome.storage.sync.set({'gitcommits_user': response.data.user});
            verifyStatus = response.data.user;

        }else
            verifyStatus = false;
    })
    .catch(function (error) {
        verifyStatus = false;
    });
    //console.log(verifyStatus);
    return verifyStatus;
}

var logoutUser = function () {
    chrome.storage.sync.set({'gitcommits_user': null});
};

