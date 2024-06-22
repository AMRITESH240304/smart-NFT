const fs = require("fs");
reader = fs.createReadStream('nft.txt',{
    flags: 'r',
    encoding: 'UTF-8',
    start: 0,
    end: 64,
    highWaterMark:16
});

function delayedFunction(){
    reader.on('data',function(chunk){
        console.log(chunk);
        reader.pause() 
        setTimeout(()=>{
            reader.resume();
        },500)
    })
}

delayedFunction();