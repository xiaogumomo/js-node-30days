




//parseArgs 默写


const{parseArgs}=require('node:util');

function parseCliArgs(argv) {

    return parseArgs({
    args:argv,
    options:{
        target: {type:"string"},
        verbose:{type:"boolean",default:false},
        apply:{type:"boolean",default:false},
    },
    allowPositionals:true,
    });

}

   
module. exports={parseCliArgs};







