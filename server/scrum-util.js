const moment = require('moment');
const log4js = require('log4js');
const LOG = log4js.getLogger('util');
const fs = require('fs');
const axios = require('axios');

exports.randomIdx = function(len, size){
    var idxArr = [];
    while(true){
        var idx = parseInt(Math.random()*len);
        if(arrayContains(idxArr, idx))
            continue;
        idxArr.push(idx);

        if(idxArr.length == size)
            break;
    }
    return idxArr;
}

exports.countArray = function(list, attr, value){
    var count = 0;
    for(var i=0;i<list.length;i++)
        if(list[i][attr] == value)
            count ++;
    return count;
}

exports.translateEstimate = function(val){
    var oriTime = parseFloat(val);
    var day = Math.floor(oriTime);
    var hour = Math.floor((oriTime - day) * 8);

    return day == 0? (hour+'h'):(day+'d'+(hour==0?'':(' '+hour+'h')));
}

exports.knockURL = async function(url, path, needBody){
    let result = {code: -1, body: null, err: null};
    try{
        if(url[url.length-1] == '/')
            url = url.substring(0, url.length-1);

        let response = await axios({ method: 'GET', baseURL: url, url: path });
        result.code = response.status;
        if(needBody){
            let json = await response.data;
            result.body = json?json:null;
        }
    }catch(err){
        LOG.info('[knock url] '+url+path+' -> '+err.toString());
        result.err = err.toString();
    }    

    return result;
}

exports.fetchValueFromArr = function(arr, key){
    var list = [];
    for(var i=0;i<arr.length;i++)
        list.push(arr[i][key]);
    
    if(list.length == 0)
        return '-';
    return list.join(',');
}

exports.countIssueLinks = function(arr, value){
    var count = 0;
    for(var i=0;i<arr.length;i++){
        var link = arr[i];
        if(link.outwardIssue && link.outwardIssue.key.indexOf(value)>-1)
            count++;
        if(link.inwardIssue && link.inwardIssue.key.indexOf(value)>-1)
            count++;
    }

    return count;
}

function arrayContains(array, value){
    for(var i=0;i<array.length;i++)
        if(array[i] == value)
            return true;
    return false;
}
exports.arrayHas = arrayContains;

exports.arrayItemHas = function(arr, attr, value){
    for(var i=0;i<arr.length;i++){
        var item = arr[i];
        if(item[attr] == value)
            return true;
    }
    return false;
}

exports.findInArray = function(array, attr, value){
    for(var i=0;i<array.length;i++){
        var item = array[i];
        if(item[attr] == value)
            return item;
    }
    return null;
}

exports.keyOfMap = function(value, map){
    for(var key in map)
        if(map[key] == value)
            return key;
    return 'n/a';
}

exports.parseIssueColor = function(bookmark, flag){
    if(flag == 'PLAN')
        return '#777777';
    switch(bookmark){
        case 'Prod': return '#3c8dbc';
        case 'Data': return '#00c0ef';
        case 'Hotfix': return '#f56954';
        case 'Patch': return '#00a65a';
        case 'Aws': return '#f39c12';
        default: return '#757575';   
    }
}
