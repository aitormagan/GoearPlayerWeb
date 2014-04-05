(function() {

  $('#searchInput').typeahead({
    autoSelect: false,
    source: function(query, process) {
    
      var ajaxReq = $.ajax({
          type: "POST",
          url: "http://clients1.google.com/complete/search",
          data: "q=" + query + "&nolabels=t&client=youtube&ds=yt",
          dataType: 'jsonp',

          success: function(data) {
            var finalResult = data[1].map(function(element) {
              return element[0];
            });
            
            process(finalResult);
          }
      });
    }
  });

})();