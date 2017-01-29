import {IRepoStats} from "../model/models/IRepoStats";
export function printAccuracyStats(name: number[], login: number[], email: number[]){
    console.log();
}


export function printHeader(){
    console.log('Statistics for all results:');
    printSeparator(3, 3);
}

export function printSeparator(size?: number, width?: number, character?: string){
    if(!character) character = '-';
    if(!size) size = 1;
    let i =0;
    let piece = Array(20).join(character);
    let line = '';
    if(!width) width = 2;
    for(let j = 0;j<width;j++){
        line += piece;
    }
    while(i++<size){
        console.log(line);
    }
}

export function printStatsForRepo(stats : IRepoStats) {
    printSeparator(1);

    console.log('Stats for:                ' + stats.repoName);
    console.log('Total number of PRs:      ' + stats.genderedPRCount);
    console.log('PRs created by women:     ' + stats.femalePullRequests);
    console.log('PRs created  by  men:     ' + stats.malePullRequests);
    console.log('PRs not gendered:         ' + stats.unknownPullRequests);
    printSeparator(1, 1);
    console.log('% of PRs by women:        ' + toPercent(stats.femalePercentage));
    console.log('% of PRs by men:          ' + toPercent(stats.malePercentage));
    printSeparator(1,1);
    console.log('% of merged PR by women:  ' + toPercent(stats.femaleMergedPercentage));
    console.log('% of merged PR by men:    ' + toPercent(stats.maleMergedPercentage));
    console.log('abs merged PR by women:   ' + stats.femaleMergedCount);
    console.log('abs merged PR by men:     ' + stats.maleMergedCount);
    printSeparator(1,1);
    console.log('% of declined PR by women:' + toPercent(stats.femaleDeclinedPercentage));
    console.log('% of declined PR by men:  ' + toPercent(stats.maleDeclinedPercentage));
    console.log('abs declined PR by women: ' + stats.femaleDeclinedCount);
    console.log('abs declined PR by men:   ' + stats.maleDeclinedCount);


}

export function printGenericCSVOutput(stats: IRepoStats[]) : void{
    printSeparator(2,4,'#');
    console.log('CSV DATA');
    console.log('repoName,totalPullRequests,malePullRequests,femalePullRequests,unknownPullRequests,malePercentage,femalePercentage,maleMergedPercentage,femaleMergedPercentage,maleDeclinedPercentage,femaleDeclinedPercentage,maleMergedCount,maleDeclinedCount,femaleMergedCount,femaleDeclinedCount')
    stats.forEach(stat =>{
        let line = '' + stat.repoName +',' + stat.genderedPRCount +',' +stat.malePullRequests+',' +stat.femalePullRequests+',' +stat.unknownPullRequests+',' +stat.malePercentage+',' +stat.femalePercentage+',' +stat.maleMergedPercentage+',' +stat.femaleMergedPercentage+',' +stat.maleDeclinedPercentage+',' +stat.femaleDeclinedPercentage+',' +stat.maleMergedCount+',' +stat.maleDeclinedCount+',' +stat.femaleMergedCount+',' +stat.femaleDeclinedCount;
        console.log(line);
    })

    
}

export function printChiCSVOutput(stats: IRepoStats[]) : void{
    printSeparator(2,4,'#');
    console.log('CSV DATA FOR CHI SQUARED TEST');
    console.log('repoName,PRCount,mergedCount,declinedCount,malePullRequests,femalePullRequests,unknownPullRequests,maleMergedCount,maleDeclinedCount,femaleMergedCount,femaleDeclinedCount');
    stats.forEach(stat =>{
        let line = '' + stat.repoName +',' + stat.PRCount +',' + stat.mergedCount +',' + stat.declinedCount+',' +stat.malePullRequests+',' +stat.femalePullRequests+',' +stat.unknownPullRequests+',' +stat.maleMergedCount+',' +stat.maleDeclinedCount+',' +stat.femaleMergedCount+',' +stat.femaleDeclinedCount;
        console.log(line);
    })
}

function toPercent(number, precision?){
    return (Math.round(number * 10000)/10000)*100 + '%';
}

