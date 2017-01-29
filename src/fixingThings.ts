import {applyGenderToUsers} from "./workers/DataCleaner";
applyGenderToUsers().then(result => {
    console.log(result);
    process.exit();
});