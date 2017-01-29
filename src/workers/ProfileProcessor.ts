import request = require("request");
import {IGithubUser} from "../model/models/IGithubUser";
import {DB_TYPES, DbAccess} from "../model/db";
import GithubUser from "../model/models/GithubUser";

let basePythonPath = 'http://localhost:5000/genderize/';

export function determineGender(name: string, login: string, email: string, country?: string): Promise<string[]> {

    country = country ? encodeURIComponent(country) : 'null';
    //country = cleanStringForGendering(country);
    login = fixAndEncodeURI(login);
    name = name ? fixAndEncodeURI(name) : 'null';
    email = email ? fixAndEncodeURI(/^([^@]+)/.exec(email)[1]) : 'null'; //first exec a regex and only grab the mail part, then encode
    let countryPath = basePythonPath + country + '/';

    let namePromise = requestFor(countryPath + name);
    let loginPromise = requestFor(countryPath + login);
    let mailPromise = requestFor(countryPath + email);

    let mergedPromise = Promise.all([namePromise, loginPromise, mailPromise]);
    mergedPromise.then(results => {
        console.log(results + ' for ' + name + '  ' + login + '  ' + email);
    });
    return mergedPromise;

}

export function getUserProfile(login: string): Promise<IGithubUser> {
    return new Promise((resolve, reject) => {
        getUserFromSource(login, DB_TYPES.LOCAL)
            .then(resolve)
            .catch(rej => {
                getUserFromSource(login, DB_TYPES.REMOTE)
                    .then(result => {
                        resolve(result);
                        return new GithubUser().inflate(result).save();
                    })
                    .catch(err=>{
                        reject(err);
                    })

            })
    });
}

function getUserFromSource(login: string, source: DB_TYPES) {
    return new Promise<IGithubUser>((resolve, reject) => {
        DbAccess.getInstance(source).getConnection()
            .then(conn => {
                conn.collection(DbAccess.USER_COLLECTION)
                    .find({login: login})
                    .limit(1)
                    .next()
                    .then((user: IGithubUser) => {
                        user ? resolve(user) : reject(user);
                    })
                    .catch(err => {
                        console.log('delfts are dicks ' + err);
                        reject(err)
                    });
            });
    })
}

function fixAndEncodeURI(str) {
    return encodeURIComponent(str.replace('/', '_'));
}

function requestFor(path): Promise<string> {
    return new Promise<string>(function (resolve, reject) {
        request
            .get(path, (err, res, body) => {
                if (body == null) return reject(res);
                try {
                    let gender = JSON.parse(body).gender;
                    resolve(gender);
                }
                catch (error) {
                    console.error(error);
                    resolve(null)
                }
            });
    });
}

