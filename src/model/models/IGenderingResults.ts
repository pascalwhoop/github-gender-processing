import {IMongoDocument} from "./IMongoDocument";
export interface IGenderingResults extends IMongoDocument{
    gh_pr_id: number;
    pr_url: string;
    merged: boolean | string;
    login: string;
    avatar_url: string;
    email: string;
    name: string;
    genderFromLogin: string;
    genderFromName: string;
    genderFromEmail: string;
    repoName: string;
}