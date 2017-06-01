var input_index = 0;
var input = [];
var line_num = 1;
var err_output = [];
var var_list = [];
var proc_list =[];

var IsInVarList = function(vname,vproc){
    for(var i=0;i<var_list.length;i++){
        for(var i = 0;i<var_list.length;i++){
            if(var_list[i].vname == vname && var_list[i].vproc == vproc){
                return true;
            }
        }
        return false;
    }
}

var IsProcExist = function(name){
    for(var i=0;i<var_list.length;i++){
        if(var_list[i].vname ==  name){
            return true;
        }
    }
    for(var i=0;i<proc_list.length;i++){
        if(proc_list[i].pname == name){
            return true;
        }
    }
    return false;
}

var varObject = function(vname,vproc,vkind,vtype,vlev,vadr){
    this.vname = vname;
    this.vproc = vproc;
    this.vkind = vkind;
    if(vtype==undefined){
        this.vtype = "integer"
    }else{
        this.vtype = vtype;
    }
    this.vlev = vlev;
    this.vadr = vadr;
}

varObject.prototype = {
    //方法定义
    update:function(attr,new_value){
        if(attr in this){
            if(attr == "vkind"){
                this.vkind = (input_index==new_value);
            }else{
                this[attr] = new_value;
            }
        }else{
            console.log("尝试修改不存在的属性");
        }
        return this;
    },
    haveSame:function(varObjArray){
        for(var i = 0;i<varObjArray.length;i++){
            if(varObjArray[i].vname == this.vname && varObjArray[i].vproc == this.vproc && varObjArray[i].vkind == this.vkind){
                return true;
            }
        }
        return false;
    }
}

var procObject = function (pname,ptype,plev,fadr,ladr){
    this.pname = pname;
    this.ptype = ptype;
    this.plev = plev;
    this.fadr = fadr;
    this.ladr = ladr;
    this.varNum = 0;
    this.paramAddr = -1;
}

procObject.prototype = {
    //方法定义
    update:function(attr,new_value){
        if(attr in this){
            if(attr == "vkind"){
                this.vkind = (input_index==new_value)?true:false;
            }else{
                this[attr] = new_value;
            }
        }else{
            console.log("尝试修改不存在的属性");
        }
        return this;
    },
    isDefined:function(proc_list){
        for(var i=0;i<proc_list.length;i++){
            if(proc_list[i].pname == this.pname){
                return false;
            }
        }
        return true;
    }
}

var thisVar = new varObject("","",false,"integer",-1,-1);
var thisProc = new procObject("","integer",0,-1,-1);

var getNext = function(){
    var next = input_index+1;
    while(input[next].word == "EOLN"){
        next++;
    }
    return next;
}

var next = function(){
    if(input[input_index].word != "EOF"){
        input_index++;
        while(input[input_index].word == "EOLN"){
            input_index++;
            line_num++;
        }
    }
}

var error =function(errType,symbol){
    switch (errType){
        case "UNDEFINED":
            err_output.push("Error：Line："+line_num+"    "+input[input_index].word+"符号未定义\n");
            break;
        case "REDEFINED":
            err_output.push("Error：Line："+line_num+"    "+input[input_index].word+"符号重定义\n");
            break;
        case "LACK_SIGN":
            err_output.push("Error：Line："+line_num+"    "+input[input_index].word+"处缺少符号"+symbol+"\n");
            break;
        case "NOT_DECLARE":
            err_output.push("Error：Line："+line_num+"    缺少"+symbol+"的声明\n");
            break;
        case "USE_RESERVE":
            err_output.push("Error：Line："+line_num+"    "+symbol+"以保留字开头\n");
            break;
        case "UNKNOW_EXE":
            err_output.push("Error：Line："+line_num+"    "+input[input_index].word+"未知的执行语句\n");
            break;
        default:
            err_output.push("Error：Line："+line_num+"    未知错误\n");
    }
}
var syntax = function (_input){
    input = _input;
    var tmp_proc_obj = new procObject(thisProc.pname,thisProc.ptype,thisProc.plev,thisProc.fadr,thisProc.ladr);
    tmp_proc_obj.paramAddr = thisProc.paramAddr;
    tmp_proc_obj.varNum = thisProc.varNum;
    proc_list.push(tmp_proc_obj);
    A();
}
var A = function(){
    B();
}
var B = function(){
    if(input[input_index].word == "begin"){
        next();
    }else{
        error("LACK_SIGN","begin");
        if(input[input_index].word != "integer"){
            next();
        }
    }
    C();
    if(input[input_index].word == ";"){
        next();
    }else{
        error("LACK_SIGN",";");
        if(input[input_index].word != "integer" && input[input_index].word != "read" && input[input_index].word != "write" && input[input_index].type != 10){
            next();
        }
    }
    M();
    if(input[input_index].word == "end"){
        next();
    }else{
        error("LACK_SIGN","end");
    }

}

