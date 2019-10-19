function ToolController($scope, socket){
  $scope.callTool = function(key){
    $('#'+key).append('<div class="overlay"><i class="fa fa-refresh fa-spin"></i></div>');
    switch(key){
      case 'sprintTaskReview':
      socket.emit('call tool', {'api': key, 'sprint': $scope.tool.sprintTaskReview.sprint, 'key': $scope.tool.sprintTaskReview.key});
      break;
      case 'sprintStoryReview':
      socket.emit('call tool', {'api': key, 'sprint': $scope.tool.sprintStoryReview.sprint, 'key': $scope.tool.sprintStoryReview.key});
      break;
      case 'sprintBugReview':
      socket.emit('call tool', {'api': key, 'sprint': $scope.tool.sprintBugReview.sprint, 'key': $scope.tool.sprintBugReview.key});
      break;
    }
  }

  $scope.tool = {
    sprintTaskReview: {sprint: 'SHD 2019 Sprint 5', key: 'SHD'},
    sprintStoryReview: {sprint: 'STO 2019 Sprint 5', key: 'STO'},
    sprintBugReview: {sprint: 'SOP 2019 Sprint 5', key: 'SOP'}
  }
  
  socket.on('call tool', function(data){
    $('#'+data.api+' div.overlay').remove();

    if(data.error){
      smWarn(data.msg);
      return;
    }

    switch(data.api){
      case 'sprintTaskReview':
      var list = data.json;
      var header = ['#', 'Summary', 'Story', 'Assignee', 'Status', 'Need Design', 'Tech Design', 'Start', 'End'];
      var body = [];      
      for(var i=0;i<list.length;i++){
        var item = list[i];
        var row = {data: [item.issueKey, item.summary, item.story, item.assignee, item.status, item.needTechDesign, item.hasTechDesign, 
          item.startTime?item.startTime:'-', item.doneTime?item.doneTime:'-'], color: null};
        body.push(row);
      }

      tableModal('JIRA Task', header, body);
      break;

      case 'sprintStoryReview':
      var list = data.json;
      var header = ['#', 'Summary', 'Priority', 'Story Point', 'Assignee', 'Reporter', 'Status', 'Test Case', 'Need Test Case'];
      var body = [];
      for(var i=0;i<list.length;i++){
        var item = list[i];
        var row = {data: [item.issueKey, item.summary, item.priority, item.storyPoint, item.assignee, item.reporter, item.status, item.linkTC, item.needTestCase], color: null};
        
        if(item.status == 'DONE')
          row.color = 'success';

        body.push(row);
      }

      tableModal('JIRA Story', header, body);
      break;

      case 'sprintBugReview':
      var list = data.json;
      var header = ['#', 'Summary', 'Priority', 'Root Cause', 'Environment', 'Assignee', 'Reporter', 'Status', 'Fix Version'];
      var body = [];
      for(var i=0;i<list.length;i++){
        var item = list[i];
        var row = {data: [item.issueKey, item.summary, item.priority, item.rootCause, item.environment, item.assignee, item.reporter, item.status, item.fixVersion], color: null};
        
        if(item.environment == 'Live')
          row.color = 'danger';
        
        body.push(row);
      }

      tableModal('JIRA Bug', header, body);
      break;
      
      default:
      hpaOK(data.msg);
    }
  })
}