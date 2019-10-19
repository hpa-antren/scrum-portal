var app = angular.module('ScrumApp', ['btford.socket-io', 'ngSanitize']);

app.factory('socket', function (socketFactory){
  return socketFactory({
    ioSocket: io('http://localhost:8080')
  })
});
app.controller('scrumCtrl', ScrumCtrl);

function ScrumCtrl($scope, socket){
  $scope.tabList = [
    {key: 'sprint', name: 'Sprint Center', info: 'Scrum Sprint Center', icon: 'fa-trophy'},
    {key: 'release', name: 'Release Center', info: 'Scrum Release Center', icon: 'fa-coffee'},
    {key: 'product', name: 'Product Center', info: 'Scrum Product Center', icon: 'fa-laptop'},
    {key: 'tool', name: 'JIRA Toolbox', info: 'JIRA Sync Tools', icon: 'fa-wrench'}
  ];

  socket.on('disconnect', () => {
    smWarn('Lost connection, please refresh the page to reconnect.', function(){
      window.location.reload();
    });
  })

  ReleaseController($scope, socket);
  SprintController($scope, socket);
  ToolController($scope, socket);
  ProductController($scope, socket);

  $scope.init = function () {
    $scope.switchTab($scope.tabList[0]);
  }

  $scope.goTab = function(key){
    $('#'+key+'SideTab').click();
  }

  $scope.switchTab = function(tab){
    $scope.activeTab = tab;
    $('.content-wrapper section').fadeIn('fast');
    switch(tab.key){
      case 'release':
      initCalendar();
      break;

      case 'product':
      $scope.loadEntry();
      break;
    }
  }

  // init
  $scope.init();
}  
// end of controller

