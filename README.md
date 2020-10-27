<img  src="https://raw.githubusercontent.com/cloudoptlab/baize/master/images/baize_logo.png"
      height="120"
      width="120">

> Baí Zé (simplified Chinese: 白泽; traditional Chinese: 白澤; pinyin: Baízé; Wade–Giles: Pai-tse), or hakutaku (白澤) in Japanese, is a mythical beast from Chinese legend. Its name literally means "white marsh".

> The Baí Zé was encountered by the Yellow Emperor or Huáng Dì while he was on patrol in the east. Thereafter the creature dictated to Huáng Dì a guide to the forms and habits of all 11,520 types of supernatural creatures in the world, and how to overcome their hauntings and attacks. The emperor had this information written down in a book called the Bái Zé Tú (白泽图/白澤圖). This book no longer exists, but many fragments of it survive in other texts.

# Introduce

Baize is the first machine-based privacy engine in China that runs directly on the browser, blocking tracking scripts and malicious ad scripts. Developed in JavaScript, it can run in Node.js, browser environment.

Traditional filtering is done using filter rules, but these are based on manual updates from open source organizations, public service organizations, or individuals and are labor-intensive to maintain. We propose an automatic and effective machine learning approach based on integration learning, mimicking the heuristic engine of antivirus software. The multidimensional features of scripts are used to learn and create classifiers to block tracking scripts and malicious ad scripts.

# Effectiveness evaluation

We collected all the web requests from the homepage of Alexa top 100 websites, totaling *11764* lines for training. In order to get a better testing result, we selected some famous websites in China that are not included in the training set, and the total number of web requests is *760* lines.

We tested the data in the training set, and Shirazawa achieved an accuracy of 91.8%. It was able to identify the majority of malicious requests with 65% accuracy.

name | acc | auc | recall
-|-|-|-
Baize | 91.8% | 78.3% | 80.2% |

In most cases, it only takes 0.1 ms to predict whether a network request is secure.

# Features

We have selected the following eight features for training and prediction. Shirazawa can automatically convert a url to an array of features in most cases.

name |
- |
domain |
third-party |
type |
root-domain |
path-length |
query-count |
adwords |
sub-domain |

# Model selection

We tested almost every integrated learning algorithm on the market, taking into account training time, prediction performance, file size, and compatibility with browsers, and finally chose [Adaboost](https://en.wikipedia.org/wiki/AdaBoost)。

AdaBoost, short for Adaptive Boosting, is a machine learning meta-algorithm formulated by Yoav Freund and Robert Schapire, who won the 2003 Gödel Prize for their work. It can be used in conjunction with many other types of learning algorithms to improve performance. The output of the other learning algorithms ('weak learners') is combined into a weighted sum that represents the final output of the boosted classifier. AdaBoost is adaptive in the sense that subsequent weak learners are tweaked in favor of those instances misclassified by previous classifiers. AdaBoost is sensitive to noisy data and outliers.[1] In some problems it can be less susceptible to the overfitting problem than other learning algorithms. The individual learners can be weak, but as long as the performance of each one is slightly better than random guessing, the final model can be proven to converge to a strong learner.

Every learning algorithm tends to suit some problem types better than others, and typically has many different parameters and configurations to adjust before it achieves optimal performance on a dataset. AdaBoost (with decision trees as the weak learners) is often referred to as the best out-of-the-box classifier.[2][3] When used with decision tree learning, information gathered at each stage of the AdaBoost algorithm about the relative 'hardness' of each training sample is fed into the tree growing algorithm such that later trees tend to focus on harder-to-classify examples.

# Compile

## Clone

Baize uses typescript as its main development language, so it needs to be compiled before it can be used.

`git clone https://github.com/cloudoptlab/baize.git`

## Install

Baize has no dependencies at runtime, it is necessary to install typescript and front-end pre-compilation tools at compile time. We recommend using yarn, but you can also use npm to install them.

`yarn install --devDependencies`

## Compile

We recommend [parceljs](https://parceljs.org/) as a front-end pre-compilation tool, Parcel is a web application packaging tool for developers of varying experience. It utilizes multi-core processing to provide extremely fast speed and does not require any configuration. It is well suited to help compile libraries like Shirazawa with a small number of files.

`NODE_ENV=development parcel build baize.ts --bundle-node-modules`

After the compilation is complete, the compiled file is automatically placed in the dist directory.

# Use

You can go to the [releases](https://github.com/cloudoptlab/baize/releases) page to download the compiled js files and model files. Then drop them into the project and import them as normal js files.

# User manual

Baize has made it easy to use most of them, but you can also refer to the test.ts file, or the following typescript-based instructions. We highly recommend using typescript as a development language, but if you're using javascript, see the following implementation.

## Creating Objects

```typescript
let baize = new Baize();
```

## Array of features converted to prediction

The first argument is the full url, the second is whether it's a third-party request (if it's an integer 3, if it's not an integer 1, and the third is the type of the request string).

```typescript
let data = baize.preProcessing("https://zz.bdstatic.com/linksubmit/push.js", 1, "script");
```

## Load model

In this example, the local file is read directly from nodejs, but you can also get the remote file from ajax and put the json string in `load()`.

```typescript
let model = fs.readFileSync("./model/baize_model.json", "utf-8");

baize.load(model);
```

## Predict

A 1 means it is a suspicious network request, a 0 means it is a normal request.

```typescript
baize.predict(data);
```

# Usage Agreement

Baize is under the Apache License 2.0 and is free to use for commercial purposes, please include a link to Baize and the license agreement in the product description.

# 引用

If you are using Baize in your research, please cite it in the following format:

```
@software{baize,
  author = {Andy Qin},
  title = {{Baize: Network Request Security Identification}},
  year = {2020},
  url = {https://github.com/cloudoptlab/baize/},
}
```