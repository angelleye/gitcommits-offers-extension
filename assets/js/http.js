//import axios from 'axios';
import {store} from './store';

let isAbsoluteURLRegex = /^(?:\w+:)\/\//;

const http = axios.create ({
    baseURL: process.env.VUE_APP_ROOT_API,
    timeout: 10000,
    headers: {'Content-Type': 'application/json'},
});

http.interceptors.request.use (
    function (config) {
        if(store.isLogged()) {
            const token = store.token;
            if (token) config.headers.Authorization = `Bearer ${token}`;
        }
        if ( !isAbsoluteURLRegex.test(config.url) ) {
            config.url = OPTIONS.apiurl+config.url;
        }
        return config;
    },
    function (error) {
        return Promise.reject (error);
    }
);

// Add a response interceptor
http.interceptors.response.use(function (response) {
    // Do something with response data
    return response;
}, function (error) {
    // Do something with response error

    console.log('intercepter error', error);
    let finalerrormsg = '';
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        switch(error.response.status){
            case 422:
                var response = error.response;
                var response = response.data;
                var errormsg = '';
                if(typeof response!='undefined' && response.hasOwnProperty('errors')) {
                    for(var i in response.errors){
                        errormsg += response.errors[i]+"\n";
                    }

                    finalerrormsg =  errormsg;
                }
                break;
            case 500:
                finalerrormsg = 'An internal server error occurred, we notified our team to look into this matter, please try later.';
                break;
            case 503:
                finalerrormsg = 'We are down due to some internal issues';
                break;
            case 504:
                finalerrormsg = 'Your last request has been timed out, please try again';
                break;
            case 509:
                finalerrormsg = 'Server is unable to handle the request due to resource overload';
                break;
            case 400:
                finalerrormsg = 'Bad request';
                break;
            case 401:
            case 403:
                finalerrormsg = 'Your login has been expired, please relogin.';
                logoutUser();
                window.app.error_message = '<div class="alert alert-danger">'+finalerrormsg+'</div>';
                window.app.isLoggedIn = false;
                break;
            case 404:
                finalerrormsg = 'Sorry we couldn\'t find the resource you were looking for. 404 Page Not Found';
                break;
            case 405:
                finalerrormsg = 'Method not allowed, 405 Error';
                break;
            case 414:
                finalerrormsg = 'Request-URI Too Long, 414 Error';
                break;
            default:
                finalerrormsg = error.response.data;
        }

    } else if (error.request) {
        // The request was made but no response was received console.log(error.request);
        finalerrormsg = "Please check your internet connection, We are unable to connect with our servers.";
    } else {
        finalerrormsg = error.message;
    }
    error.htmlerrormsg = '<div class="alert alert-danger">'+finalerrormsg+'</div>';
    error.finalerrormsg = finalerrormsg;
    return Promise.reject(error);
});

export default http;