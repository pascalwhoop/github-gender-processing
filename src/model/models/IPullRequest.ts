import {IGithubUser} from "./IGithubUser";
import {IRepository} from "./IRepository";

export interface IPullRequest {
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


export interface Milestone {
    url: string;
    html_url: string;
    labels_url: string;
    id: number;
    number: number;
    state: string;
    title: string;
    description: string;
    creator: IGithubUser;
    open_issues: number;
    closed_issues: number;
    created_at: Date;
    updated_at: Date;
    closed_at: Date;
    due_on: Date;
}



export interface Head {
    label: string;
    ref: string;
    sha: string;
    user: IGithubUser;
    repo: IRepository;
}



export interface Base {
    label: string;
    ref: string;
    sha: string;
    user: IGithubUser;
    repo: IRepository;
}

export interface Link {
    href: string;
}


export interface Links {
    self: Link;
    html: Link;
    issue: Link;
    comments: Link;
    review_comments: Link;
    review_comment: Link;
    commits: Link;
    statuses: Link;
}


