export const store = {
    _user: '',

    isLogged () {
        return this.user('token')
    },

    get username () {
        return  this.user('username')
    },

    get token () {
        return this.user('token')
    },

    set User(val){
        this._user = val;
    },

    user(val){
        let userobj = this._user;

        if(userobj!=null && typeof userobj.token !=='undefined'){
            switch(val){
                case 'username':
                    return userobj.username;
                case 'token':
                    return userobj.token;
            }
        }
        return false;
    }

};