import {Injectable} from '@angular/core';
import {Headers, Http} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import {Environment} from '../env';
// import {JsonApiDoc, JsonApiResObj, JsonApiRelObj, JsonApiResModel} from '../models/jsonApi';
import {JsonApiDoc, JsonApiResObj, JsonApiRelObj, JsonApiResModel} from './jsonApi';
import _ = require('lodash');


export class ResModelFactoryNotFoundError extends Error {}


export class ResourceModelNotFoundError extends Error {}


export interface ModelResMap {
    properties?: {[name: string]: string};
    relationships?: {[type: string]: {[name: string]: string}};
}


export interface ModelResource {
    model: any;
    map: ModelResMap;
}


export class ResModelHydrator {
    constructor(private resource: ModelResource) {}

    public buildFromResId(id: string): JsonApiResModel {
        return new this.resource.model(id);
    }

    public hydrateFromResObj(model: JsonApiResModel, resObj: JsonApiResObj, relModels?: {[name: string]: any}): void {
        if ('properties' in this.resource.map && 'attributes' in resObj) {
            for (let propName in this.resource.map.properties) {
                this.hydrateProp(resObj, propName, model);
            }
        }

        if ('relationships' in this.resource.map && relModels) {
            if ('toOne' in this.resource.map.relationships) {
                for (let modelRelName in this.resource.map.relationships['toOne']) {
                    this.hydrateToOneRel(model, modelRelName, relModels);
                }
            }

            if ('toMany' in this.resource.map.relationships) {
                for (let modelRelName in this.resource.map.relationships['toMany']) {
                    this.hydrateToManyRel(model, modelRelName, relModels);
                }
            }
        }
    }

    private hydrateProp(resObj: JsonApiResObj, propName: string, model: JsonApiResModel): void {
        if (!(propName in model)) throw new Error(`Missing prop "${propName}" in model!`);

        let attrName = this.resource.map.properties[propName];

        if (attrName in resObj.attributes) model[propName] = resObj.attributes[attrName];
    }

    private hydrateToOneRel(model: JsonApiResModel, modelRelName: string, relModels: {[name: string]: any}): void {
        if (!(modelRelName in model)) throw new Error(`Missing rel "${modelRelName}" in model!`);

        let resRelName = this.resource.map.relationships['toOne'][modelRelName];

        if (resRelName in relModels) {
            model[modelRelName] = relModels[resRelName];
        }
    }

    private hydrateToManyRel(model: JsonApiResModel, modelRelName: string, relModels: {[name: string]: any}): void {
        if (!(modelRelName in model)) throw new Error(`Missing rel "${modelRelName}" in model!`);

        let resRelName = this.resource.map.relationships['toMany'][modelRelName];

        if (resRelName in relModels) {
            _.forEach(relModels[resRelName], (resModel: JsonApiResModel) => {
                model[modelRelName].push(resModel);
            });
        }
    }
}


export abstract class ResModelHydratorProvider {
    getHydrator: (resType: string) => ResModelHydrator;
}


@Injectable()
export class JsonApiService {

    constructor(
        private env: Environment,
        private http: Http
    ) {}

    public getResource(type: string, id: string, includes?: Array<Array<string>>) {
        let url = `${this.env.apiUrl}${type}/${id}`;
        let params: {[name: string]: string} = {};

        if (includes) {
            params['include'] = this.stringifyIncludeParam(includes);
        }

        if (params) {
            url += '?' + this.stringifyQueryParams(params);
        }

        return this.http.get(url)
                   .toPromise()
                   .then(response => response.json())
                   .catch(this.handleError);
    }

    private stringifyIncludeParam(includes: Array<Array<string>>): string {
        let includesParam: Array<string> = [];

        _.forEach(includes, (include: Array<string>) => {
            includesParam.push(include.join('.'));
        });

        return includesParam.join(',');
    }

    private stringifyQueryParams(queryParams: {[name: string]: string}): string {
        let queryString: Array<string> = [];

        for (let paramName in queryParams) {
            queryString.push(paramName + '=' + queryParams[paramName]);
        }

        return queryString.join('&');
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }
}


@Injectable()
export class ResourceDbService {
    private resModels: {[resType: string]: {[id: string]: JsonApiResModel}} = {};

    public addResource(resType: string, resModel: JsonApiResModel) {
        // if (resType == "assets") resType = "computer";  // TODO: Unificar los tipos.

        if (!(resType in this.resModels)) this.resModels[resType] = {};

        this.resModels[resType][resModel.id] = resModel;
    }

    public hasResource(resType: string, id: string): any {
        // if (resType == "assets") resType = "computer";  // TODO: Unificar los tipos.

        return resType in this.resModels && id in this.resModels[resType];
    }

    public getResource(resType: string, id: string): any {
        // if (resType == "assets") resType = "computer";  // TODO: Unificar los tipos.

        if (this.hasResource(resType, id)) {
            return this.resModels[resType][id];
        }

        throw new ResourceModelNotFoundError("No such resource model.");
    }
}


@Injectable()
export class ResourceStoreService {
    private resModels: {[resType: string]: {[id: string]: JsonApiResModel}} = {};

    constructor(
        private jsonApiService: JsonApiService,
        private resDb: ResourceDbService,
        private hydratorProvider: ResModelHydratorProvider
    ) {}

    public getResource(resType: string, id: string, includes?: Array<Array<string>>): any {
        let resModel: JsonApiResModel = this.fetchResModel(resType, id);

        this.jsonApiService.getResource(resType, id, includes).then((resDoc: JsonApiDoc) => {
            this.fetchHydratedResModel(resDoc.data);

            _.forEach(resDoc.included, (include: JsonApiResObj) => this.fetchHydratedResModel(include));
        });

        return resModel;
    }

    private fetchHydratedResModel(resObj: JsonApiResObj): JsonApiResModel {
        let resModel = this.fetchResModel(_.kebabCase(resObj.type), resObj.id);
        let relModels = {};

        _.forIn(resObj['relationships'], (relObj: JsonApiRelObj, relName: string) => {
            if (relObj && relObj.data) {
                if (_.isArray(relObj.data)) {
                    relModels[relName] = [];

                    _.forIn(relObj.data, (resObj: JsonApiResObj) => {
                        let resType = _.kebabCase(resObj.type);

                        if (!this.hydratorProvider.getHydrator(resType)) return;  // Continue.

                        relModels[relName].push(this.fetchResModel(resType, resObj.id));
                    });
                } else {
                    let resType = _.kebabCase(relObj.data.type);

                    if (!this.hydratorProvider.getHydrator(resType)) return;  // Continue.

                    relModels[relName] = this.fetchResModel(resType, relObj.data.id);
                }
            }
        });

        this.hydratorProvider.getHydrator(_.kebabCase(resObj.type)).hydrateFromResObj(resModel, resObj, relModels);

        return resModel;
    }

    private fetchResModel(resType: string, id: string): JsonApiResModel {
        let resModel: JsonApiResModel;

        if (this.resDb.hasResource(resType, id)) {
            resModel = this.resDb.getResource(resType, id);
        } else {
            let factory = this.hydratorProvider.getHydrator(resType);

            if (!factory) {
                throw new ResModelFactoryNotFoundError(`Can't fetch; no factory for type ${resType}!`);
            }

            resModel = factory.buildFromResId(id);
            this.resDb.addResource(resType, resModel);
        }

        return resModel;
    }
}
