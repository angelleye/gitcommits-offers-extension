<template>
    <div class="login_window">
        <div class="logo">
            <img class="responsive" src="/assets/images/gitcommits-logo-topdown.png" />
        </div>
        <div class="text-center">
            <p>Do you want to make an offer?</p>
            <!--<p><b>Or</b></p>
            <p class="mb-3">You want to fund this issue?</p>-->
            <p class="mb-4">Click the button below to create an account/login.</p>
            <a :href="this.$parent.loginurl" target="_blank" class="btn btn-primary">Login/Signup</a>
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