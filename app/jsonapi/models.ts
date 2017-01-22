import {JsonApiResModel} from './jsonApi';


export class Location implements JsonApiResModel {
    constructor(
        public id: string,
        public name?: string
    ) {}
}


export class Person implements JsonApiResModel {
    constructor(
        public id: string,
        public name?: string,
        public location?: Location
    ) {}
}