var C = function(){
    D();
    _C();
}
var _C = function(){
     if(input[input_index].word == ";"&&input[getNext()].word == "integer"){
         next();
         D();
         _C();
     }else{
         if(input[input_index].word == "integer"){
             error("LACK_SIGN",";");
             D();
             _C();
         }
     }
}
var D = function(){
    if(input[input_index+1].word == "function"){
        J();
    }else{
        E();
    }
}

var E = function(){
    if(input[input_index].word == "integer"){
        next();
    }else{
        error("LACK_SIGN","integer");
        next();
    }
    thisVar.update("vname",input[input_index].word)
           .update("vproc",thisProc.pname)
           .update("vkind",thisProc.paramAddr)
           .update("vtype","integer")
           .update("vlev",thisProc.plev)
           .update("vadr",var_list.length);
    if(thisVar.haveSame(var_list)){
        error("REDEFINED",null);
    }else{
        if(thisProc.varNum == 0){
            thisProc.fadr=thisVar.vadr;
        }
        thisProc.ladr = thisVar.vadr;
        thisProc.varNum++;
        var tmp_var_obj = new varObject(thisVar.vname,thisVar.vproc,thisVar.vkind,thisVar.vtype,thisVar.vlev,thisVar.vadr);
        var_list.push(tmp_var_obj);
    }
    F();
}


var F =function(){
    G();
}

var G = function(){
    if(input[input_index].type == 10){
        next();
    }
}

var J = function(){
    var saveThisProc = new procObject(thisProc.pname,thisProc.ptype,thisProc.plev,thisProc.fadr,thisProc.ladr);
    saveThisProc.varNum = thisProc.varNum;
    saveThisProc.paramAddr = thisProc.paramAddr;

    if(input[input_index].word == "integer"){
        next();
    }else{
        error("LACK_SIGN","integer");
        if(input[input_index].word != "function"){
            next();
        }
    }
    if(input[input_index].word == "function"){
        next()
    }else{
        error("LACK_SIGN","function")
        if(input[input_index].type == 10){
            next();
        }
    }
    thisProc.update("pname",input[input_index].word)
            .update("ptype","integer")
            .update("plev",thisProc.plev+1)
            .update("varNum",0);
    if(IsProcExist(thisProc.pname)){
        error("REDEFINED","");
    }else{
        var tmp_proc_obj = new procObject(thisProc.pname,thisProc.ptype,thisProc.plev,thisProc.fadr,thisProc.ladr);
        tmp_proc_obj.paramAddr = thisProc.paramAddr;
        tmp_proc_obj.varNum = thisProc.varNum;
        proc_list.push(tmp_proc_obj);
    }
    G();
    if(input[input_index].word == "("){
        next();
    }else{
        error("LACK_SIGN","(");
        if(input[input_index].type == 10){
            next();
        }
    }

    thisProc.update("paramAddr",input_index);

    K();

    if(input[input_index].word == ")"){
        next();
    }else{
        error("LACK_SIGN",")");
        if(input[input_index].word != ";"){
            next();
        }
    }
    if(input[input_index].word == ";"){
        next();
    }else{
        error("LACK_SIGN",";");
        if(input[input_index].word == "begin"){
            next();
        }
    }
    L();
    thisProc = saveThisProc;
}

