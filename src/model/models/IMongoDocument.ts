export interface IMongoDocument{
    _id?: string;
    save() : Promise<any>;
}