const log4js = require('log4js');
const LOG = log4js.getLogger('jira');
const axios = require('axios');
const moment = require('moment');
const smUtil = require('./scrum-util');

var apiHost = null;
var apiAuth = null;

exports.init = async function (opts) {
    if(!opts.token || opts.tokens == null) {
        apiHost = opts.host;
        apiAuth = Buffer.from(opts.user + ':' + opts.token).toString('base64');
        LOG.info('jira token init success');
    } else
        LOG.error('unable to get jira api token');
}

async function findWiki(title, space){
    var apiName = '/wiki/rest/api/content';
    var apiParams = {'spaceKey': space, 'title': encodeURI(title), 'type': 'page'};

    const response = await axios.get(apiHost+apiName, {
        params: apiParams,
        headers: {'Authorization': 'Basic ' + apiAuth}
    });
    const json = await response.data;
    if(json.results.length > 0)
        return {id: json.results[0].id};
    return null;
}

async function findWikiVersion(id){
    var apiName = '/wiki/rest/api/content/'+id;
    var apiParams = {};

    const response = await axios.get(apiHost+apiName, {
        params: apiParams,
        headers: {'Authorization': 'Basic ' + apiAuth}
    });
    const json = await response.data;
    return json.version.number;
}

async function createWiki(apiBody){
    var apiName = '/wiki/rest/api/content';
    const response = await axios({
        method: 'POST',
        baseURL: apiHost,
        url: apiName,
        data: apiBody,
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Basic ' + apiAuth},
    });
    
    const json = await response.data;
    return json;
}

async function updateWiki(pageId, apiBody){
    var apiName = '/wiki/rest/api/content/'+pageId;
    const response = await axios({
        method: 'PUT',
        baseURL: apiHost,
        url: apiName,
        data: apiBody,
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Basic ' + apiAuth},
    });
    
    const json = await response.data;
    return json;
}

async function createSprint(boardId, sprintName){
    var apiBody = {
        "name": sprintName,
        "originBoardId": boardId
    };

    var apiName = '/rest/agile/1.0/sprint';
    const response = await axios({
        method: 'POST',
        baseURL: apiHost,
        url: apiName,
        data: apiBody,
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Basic ' + apiAuth},
    });
    
    const json = await response.data;
    return json;
}

async function moveIssueSprint(sprintId, issueList){
    var apiBody = {"issues": issueList};
    var apiName = '/rest/agile/1.0/sprint/'+sprintId+'/issue';
    const response = await axios({
        method: 'POST',
        baseURL: apiHost,
        url: apiName,
        data: apiBody,
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Basic ' + apiAuth},
    });
    
    const json = await response.data;
    return json;
}

async function findSprintByName(boardId, sprintName, offset){
    var apiName = '/rest/agile/1.0/board/'+boardId+'/sprint';
    offset = offset?parseInt(offset):0;

    var apiParams = {state: 'active,future,closed', startAt: offset};
    try{
        const response = await axios.get(apiHost+apiName, {
            params: apiParams,
            headers: {'Authorization': 'Basic ' + apiAuth}
        });
        const json = await response.data;
        var targetSprint = null;
        for(var i=0;i<json.values.length;i++){
            var sprint = json.values[i];
            if(sprint.name == sprintName){
                targetSprint = sprint;
                break;
            }
        }

        if(targetSprint == null){
            if(json.isLast){
                LOG.info('can not find sprint with name: '+sprintName);
                return {'id': 0, 'name': '-', 'state': '-'};
            }else
                return await findSprintByName(boardId, sprintName, 50+offset);
        }

        if(targetSprint.state != 'future')
            return {'id': targetSprint.id, 'name': targetSprint.name, 'state': targetSprint.state, 'start': targetSprint.startDate, 'end': targetSprint.endDate};
        else    
            return {'id': targetSprint.id, 'name': targetSprint.name, 'state': targetSprint.state};
    }catch(err){
        LOG.error('fail to find sprint by name: '+err.toString());
        return {'id': 0, 'name': '-', 'state': '-'};
    }
}

