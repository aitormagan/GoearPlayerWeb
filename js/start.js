(function() {

  function getParameterByName(name){
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    if (results == null) {
      return '';
    } else {
      return decodeURIComponent(results[1].replace(/\+/g, " "));
    }
  }

  //Get action
  var action = getParameterByName('action');

  if (action === 'show_reports') {
    $('#reportsBtn').click();
  } else if (action === 'help') {
    $('#helpBtn').click();
  } else if (action === 'about') {
    $('#aboutBtn').click();
  } else if (action === 'contact') {
    $('#loadingModal').modal('show');
    window.location = 'wp/?page_id=83';
  }

  //Get search parameter
  if (!action) {
    var searchParam = getParameterByName('search');
    var typeParam = getParameterByName('type') || 'songs';

    if (searchParam !== '') {
      document.getElementById('searchInput').value = searchParam;
      document.getElementById('searchType').value = typeParam;
      $('#formOnline').submit();
    }
  }
})();
