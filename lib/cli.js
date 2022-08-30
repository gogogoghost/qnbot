const path = require('path');
const fs = require('fs');
const colors = require('colors');
const os = require('os')

const uploadFunc = require('./core/upload')
const hashFunc = require('./core/hash')

const configName = 'qnbot.json';

let config;

const globalConfigPath = path.join(os.homedir(), '.config', configName);
const currentConfigPath = path.join(process.cwd(), configName)

function loadConfig() {
    if (fs.existsSync(currentConfigPath)) {
        console.log("加载当前目录的配置")
        try {
            config = require(currentConfigPath)
        } catch (e) {
            console.error(e)
            process.exit(-1)
        }
    } else if (fs.existsSync(globalConfigPath)) {
        console.log("加载全局配置")
        try {
            config = require(globalConfigPath)
        } catch (e) {
            console.error(e)
            process.exit(-1)
        }
    } else {
        console.error("没有找到配置")
        process.exit(-1)
    }
}


//桶名字 路径
async function upload(args) {
    if (args.length != 2) {
        console.error(('Upload need 2 params but got ' + args.length).red);
        return;
    }
    const bucketSelected = args[0];
    const uploadDir = args[1];
    let bucketObj = null;
    for (let bucket of config.bucketList) {
        if (bucketSelected == (bucket.cmdName || bucket.name)) {
            bucketObj = bucket;
            break;
        }
    }
    if (!bucketObj) {
        console.error(`The bucket "${bucketSelected}" is not found in config`.red);
        return;
    }
    const absPath = path.join(process.cwd(), uploadDir);
    if (!fs.existsSync(absPath)) {
        console.error(`Upload file "${absPath}" is not found`.red);
        return;
    }

    let hook = {};
    try {
        hook = require(process.cwd() + '/qn.hook.js')
    } catch (e) { };
    //调用前
    if (hook.before && hook.before instanceof Function) {
        hook.before();
    }

    const result = await uploadFunc(absPath, {
        accessKey: config.accessKey,
        secretKey: config.secretKey,
        bucketName: bucketObj.name,
        baseUrl: bucketObj.baseUrl
    });
    //调用后
    if (hook.after && hook.after instanceof Function) {
        hook.after(result);
    }
}

function hash(args) {
    if (args.length != 1) {
        console.error(('Upload need 1 params but got ' + args.length).red);
        return;
    }
    const absPath = path.join(process.cwd(), args[0]);
    if (!fs.existsSync(absPath)) {
        console.error(`Hash file "${absPath}" is not found`.red);
        return;
    }
    hashFunc(absPath);
}

function checkConfig() {
    loadConfig()
    if (!config.accessKey || !config.secretKey) {
        console.error('Invalid config: need accessKey and secretKey'.red);
        return false;
    }
    if (!config.bucketList instanceof Array || config.bucketList.length == 0) {
        console.error('Invalid config: bucketList must have at least 1 child'.red);
        return false;
    }
    for (let item of config.bucketList) {
        if (!item.name) {
            console.error('Invalid config: the item of bucketList should have a name field'.red);
            return false;
        }
    }
    return true;
}

//命令 qnbot up test ./upload
module.exports = function (args) {
    if (args[2] == 'upload') {
        if (!checkConfig())
            return;
        upload(args.slice(3));
    } else if (args[2] == 'hash') {
        hash(args.slice(3));
    } else if (args[2] == 'config') {
        console.log('The path of global config:')
        console.log(globalConfigPath.green)
        console.log('\nThe path of current config:')
        if (fs.existsSync(currentConfigPath)) {
            console.log(currentConfigPath.green);
        } else {
            console.log('Current config not found'.red);
        }
        console.log('\nqn bot will use current config first'.yellow);
    } else {
        console.error('Unknown operation'.red);
    }
}