import TurndownService from "turndown";

class HtmlParser {
    constructor() {
        this.turndownService = new TurndownService({ headingStyle: 'atx' })
    }

    parseGitIssue(html){
        html = $(html);
        let title = html.find('.gh-header-title .js-issue-title').html();
        if (typeof title !== 'undefined') {
            let description = html.find('#discussion_bucket .js-discussion>.TimelineItem .js-comment-body').html();
            let markdown = this.turndownService.turndown(description);
            return {
                title: title.trim(),
                desc: markdown
            };
        } else {
            return false;
        }
    }

    parseJiraIssue(html){
        html = $(html);
        let title = html.find('[data-test-id="issue.views.issue-base.foundation.summary.heading"]').html();
        let description = html.find('.ak-renderer-document').html();
        if(typeof title !== 'undefined' && typeof description !== 'undefined') {
            let markdown = this.turndownService.turndown(description);
            return {
                title: title.trim(),
                desc: markdown
            };
        } else {
            return false;
        }
    }
}

export default HtmlParser;