var K = function(){
    thisVar.update("vname",input[input_index].word)
           .update("vproc",thisProc.pname)
           .update("vkind",thisProc.paramAddr)
           .update("vtype","integer")
           .update("vlev",thisProc.plev)
           .update("vadr",var_list.length);
    if(thisVar.haveSame(var_list)){
        error("REDEFINED",null);
    }else{
        if(thisProc.varNum == 0){
            thisProc.fadr=thisVar.vadr;
        }
        thisProc.ladr = thisVar.vadr;
        thisProc.varNum++;
        var tmp_var_obj = new varObject(thisVar.vname,thisVar.vproc,thisVar.vkind,thisVar.vtype,thisVar.vlev,thisVar.vadr);
        var_list.push(tmp_var_obj);
    }
    F();
}

var L = function(){
    if(input[input_index].word == "begin"){
        next();
    }else{
        error("LACK_SIGN","begin");
        if(input[input_index].word != "integer"){
            next();
        }
    }
    C();
    if(input[input_index].word == ";"){
        next();
    }else{
        error("LACK_SIGN",";");
        if(input[input_index].word!="integer"&&input[input_index].word!="read"&&input[input_index].word!="write"&&input[input_index].type!=10){
            next();
        }
    }
    M();
    if(input[input_index].word == "end"){
        next();
    }else{
        error("LACK_SIGN","end");
        if(input[input_index].word != ";" && input[input_index] != "end"){
            next();
        }
    }
}

var M = function(){
    N();
    _M();
}


var _M = function(){
    if(input[input_index].word == ";"){
        next();
        N();
        _M();
    }else{
        if(input[input_index].word != "end"&&input[input_index].word != "EOF"){
            error("LACK_SIGN",";");
            N();
            _M();
        }
    }
}

var N = function(){
    if(input[input_index].word == "read"){
        O();
    }else if (input[input_index].word == "write") {
        P();
    }else if (input[input_index].word == "if") {
        W();
    }else if(input[input_index].type == 10){
        Q();
    }else{
        error("UNKNOW_EXE","");
        if(input[input_index].word!="end"){
            next();
        }
    }
}

var O = function(){
    if(input[input_index].word == "read"){
        next();
    }else{
        error("LACK_SIGN","read");
        if(input[input_index].word != "("){
            next();
        }
    }
    if(input[input_index].word == "("){
        next();
    }else{
        error("LACK_SIGN","(");
        if(input[input_index].type != 10){
            next();
        }
    }
    if(!IsInVarList(input[input_index].word,thisProc.pname)){
        error("UNDEFINED","");
    }
    F();
    if(input[input_index].word == ")"){
        next();
    }else{
        error("LACK_SIGN",")");
        if(input[input_index].word == ";"&&input[input_index].word == "end"){
            next();
        }
    }
}

var P = function(){
    if(input[input_index].word == "write"){
        next();
    }else{
        error("LACK_SIGN","write");
        if(input[input_index].word != "("){
            next();
        }
    }
    if(input[input_index].word == "("){
        next();
    }else{
        error("LACK_SIGN","(");
        if(input[input_index].type != 10){
            next();
        }
    }
    if(!IsInVarList(input[input_index].word,thisProc.pname)){
        error("UNDEFINED","");
    }
    F();
    if(input[input_index].word == ")"){
        next();
    }else{
        error("LACK_SIGN",")");
        if(input[input_index].word != ";" && input[input_index].word != "end"){
            next();
        }
    }
}

var Q = function(){
    if(!IsInVarList(input[input_index].word,thisProc.pname)&&!IsProcExist(input[input_index].word)){
        error("UNDEFINED","");
    }
    F();
    if(input[input_index].word == ":="){
        next();
    }else{
        error("LACK_SIGN",":=")
        if(input[input_index].type != 10 && input[input_index].type != 11){
            next();
        }
    }
    R();
}
var R = function(){
    S();
    _R();
}
var _R = function(){
    if(input[input_index].word == "-"){
        next();
        S();
        _R();
    }else{
        if(input[input_index].type == 10 || input[input_index].type == 11){
            S();
            _R();
        }
    }
}
var S = function(){
    T();
    _S();
}

