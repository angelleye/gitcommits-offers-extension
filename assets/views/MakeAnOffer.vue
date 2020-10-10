<template>
    <div>
        <div v-if="isGitIssuePage">
            <div class="text-center" v-if="isCheckingStatus">
                <div class="spinner"></div><br>Please wait loading details...
            </div>
            <div v-else-if="showForm">
                <form id="makeofferform" class="col-md-12 pt-2" @submit.prevent="submitOffer">
                    <input class="form-control" name="git_title" v-bind:value="formvalues.git_title" type="hidden"/>
                    <textarea class="form-control" name="git_desc" v-bind:value="formvalues.git_desc" style="display: none"></textarea>
                    <input class="form-control" name="issue_url" v-bind:value="formvalues.issue_url" type="hidden"/>

                    <div class="make-an-offer-heading">
                        <img src="/assets/images/money-icon.png" class="mr-3" />
                        <p class="m-0">Make an Offer:<br>Take your best shot!</p>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Please type your message to the Product Owner.</label>
                        <textarea placeholder="Enter your Message" class="form-control" name="your_comment" v-model="formvalues.your_comment"></textarea>
                    </div>

                    <div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <span class="input-group-text" id="basic-addon1">$</span>
                        </div>
                        <input type="text" class="form-control" placeholder="Enter Offer Amount" aria-label="Amount" aria-describedby="basic-addon1" name="amount" v-model="formvalues.amount">
                    </div>

                    <div class="form-group">
                        <input type="submit" class="btn btn-primary" value="Submit Offer >"/>
                    </div>
                </form>
            </div>
            <div v-else>

            </div>
        </div>
        <template v-else>
            <div class="alert alert-orange">You can make an offer only on Git Issues</div>
        </template>
    </div>
</template>