async function findCurrentSprint(boardId){
    var apiName = '/rest/agile/1.0/board/'+boardId+'/sprint';
    var apiParams = {state: 'active,future'};

    try{
        const response = await axios.get(apiHost+apiName, {
            params: apiParams,
            headers: {'Authorization': 'Basic ' + apiAuth}
        });
        const json = await response.data;
        var activeSprint = smUtil.findInArray(json.values, 'state', 'active');
        if(activeSprint != null)
            return {'id': activeSprint.id, 'name': activeSprint.name, 'state': activeSprint.state, 'start': activeSprint.startDate, 'end': activeSprint.endDate};
        
        var futureSprint = smUtil.findInArray(json.values, 'state', 'future');
        if(futureSprint != null)
            return {'id': futureSprint.id, 'name': futureSprint.name, 'state': futureSprint.state};
        
        return {'id': 0, 'name': '-', 'state': '-'};
    }catch(err){
        LOG.error('fail to get sprint list: '+err.toString());
        return {'id': 0, 'name': '-', 'state': '-'};
    }
}

async function findIssueByFilter(filter, changelog){
    try{
        var apiName = '/rest/api/2/search';
        var apiParams = {jql: filter, maxResults: 500};

        if(changelog)
            apiParams.expand = 'changelog';

        const response = await axios.get(apiHost+apiName, {
            params: apiParams,
            headers: {'Authorization': 'Basic ' + apiAuth}
        });
        const json = await response.data;
        return json.issues;
    }catch(err){
        return [];
    }
}

async function dropIssue(key){
    var apiName = '/rest/api/2/issue/'+key;
    const response = await axios({
        method: 'DELETE',
        baseURL: apiHost,
        url: apiName,
        data: {},
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Basic ' + apiAuth},
    });
    
    await response.data;
    LOG.info('issue: '+key+' auto deleted');
}

async function createIssue(body){
    var apiName = '/rest/api/2/issue';
    var apiBody = {fields: body};
    const response = await axios({
        method: 'POST',
        baseURL: apiHost,
        url: apiName,
        data: apiBody,
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Basic ' + apiAuth},
    });
    
    const json = await response.data;
    LOG.info('issue '+json.key+' auto created');
    return json.key;
}

async function linkIssue(srcKey, dstKey, linkType){
    var body = {
        "inwardIssue": {"key": srcKey},
        "outwardIssue": {"key": dstKey},
        "type": {"name": linkType}
    }
    var apiName = '/rest/api/2/issueLink';
    const response = await axios({
        method: 'POST',
        baseURL: apiHost,
        url: apiName,
        data: body,
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Basic ' + apiAuth},
    });
    
    await response.data;
    LOG.info('link issue: '+srcKey+'->'+dstKey+' ['+linkType+']');
}

async function moveIssueToBacklog(list){
    var apiName = '/rest/agile/1.0/backlog/issue';
    var body = {'issues': list};
    const response = await axios({
        method: 'POST',
        baseURL: apiHost,
        url: apiName,
        data: body,
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Basic ' + apiAuth},
    });
    
    await response.data;
    LOG.info('move issues ('+list.join(',')+') to backlog.');
}

async function estimateIssueTime(key, point, et){
    point = Math.floor(point * 10)/10;
    var body = {
        'fields': {'customfield_10005': point,
        "timetracking": { 
            "originalEstimate": et
        }
    }};

    var apiName = '/rest/api/2/issue/'+key;
    const response = await axios({
        method: 'PUT',
        baseURL: apiHost,
        url: apiName,
        data: body,
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Basic ' + apiAuth},
    });
    
    await response.data;
    LOG.info('edit issue '+key+', story point = '+point+', estimate: '+et);
}

