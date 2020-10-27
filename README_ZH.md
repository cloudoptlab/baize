<img  src="https://raw.githubusercontent.com/cloudoptlab/baize/master/images/baize_logo.png"
      height="120"
      width="120">

> 白泽是中国古代神话中地位崇高的神兽，祥瑞之象征，传说中白泽可以预测吉凶，是令人逢凶化吉的吉祥之兽。白泽亦能说人话，通万物之情，晓天下万物状貌。

# 介绍

白泽是直接运行在浏览器上且基于机器的隐私保护引擎，能够有效的阻挡跟踪脚本、恶意广告脚本。使用 JavaScript 开发，可以运行在 Node.js、浏览器环境中。

传统的过滤方式是使用过滤规则进行过滤，但这些过滤规则都是基于开源组织、公益组织或个人手动更新的，需要耗费大量的人力进行维护。我们模仿杀毒软件的启发式引擎，基于集成学习，提出了一种自动有效的机器学习方法。通过脚本的多维度特征来学习并创建分类器从而阻止跟踪脚本及恶意广告脚本。

# 效果评估

我们收集了 Alexa top 100 网站中的首页所有的网络请求，合计 *11764* 行作为训练。同时为了达到更好的测试效果，我们选取了国内的一些知名网站且不包含在训练集中的网站的首页网络请求，合计 *760* 行。

我们对测试集的数据进行了测试，白泽获得了高达 91.8% 的准确率。它能以 65% 的准确率识别出绝大多数的恶意请求。

name | acc | auc | recall
-|-|-|-
Baize | 91.8% | 78.3% | 80.2% |

绝大多数情况下，预测一个网络请求是否安全仅需要 0.1 ms。

# 选取特征

我们选取了以下八个特征作为训练和预测的依据。白泽在绝大多数情况下可以自动将一个 url 转为特征数组。

name | describe
-|-
domain | 域名
third-party | 是否是第三方请求
type | 请求类型
root-domain | 根域名
path-length | 路径长度
query-count | 参数数量
adwords | 是否符合通用规则
sub-domain | 是否是子域名

# 模型选取

我们测试了几乎市面上所有的集成学习算法，考虑到训练时间、预测效果、文件大小、对浏览器的兼容性，最终选择了 [Adaboost](https://en.wikipedia.org/wiki/AdaBoost)。

Adaboost算法基本原理就是将多个弱分类器（弱分类器一般选用单层决策树）进行合理的结合，使其成为一个强分类器。

Adaboost采用迭代的思想，每次迭代只训练一个弱分类器，训练好的弱分类器将参与下一次迭代的使用。也就是说，在第N次迭代中，一共就有N个弱分类器，其中N-1个是以前训练好的，其各种参数都不再改变，本次训练第N个分类器。其中弱分类器的关系是第N个弱分类器更可能分对前N-1个弱分类器没分对的数据，最终分类输出要看这N个分类器的综合效果。

# 编译文件

## 下载源码

白泽主要是使用 typescript 作为主要开发语言，所以需要先进行编译才可以使用。

`git clone https://github.com/cloudoptlab/baize.git`

## 安装依赖

白泽虽然运行时没有依赖，但是在编译时是需要安装 typescript 和前端预编译工具的。我们推荐使用 yarn 进行安装，当然你也可以使用 npm 进行安装。

`yarn install --devDependencies`

## 编译源码

我们推荐使用 [parceljs](https://parceljs.org/) 作为前端预编译工具，Parcel 是 Web 应用打包工具，适用于经验不同的开发者。它利用多核处理提供了极快的速度，并且不需要任何配置。非常适合帮助白泽这种少量文件的库进行编译。

`NODE_ENV=development parcel build baize.ts --bundle-node-modules`

编译完成后会自动将编译出的文件放入 dist 目录下。

# 直接使用

你可以前往 [releases](https://github.com/cloudoptlab/baize/releases) 页面下载已经编译好的 js 文件及模型文件。然后放入项目中，按照正常的 js 文件引入即可。

# 用户手册

白泽已经简化了绝大多数的使用方法，你也可以参考 test.ts 文件中的写法，或者参考下面基于 typescript 的说明。我们非常强烈的推荐使用 typescript 作为开发语言，如果你使用的是 javascript 可以参考下面实现。

## 创建对象

```typescript
let baize = new Baize();
```

## 转为用于预测的特征数组

第一个参数为完整的 url，第二个参数为是否是第三方请求（如果是放入整数 3，如果不是放入整数 1，第三个参数放入请求的类型字符串类型。）

```typescript
let data = baize.preProcessing("https://zz.bdstatic.com/linksubmit/push.js", 1, "script");
```

## 加载模型

示例中是直接通过 nodejs 读取本地文件，你也可以通过 ajax 的方式获取远程的文件，然后将文件中的 json 字符串放入 `load()`。

```typescript
let model = fs.readFileSync("./model/baize_model.json", "utf-8");

baize.load(model);
```

## 预测

如果是 1 代表是可疑的网络请求，如果是 0 代表是正常请求。

```typescript
baize.predict(data);
```

# 使用协议

Baize 遵循 Apache License 2.0 协议，可免费使用作为商业用途，请在产品说明中附加 Baize 的链接和授权协议。

# 引用

如果你在研究中使用了 Baize，请按如下格式引用：

```
@software{baize,
  author = {Andy Qin},
  title = {{Baize: Network Request Security Identification}},
  year = {2020},
  url = {https://github.com/cloudoptlab/baize/},
}
```