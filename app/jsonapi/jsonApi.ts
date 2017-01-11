export interface JsonApiResModel {
    id: string;
}


export interface JsonApiRelObj {
    data: any;
    meta?: Object;
}


export interface JsonApiResObj {
    type: string;
    id: string;
    attributes?: Object;
    relationships?: {[id: string]: JsonApiDoc};
}


export interface JsonApiDoc {
    data: JsonApiResObj;
    included?: JsonApiResObj[];
    meta?: Object;
}
