import Vue from 'vue';
import {store} from './js/store';

let vuedata = {
    projectName: 'GitCommits Offers',
    isLoggedIn: false,
    loginurl: OPTIONS.baseurl+'/extension-token',
    user: null,
    error_message: ''
};

vuedata = {...vuedata, ...OPTIONS };

//import LoginScreen from './views/login.vue'
Vue.component('login-screen', require('./views/login.vue').default);
Vue.component('make-an-offer', require('./views/MakeAnOffer.vue').default);


var app = new Vue({
    el: '#app',
    data: vuedata,
    async created(){
        var logged = await isLoggedIn(this.loggedInCallback);
        console.log('logged',logged,this.isLoggedIn);
    },
    updated(){
        console.log(this.isLoggedIn);
    },
    methods: {
        loggedInCallback(status, user){
            if(status){
                this.user = user;
                this.isLoggedIn = true;
                store.User = user;
            }
            console.log('loggedin callback', status, user);
        },
        logoutUser(){
            this.user = null;
            this.isLoggedIn = false;
            this.error_message = '';
            logoutUser();
        }
    }
});

window.app = app;