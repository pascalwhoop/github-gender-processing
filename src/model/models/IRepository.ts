import {IMongoDocument} from "./IMongoDocument";
import {IGithubUser} from "./IGithubUser";
/**
 * Created by pbr on 1/19/17.
 */



export interface IPRStats{
    [propName: string]: IPRStat;
}

export interface IPRStat{
    merged: boolean,
    gender: string
}

export interface IPermissions {
    admin: boolean;
    push: boolean;
    pull: boolean;
}

export interface IRepository {
    //customs
    merge_stats?: IPRStats;

    id: number;
    owner: IGithubUser;
    name: string;
    full_name: string;
    description: string;
    private: boolean;
    fork: boolean;
    url: string;
    html_url: string;
    archive_url: string;
    assignees_url: string;
    blobs_url: string;
    branches_url: string;
    clone_url: string;
    collaborators_url: string;
    comments_url: string;
    commits_url: string;
    compare_url: string;
    contents_url: string;
    contributors_url: string;
    deployments_url: string;
    downloads_url: string;
    events_url: string;
    forks_url: string;
    git_commits_url: string;
    git_refs_url: string;
    git_tags_url: string;
    git_url: string;
    hooks_url: string;
    issue_comment_url: string;
    issue_events_url: string;
    issues_url: string;
    keys_url: string;
    labels_url: string;
    languages_url: string;
    merges_url: string;
    milestones_url: string;
    mirror_url: string;
    notifications_url: string;
    pulls_url: string;
    releases_url: string;
    ssh_url: string;
    stargazers_url: string;
    statuses_url: string;
    subscribers_url: string;
    subscription_url: string;
    svn_url: string;
    tags_url: string;
    teams_url: string;
    trees_url: string;
    homepage: string;
    language?: any;
    forks_count: number;
    stargazers_count: number;
    watchers_count: number;
    size: number;
    default_branch: string;
    open_issues_count: number;
    has_issues: boolean;
    has_wiki: boolean;
    has_pages: boolean;
    has_downloads: boolean;
    pushed_at: Date;
    created_at: Date;
    updated_at: Date;
    permissions: IPermissions;

}

