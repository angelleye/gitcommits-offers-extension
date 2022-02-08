<template>
  <div>
    <div class="text-center" v-if="pageType == 'detect'">
        <div class="spinner"></div><br>Please wait...
    </div>
    <div v-else-if="pageType == 'github'">
      <make-an-offer :git-url="currentTabUrl" :url-parts="gitParsedUrl"></make-an-offer>
    </div>
    <div v-else-if="pageType == 'jira'">
      <post-bounty :tab-url="currentTabUrl" :url-parts="gitParsedUrl"></post-bounty>
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
      currentTabUrl: null
    }
  },
  created() {
    console.log('created', this.pageType);
    if (this.pageType == null) {
      this.startCheck();
    }

  },
  watch:{
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
