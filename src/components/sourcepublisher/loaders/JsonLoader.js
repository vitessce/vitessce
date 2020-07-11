/* eslint-disable */
import Ajv from 'ajv';
import { typeToSchema } from '../types';
import AbstractLoader from "./AbstractLoader";

export default class JsonLoader extends AbstractLoader {

    constructor(params) {
        super(params);
    }
    
    load() {
        const { url, requestInit, type, name } = this;
        if(this.data) {
            return this.data;
        }
        this.data = fetch(url, requestInit)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    return Promise.reject(response.headers);
                }
            })
            .catch((reason) => {
                console.warn(`"${name}" (${type}) from ${url}: fetch failed`, reason);
                return Promise.reject(`Error while fetching ${name}. Details in console.`);
            })
            .then((data) => {
                const [valid, reason] = this.validate(data);
                if (valid) {
                    return Promise.resolve(data);
                } else {
                    return Promise.reject(reason);
                }
            })
            .catch((reason) => {
                console.warn(`"${name}" (${type}) from ${url}: validation failed`, reason);
                return Promise.reject(`Error while validating ${name}. Details in console.`);
            });
        return this.data;
    }

    validate(data) {
        const { type } = this;
        const schema = typeToSchema[type];
        if (!schema) {
            throw Error(`No schema for ${type}`);
        }
        const validate = new Ajv().compile(schema);
        const valid = validate(data);
        let failureReason;
        if (!valid) {
            failureReason = JSON.stringify(validate.errors, null, 2);
        }
        return [valid, failureReason];
    }
}