<script>
    var gh = require('parse-github-url');
    import http from './../js/http';

    export default {
        name: "MakeAnOffer",
        data(){
            return {
                current_tab_url: '',
                parsed_url: '',
                isGitIssuePage: false,
                isCheckingStatus: true,
                showForm: false,
                formvalues: {
                    git_title: '',
                    git_desc: '',
                    your_comment: '',
                    amount: '',
                    issue_url: ''
                },
                error_message: ''
            }
        },
        mounted(){
            var thisobj = this;

            chrome.tabs.query({'active': true, 'lastFocusedWindow': true, 'currentWindow': true}, function (tabs) {
                if(typeof tabs[0] === 'undefined'){
                    thisobj.isGitIssuePage = false;
                    return;
                }else {
                    var url = tabs[0].url;
                    //var url = 'https://github.com/angelleye/GitWorkDone/issues/1';
                    thisobj.current_tab_url = url;
                    thisobj.parsed_url = gh(url);
                    thisobj.isGitIssue(url, thisobj.parsed_url);
                    if (thisobj.isGitIssuePage) {
                        thisobj.checkGitIssueStatus(url);
                    } else {
                        thisobj.isCheckingStatus = false;
                    }
                }
            });


        },
        watch:{
            error_message: function(newval, oldval){
                //console.log('watch: ', newval, oldval);
                this.$parent.error_message = newval;
            },
        },
        methods:{
            parsePageDocument(results){
                var html = results[0];
                html = $(html);
                let issue_title = html.find('.gh-header-title .js-issue-title').html();
                if(typeof issue_title!=='undefined') {
                    this.formvalues.git_title = issue_title.trim();
                    this.formvalues.git_desc = html.find('#discussion_bucket .js-discussion>.TimelineItem .js-comment-body').html();
                }else {
                    this.markUnknownGitIssue();
                }
            },
            isGitIssue(issue_url, url_parts){
                let gitIssue = false;
                if(url_parts.hostname==='github.com' || url_parts.hostname==='www.github.com'){
                    if(url_parts.branch==='issues' && url_parts.owner!=='' && url_parts.name!=='' && url_parts.filepath!==''){
                        gitIssue = true;
                    }
                }
                this.isGitIssuePage = gitIssue;
            },
            checkGitIssueStatus(issue_url){
                function getHtmlDom() {
                    return document.getElementsByTagName('html')[0].innerHTML;
                }

                this.error_message = '';
                var thisobj = this;
                thisobj.isCheckingStatus = true;
                http.post(OPTIONS.apiurl+'/make-an-offer/git-issue-status', {
                    issue_url: issue_url
                }).then((response) => {
                    let issuestat = response.data;
                    console.log(issuestat);
                    if(issuestat.can_make_offer==='yes'){
                        if(issuestat.message!=='')
                            thisobj.error_message = '<div class="alert alert-info">'+issuestat.message+'</div>';
                        thisobj.isCheckingStatus = false;
                        thisobj.showForm = true;
                        thisobj.formvalues.issue_url = thisobj.current_tab_url;
                        if(issuestat.offer){
                            thisobj.formvalues.amount = issuestat.offer.offer_price;
                            thisobj.formvalues.your_comment = issuestat.offer.user_comment;
                        }
                    }else{
                        var bounty_url = '';
                        if(typeof issuestat.bounty_url !== 'undefined'){
                            bounty_url = '<div class="text-center mx-2"><a target="_blank" class="btn btn-primary btn-sm" href="'+issuestat.bounty_url+'">View Bounty > </a></div>';
                        }
                        if(typeof issuestat.offer_url !== 'undefined')
                            bounty_url = '<div class="text-center mx-2"><a target="_blank" class="btn btn-primary btn-sm" href="'+issuestat.bounty_url+'">Counter Offer > </a></div>';

                        if(issuestat.offer && typeof issuestat.offer.offer_status !== 'undefined' && issuestat.offer.offer_status=="rejected")
                            thisobj.error_message = '<div class="alert alert-orange">'+issuestat.message+'</div>'+bounty_url;
                        else
                            thisobj.error_message = '<div class="alert alert-info">'+issuestat.message+'</div>'+bounty_url;
                    }
                }).catch(function (error) {
                    thisobj.error_message = error.htmlerrormsg;
                }).then(function () {
                    thisobj.isCheckingStatus = false;
                });

                /**
                 * Gets the values from git issue page
                 */
                chrome.tabs.executeScript( null, {code: '(' + getHtmlDom + ')();'}, thisobj.parsePageDocument );
            },
            markUnknownGitIssue(){
                this.isCheckingStatus = false;
                this.isGitIssuePage = false;
                this.showForm = false;
            },
            submitOffer(){
                let form_errors = [];
                var thisobj= this;

                if (this.formvalues.git_title==="" || typeof this.formvalues.git_title==='undefined') {
                    form_errors.push('We are unable to detect the issue title');
                }

                /*if (this.formvalues.git_desc==="" || typeof this.formvalues.git_desc==='undefined') {
                    form_errors.push('We are unable to detect the issue description');
                }*/

                if (this.formvalues.your_comment==="" || typeof this.formvalues.your_comment==='undefined') {
                    form_errors.push('Please enter your message to the funder');
                }

                let priceamt = parseFloat(this.formvalues.amount);
                if (this.formvalues.amount==="" || typeof this.formvalues.amount==='undefined' || priceamt<0) {
                    form_errors.push('Please enter a valid offer amount');
                }

                if(form_errors.length) {
                    this.error_message = '<div class="alert alert-danger">';
                    for(var i=0;i< form_errors.length;i++){
                        this.error_message += form_errors[i]+"<br>";
                    }
                    this.error_message += '</div>';
                }else {
                    this.error_message = '';
                    let submitbtn = $('#makeofferform input[type=submit]');
                    var loadingText=submitbtn.html();
                    submitbtn.html('<span class="fa fa-spinner fa-spin"></span> '+ loadingText).attr('disabled', true);
                    var serialize  = JSON.stringify(this.formvalues);
                    thisobj.$parent.error_message = '';
                    http.post('/make-an-offer/submit-offer', serialize,{

                    }).then((response) => {
                        console.log(response);
                        let res = response.data;
                        if(res.status){
                            thisobj.showForm=false;
                            thisobj.error_message = "<div class='alert alert-info'>"+res.message+"</div>";
                        }else {
                            thisobj.error_message = "<div class='alert alert-danger'>"+res.message+"</div>";
                        }
                    }).catch(function(error) {
                        console.log(error);
                        thisobj.$parent.error_message = (error.htmlerrormsg).replace(/\n/g, "<br />");
                    }).then(function () {
                        submitbtn.html(loadingText).attr('disabled', false);
                    });
                }

            }
        }
    }
</script>

<style scoped>

</style>