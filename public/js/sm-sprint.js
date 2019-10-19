function SprintController($scope, socket){
    $scope.spMode = 'review';

    $scope.spCalBuffer = function(){
        var total = parseFloat($scope.spCal.qa.buf) + parseFloat($scope.spCal.back.buf) + parseFloat($scope.spCal.front.buf) + parseFloat($scope.spCal.app.buf); 
        $scope.spCal.buf = total.toFixed(1) + ' - Buffer Days';
    }

    $scope.spCalLeave = function(){
        var total = parseFloat($scope.spCal.qa.leave) + parseFloat($scope.spCal.back.leave) + parseFloat($scope.spCal.front.leave) + parseFloat($scope.spCal.app.leave); 
        $scope.spCal.leave = total.toFixed(1) + ' - Leave Days';
    }

    $scope.spCalIssue = function(s){
        var total = parseFloat(s.qa) + parseFloat(s.back) + parseFloat(s.front) + parseFloat(s.app);
        s.total = total.toFixed(2);
    }

    $scope.reloadSP = function(h){
        $scope.spCal = {
            days: h.sprintDay, meeting: h.meetingDay, buf: h.bufferDay+' - Buffer Days', leave: h.leaveDay+' - Leave Days', cap: h.capacity, cost: h.consume,
            qa: JSON.parse(h.qaData),
            front: JSON.parse(h.frontData),
            back: JSON.parse(h.backData),
            app: JSON.parse(h.appData), pointTotal: 0,
            sprint: h.sprint, key: h.proKey, id: h.id
        };

        $scope.spList = JSON.parse(h.sprintData);
        $scope.spMode = 'review';
        $scope.doSPCal();
        $scope.calcPointTotal();
    }

    $scope.loadSPHistory = function(){
        var key = $scope.spCal.key;
        socket.emit('load sp history', {'key': key});
    }

    socket.on('load sp history', function(data){
        if(data.length == 0){
            smNotice('No history for board: '+$scope.spCal.key);
            return;
        }

        $scope.clearSpCal();
        $scope.spHistory = data;
        $scope.spMode = 'history';
    })

    $scope.loadSPCal = function(){
        $scope.clearSpCal();
        $('#spCalBox').append('<div class="overlay"><i class="fa fa-refresh fa-spin"></i></div>');
        socket.emit('load sprint plan', {sprint: $scope.spCal.sprint, key: $scope.spCal.key});
    }

    socket.on('load sprint plan', function(data){
        $('#spCalBox div.overlay').remove();
        if(data.error){
            smWarn(data.msg);
            return;
        }
        
        $scope.spMode = 'review';
        $scope.spList = data.json;
        $scope.calcPointTotal();
    })

    $scope.calcPointTotal = function(){
        $scope.spCal.pointTotal = 0;
        $.each($scope.spList, function(i, item){
            $scope.spCal.pointTotal += parseFloat(item.point);
        })

        $scope.spCal.pointTotal = $scope.spCal.pointTotal.toFixed(1);
    }

    $scope.doSPCal = function(){
        $scope.spCal.qa.cost = 0;
        $scope.spCal.back.cost = 0;
        $scope.spCal.front.cost = 0;
        $scope.spCal.app.cost = 0;

        for(var i=0;i<$scope.spList.length;i++){
            var item = $scope.spList[i];
            $scope.spCal.qa.cost += parseFloat(item.qa);
            $scope.spCal.back.cost += parseFloat(item.back);
            $scope.spCal.front.cost += parseFloat(item.front);
            $scope.spCal.app.cost += parseFloat(item.app);
        }

        $scope.spCal.cost = $scope.spCal.qa.cost + $scope.spCal.back.cost + $scope.spCal.front.cost + $scope.spCal.app.cost;
        $scope.spCal.qa.cost = $scope.spCal.qa.cost.toFixed(1);
        $scope.spCal.back.cost = $scope.spCal.back.cost.toFixed(1);
        $scope.spCal.front.cost = $scope.spCal.front.cost.toFixed(1);
        $scope.spCal.app.cost = $scope.spCal.app.cost.toFixed(1);
        $scope.spCal.cost = $scope.spCal.cost.toFixed(1);

        $scope.spCal.qa.cap = $scope.spCal.qa.total * ($scope.spCal.days-$scope.spCal.meeting) - $scope.spCal.qa.leave - $scope.spCal.qa.buf;
        $scope.spCal.back.cap = $scope.spCal.back.total * ($scope.spCal.days-$scope.spCal.meeting) - $scope.spCal.back.leave - $scope.spCal.back.buf;
        $scope.spCal.front.cap = $scope.spCal.front.total * ($scope.spCal.days-$scope.spCal.meeting) - $scope.spCal.front.leave - $scope.spCal.front.buf;
        $scope.spCal.app.cap = $scope.spCal.app.total * ($scope.spCal.days-$scope.spCal.meeting) - $scope.spCal.app.leave - $scope.spCal.app.buf;

        $scope.spCal.cap = parseFloat($scope.spCal.qa.cap) + parseFloat($scope.spCal.back.cap) + parseFloat($scope.spCal.front.cap) + parseFloat($scope.spCal.app.cap);
        $scope.spCal.qa.cap = $scope.spCal.qa.cap.toFixed(1);
        $scope.spCal.back.cap = $scope.spCal.back.cap.toFixed(1);
        $scope.spCal.front.cap = $scope.spCal.front.cap.toFixed(1);
        $scope.spCal.app.cap = $scope.spCal.app.cap.toFixed(1);
        $scope.spCal.cap = $scope.spCal.cap.toFixed(1);

        $.each($scope.spList, function(i, item){
            if(parseFloat(item.total) == 0)
                item.point = 0;
        })
        $scope.calcPointTotal();
    }

    $scope.syncSPCal = function(action){
        if($scope.spList.length == 0){
            smWarn('Please start with load JIRA before sync');
            return;
        }

        if($scope.spCal.cap == 0 || $scope.spCal.cost == 0){
            smWarn('Capacity or Cost still 0, please do calculation before sync');
            return;
        }

        socket.emit('sync sprint plan', {'meta': $scope.spCal, 'list': $scope.spList, 'sync': true});
    }

    socket.on('sync sprint plan', function(data){
        $('#spCalBox div.overlay').remove();
        if(data.error){
            smWarn(data.msg);
            return;
        }

        smOK('Sprint plan save & sync success.');
        $scope.clearSpCal();
    })

    $scope.clearSpCal = function(){
        $scope.spCal = {
            days: 10, meeting: 1.5, buf: '0 - Buffer Days', leave: '0 - Leave Days', cap: 0, cost: 0,
            qa: {total: 0, leave: 0, buf: 0, cost: 0, cap: 0},
            front: {total: 0, leave: 0, buf: 0, cost: 0, cap: 0},
            back: {total: 0, leave: 0, buf: 0, cost: 0, cap: 0},
            app: {total: 0, leave: 0, buf: 0, cost: 0, cap: 0},
            sprint: 'SHD 2019 Sprint 6', key: 'SHD', pointTotal: 0
        };

        $scope.spList = [];
    }

    $scope.clearSpCal();
    socket.emit('load sp history');
}