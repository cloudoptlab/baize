import { Baize } from './baize'
import * as fs from 'fs';
import { parseFile } from 'fast-csv';

let baize = new Baize()

let data = baize.preProcessing("https://zz.bdstatic.com/linksubmit/push.js", 1, "script");

let model = fs.readFileSync("./model/baize_model.json", "utf-8");

baize.load(model);

console.log(data);

console.time("Forecast consumption time");

console.log(baize.predict(data));

console.timeEnd("Forecast consumption time");

let testTrainingSet: Array<Array<any>> = []

let testPredictions: Array<number> = []

parseFile("dataset/test_convert.csv", { skipLines: 1 })
    .on("error", error => console.error(error))
    .on("data", row => {
        testPredictions.push(row.shift());
        testTrainingSet.push(row);
    })
    .on("end", (rowCount: number) => {
        console.log(`Test dataset successfully loaded ${rowCount} lines`);
        console.log("Start evaluating the model..");
        console.log(`acc: ${baize.acc(testTrainingSet, testPredictions)}`);
    });