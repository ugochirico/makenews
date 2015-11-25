/* eslint no-underscore-dangle:0, no-unused-vars:0 */

"use strict";
import PouchClient from "../../db/PouchClient.js";
import StringUtil from "../../../../../common/src/util/StringUtil.js";

export default class CategoryDb {

    static fetchAllCategoryDocuments() {
        return PouchClient.fetchDocuments("category/allCategories", { "include_docs": true });
    }

    static fetchSourceConfigurationsByCategoryId(categoryId) {
        if(StringUtil.isEmptyString(categoryId)) {
            return new Promise((resolve, reject) => {
                reject("category id should not be empty");
            });
        }
        return PouchClient.fetchDocuments("category/sourceConfigurations", { "include_docs": true, "key": categoryId });
    }

    static fetchSourceConfigurationByUrl(url) {
        if(StringUtil.isEmptyString(url)) {
            return new Promise((resolve, reject) => {
                reject("url should not be empty");
            });
        }
        return PouchClient.fetchDocuments("category/allSourcesByUrl", { "include_docs": true, "key": url });
    }

    static createOrUpdateSource(sourceConfigurationDocument) {
        return new Promise((resolve, reject) => {
            if(!sourceConfigurationDocument) {
                reject("document should not be empty");
            }
            CategoryDb.fetchSourceConfigurationByUrl(sourceConfigurationDocument.url).then(docs => {
                if(docs.length === 0) {
                    PouchClient.createDocument(sourceConfigurationDocument).then(response => {
                        resolve(response);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    let existingDocument = docs[0];
                    existingDocument.categoryIds.push(sourceConfigurationDocument.categoryIds[0]);
                    PouchClient.updateDocument(existingDocument).then(response => {
                        resolve(response);
                    }).catch(error => {
                        reject(error);
                    });
                }
            });
        });
    }

    static isCategoryExists(categoryName) {
        return new Promise((resolve, reject) => {
            CategoryDb.fetchAllCategoryDocuments().then((categoryDocs) => {
                categoryDocs.forEach(document => {
                    if(document.name === categoryName) {
                        resolve({
                            "error": "",
                            "status": true
                        });
                    }
                });
                resolve({
                    "error": "",
                    "status": false
                });
            }).catch((error) => {
                reject({
                    "error": error,
                    "status": false
                });
            });
        });
    }

    static fetchCategoryByName(name) {
        if(StringUtil.isEmptyString(name)) {
            return new Promise((resolve, reject) => {
                reject("name should not be empty");
            });
        }
        return PouchClient.fetchDocuments("category/allCategoriesByName", { "include_docs": true, "key": name });
    }

    static createCategoryIfNotExists(categoryDocument) {
        return new Promise((resolve, reject) => {
            if(!categoryDocument) {
                reject({ "status": "document should not be empty" });
            }
            CategoryDb.isCategoryExists(categoryDocument.name).then(result => {
                if(result.status === false) {
                    PouchClient.createDocument(categoryDocument).then(response => {
                        resolve(response);
                    }).catch(error => {
                        reject(error);
                    });
                }
                resolve({ "status": "category name already exists" });
            }).catch(error => {
                reject(error);
            });
        });
    }

    static createCategory(categoryDocument) {
        return new Promise((resolve, reject) => {
            CategoryDb.fetchCategoryByName(categoryDocument.name).then(result => {
                if(result.length === 0) {
                    PouchClient.createDocument(categoryDocument).then(response => {
                        resolve(response);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    reject("Category with name already exists");
                }
            }).catch(err => { reject(err) });
        });
    }
}
