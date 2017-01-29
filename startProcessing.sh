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

echo "$INFOPREP connecting to Delft MongoDB"
ssh -L 27272:dutihr.st.ewi.tudelft.nl:27017 ghtorrent@dutihr.st.ewi.tudelft.nl  | ts  2>> log/SSHerror.log >> log/SSHoutput.log &


echo "$INFOPREP starting redis-server"
redis-server  | ts  2>> log/redis_error.log >> log/redis_output.log &

echo "$INFOPREP starting redis GUI"
node_modules/kue/bin/kue-dashboard -p 3050 -r redis://127.0.0.1:6379 &

echo "$INFOPREP starting local mongo daemon"
startdtdb  | ts  2>> log/mongo_error.log >> log/mongo_output.log &

echo "$INFOPREP starting typescript compiling"
npm run tsc:watch  | ts  2>> log/tsc_error.log >> log/tsc_output.log &

echo "$INFOPREP starting GenderComputer Python Tool"
cd genderComputerWorker
python main.py | ts  2>> ../log/gender_error.log >> ../log/gender_output.log &
cd ..

echo "$INFOPREP starting server with nodemon and watching changes"
#node dist/main.js addRepos &
nodemon --debug --watch dist/ -d 1 ./dist/main.js | ts  2>> log/server_error.log >> log/server_output.log &

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
