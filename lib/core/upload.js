const client=require('../qiniuHelper');
const fs=require('fs');
const path=require('path');

//需要刷新缓存的文件
let needRefresh=[];
//上传失败的文件
let errorFile=[];
//成功目录
let successFile=[];
//上传成功文件数量
let successCount=0;

//upload目录根
let uploadDir;

//处理文件
async function processFile(filePath){
    //计算远程路径
    const remotePath=path.relative(uploadDir,filePath);
    //计算hash
    const hash=client.getHash(fs.readFileSync(filePath));
    //获取远程hash
    const ret=await client.getFileInfo(remotePath);
    if(ret.hash!=hash){
        //远程没有文件 或者 远程有文件且hash不同
        //上传文件
        try{
            const result=await client.uploadFile(remotePath,filePath);
            console.log('上传成功：'+filePath);
            console.log('链接：'+result.url);
            successCount++;
            successFile.push({
                file:filePath,
                url:result.url
            });
            if(!ret.error){
                //远程是有文件的，而且我传了，得刷新一下
                needRefresh.push(result.url);
            }
        }catch (e) {
            console.error('上传失败：'+filePath);
            errorFile.push(filePath);
        }
    }else{
        console.log('跳过：'+filePath);
    }
}
//处理目录
async function processDir(dirPath){
    const list=fs.readdirSync(dirPath);
    for(let item of list){
        const p=path.join(dirPath,item);
        const stat=fs.statSync(p);
        if(stat.isDirectory()){
            await processDir(p);
        }else{
            await processFile(p);
        }
    }
}

//刷新缓存
async function refreshCDN(){
    while(needRefresh.length){
        let list=needRefresh.splice(0,100);
        console.log(`开始分片刷新${list.length}个文件CDN缓存`);
        try{
            await client.refreshFiles(list);
            console.error('刷新成功');
        }catch (e) {
            console.error('刷新失败');
        }
    }
}

function init() {
    needRefresh=[];
    errorFile=[];
    successFile=[];
    successCount=0;
}

const main=async (dir,config)=>{
    init();
    client.init(config)

    uploadDir=dir;
    const stat=fs.statSync(dir);
    if(stat.isDirectory()){
        await processDir(dir);
    }else{
        await processFile(dir);
    }
    console.log(`总共上传成功了${successCount}个文件`);
    if(errorFile.length>0){
        console.log(`有${errorFile.length}个文件上传失败，请稍后重试`);
    }
    if(needRefresh.length>0){
        await refreshCDN();
    }else{
        console.log('无需刷新CDN缓存');
    }
    return successFile;
};

module.exports=main;