import {IMongoDocument} from "./IMongoDocument";
export interface IRepoStats{
    //general repo stats
    repoName: string;
    PRCount: number;
    mergedCount: number;
    declinedCount: number;
    genderedPRCount: number;
    //general PR summaries
    malePullRequests: number;
    femalePullRequests: number;
    unknownPullRequests: number;

    //percentages
    malePercentage: number;
    femalePercentage: number;
    maleMergedPercentage: number;
    femaleMergedPercentage: number;
    maleDeclinedPercentage: number;
    femaleDeclinedPercentage: number;

    //absolute numbers
    maleMergedCount: number;
    maleDeclinedCount: number;
    femaleMergedCount: number;
    femaleDeclinedCount: number;
}
