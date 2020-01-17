const qiniu=require('qiniu');
const getHash=require('./hash');
const path=require('path');

let mac=null;

let bucketName='';
let baseUrl='';

//桶管理器
let bucketManager=null;
//上传管理器
let uploadManager=null;
//CDN管理器
let cdnManager=null;

//获取文件信息
function getFileInfo(name){
    if(!bucketManager){
        bucketManager=new qiniu.rs.BucketManager(mac);
    }
    return new Promise((resolve,reject)=>{
        bucketManager.stat(bucketName,name,function (err,ret) {
            if(err){
                reject(err);
            }else{
                resolve(ret);
            }
        })
    })
}

//上传一个文件
function uploadFile(name,filepath){
    if(!uploadManager){
        uploadManager=new qiniu.form_up.FormUploader();
    }
    return new Promise((resolve,reject)=>{
        const policy=new qiniu.rs.PutPolicy({
            scope:bucketName+':'+name
        });
        const token=policy.uploadToken(mac);
        uploadManager.putFile(token,name,filepath,null,function (err,ret) {
            if(err){
                reject(err);
            }else{
                ret.url=baseUrl+name;
                resolve(ret);
            }
        })
    })
}

//刷新缓存
function refreshFiles(list){
    if(!cdnManager){
        cdnManager=new qiniu.cdn.CdnManager(mac);
    }
    return new Promise((resolve,reject)=>{
        cdnManager.refreshUrls(list,function(err,resBody,resInfo){
            if(err){
                reject(err);
            }else{
                if(resInfo.statusCode==200){
                    resolve(resBody);
                }else{
                    reject(resInfo);
                }
            }
        })
    })
}

// function changeTarget(index){
//     bucketObj=bucketList[index];
// }
function init(config){
    mac=new qiniu.auth.digest.Mac(config.accessKey,config.secretKey);
    bucketName=config.bucketName;
    baseUrl=config.baseUrl;
}

module.exports={
    getFileInfo,
    refreshFiles,
    uploadFile,
    getHash,
    init
    // changeTarget
}
