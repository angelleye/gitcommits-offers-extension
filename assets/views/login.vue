<template>
    <div class="login_window">
        <div class="logo">
            <img class="responsive" src="/assets/images/gitcommits-logo-topdown.png" />
        </div>
        <div class="text-center">
            <p class="mt-4 mb-5 make-an-offer-text">Do you want to make an offer?<br>
                Click on the GitHub button to begin!</p>
            <a :href="this.$root.loginUrl" target="_blank" class="btn btn-github"><img src="/assets/images/github_logo.png" class="mr-2"/> Log In with GitHub</a>
        </div>
    </div>
</template>
<script>
    export default {
        name: 'login_screen',
        data(){
            return {

            }
        }
    }
</script>
<style>
    .make-an-offer-text{
        font-family: 'IBM Plex Mono';
        font-style: normal;
        font-weight: 500;
        font-size: 22px;
        line-height: 30px;
        color: #102B4E;
    }
    .btn-github{
        display: flex;
        align-items: center;
        max-width: 300px;
        text-align: center;
        margin: 0 auto;
        color: #fff;
        background-color: #666;
        border-color: rgba(0,0,0,0.2);
        padding: 20px 50px;
        font-size: 18px;
        line-height: 23px;
    }
    .btn-github:hover {
        color: #fff;
        background-color: #2b2b2b;
        border-color: rgba(0,0,0,0.2);
    }
</style>