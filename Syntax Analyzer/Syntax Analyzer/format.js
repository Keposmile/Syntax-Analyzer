var format = function(data){
    var input = [];
    var dataDivideByLine = data.split(/\n/);
    for(i=0;i<dataDivideByLine.length-1;i++){
        var inputObj = {
            word:"",
            type:0
        }
        var line = dataDivideByLine[i].split(/\s+/);
        inputObj.word = line[1];
        inputObj.type = Number(line[2]);
        input.push(inputObj);
    }
    // for(i=0;i<input.length;i++){
    //     console.log(input[i].word+" "+input[i].type);
    // }
    return input;
}

exports.format = format;
