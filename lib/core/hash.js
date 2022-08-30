const sha1=require('js-sha1')
const fs=require('fs');
const path=require('path');

function processFile(file){
    const buf=fs.readFileSync(file);
    //计算新文件名
    const sign=sha1(buf);
    const name=sign.substring(0,10)+path.extname(file);
    //重命名
    fs.renameSync(file,path.dirname(file)+path.sep+name);
}

//处理目录
function processDir(dirPath){
    const list=fs.readdirSync(dirPath);
    for(let item of list){
        const p=path.join(dirPath,item);
        const stat=fs.statSync(p);
        if(stat.isDirectory()){
            processDir(p);
        }else{
            processFile(p);
        }
    }
}

module.exports=function(dir){
    const stat=fs.statSync(dir);
    if(stat.isDirectory()){
        processDir(dir);
    }else{
        processFile(dir);
    }
}