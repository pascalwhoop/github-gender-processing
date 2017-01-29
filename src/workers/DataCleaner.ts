import {DbAccess, DB_TYPES} from "../model/db";
import {IGenderingResults} from "../model/models/IGenderingResults";
import {Db, WriteOpResult} from "mongodb";
import {finalGenderDecision} from "./AnalysisWorker";

export function fixEmails(): Promise<any> {
    return DbAccess.getInstance(DB_TYPES.LOCAL).getConnection()
        .then(handleConn);

    function handleConn(connection: Db) {
        return connection.collection(DbAccess.RESULTS_COLLECTION)
            .find({email: {$regex: /#/}})
            .toArray()
            .then(results => handleResultsArray(results as IGenderingResults[], connection))
    }

    function handleResultsArray(array: IGenderingResults[], connection: Db) {
        let promises = [];
        array.forEach(result => {
            result.email = result.email.replace('#', '@');
            promises.push(connection.collection(DbAccess.RESULTS_COLLECTION).updateOne({_id: result._id}, result));
        });
        return Promise.all(promises);
    }
}


export function applyGenderToUsers(): Promise<any> {
    let conn: Db;
    let counter = 0;

    return DbAccess.getInstance(DB_TYPES.LOCAL).getConnection()
        .then(handleConn)
        .then(handleResultsArray)
        .then(handleLoginGenderMap);

    function handleConn(_conn: Db): Promise<IGenderingResults[]> {
        conn = _conn;
        return _conn.collection(DbAccess.RESULTS_COLLECTION)
            .find({})
            .project({login: 1, genderFromLogin: 1, genderFromName: 1, genderFromEmail: 1})
            .toArray();

    }

    function handleResultsArray(results: IGenderingResults[]): Promise<Map<string,string>> {
        let genderMap = new Map<string, string>();
        results.forEach(result => {
            genderMap.set(result.login, finalGenderDecision(result));
        });
        return Promise.resolve(genderMap);
    }

    function handleLoginGenderMap(loginGenderMap: Map<string,string>): Promise<WriteOpResult[]> {
        let promises = [];
        let coll = conn.collection(DbAccess.USER_COLLECTION);

        loginGenderMap.forEach((value, key, map) => {
            let p = coll.updateOne({login: key}, {$set: {gender: value}});
            p.then(result => console.log(++counter));
            promises.push(p);
        });
        return Promise.all(promises);
    }
}


