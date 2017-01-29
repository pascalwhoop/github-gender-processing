#!/bin/bash

# Destroy child processes, when exiting.
cleanup() {
  echo 'ending all child processes'
  kill `jobs -p`
}
function startdtdb(){
	ulimit -n 1000
	mongod # --dbpath "/Volumes/OC Externe/Github Data Science Experiment/db"
}

# Call cleanup function on SIGINT, ie. Ctrl-C.
trap "cleanup; exit 0" EXIT TERM
INFOPREP='INFO:'

echo "$INFOPREP starting local mongo daemon"
startdtdb  | ts  2>> log/mongo_error.log >> log/mongo_output.log &

echo "$INFOPREP starting typescript compiling"
npm run tsc:watch  | ts  2>> log/tsc_error.log >> log/tsc_output.log &


echo "$INFOPREP starting server with nodemon and watching changes"
nodemon --debug --watch dist/ -d 1 ./dist/analysis.js   2>> log/analysis_error.log >> log/analysis_output.log &

#echo "$INFOPREP jobs running with PID"
#jobs -p
echo "$INFOPREP subscribing to all log files"
tailAll(){
tail  -f log/*.log |
    awk '/^==> / {a=substr($0, 5, length-8); next}
                 {print a":"$0}' &
}
tailAll

wait
cleanup
