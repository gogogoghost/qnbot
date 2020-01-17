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

```js
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



### 上传文件

