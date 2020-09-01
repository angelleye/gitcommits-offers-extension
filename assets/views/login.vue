<template>
    <div class="login_window">
        <div class="logo">
            <img class="responsive" src="/assets/images/gitcommits-logo-topdown.png" />
        </div>
        <div class="text-center">
            <p class="m-4">Please log in to your GitCommits account in order to use this extension.</p>
            <a :href="this.$parent.loginurl" target="_blank" class="btn btn-primary">Log In / Sign Up</a>
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