import MongoDocument from "./MongoDocument";
import {IPullRequest, Milestone, Head, Base, Links} from "./IPullRequest";
import {IGithubUser} from "./IGithubUser";
export default class PullRequest extends MongoDocument implements IPullRequest{

    //custom
    kueued: boolean;
    static MONGO_COLLECTION_NAME = 'pull_requests';

    //from github
    id: number;
    url: string;
    html_url: string;
    diff_url: string;
    patch_url: string;
    issue_url: string;
    commits_url: string;
    review_comments_url: string;
    review_comment_url: string;
    comments_url: string;
    statuses_url: string;
    number: number;
    state: string;
    title: string;
    body: string;
    assignee: IGithubUser;
    milestone: Milestone;
    locked: boolean;
    created_at: Date;
    updated_at: Date;
    closed_at: Date;
    merged_at: Date;
    head: Head;
    base: Base;
    _links: Links;
    user: IGithubUser;
}