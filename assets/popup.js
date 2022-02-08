import Vue from 'vue';
import {store} from './js/store';
import vSelect from 'vue-select'

let vueData = {
    projectName: 'GitCommits Offers',
    isLoggedIn: false,
    siteUrl: OPTIONS.baseurl,
    apiUrl: OPTIONS.apiurl,
    loginUrl: OPTIONS.baseurl+'/extension-token',
    user: null,
    error_message: ''
};

vueData = {...vueData, ...OPTIONS };

//import LoginScreen from './views/login.vue'
Vue.component('v-select', vSelect)
Vue.component('login-screen', require('./views/login.vue').default);
Vue.component('gitcommits-menu', require('./views/Menu.vue').default);
Vue.component('make-an-offer', require('./views/MakeAnOffer.vue').default);
Vue.component('post-bounty', require('./views/PostBounty.vue').default);


var app = new Vue({
    el: '#app',
    data: vueData,
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