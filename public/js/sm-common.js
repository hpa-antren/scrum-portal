Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
const ById = function(i){return document.getElementById(i);}

$(document).ready(function(){
  $('.select2').select2();
})

function initCalendar(){
  $('#releaseCalendar').fullCalendar({
    aspectRatio: 1.35,
    firstDay: 1,
    eventLimit: true,
    eventLimitText: "more",
    nextDayThreshold: '00:00:00',
    header: { left: 'title', center: '' },
    buttonText: { today: 'Today' },
    events: '/calendar/release',
    eventClick: shoeReleaseEvent
  })
}

function prettyTime(ms){
  if(ms == 0 || ms == null)
    return '-';
  var s = parseInt(ms/1000);
  if(s<60)
    return s+'s';
  else if(s<3600)
    return Math.floor(s/60)+'m '+(s%60)+'s';
  else if(s<86400)
    return Math.floor(s/3600)+'h '+Math.floor((s%3600)/60)+'m '+(s%60)+'s';
  else
    return Math.floor(s/86400)+'d '+Math.floor((s%86400)/3600)+'h '+Math.floor((s%3600)/60)+'m';
}

function htmlModal(title, html){
  var reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-)+)/g;
  var html = html.replace(/<\/?[^>]*>/g, '');
  html = html.replace(/\n/g,'<br/>');
  html = html.replace(/\(\#/g,'<strong class="text-red">');
  html = html.replace(/\#\)/g,'</strong>');
  html = html.replace(reg, '<a target="_blank" href="$&">click here</a>');

  $('#htmlModal .modal-title').html('<i class="fa fa-info"></i> '+title);
  $('#htmlModal .modal-body p').html(html);
  $('#htmlModal').modal('show');
}

$('#htmlModal').on('hidden.bs.modal', function (e) {
  $('#htmlModal .modal-title').html('Html Modal');
  $('#htmlModal .modal-body p').html('');
})

function tableModal(title, header, body, prefix){
  var html = [];
  if(prefix)
    html[html.length] = prefix;

  html[html.length] = '<table class="table table-hover issue-table"><thead class="thead-dark"><tr>';
  for(var i=0;i<header.length;i++)
    html[html.length] = '<th>'+header[i]+'</td>';
  html[html.length] = '</tr></thead><tbody>';
  
  for(var i=0;i<body.length;i++){
    var item = body[i];
    if(item.color)
      html[html.length] = '<tr class="'+item.color+'">';
    else
      html[html.length] = '<tr>';
    for(var j=0;j<header.length;j++)
      html[html.length] = '<td>'+item.data[j]+'</td>';
    html[html.length] = '</tr>';
  }
  html[html.length] = '</tbody></table>';

  $('#tableModal .modal-header .modal-title').html('<i class="fa fa-coffee"></i> Table List: '+title);
  $('#tableModal .modal-body').html(html.join(''));
  $('#tableModal').modal('show');
}

function smConfirm(msg, callback){
  $('#confirmModal .modal-body p').html(msg);
  $('#confirmModal').modal('show');

  $('#confirmYes').on('click', function(){
    callback(true);
    $('#confirmModal').modal('hide');
  });
  
  $('#confirmNo').on('click', function(){
    callback(false);
    $("#confirmModal").modal('hide');
  });
}

function smNotice(msg, callback) {
  $('#alertModal').removeClass('modal-success');
  $('#alertModal').removeClass('modal-warning');

  $('#alertModal .modal-footer button').removeClass('btn-success');
  $('#alertModal .modal-footer button').removeClass('btn-warning');

  $('#alertModal .modal-title').html('<i class="fa fa-bullhorn"></i> Notice');
  $('#alertModal .modal-body p').html(msg);

  $('#alertModal').modal();
  $('#alertOK').on('click', function(){
    if(callback) callback();
    $('#alertModal').modal('hide');
  });
}

function smOK(msg, callback) {
  $('#alertModal').removeClass('modal-warning');
  $('#alertModal').addClass('modal-success');

  $('#alertModal .modal-footer button').removeClass('btn-warning');
  $('#alertModal .modal-footer button').addClass('btn-success');

  $('#alertModal .modal-title').html('<i class="fa fa-check"></i> Success');
  $('#alertModal .modal-body p').html(msg);

  $('#alertModal').modal();
  $('#alertOK').on('click', function(){
    if(callback) callback();
    $('#alertModal').modal('hide');
  });
}

function smWarn(msg, callback) {
  $('#alertModal').removeClass('modal-success');
  $('#alertModal').addClass('modal-warning');

  $('#alertModal .modal-footer button').removeClass('btn-success');
  $('#alertModal .modal-footer button').addClass('btn-warning');

  $('#alertModal .modal-title').html('<i class="fa fa-warning"></i> Warning');
  $('#alertModal .modal-body p').html(msg);

  $('#alertModal').modal();

  $('#alertOK').on('click', function(){
    if(callback) callback();
    $('#alertModal').modal('hide');
  });
}

function isURL(url) {
  var strRegex = '^((https|http|ftp|rtsp|mms)?://)?'
      +'(([0-9A-Za-z_!~*().&=+$%-]+: )?[0-9a-z_!~*().&=+$%-]+@)?' 
      +'(([0-9]{1,3}.){3}[0-9]{1,3}|'
      +'([0-9A-Za-z_!~*()-]+.)*'
      +'[a-z]{2,6})'
      +'(:[0-9]{1,4})?'
      +'((/?)|(/[0-9A-Za-z_!~*().;?:@&=+$,%#-]+)+/?)$';
  return new RegExp(strRegex).test(url);
}

function findInArray(array, attr, value){
  for(var i=0;i<array.length;i++){
      var item = array[i];
      if(item[attr] == value)
          return item;
  }
  return null;
}

function arrayHas(array, value){
  for(var i=0;i<array.length;i++)
      if(array[i] == value)
          return true;
  return false;
}

function arrayItemHas(arr, attr, value){
  if(!arr)
    return false;
  for(var i=0;i<arr.length;i++){
      var item = arr[i];
      if(item[attr] == value)
          return true;
  }
  return false;
}

function wrapHtml(html){
  if(!html)
    return '';
  var reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-)+)/g;
  var html = html.replace(/<\/?[^>]*>/g, '');
  html = html.replace(/\n/g,'<br/>');
  html = html.replace(/\(\#/g,'<strong class="text-red">');
  html = html.replace(/\#\)/g,'</strong>');
  html = html.replace(reg, '<a target="_blank" href="$&">click here</a>');

  return html;
}