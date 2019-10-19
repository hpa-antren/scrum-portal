function ProductController($scope, socket){
    $scope.filterEntry = function(e){
        $scope.entryFilter = e.filter;
    }

    $scope.loadEntry = function(){
        socket.emit('load entry');
    }

    socket.on('load entry', function(data){
        $scope.entryCount = [
        {name: 'Frontend', total: 0, pmp: 0, acquisition: 0, common: 0, dm: 0, color: 'bg-aqua', icon: 'fa-paper-plane-o', filter: '-front'}, 
        {name: 'Backend', total: 0, pmp: 0, acquisition: 0, common: 0, dm: 0, color: 'bg-red', icon: 'fa-paper-plane', filter: '-api'}, 
        {name: 'Lambda', total: 0, pmp: 0, acquisition: 0, common: 0, dm: 0, color: 'bg-green', icon: 'fa-coffee', filter: '-lm'}, 
        {name: 'Service', total: 0, pmp: 0, acquisition: 0, common: 0, dm: 0, color: 'bg-yellow', icon: 'fa-plug', filter: '-site'}
        ];

        for(var i=0;i<data.list.length;i++){
        var item = data.list[i];
        item.jenkins = ['prod', item.key.toLowerCase(), item.module.replace(/\s/g, '').toLowerCase(), item.type, item.env].join('-');
        item.category = (item.key == 'OP'? 'acquisition': item.key.toLowerCase());
        
        if(item.env == 'lm'){
            $scope.entryCount[2].total++;
            $scope.entryCount[2][item.category]++;
        }else if(item.type == 'api'){
            $scope.entryCount[0].total++;
            $scope.entryCount[0][item.category]++;
        }else if(item.type == 'front'){
            $scope.entryCount[1].total++;
            $scope.entryCount[1][item.category]++;
        }else{
            $scope.entryCount[3].total++;
            $scope.entryCount[3][item.category]++;
        }
        }
        $scope.entryList = data;
    })
}