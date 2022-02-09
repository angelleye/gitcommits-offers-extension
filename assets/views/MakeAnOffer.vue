<template>
    <div>
        <div v-if="isGitIssuePage">
            <div v-html="errorMessage"></div>
            <div class="text-center" v-if="isCheckingStatus">
                <div class="spinner"></div><br>Please wait loading details...
            </div>
            <div v-if="showForm">
                <form id="makeofferform" class="col-md-12 pt-2" @submit.prevent="submitOffer">
                    <input class="form-control" name="git_title" v-bind:value="form.git_title" type="hidden"/>
                    <textarea class="form-control" name="git_desc" v-bind:value="form.git_desc" style="display: none"></textarea>
                    <input class="form-control" name="issue_url" v-bind:value="form.issue_url" type="hidden"/>

                    <div class="make-an-offer-heading">
                        <img src="/assets/images/money-icon.png" class="mr-3" />
                        <p class="m-0">{{offerTitle}}:<br>Take your best shot!</p>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Please type your message to the Product Owner.</label>
                        <textarea placeholder="Enter your Message" class="form-control" name="your_comment" v-model="form.your_comment"></textarea>
                    </div>

                    <div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <span class="input-group-text" id="basic-addon1">$</span>
                        </div>
                        <input type="text" class="form-control" placeholder="Enter Offer Amount" aria-label="Amount" aria-describedby="basic-addon1" name="amount" v-model="form.amount">
                    </div>

                    <div class="form-group">
                        <input type="submit" class="btn btn-primary" value="Submit Offer >"/>
                    </div>
                </form>
            </div>
        </div>
        <template v-else>
            <div class="alert alert-orange">You can make an offer only on Git Issues</div>
        </template>
    </div>
</template>

<script>
    import http from './../js/http';
    import HtmlParser from "../js/HtmlParser";

    export default {
        name: "MakeAnOffer",
        props: {
            gitUrl: String,
            urlParts: Object
        },
        data(){
            return {
              offerTitle: 'Make an Offer',
                parsed_url: '',
                isGitIssuePage: false,
                isCheckingStatus: true,
                showForm: false,
                form: {
                    git_title: '',
                    git_desc: '',
                    your_comment: '',
                    amount: '',
                    issue_url: ''
                },
                errorMessage: ''
            }
        },
        created () {
            if (this.urlParts.branch === 'issues' && this.urlParts.owner !== '' && this.urlParts.name !== '' && this.urlParts.filepath !== '') {
                this.isGitIssuePage = true;
                this.checkGitIssueStatus(this.gitUrl);
            } else {
                this.isCheckingStatus = false;
            }
        },
        methods: {
            parsePageDocument(results){
                let html = results[0];
                let gitData = (new HtmlParser()).parseGitIssue(html);
                if (gitData) {
                    this.form.git_title = gitData.title;
                    this.form.git_desc = gitData.desc;
                } else {
                  this.markUnknownGitIssue();
                }
            },
            checkGitIssueStatus (issue_url){
                function getHtmlDom() {
                    return document.getElementsByTagName('html')[0].innerHTML;
                }

                this.errorMessage = '';
                this.isCheckingStatus = true;
                http.post(OPTIONS.apiurl + '/make-an-offer/git-issue-status', {
                    issue_url: issue_url
                }).then((response) => {
                    let issueDetail = response.data;
                    if (issueDetail.can_make_offer==='yes') {
                        this.isCheckingStatus = false;
                        this.showForm = true;
                        this.form.issue_url = this.gitUrl;
                        if (issueDetail.offer) {
                          this.offerTitle = 'Update your offer';
                            this.form.amount = issueDetail.offer.offer_price;
                            this.form.your_comment = issueDetail.offer.user_comment;
                        } else if (issueDetail.message) {
                          this.errorMessage = '<div class="alert alert-info mb-2">' + issueDetail.message + '</div>';
                        }
                    } else {
                        let bountyUrl = '';
                        if (typeof issueDetail.bounty_url !== 'undefined') {
                            bountyUrl = '<div class="text-center mx-2"><a target="_blank" class="btn btn-primary btn-sm" href="'+issueDetail.bounty_url+'">View Bounty > </a></div>';
                        }
                        if (typeof issueDetail.offer_url !== 'undefined') {
                            bountyUrl = '<div class="text-center mx-2"><a target="_blank" class="btn btn-primary btn-sm" href="' + issueDetail.offer_url + '">Counter Offer > </a></div>';
                        }
                        if(issueDetail.offer && typeof issueDetail.offer.offer_status !== 'undefined' && issueDetail.offer.offer_status=="rejected")
                            this.errorMessage = '<div class="alert alert-orange">'+issueDetail.message+'</div>' + bountyUrl;
                        else
                            this.errorMessage = '<div class="alert alert-info">'+issueDetail.message+'</div>' + bountyUrl;
                    }
                }).catch(function (error) {
                    this.errorMessage = error.htmlerrormsg;
                }).then(function () {
                    this.isCheckingStatus = false;
                });

                /**
                 * Gets the values from git issue page
                 */
                chrome.tabs.executeScript( null, {code: '(' + getHtmlDom + ')();'}, this.parsePageDocument );
            },
            markUnknownGitIssue(){
                this.isCheckingStatus = false;
                this.isGitIssuePage = false;
                this.showForm = false;
            },
            submitOffer(){
                let form_errors = [];

                if (this.form.git_title==="" || typeof this.form.git_title==='undefined') {
                    form_errors.push('We are unable to detect the issue title');
                }

                /*if (this.form.git_desc==="" || typeof this.form.git_desc==='undefined') {
                    form_errors.push('We are unable to detect the issue description');
                }*/

                if (this.form.your_comment==="" || typeof this.form.your_comment==='undefined') {
                    form_errors.push('Please enter your message to the funder');
                }

                let priceamt = parseFloat(this.form.amount);
                if (this.form.amount==="" || typeof this.form.amount==='undefined' || priceamt<0) {
                    form_errors.push('Please enter a valid offer amount');
                }

                if (form_errors.length) {
                    this.errorMessage = '<div class="alert alert-danger">';
                    for(var i=0;i< form_errors.length;i++){
                        this.errorMessage += form_errors[i]+"<br>";
                    }
                    this.errorMessage += '</div>';
                } else {
                    this.errorMessage = '';
                    let submitbtn = $('#makeofferform input[type=submit]');
                    var loadingText=submitbtn.html();
                    submitbtn.html('<span class="fa fa-spinner fa-spin"></span> '+ loadingText).attr('disabled', true);
                    var serialize  = JSON.stringify(this.form);
                    this.$parent.errorMessage = '';
                    http.post('/make-an-offer/submit-offer', serialize,{

                    }).then((response) => {
                        //console.log(response);
                        let res = response.data;
                        if(res.status){
                            this.showForm=false;
                            this.errorMessage = "<div class='alert alert-info'>"+res.message+"</div>";
                        }else {
                            this.errorMessage = "<div class='alert alert-danger'>"+res.message+"</div>";
                        }
                    }).catch(function(error) {
                        //console.log(error);
                        this.$parent.errorMessage = (error.htmlerrormsg).replace(/\n/g, "<br />");
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
