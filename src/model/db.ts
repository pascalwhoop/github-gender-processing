import {MongoClient, Db} from "mongodb";


// Create a class to manage the data manipulation.
export enum DB_TYPES {LOCAL, REMOTE}

export class DbAccess {
    static LOCAL_MONGO_URL: string = 'mongodb://127.0.0.1:27017/github';
    static REMOTE_MONGO_URL: string = 'mongodb://ghtorrentro:ghtorrentro@127.0.0.1:27272/github';

    static REPO_COLLECTION: string = 'repositories';
    static PR_COLLECTION: string = 'pull_requests';
    static USER_COLLECTION: string = 'users';
    static RESULTS_COLLECTION: string = 'results';

    private db: Promise<Db>;
    private static localInstance: DbAccess;
    private static remoteInstance: DbAccess;

    constructor(url: string) {

        this.openDbConnection(url);
    }

    static getInstance(fromOrigin): DbAccess {
        if (fromOrigin == DB_TYPES.LOCAL) {
            //console.log('getting local db instance');
            return !DbAccess.localInstance ? DbAccess.localInstance = new DbAccess(DbAccess.LOCAL_MONGO_URL) : DbAccess.localInstance;
        }
        if (fromOrigin == DB_TYPES.REMOTE) {
            //console.log('getting remote db instance');
            return !DbAccess.remoteInstance ? DbAccess.remoteInstance = new DbAccess(DbAccess.REMOTE_MONGO_URL) : DbAccess.remoteInstance;
        }


        return DbAccess.localInstance;
    }


    public getConnection(): Promise<Db> {
        //console.log("getting connection");
        return this.db;
    }

    // Open the MongoDB connection.
    public openDbConnection(path): void {
        if (this.db == null) {
            this.db = MongoClient.connect(path) as Promise<Db>;

            //log away the error
            this.db.then(
                resolve => //console.log('connected to ' + path),
                reject => console.log(reject)
            );

        }
    }

    // Close the existing connection.
    public closeDbConnection() {
        if (this.db) {
            this.db.then(
                db => {
                    db.close();
                    this.db = null;
                }
            );
        }
    }


}