## qnbot

轻量的七牛云命令行工具（还未发布到npm，多测试一下）

可用于简单的文件上传、部署前端开发静态资源。



### 安装

全局安装

```shell
npm install -g qnbot
```

### 配置

配置文件为如下格式

```javascript
module.exports={
    accessKey:'',    //七牛后台获取的accessKey
    secretKey:'',    //七牛后台获取的secretKey
    bucketList:[{    //需要管理的桶的列表
        name:'name',    //桶名称，需要和七牛桶名称一样
        baseUrl:'http://test.com/',    //上传成功后输出在命令行的链接前缀，可选
        cmdName:'test'    //命令行桶名称别名，用于缩短上传命令
    }]
}
```

配置文件分为全局配置与本地配置，可通过
```shell
qnbot config
```
获取配置信息
```shell
The path of global config:
/home/xxx/project/qnbot/qn.config.js

The path of current config:
Current config not found

qn bot will use current config first
```
qnbot配置文件名为qn.config.js

可通过修改global config路径下的文件添加全局配置，也可在当前目录下建立配置文件

当前目录的配置会被优先使用

```shell script
cp /home/xxx/project/qnbot/qn.config.js ./
vim qn.config.js
```
### 上传文件
```shell script
qnbot upload main dir
```
将dir目录下的文件递归上传到名称或者别名为main的桶中，dir目录对应桶的根目录

文件上传前会做hash运算判断桶中文件是否一致，不一致或桶中无该文件才上传，并会覆盖已有文件

#### 上传文件钩子

qnbot会在当前目录寻找qn.hook.js
```javascript
function before() {
    console.log('before')
}

function after(res) {
    console.log('after');
    console.log(res);
}

module.exports={
    before,
    after
}
```
after参数为成功上传的文件列表对象数组，对象含有参数

- file 文件路径
- url 成功上传后的下载路径（配置baseUrl后有效）

### 文件hash重命名

上传的文件根据文件内容哈希值命名，可以解决一些缓存问题，qnbot可以生成简单的hash文件名

```shell script
qnbot hash dir
```

将会递归把dir目录中所有文件按文件内容计算sh1并取前10位作为文件名

比如 mian.js -> cbf30b51f4.js
