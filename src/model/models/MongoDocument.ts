import {IMongoDocument} from "./IMongoDocument";
import {DbAccess, DB_TYPES} from "../db";
import {WriteOpResult} from "mongodb";

abstract class MongoDocument implements IMongoDocument {


    static MONGO_COLLECTION_NAME: string;

    public inflate(json: {}) : this{
        return Object.assign(this, json);
    }

    public save(): Promise<WriteOpResult> {
        return new Promise((resolve, reject) => {
            if(!this.constructor['MONGO_COLLECTION_NAME']){
                throw new Error('no MONGO_COLLECTION_NAME defined in class');
            }
            DbAccess.getInstance(DB_TYPES.LOCAL).getConnection().then(db => {
                db.collection(this.constructor['MONGO_COLLECTION_NAME']).save(this).then(
                    value => {
                        //console.log('INFO: stored new document of type ' + this.constructor.name);
                        resolve(value);
                    },
                    error => {
                        console.log('ERR:  could not store document of type ' + this.constructor.name);
                        reject(error);
                    }
                )
            });
        });
    }

    _id: string;
}

export default MongoDocument;