async function findFixVersion(key){
    var apiName = '/rest/api/2/project/'+key+'/versions';
    var apiParams = {};
    try{
        const response = await axios.get(apiHost+apiName, {
            params: apiParams,
            headers: {'Authorization': 'Basic ' + apiAuth}
        });
        const json = await response.data;
        var list = [];
        
        var offsetDate = moment(new Date()).add(-1, 'months').format('YYYY-MM-DD');
        for(var i=0;i<json.length;i++){
            var item = json[i];
            if(item.released && item.releaseDate){
                if(item.releaseDate < offsetDate)
                    continue;
                else
                    list.push({id: item.id, name: item.name, flag: item.released});
            }else
                list.push({id: item.id, name: item.name, flag: item.released});
        }
        
        return {error: false, json: list};
    }catch(err){
        return {error: true, msg: err.toString()};
    }
}

async function createComponent(proKey, comName){
    var apiName = '/rest/api/2/component';
    var apiBody = {project: proKey, name: comName};
    const response = await axios({
        method: 'POST',
        baseURL: apiHost,
        url: apiName,
        data: apiBody,
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Basic ' + apiAuth},
    });
    
    const json = await response.data;
    LOG.info('component '+json.name+' auto created');
    return json.id;
}

async function findComponent(proKey, comName){
    var apiName = '/rest/api/2/project/'+proKey+'/components';
    var apiParams = {};
    const response = await axios.get(apiHost+apiName, {
        params: apiParams,
        headers: {'Authorization': 'Basic ' + apiAuth}
    });

    const json = await response.data;
    for(var i=0;i<json.length;i++){
        var item = json[i];
        if(item.name.toLowerCase() == comName.toLowerCase())
            return item.id;
    }
    return null;
}

async function createFixVersion(proId, verName){
    var apiName = '/rest/api/2/version';
    var apiBody = {projectId: proId, name: verName, description: "TCL-"+verName};
    const response = await axios({
        method: 'POST',
        baseURL: apiHost,
        url: apiName,
        data: apiBody,
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Basic ' + apiAuth},
    });
    
    const json = await response.data;
    LOG.info('fix version '+json.name+' auto created');
    return json.id;
}

async function findFixVersionId(proKey, verName){
    var apiName = '/rest/api/2/project/'+proKey+'/versions';
    var apiParams = {};
    const response = await axios.get(apiHost+apiName, {
        params: apiParams,
        headers: {'Authorization': 'Basic ' + apiAuth}
    });

    const json = await response.data;
    for(var i=0;i<json.length;i++){
        var item = json[i];
        
        if(item.name.toLowerCase() == verName.toLowerCase())
            return item.id;
    }
    return null;
}

async function findGroupUser(group, idx){
    var offset = (idx-1) * 50;
    var apiName = '/rest/api/3/group/member';
    var apiParams = {groupname: group, startAt: offset};

    const response = await axios.get(apiHost+apiName, {
        params: apiParams,
        headers: {'Authorization': 'Basic ' + apiAuth}
    });
    const json = await response.data;
    return json;
}

async function findCustomField (){
    var apiName = '/rest/api/2/field';
    var apiParams = {};

    const response = await axios.get(apiHost+apiName, {
        params: apiParams,
        headers: {'Authorization': 'Basic ' + apiAuth}
    });
    const json = await response.data;
    return json;
}

exports.getIssueByFilter = findIssueByFilter;
exports.deleteIssue = dropIssue;
exports.postIssue = createIssue;
exports.putIssueToBacklog = moveIssueToBacklog;
exports.putIssueTime = estimateIssueTime;
exports.postComponent = createComponent;
exports.getComponent = findComponent;
exports.postFixVersion = createFixVersion;
exports.getFixVersion = findFixVersion;
exports.putIssueLink = linkIssue;

exports.getWiki = findWiki;
exports.getWikiVersion = findWikiVersion;
exports.postWiki = createWiki;
exports.putWiki = updateWiki;

exports.getCustomField = findCustomField;
exports.getGroupUser = findGroupUser;
exports.getFixVersionId = findFixVersionId;
exports.getSprintByName = findSprintByName;
exports.getCurrentSprint = findCurrentSprint;
exports.postSprint = createSprint;
exports.putIssueSprint = moveIssueSprint;


