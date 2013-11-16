(function() {
  
  //Variables
  var errorDiv = $('#rep_errDiv');
  var infoDiv = $('#report_infoDiv');
  var reportButton = $('#reportButton');

  //AUXILIAR FUNCTIONS
  function cleanFieldAndSetContent(field, content) {
    var element = $('#' + field);
    element.html(content);
  }

  function onError() {
    reportButton.button('reset');
    errorDiv.removeClass('hidden');
    cleanFieldAndSetContent('rep_errMsg', 'Error: La petición no se ha podido llevar a cabo por un error desconocido');
  }

  //MAIN FUNCTION
  function searchReport() {
    
    var id = $('#reportNumber').val();
    
    errorDiv.addClass('hidden');
    infoDiv.addClass('hidden');
    
    try {
    
      reportButton.button('loading');

      var url = "getReport.php?id=" + id;
      var req = new XMLHttpRequest();
      req.open('GET', url, true);

      req.onload = function() {
        try {
          var response = JSON.parse(this.responseText);

          if(response.error) {
            errorDiv.removeClass('hidden');
            cleanFieldAndSetContent('rep_errMsg', response.error);
          } else {
            infoDiv.removeClass('hidden');
            cleanFieldAndSetContent('rep_number', response.id);
            cleanFieldAndSetContent('rep_errorType', response.errorType);
            cleanFieldAndSetContent('rep_goearID', response.goearID);
            cleanFieldAndSetContent('rep_programVersion', response.programVersion);
            cleanFieldAndSetContent('rep_additionalInfo', response.additionalInfo);
            cleanFieldAndSetContent('rep_date', response.date);
            cleanFieldAndSetContent('rep_solved', response.solved);
            cleanFieldAndSetContent('rep_adminComments', response.adminComments);
          }
        } catch(e) {
          onError();
        }
        
        reportButton.button('reset');
      }
    
      req.onerror = onError;
    
      req.send();
    
    }catch (e) {
      onError();
    }
  }
  
  //Set form action
  $('#formReports').on('submit', function(ev) {
    ev.preventDefault();
    $('#reportNumber').blur();
    searchReport();
  });
  
  
})();