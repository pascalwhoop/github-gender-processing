import {IGenderingResults} from "../model/models/IGenderingResults";
import {DbAccess, DB_TYPES} from "../model/db";
import {Db} from "mongodb";
import {printSeparator, printStatsForRepo} from "../helpers/StatPrintHelper";
import {IRepoStats} from "../model/models/IRepoStats";

export function totalNumber() {
    console.log('Number of total Records: ' + results.length);
    console.log('Number of repositories analyzed: ' + getRepoList().length)
}

export function summarizeAccuracyOfGendering() {
    console.log('Overall gendering accuracy: ');
}

export function printOverallGenderPRDiff() : void {

}




//keep the results array in memory for all analyses
let results: IGenderingResults[];
export function initResults(): Promise<IGenderingResults[]> {
    return new Promise((resolve, reject) => {
        if (results) resolve(results);
        else resolve(DbAccess.getInstance(DB_TYPES.LOCAL).getConnection().then(handleConn));
    });
    function handleConn(connection: Db): Promise<IGenderingResults[]> {
        return connection.collection("fixedresults")
            .find({})
            .toArray()
            .then(res => {
                results = res;
                return results;
            });
    }
}

// export function printRepoList(): Promise<any> {
//     return getRepoList()
//         .then(repos => {
//             repos.forEach(repo => console.log(repo));
//         })
// }

export function printRepoStats() {
    printSeparator(2);
    let repos = getRepoList();
    repos.forEach(repo => {
        printStatsForRepo(calcRepoStatsFromResults(getResultsForRepo(repo)));
    })
}


let repostats = {};
export function calcRepoStatsFromResults(repoList: IGenderingResults[]): IRepoStats {
    let repoName = repoList[0].repoName;
    if(repostats[repoName])return repostats[repoName];

    let femalePRs = repoList.filter(pr => finalGenderDecision(pr) == 'female');
    let malePRs = repoList.filter(pr => finalGenderDecision(pr) == 'male');

    //we only see the gendered as relevant now
    let PRCount = repoList.length;
    let genderedList = malePRs.concat(femalePRs);

    let declinedPRs = repoList.filter(pr => pr.merged == 'false');
    let mergedPRs = repoList.filter(pr => pr.merged == 'true');

    let malePer = malePRs.length / genderedList.length ;
    let femPer = femalePRs.length / genderedList.length ;
    let unknownPullRequests = PRCount - malePRs.length - femalePRs.length;




    let stats :IRepoStats= {
        repoName: repoName,
        PRCount: PRCount,
        mergedCount: mergedPRs.length,
        declinedCount: PRCount - mergedPRs.length,
        genderedPRCount: genderedList.length,
        malePullRequests: malePRs.length,
        femalePullRequests: femalePRs.length,
        unknownPullRequests: unknownPullRequests,
        malePercentage: malePer,
        femalePercentage: femPer,
        maleMergedPercentage:       malePRs.    filter(pr => pr.merged == 'true').length    / mergedPRs.length ,
        femaleMergedPercentage:     femalePRs.  filter(pr => pr.merged == 'true').length  / mergedPRs.length ,
        maleDeclinedPercentage:     malePRs.    filter(pr => pr.merged == 'false').length   / declinedPRs.length ,
        femaleDeclinedPercentage:   femalePRs.  filter(pr => pr.merged == 'false').length / declinedPRs.length,
        maleMergedCount:        mergedPRs.  filter(pr => finalGenderDecision(pr) == 'male').length,
        femaleMergedCount:      mergedPRs.  filter(pr => finalGenderDecision(pr) == 'female').length,
        maleDeclinedCount:      declinedPRs.filter(pr => finalGenderDecision(pr) == 'male').length,
        femaleDeclinedCount:    declinedPRs.filter(pr => finalGenderDecision(pr) == 'female').length

    };
    repostats[stats.repoName] = stats;
    return stats;
}

export function getRepoStats(): IRepoStats[]{
    let stats : IRepoStats[] = [];
    getRepoList().forEach(repo =>{
        let stat = calcRepoStatsFromResults(getResultsForRepo(repo));
        stats.push(stat);
    });
    //sort by totalPullRequests
    return stats.sort((a,b) => a.genderedPRCount < b.genderedPRCount ? 1 : (a.genderedPRCount>b.genderedPRCount? -1 : 0));

}

export function finalGenderDecision(result: IGenderingResults) {
    if (result.genderFromName == 'male' || result.genderFromName == 'female') {
        return result.genderFromName;
    } else if (result.genderFromLogin == 'male' || result.genderFromLogin == 'female') {
        return result.genderFromLogin;
    } else  return result.genderFromEmail;

}

let repoList = null;
function getRepoList() : string[]{
    if (repoList) return repoList;
    else {
        repoList = uniq(results.map(result => result.repoName));
        return repoList;
    }
}

function getResultsForRepo(repoName: string) {
    return results.filter(result => result.repoName == repoName);
}

function uniq(a) {
    return a.sort().filter(function (item, pos, ary) {
        return !pos || item != ary[pos - 1];
    })
}