import {
    summarizeAccuracyOfGendering, totalNumber, printRepoStats,
    initResults, printOverallGenderPRDiff, getRepoStats
} from "./workers/AnalysisWorker";
import {printHeader, printGenericCSVOutput, printChiCSVOutput} from "./helpers/StatPrintHelper";
let command = process.argv[2];

debugger;
switch (command){
    case '':

        break;
    default:
        analyze();
        break;
}


function analyze() : void {
    printHeader();
    initResults()
        .then(results =>{
            totalNumber();
            printRepoStats();
            summarizeAccuracyOfGendering();
            //printOverallGenderPRDiff();
            //printGenericCSVOutput(getRepoStats())
            printChiCSVOutput(getRepoStats());
        });

}


function logAndExit(result){
    console.log(result);
    process.exit();
}
