import {Queue, Job} from "kue";
import * as GitHub from "github-api";
import {IPullRequest} from "../model/models/IPullRequest";
import {InsertWriteOpResult, WriteOpResult} from "mongodb";
import {DbAccess, DB_TYPES} from "../model/db";
import {IGithubUser} from "../model/models/IGithubUser";
import {determineGender, getUserProfile} from "./ProfileProcessor";
import GenderingResult from "../model/models/GenderingResult";
import {currentRepoJob, currentRepoContext} from "./RepositoryProcessor";
import GithubUser from "../model/models/GithubUser";
import {IRepository} from "../model/models/IRepository";


/**
 * we trigger the recursive call and then trigger the kue processing of the PRs using the processPullRequest callback
 * @param ghRepo
 * @param kue
 */
export function processPRs(ghRepo: GitHub.Repository, kue: Queue): Promise<any> {
    return new Promise((resolve, reject) => {
        recursivePRFetchAndKue(1, kue, ghRepo)
            .then(result => resolve())
            .catch(err =>console.error(err));
        //setTimeout(()=>resolve(), 100000);

    });

}


/**
 * recursive chain of promise. Probably a TODO to make that a Stack or even a queue but for now better than nothing!
 * @param nextPage
 * @param kue
 * @param ghRepo
 * @returns {Promise<any>}
 */
function recursivePRFetchAndKue(nextPage: number, kue: Queue, ghRepo: GitHub.Repository): Promise<any> {

    //we cache the PRs locally and kue them in the queue then we recurse call this again with the next page
    let processAndRecurse = function (response, resolve) {
        let p1 = cachePRsLocally(response.data);
        let p2 = kuePRs(response.data, kue);
        Promise.all([p1, p2]).then(results => {
            recursivePRFetchAndKue(++nextPage, kue, ghRepo)
                .then(result => resolve());
        });
    };
    return new Promise((resolve, reject) => {
        //else fetch the next page and recursively call this function again
        ghRepo.listPullRequests({state: 'closed', page: nextPage})
            .then(response => {
                pauseIfNoRateLeft(response);
                console.log('GET: ' + response.config.url + '  Page: ' + nextPage);
                updateProgress(nextPage, getLastPage(response));
                //there is nothing left?
                if (response.data.length == 0) {
                    resolve();
                    return;
                }
                else processAndRecurse(response, resolve);
            })
    })
}

/**
 * we cache all the PRs in the local database. that way we never have to fetch them again
 * @param data
 * @returns {Promise<InsertWriteOpResult>}
 */
function cachePRsLocally(data: IPullRequest[]): Promise<InsertWriteOpResult> {
    return new Promise<InsertWriteOpResult>((resolve, reject) => {
        DbAccess.getInstance(DB_TYPES.LOCAL).getConnection()
            .then(conn => {
                conn.collection(DbAccess.PR_COLLECTION)
                    .insertMany(data, {ordered: false})
                    .then(res => resolve(res))
                    .catch(err => reject(err));
            })
    });

    // let promises = [];
    // data.forEach(prJson => {
    //     let promise = new PullRequest().inflate(prJson).save();
    //     promises.push(promise);
    // });
    // return Promise.all(promises);


}
/**
 * takes a bunch of pull requests and throws them in the kue queue
 * @param data the array of PRs from the Github API
 * @param kue reference to the Queue where we throw it all inside
 * @returns {Promise<[]>}
 */
function kuePRs(data: IPullRequest[], kue: Queue): Promise<any[]> {
    let promises = [];
    data.forEach(pr => {
        //wrapping callbacks in promises
        let promise = new Promise(function (resolve, reject) {
            kue.create('pull_request', pr)
                .priority('high')
                .ttl(3000)
                .attempts(3)
                .save((err) => {
                    if (err !== null) return reject(err);
                    resolve(true);
                });
        });
        //pushing them all in a promise array and resolving them all together
        promises.push(promise);
    });
    return Promise.all(promises);
}

