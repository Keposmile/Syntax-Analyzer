var io = require('./io');
var format = require('./format');
var analyzer =require('./analyzer');

var output={

};

var file = io.read();

var dys_type = ".dys";
var var_type = ".var";
var pro_type = ".pro";
var err_type = ".err"

file.on('data',function(data){
    data = data.toString();
    output = data;
    data = format.format(data);
    analyzer.syntax(data);
});

file.on('end',function(data){
    console.log("文件读取完毕！");
    // console.log(anaylzer.output_array);

    var output_data="";
    for(var i = 0;i<output.length;i++){
        output_data=output_data+output[i];
    }
    // console.log(output_data);
    io.write(output_data,dys_type);


    var err_data="";
    for(var i = 0;i<analyzer.err_output.length;i++){
        err_data=err_data+analyzer.err_output[i];
    }
    io.write(err_data,err_type);

    var pro_data="";
    var pro_out = analyzer.proc_list();
    for(var i = 0;i<pro_out.length;i++){
        pro_data=pro_data+pro_out[i];
    }
    io.write(pro_data,pro_type);

    var var_data="";
    var var_out = analyzer.var_list();
    for(var i = 0;i<var_out.length;i++){
        var_data=var_data+var_out[i];
    }
    io.write(var_data,var_type);
});
