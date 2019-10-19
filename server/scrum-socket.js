const log4js = require('log4js');
const LOG = log4js.getLogger('socket');
const fs = require('fs');
const smUtil = require('./scrum-util');
const smJIRA = require('./scrum-jira');

//  You can use retrieve JIRA devops tickets from database or JQL
//  FullCalendar will pass start time / end time to render calendar event
exports.loadCalendar = async (ctx) => {
    let key = ctx.params.key;
    let sTime = new Date(ctx.request.query.start+' 00:00:00').getTime();
    let eTime = new Date(ctx.request.query.end+' 23:59:59').getTime();

    let events = JSON.parse(fs.readFileSync('./example/calendar-09.dat', 'utf-8'));
    ctx.body = events;
}

exports.socketHandler = function (socket) {
    //  You should load product entry info from database
    socket.on('load entry', async (data) => {
        let result = JSON.parse(fs.readFileSync('./example/entry.dat', 'utf-8'));
        socket.emit('load entry', {'list': result.rows, 'total': result.count});
    })

    //  You can use smJIRA to retrieve real JIRA data
    socket.on('call tool', async (data) => {
        let response = {};
        switch(data.api){
            case 'sprintTaskReview':
            /*
            [example code]
            let jqlVal = 'project = '+data.key+' and type = "Sub-task" and sprint = "'+data.sprint+'" order by key desc';
            let issues = await smJIRA.getIssueByFilter(jqlVal);
            let response = {error: false, json: issues};
            */ 
            response = JSON.parse(fs.readFileSync('./example/jira-task.dat', 'utf-8'));
            response.api = data.api;
            socket.emit('call tool', response);
            break;

            case 'sprintStoryReview':
            /*
            [example code]
            let jqlVal = 'project = '+data.key+' and type = "Story" and sprint = "'+data.sprint+'" order by key desc';
            let issues = await smJIRA.getIssueByFilter(jqlVal);
            let response = {error: false, json: issues};
            */ 
            response = JSON.parse(fs.readFileSync('./example/jira-story.dat', 'utf-8'));
            response.api = data.api;
            socket.emit('call tool', response);
            break;

            case 'sprintBugReview':
            /*
            [example code]
            let jqlVal = 'project = '+data.key+' and type = "Bug" and sprint = "'+data.sprint+'" order by key desc';
            let issues = await smJIRA.getIssueByFilter(jqlVal);
            let response = {error: false, json: issues};
            */ 
            response = JSON.parse(fs.readFileSync('./example/jira-bug.dat', 'utf-8'));
            response.api = data.api;
            socket.emit('call tool', response);
            break;
        }
    })

    //  You can use smJIRA to retrieve real JIRA story data
    socket.on('load sprint plan', async (data) => {
        /*
        [example code]:  
        var jql = 'project = '+data.key+' and type in ("Story", "Bug") and sprint = "'+data.sprint+'" order by rank';
        var list = await smJIRA.getIssueByFilter(jqlVal);
        */

        var exampleData = fs.readFileSync('./example/sprint-plan.dat', 'utf-8');
        var list = JSON.parse(exampleData);
        socket.emit('load sprint plan', {error: false, 'json': list});
    })

    //  You can load sprint plan data from your database
    //  Example data will demo the case
    socket.on('load sp history', async (data) => {
        var exampleData = fs.readFileSync('./example/sprint-history.dat', 'utf-8');
        var list = JSON.parse(exampleData);
        socket.emit('load sp history', list);
    });

    // sync sprint plan steps:
    // 1. fill JIRA story with story point and estimate time value
    // 2. move out 0-resource story to future sprint
    // 3. if future sprint not exist, auto create one
    socket.on('sync sprint plan', async (data) => { 
        /* 
        [example code]
        let moveoutIssues = [];
        for(let i =0;i < data.list.length;i++){
            let item = data.list[i];
            if(item.total == 0){
                moveoutIssues.push(item.key);
                continue;
            }

            let et = smUtil.translateEstimate(item.total);
            await smJIRA.putIssueTime(item.key, item.point, et);
        }

        if(moveoutIssues.length > 0){
            // notice: you should figure out next sprint name & boardId before, maybe get from database
            let nextSprintName = 'XXX 2019 Sprint YYY';
            let boardId = 123;

            let futureSprint = await smJIRA.getSprintByName(boardId, nextSprint);
            if(futureSprint.id == 0)
                futureSprint = await smJIRA.postSprint(boardId, nextSprint);
            
            await smJIRA.putIssueSprint(futureSprint.id, moveoutIssues);
        }
        */

        socket.emit('sync sprint plan', {'error': false});
    })
}
