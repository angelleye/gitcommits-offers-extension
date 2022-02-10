<template>
<div>
  <div class="text-center" v-if="!$root.user.is_funder">
    <p class="mt-4 mb-5 make-an-offer-text">Please connect your PayPal account<br>to Post a Bounty. <br>
      Click below button to open Integrations.</p>
    <a :href="this.$root.siteUrl + '/user/integrations'" target="_blank" class="btn btn-primary">Open Integrations</a>
    <br><br>
    <p>If you've already connected your account, please <a :href="this.$root.loginUrl" target="_blank">click here</a> to re-sync your account.</p>
  </div>
  <div v-else-if="!isJiraIssue && !isGitIssue">
    <div class="alert alert-orange">You can post a bounty only on Jira/Git Issues</div>
  </div>
  <div v-else-if="failedToDetect">
    <div class="alert alert-orange">We're unable to parse Jira Issue, Please make sure you are on Jira Issue Detail Page.</div>
  </div>
  <div v-else>
    <div v-show="!showForm">
      <div v-html="errorMessage"></div>
      <div v-if="postedBountyUrl">
        <div class="text-center"><a :href="postedBountyUrl" target="_blank" class="btn btn-primary">View Bounty</a><br><br>OR<br><br></div>
        <div class="input-group mb-3">
          <input type="text" class="form-control" placeholder="Bounty Url" disabled v-model="postedBountyUrl" aria-describedby="basic-addon2">
          <div class="input-group-append">
            <div class="dmg-tooltip">
              <button @focusout="clipboardHint=null" class="btn btn-secondary" @click="copyUrl">
                <span class="tooltiptext" id="myTooltip">{{clipboardHint ? clipboardHint : 'Copy Url'}}</span> <img src="/assets/images/copy-icon.png">
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <form v-show="showForm" id="post_bounty_form" class="col-md-12 pt-2" @submit.prevent="postBounty">
      <div class="make-an-offer-heading">
        <img src="/assets/images/money-icon.png" class="mr-3" />
        <p class="m-0">Post Bounty:<br>Take your best shot!</p>
      </div>
      <div class="alert alert-orange" v-if="errorMessage">{{ errorMessage }}</div>
      <div v-if="isJiraIssue">
        <div class="form-group">
          <label class="form-label"><input type="radio" v-model="form.gitIssueAction" value="new"> Create a new Git Issue</label><br>
          <label class="form-label"><input type="radio" v-model="form.gitIssueAction" value="existing"> Select existing Git Issue</label>
        </div>
        <div class="form-group" v-if="form.gitIssueAction == 'new'">
          <label class="form-label">Select a Repository</label>
          <div v-if="isLoading">
            <select class="form-control">
              <option>Loading Repositories List...</option>
            </select>
          </div>
          <v-select v-else class="custom-select2 form-control" label="full_name" :options="repoList"
                    id="field-issue" aria-describedby="field-issue-feedback" required
                    :reduce="repo => repo"
                    placeholder="Select a Repository"
                    v-on:input="repoChanged">
            <template #search="{attributes, events}">
              <input
                  class="vs__search"
                  v-bind="attributes"
                  v-on="events"
              />
            </template>
            <template v-slot:no-options="{ search, searching }">
              <template v-if="searching">
                No results found for <em>{{ search }}</em>.
              </template>
              <em style="opacity: 0.5;" v-else>Start typing to search for a Git Repository.</em>
            </template>
          </v-select>

          <div :class="'error-message' + (checkFieldError('repoName') ? '' : ' d-none')">
            {{ checkFieldError('repoName', 'message') }}
          </div>
        </div>
        <div class="form-group" v-if="form.gitIssueAction == 'existing'">
          <label class="form-label">Select a Git Issue</label>
          <div v-if="isLoading">
            <select class="form-control">
              <option>Loading Issues...</option>
            </select>
          </div>
          <v-select v-else class="custom-select2 form-control" label="title" :options="gitIssues"
                    id="field-issue" aria-describedby="field-issue-feedback" required
                    placeholder="Select a Git Issue"
                    v-on:input="issueChanged">
            <template #search="{attributes, events}">
              <input
                  class="vs__search"
                  v-bind="attributes"
                  v-on="events"
              />
            </template>
            <template v-slot:no-options="{ search, searching }">
              <template v-if="searching">
                No results found for <em>{{ search }}</em>.
              </template>
              <em style="opacity: 0.5;" v-else>Start typing to search for a Git Issue.</em>
            </template>
          </v-select>
          <div :class="'error-message' + (checkFieldError('issueUrl') ? '' : ' d-none')">
            {{ checkFieldError('issueUrl', 'message') }}
          </div>
        </div>
      </div>
      <div v-else class="form-group">
        <label class="form-label">Git Issue Url</label>
        <input class="form-control" disabled v-model="form.issueUrl" placeholder="Git Issue Url" type="text"/>
        <div :class="'error-message' + (checkFieldError('issueUrl') ? '' : ' d-none')">
          {{ checkFieldError('issueUrl', 'message') }}
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Project Title</label>
        <input class="form-control" v-model="form.title" placeholder="Project Title" type="text"/>
        <div :class="'error-message' + (checkFieldError('title') ? '' : ' d-none')">
          {{ checkFieldError('title', 'message') }}
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Project Description</label>
        <textarea rows="10" placeholder="Project Description" class="form-control" v-model="form.desc"></textarea>
        <div :class="'error-message' + (checkFieldError('desc') ? '' : ' d-none')">
          {{ checkFieldError('desc', 'message') }}
        </div>
      </div>
      <div class="row">
        <div class="col-sm-6">
          <div class="form-group">
            <label class="form-label">Project Type</label>
            <select class="form-control" v-model="form.projectType">
              <option value="Traditional">Traditional</option>
              <option value="Contest">Contest</option>
            </select>
            <div :class="'error-message' + (checkFieldError('projectType') ? '' : ' d-none')">
              {{ checkFieldError('projectType', 'message') }}
            </div>
          </div>
        </div>
        <div class="col-sm-6">
          <div class="form-group">
            <label class="form-label">Experience Level</label>
            <select class="form-control" v-model="form.experience">
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <div :class="'error-message' + (checkFieldError('experience') ? '' : ' d-none')">
              {{ checkFieldError('experience', 'message') }}
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-6">
          <div class="form-group">
            <label class="form-label">Issue Type</label>
            <select :class="'form-control'" v-model="form.issueType">
              <option value="Bug">Bug</option>
              <option value="Feature">Feature</option>
              <option value="Security">Security</option>
            </select>
            <div :class="'error-message' + (checkFieldError('issueType') ? '' : ' d-none')">
              {{ checkFieldError('issueType', 'message') }}
            </div>
          </div>
        </div>
        <div class="col-sm-6">
          <label class="form-label">Bounty Amount</label>
          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text" id="basic-addon1">$</span>
            </div>
            <input type="text" class="form-control" placeholder="Enter Bounty Amount" aria-label="Amount" aria-describedby="basic-addon1" v-model="form.amount">
          </div>
          <div :class="'error-message' + (checkFieldError('amount') ? '' : ' d-none')">
            {{ checkFieldError('amount', 'message') }}
          </div>
        </div>
      </div>

      <div class="form-group">
        <input type="submit" class="btn btn-primary" :disabled="formProcessing" value="Post Bounty >"/>
      </div>
    </form>
  </div>