// function extractLastPage(link: string): number {
//     //todo move to util file
//     let regex = /page=([0-9]+)/g;
//     let results = regex.exec(link);
//     return Number.parseInt(results[2]);
// }


export function processPullRequest(kueJob: Job<IPullRequest>, done): void {
    //get profile of creator
    //determine gender
    //determine PR result
    //store stats in repo.IPRStats
    let pr = kueJob.data;

    let creator = pr.user;
    let _profile;

    //timing the duration of the processing
    let timeStart = Date.now();
    let timeSteps = [];
    getUserProfile(creator.login)

        .then((profile) => {
            timeSteps.push(Date.now());
            if (!profile) profile = pr.user;
            _profile = profile;

            return determineGender(profile.name, profile.login, profile.email, profile.location)
        })
        .catch(err => logErrAndFailJob(err, done))
        .then((genderResults: string[]) => {
            timeSteps.push(Date.now());
            return storeResultRow(pr, _profile, genderResults);
        })
        .catch(err => logErrAndFailJob(err, done))
        .then(() => {
            timeSteps.push(Date.now());
            logTimes(timeStart, timeSteps);
            done()
        })
        .catch(err => logErrAndFailJob(err, done));

}

function logTimes(start, steps: Array<number>){

    steps[0]= steps[0]- start; //looks ok
    for(let i = 1;i<steps.length;i++){
        steps[i] = steps[i] - start - steps[i-1];
    }
    console.log('Steps took: ' + steps[0] + '  ' + steps[1] + '  ' + steps[2]);
}

function logErrAndFailJob(err, done) {
    console.error(err);
    done(err);
}
// function handleUserProfile(profile: IGithubUser, done: Function) {
//     determineGender(profile.login, profile.email, profile.location)
//         .then((result) => {
//             profile.gender = result[0] ? result[0] : result[1];
//
//             let userObj = new GithubUser().inflate(profile);
//             userObj.save().then();
//             debugger;
//         })
//
// }

function storeResultRow(pr: IPullRequest, profile: IGithubUser, gender: string[]): Promise<WriteOpResult> {
    let result = new GenderingResult();
    if (!pr.base.repo || !profile) {
        return;
    }
    //PR Info
    result.repoName = pr.base.repo.name;
    result.merged = !!pr.merged_at;
    result.gh_pr_id = pr.id;
    result.pr_url = pr.url;

    //user info
    result.avatar_url = profile.avatar_url;

    result.name = profile.name;
    result.genderFromName = gender[0] || 'unknown';
    result.login = profile.login;
    result.genderFromLogin = gender[1] || 'unknown';
    result.email = profile.email;
    result.genderFromEmail = gender[2] || 'unknown';


    return result.save();
}



/**
 * from the link header we can extract the total number of pages.
 * @param response
 * @returns {number}
 */
function getLastPage(response): number {
    let link = response.headers.link;
    if (!link) return -1;
    let regex = /page=(\d+)/g;
    let page;
    let match = regex.exec(link);
    while (match != null) {
        page = match[1];
        match = regex.exec(link);
    }
    return Number.parseInt(page);
}

function updateProgress(currentPage: number, lastPage: number) {
    if (lastPage && lastPage > 0) {
        currentRepoJob.progress(currentPage, lastPage);
    }
}


function pauseIfNoRateLeft(response) {
    //check how many tries we have left. if we got left, keep going
    let rateRemaining = Number.parseInt(response.headers['x-ratelimit-remaining']);
    if(rateRemaining > 0) return;
    //all used up? lets calc the timeout and wait a bit until we keep processing
    let resetDate = Number.parseInt(response.headers['x-ratelimit-reset'])*1000;
    let resetLeft = resetDate - Date.now();
    currentRepoContext.pause(resetDate, err => console.error(err));

    //giving user feedback about it
    console.log('waiting for Github ratelimit .');
    let timer = setInterval(()=>console.log('.'),5000);

    //waiting until we can keep going
    setTimeout(()=>{
        currentRepoContext.resume();
        clearInterval(timer);
    },  resetLeft);
}