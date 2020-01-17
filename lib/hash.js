function getEtag(buffer){
    // 以4M为单位分割
    var sliceSize = 4*1024*1024;
    var bufferSize = buffer.length;
    var blockCount = Math.ceil(bufferSize / sliceSize);
    var prefix;
    if(blockCount > 1){
        prefix = 0x96;
    }else{
        prefix = 0x16
    }

    var sha1String = [];
    var sha1Length = 0;

    for(var i=0;i<blockCount;i++){
        sha1String.push(sha1(buffer.slice(i*sliceSize,(i+1)*sliceSize)));
        sha1Length += 20;
    }

    var sha1Buffer = Buffer.concat(sha1String,sha1Length);

    if(blockCount > 1){
        sha1Buffer = sha1(sha1Buffer);
    }

    sha1Buffer = Buffer.concat([new Buffer.from([prefix]),sha1Buffer],sha1Buffer.length + 1);

    return sha1Buffer.toString('base64')
        .replace(/\//g,'_').replace(/\+/g,'-');

    function sha1(content){
        var crypto = require('crypto');
        var sha1 = crypto.createHash('sha1');
        sha1.update(content);
        return sha1.digest();
    }
}

module.exports=getEtag