var _S = function(){
    if(input[input_index].word == "*"){
        next();
        T();
        _S();
    }else{
        if(input[input_index].type == 10 || input[input_index].type == 11){
            T();
            _S();
        }
    }
}

var T =function(){
    if((/^\d+$/).test(input[input_index].word)){
        U();
    }else if (input[getNext()].word == "(") {
        Z();
    }else{
        if(!IsInVarList(input[input_index].word,thisProc.pname)){
            error("UNDEFINED","");
        }
        F();
    }
}

var U = function(){
    if(input[input_index].type == 11){
        next();
    }
}

var W = function(){
    if(input[input_index].word == "if"){
        next();
    }else{
        error("LACK_SIGN","if");
        if(input[input_index].type != 10||input[input_index].type != 11){
            next();
        }
    }
    X();
    if(input[input_index].word == "then"){
        next();
    }else{
        error("LACK_SIGN","then");
        if(input[input_index].word != "integer" && input[input_index].word != "read" && input[input_index].word != "write" &&input[input_index].type != 10){
            next();
        }
    }
    N();
    if(input[input_index].word == "else"){
        next();
    }else{
        error("LACK_SIGN","else");
        if(input[input_index].word != "integer" && input[input_index].word != "read" && input[input_index].word != "write" &&input[input_index].type != 10){
            next();
        }
    }
    N();
}
var X = function(){
    R();
    Y();
    R();
}
var Y = function(){
    if(input[input_index].word == "<"||input[input_index].word == "<="||input[input_index].word == ">"||input[input_index].word == ">="||input[input_index].word == "="||input[input_index].word == "<>"){
        next();
    }else{
        error("LACK_SIGN","关系运算符");
        if(input[input_index].type != 10&&input[input_index].type != 11){
            next();
        }
    }
}
var Z = function(){
    if(!IsProcExist(input[input_index].word)){
        error("UNDEFINED","");
    }
    G();
    if(input[input_index].word == "("){
        next();
    }else{
        error("LACK_SIGN","(");
        if(input[input_index].type != 10 ||input[input_index].type != 11){
            next();
        }
    }
    R();
    if(input[input_index].word == ")"){
        next();
    }else{
        error("LACK_SIGN",")");
        if(input[input_index].word != "-" && input[input_index].word != "*" && input[input_index].word != ";" || input[input_index].word != "end"){
            next();
        }
    }
}

var out_var_list = function(){
    var tmp = [];
    console.log("length:"+var_list.length);
    for(var i = 0;i<var_list.length;i++){
        console.log(var_list[i].vname+" "+var_list[i].vproc+" "+var_list[i].vkind+" "+
                 var_list[i].vlev+" "+var_list[i].vtype+" "+var_list[i].vadr+"\n");
        tmp.push(var_list[i].vname+" "+var_list[i].vproc+" "+var_list[i].vkind+" "+
                 var_list[i].vlev+" "+var_list[i].vtype+" "+var_list[i].vadr+"\n");
    }
    return tmp;
}

var out_proc_list = function(){
    var tmp = [];
    console.log("length:"+proc_list.length);
    for(var i = 0;i<proc_list.length;i++){
        console.log(proc_list[i].pname+" "+proc_list[i].plev+" "+proc_list[i].ptype+" "+
                 proc_list[i].fadr+" "+proc_list[i].ladr+"\n");
        tmp.push(proc_list[i].pname+" "+proc_list[i].plev+" "+proc_list[i].ptype+" "+
                 proc_list[i].fadr+" "+proc_list[i].ladr+"\n");
    }
    return tmp;
}

exports.syntax = syntax;
exports.var_list = out_var_list;
exports.proc_list = out_proc_list;
exports.err_output = err_output;
