<template>
  <div>
    <div class="text-center" v-if="pageType == 'detect'">
        <div class="spinner"></div><br>Please wait...
    </div>
    <div v-else-if="pageType == 'github'">
      <div v-if="!isGitIssuePage" class="alert alert-orange">You can make an offer only on Git Issues</div>
      <div v-else>
        <post-bounty v-if="subPage == 'post-bounty'" :tab-url="currentTabUrl" :url-parts="gitParsedUrl" :type="pageType"></post-bounty>
        <make-an-offer v-else-if="subPage == 'make-an-offer'" :git-url="currentTabUrl" :url-parts="gitParsedUrl"></make-an-offer>
        <div class="text-center" v-else>
          <h3 class="my-5">What do you want to do?</h3>
          <div class="row">
            <div class="col-sm-6">
              <button class="btn btn-primary" @click="subPage='post-bounty'">Post a Bounty</button>
            </div>
            <div class="col-sm-6">
              <button class="btn btn-primary" @click="subPage='make-an-offer'">Make an Offer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="pageType == 'jira'">
      <post-bounty :tab-url="currentTabUrl" :url-parts="gitParsedUrl" :type="pageType"></post-bounty>
    </div>
    <template v-else>
      <div class="alert alert-orange">You can make an offer only on Git Issues<br>Or<br>You can post a bounty on Jira ticket.</div>
    </template>
  </div>
</template>

<script>
let githubParser = require('parse-github-url');

export default {
  name: "Menu",
  data(){
    return {
      gitParsedUrl: '',
      pageType: null,
      internalErrorMessage: null,
      currentTabUrl: null,
      subPage: null
    }
  },
  created() {
    if (this.pageType == null) {
      this.startCheck();
    }
  },
  computed: {
    isGitIssuePage: function () {
      if (this.gitParsedUrl.branch === 'issues' && this.gitParsedUrl.owner !== '' && this.gitParsedUrl.name !== '' && this.gitParsedUrl.filepath !== '') {
        return true;
      } else {
        return false;
      }
    }
  },
  watch: {
    pageType: function (newVal, oldVal) {
      if (newVal == 'github') {
        if (this.$root.user.is_funder && this.$root.user.is_contributor) {
        } else if (this.$root.user.is_funder) {
          this.subPage = 'post-bounty';
        } else {
          this.subPage = 'make-an-offer';
        }
      }
    }
  },
  methods:{
    startCheck () {
      this.pageType = 'detect';
      let thisObj = this;
      chrome.tabs.query({'active': true, 'lastFocusedWindow': true, 'currentWindow': true}, function (tabs) {
        if(typeof tabs[0] === 'undefined'){
          thisObj.pageType = 'unknown';
        } else {
          let url = tabs[0].url;
          thisObj.currentTabUrl = url;
          thisObj.gitParsedUrl = githubParser(url);
          if (thisObj.gitParsedUrl) {
            let pageType = thisObj.checkPageType(url, thisObj.gitParsedUrl);
            if (pageType) {
              thisObj.pageType = pageType;
            } else {
              thisObj.pageType = 'unknown';
            }
          }
        }
        return;
      });
    },
    checkPageType(issueUrl, urlParts){
      console.log(urlParts);
      if(urlParts.hostname === 'github.com' || urlParts.hostname === 'www.github.com'){
        return 'github';
      } else if (urlParts.hostname.indexOf('atlassian.net') > -1) {
        return 'jira';
      }
      return null;
    },
  }
}
</script>

<style scoped>

</style>
