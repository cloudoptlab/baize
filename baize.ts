/**
 * The core javascript of the baize.
 */
import { UrlParse } from './lib/urlparse';
import * as idDict from './domain_id.json';
import * as generalRules from './convert_general.json';

export class Baize {

    /**
     * Used to save models
     */
    forest: any = null;
    nEstimators: number = 0;
    nClasses: number = 0;

    /**
     * @description The url is pre-processed into data that meets the prediction criteria.
     * @returns [domain,third-party,type,root-domain,path-length,query-count,adwords,sub-domain]
     */
    preProcessing(url: string, thirdParty: number, type: string): any {
        let dataset = [];
        let urlparse = new UrlParse(url);
        dataset.push(this.getDomainId(urlparse.getDomain()));
        dataset.push(thirdParty);
        dataset.push(this.getTypeId(type))
        dataset.push(this.getRootDomainId(urlparse.getRootDomain()))
        dataset.push(urlparse.getPath().length)
        dataset.push(urlparse.getQueryCount())
        dataset.push(this.matchingRules(urlparse.getPath() + "?" + urlparse.getQuery()))
        if (urlparse.getSub() == "" || urlparse.getSub() == "www" || urlparse.getSub() == undefined) {
            dataset.push(0)
        } else {
            dataset.push(1)
        }

        return dataset
    }

    /**
     * @description Get the id of the normalized domain id.
     * @returns domain id
     */
    getDomainId(domain: string): number {
        if (idDict.domain[domain]) {
            return idDict.domain[domain];
        } else {
            return 0;
        }
    }

    /**
     * @description Get the id of the normalized type id.
     * @returns normalized domain id
     */
    getTypeId(type: string) {
        if (idDict.type[type]) {
            return idDict.type[type];
        } else {
            return 0;
        }
    }

    /**
     * @description Get the id of the normalized root-domain id.
     * @returns normalized root-domain id
     */
    getRootDomainId(domain: string) {
        if (idDict["root-domain"][domain]) {
            return idDict["root-domain"][domain];
        } else {
            return 0;
        }
    }

    /**
     * @description Determine if it matches a generic path rule.
     * @param url Path of the url + parameters of the url request
     * @returns If or not it can be matched by general rules, 0 for no match, 1 for match.
     */
    matchingRules(url: string): number {
        for (let i in generalRules) {
            if (generalRules[i].indexOf("*") >= 0 && generalRules[i].split("*").length > 0) {
                if (url.indexOf(generalRules[i].split("*")[0].replace("*", "")) >= 0 && url.indexOf(generalRules[i].split("*")[1].replace("*", "")) >= 0) {
                    return 1;
                } else if (generalRules[i].indexOf("*") >= 0) {
                    if (url.indexOf(generalRules[i].replace("*", ""))) {
                        return 1;
                    }
                }
            } else {
                if (url.indexOf(generalRules[i]) >= 0) {
                    return 1;
                }
            }
        }
        return 0;
    }

    /**
     * Used to compare the size of values.
     * @param nums 
     */
    private imax(nums: Array<number>): number {
        let index = 0;
        for (let i = 0, l = nums.length; i < l; i++) {
            index = nums[i] > nums[index] ? i : index;
        }
        return index;
    };

    /**
     * Iteration tree for prediction.
     * @param tree 
     * @param features 
     * @param node 
     * @returns
     */
    private predictHandle(tree, features, node) {
        if (tree['thresholds'][node] != -2) {
            if (features[tree['indices'][node]] <= tree['thresholds'][node]) {
                return this.predictHandle(tree, features, tree['childrenLeft'][node]);
            } else {
                return this.predictHandle(tree, features, tree['childrenRight'][node]);
            }
        }
        return tree['classes'][node].slice();
    };


    /**
     * @description The data to be put in the prediction should be in the order of [domain,third-party,type,root-domain,path-length,query-count,adwords,sub-domain].
     * @param features features to be projected, not supported in bulk.
     * @returns Predict results
     */
    predict(features: any): any {
        if(this.forest == null){
            throw "The model must be loaded first."
        }
        let preds = new Array(this.nEstimators).fill(new Array(this.nClasses).fill(0.));
        let i:number, j:number;
        for (i = 0; i < this.nEstimators; i++) {
            preds[i] = this.predictHandle(this.forest[i], features, 0);
        }
        let classes = new Array(this.nClasses).fill(0.);
        for (i = 0; i < this.nEstimators; i++) {
            let normalizer = 0.;
            for (j = 0; j < this.nClasses; j++) {
                normalizer += preds[i][j];
            }
            if (normalizer == 0.) {
                normalizer = 1;
            }
            for (j = 0; j < this.nClasses; j++) {
                preds[i][j] = preds[i][j] / normalizer;
                if (preds[i][j] <= 2.2204460492503131e-16) {
                    preds[i][j] = 2.2204460492503131e-16;
                }
                preds[i][j] = Math.log(preds[i][j]);
            }
            let sum = 0.;
            for (j = 0; j < this.nClasses; j++) {
                sum += preds[i][j];
            }
            for (j = 0; j < this.nClasses; j++) {
                preds[i][j] = (this.nClasses - 1) * (preds[i][j] - (1. / this.nClasses) * sum);
            }

            for (j = 0; j < this.nClasses; j++) {
                classes[j] += preds[i][j];
            }
        }

        return this.imax(classes)

    }

    /**
     * @description Obtaining accuracy through test dataset.
     * @param featuresList Data features used for testing.
     * @param predictions Marked values
     */
    acc(featuresList: any, predictions: any): number {
        let results = [];
        featuresList.forEach((val:number, idx:number) => {
            results.push(this.predict(val))
        });
        let nSamples = predictions.length;
        let nCorrect = 0;
        results.forEach((val:number, idx:number) => {
            if (val == predictions[idx]) {
                nCorrect++;
            }
        });
        return nCorrect / nSamples;
    }

    /**
     * @method
     * @description Loading a model from a saved json string.
     * @param modelJson String of models
     */
    load(modelJson: string): void {
        this.forest = JSON.parse(modelJson);
        this.nEstimators = this.forest.length;
        this.nClasses = this.forest[0]['classes'][0].length;
    }

}