</div>
</template>
<script>
import http from './../js/http';
import HtmlParser from './../js/HtmlParser';
export default {
  name: "PostBounty",
  props: {
    tabUrl: String,
    urlParts: Object,
    type: String
  },
  computed: {
    isJiraIssue: function () {
      if (this.urlParts.owner == 'browse' && this.urlParts.name !== '') {
        return true;
      }
      return false;
    },
    isGitIssue: function () {
      if (this.type == 'github') {
        return true;
      }
      return false;
    }
  },
  watch: {
    'form.gitIssueAction': function (newVal, oldVal) {
      if (newVal == 'existing' && this.gitIssues === null) {
        this.fetchGitIssues('cache');
      } else if (newVal == 'new' && this.repoList === null) {
        this.fetchRepoList('cache');
      }
    }
  },
  data () {
    return {
      isLoading: false,
      failedToDetect: false,
      gitIssues: null,
      repoList: null,
      errorMessage: null,
      formErrors: {},
      showForm: true,
      formProcessing: false,
      postedBountyUrl: null,
      clipboardHint: null,
      form: {
        gitIssueAction: 'new',
        issueUrl: '',
        repoName: '',
        title: null,
        desc: null,
        projectType: 'Traditional',
        experience: 'Beginner',
        issueType: 'Bug',
        amount: 10,
        containsPrivateIssues: false
      }
    }
  },
  created() {
    function getHtmlDom() {
      return document.getElementsByTagName('html')[0].innerHTML;
    }
    if (this.type == 'github') {
      this.form.issueUrl = this.tabUrl;
      this.form.gitIssueAction = 'existing';
    } else if (this.isJiraIssue) {
      this.fetchRepoList();
    }
    /**
     * Gets the values from git issue page
     */
    chrome.tabs.executeScript( null, {code: '(' + getHtmlDom + ')();'}, this.parsePageDocument );
  },
  methods: {
    parsePageDocument(results){
      let html = results[0];
      if (this.isJiraIssue) {
        let jiraData = (new HtmlParser()).parseJiraIssue(html);
        if (jiraData) {
          this.form.title = this.urlParts.name + ' - ' + jiraData.title;
          this.form.desc = jiraData.desc;
          return;
        }
      } else {
        let gitData = (new HtmlParser()).parseGitIssue(html);
        if (gitData) {
          this.form.title = gitData.title;
          this.form.desc = gitData.desc;
          return;
        }
      }
      this.failedToDetect = true;
    },
    fetchGitIssues(loadFrom = 'reload') {
      this.isLoading = true;
      http.get(this.$root.apiUrl + '/github-issue-list').then((response) => {
        let data = response.data;
        if(data.issues && data.issues.length){
          this.gitIssues = data.issues;
        } else {
          this.gitIssues = [];
        }
      }).catch((error) => {
        this.gitIssues = [];
      }).finally(() => {
        this.isLoading = false;
      });
    },
    fetchRepoList (){
      this.isLoading = true;
      http.get(this.$root.apiUrl + '/github-repo-list').then((response) => {
        let data = response.data;
        if(data.repos && data.repos.length){
          this.repoList = data.repos;
        } else {
          this.repoList = [];
        }
      }).catch((error) => {
        this.repoList = [];
      }).finally(() => {
        this.isLoading = false;
      });
    },
    checkFieldError(fieldName, returnType = 'class') {
      if (typeof this.formErrors[fieldName] !== 'undefined') {
        return returnType == 'class' ? 'error' : this.formErrors[fieldName];
      }
      return null;
    },
    postBounty(){
      if (this.formProcessing) return;
      this.formErrors = {};

      if (this.form.gitIssueAction == 'new') {
        if (this.form.repoName == '' || this.form.repoName == null) {
          this.formErrors['repoName'] = 'Please select a repository.';
        }
      } else if (this.form.gitIssueAction == 'existing') {
        if (this.form.issueUrl == '' || this.form.issueUrl == null) {
          this.formErrors['issueUrl'] = 'Please select a Git issue.';
        }
      }

      if (this.form.title == '' || this.form.title == null) {
        this.formErrors['title'] = 'Please enter project title.';
      }

      if (this.form.desc == '' || this.form.desc == null) {
        this.formErrors['desc'] = 'Please enter project description.';
      }

      if (this.form.projectType == '' || this.form.projectType == null) {
        this.formErrors['projectType'] = 'Please select project type.';
      }

      if (this.form.experience == '' || this.form.experience == null) {
        this.formErrors['experience'] = 'Please select experience level.';
      }

      if (this.form.issueType == '' || this.form.issueType == null) {
        this.formErrors['issueType'] = 'Please select issue type.';
      }
      if (this.form.amount == '' || this.form.amount == null || Number.isNaN(this.form.amount)) {
        this.formErrors['amount'] = 'Please enter a valid amount.';
      }

      if (Object.keys(this.formErrors).length) {
        this.errorMessage = 'Please fix form errors.';
        return false;
      }

      this.error_message = '';
      this.formProcessing = true;
      http.post('/post-bounty', this.form).then((response) => {
        console.log(response);
        let res = response.data;
        if (res.status) {
          this.showForm = false;
          this.postedBountyUrl = res.issue_url
          this.errorMessage = "<div class='alert alert-info'>" + res.message + "</div>";
        } else {
          this.errorMessage = res.message;
        }
      }).catch((error) => {
        console.dir(error);
        if (error.response) {
          switch (error.response.status) {
            case 422: {
              let formErrors = {};
              this.errorMessage = 'Please fix the form issues.';
              Object.keys(error.response.data.errors).forEach((index) => {
                formErrors[index] = error.response.data.errors[index][0];
              });
              this.formErrors = formErrors;
            }
              break;
            default:
              this.errorMessage = "Something went wrong, please try again.";
          }
        } else {
          this.errorMessage = "Something went wrong, please try again.";
        }
      }).finally(() => {
        this.formProcessing = false;
      });
    },
    repoChanged (repo) {
      console.log(repo);
      if (repo) {
        this.form.repoName = repo.full_name;
        this.form.containsPrivateIssues = repo.visibility == 'private';
      }
    },
    issueChanged (issue) {
      console.log(issue);
      if (issue) {
        this.form.issueUrl = issue.url;
        this.form.containsPrivateIssues = issue.private;
      }
    },
    copyUrl () {
      this.clipboardHint = 'Url Copied';
      navigator.clipboard.writeText(this.postedBountyUrl);
    }
  }
}
</script>

<style scoped>
.form-control.error {
  border: 1px solid red;
}
.error-message{
  color: red;
}
</style>