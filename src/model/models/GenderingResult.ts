import MongoDocument from "./MongoDocument";
import {IGenderingResults} from "./IGenderingResults";

export default class GenderingResult extends MongoDocument implements IGenderingResults {


    static MONGO_COLLECTION_NAME = 'results';



    toString() {
        return JSON.stringify(this);
    }

    name: string;
    genderFromLogin: string;
    login: string;
    avatar_url: string;
    gh_pr_id: number;
    pr_url: string;
    merged: boolean;
    email: string;
    genderFromName: string;
    genderFromEmail: string;
    repoName: string;
}