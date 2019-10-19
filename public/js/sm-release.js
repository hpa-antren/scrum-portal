function ReleaseController($scope, socket){
  //TODO
}

function shoeReleaseEvent(calEvent, jsEvent, view){
  var issue = calEvent.rawData;

  $('#issueModal .modal-header h3').html(issue.issueKey);
  $('#issueModal .modal-body .box-title').html('<i class="fa fa-newspaper-o margin-r-5"></i> '+issue.summary);
  $('#issueModal .modal-body .box-body p.issue-desc').html(wrapHtml(issue.description));
  
  var propHtml = [];
  propHtml.push('<p>');
  propHtml.push('<span class="issue_field"><strong><i class="fa fa-server margin-r-5"></i> Product: </strong> '+issue.product+'</span>');
  propHtml.push('<span class="issue_field"><strong><i class="fa fa-wrench margin-r-5"></i> Module: </strong> '+(issue.releaseModule?issue.releaseModule:'-')+'</span>');  
  propHtml.push('</p>');

  propHtml.push('<p>');
  propHtml.push('<span class="issue_field"><strong><i class="fa fa-user-circle-o margin-r-5"></i> Reporter: </strong> '+issue.reporter+'</span>');
  propHtml.push('<span class="issue_field"><strong><i class="fa fa-file-text-o margin-r-5"></i> Change Config: </strong> '+issue.changeConfig+'</span>');
  propHtml.push('</p>');

  propHtml.push('<p>');
  propHtml.push('<span class="issue_field"><strong><i class="fa fa-tag margin-r-5"></i> Version: </strong> '+issue.releaseVersion+'</span>');
  propHtml.push('<span class="issue_field"><strong><i class="fa fa-sticky-note margin-r-5"></i> Branch: </strong> '+(issue.branch?issue.branch:'-')+'</span>');
  propHtml.push('</p>');

  propHtml.push('<p>');
  propHtml.push('<span class="issue_field field_long"><strong><i class="fa fa-globe margin-r-5"></i> Entry: </strong> '+(issue.releaseEntry?issue.releaseEntry:'-')+'</span>');
  propHtml.push('</p>');

  propHtml.push('<p>');
  propHtml.push('<span class="issue_field field_long"><strong><i class="fa fa-comment margin-r-5"></i> QA Comment: </strong> '+(issue.qaComment?issue.qaComment:'-')+'</span>');
  propHtml.push('</p>');

  $('#issueModal .modal-body .box-body div').html(propHtml.join(''));
  $('#issueModal').modal('show');
}
