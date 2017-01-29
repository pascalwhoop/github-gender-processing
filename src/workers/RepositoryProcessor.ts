import {IRepository} from "../model/models/IRepository";
import {Queue} from "kue";
import Repository from "../model/models/Repository";
import {processPRs} from "./PullRequestProcessor";
import * as GitHub from "github-api";
import gh from "../model/Github";
import {Job} from "kue";
import {JobContext} from "kue";
let hub = gh as GitHub.GitHub;

export function processRepositories(repos: IRepository[], kue: Queue, done) {

    //enque all repos into a job queue
    repos.forEach((repo: IRepository) => {
        let repoObj = new Repository().inflate(repo);
        if (!repoObj.kueued) {//dfdf
            console.log('adding repo to Queue: ' + repo.full_name);
            repoObj.kueued = true;
            kue.create('repository', repoObj).priority('low').save();
            repoObj.save()
        }
    });
    //start processing them
    kue.process<IRepository>('repository', 1, (job,ctx, done) => {
        currentRepoJob = job;
        processRepo(job, kue, done);
    })
}

export let currentRepoJob : Job<IRepository>;
export let currentRepoContext: JobContext;

export function processRepo(job: Job<IRepository>, kue: Queue, done: Function): void {
    console.log('processing PRs for repo ' + job.data.full_name);
    console.log('repo has watchers: ' + job.data.watchers_count);


    let ghRepo = hub.getRepo(job.data.owner.login, job.data.name);

    processPRs(ghRepo, kue).then(result =>{
        done()
    })

}

