(function() {

  var actualPosition = 0,
      maintenance = false;
  
  //var maintenanceText = '<strong>Información Útil: El servicio está siendo actualizado, es posible que haya incidencias durante la utilización. Disculpe las molestias.</strong>'
  var maintenanceText = '<strong>Información Útil: Debido a tareas de mantenimiento de Mi@, es posible que el servicio presente incidencias. Disculpe las molestias</strong';
  var tips = [];
  tips[0] = '<strong>Consejo:</strong> Utiliza los botones multimedia de tu teclado para reproducir, pausar, avanzar o retroceder <em>(IEv10+ y Chrome)</em>';
  tips[1] = '<strong>Consejo:</strong> Busca y reproduce listas fácilmente seleccionando "Listas" en el formulario de búsqueda';
  tips[2] = '<strong>Consejo:</strong> Reproduce todas las canciones sin pausa pulsando el botón "Reproducir todo" <em>(IEv10+, FFv21+ y Chrome)</em>';
  tips[3] = '<strong>Consejo:</strong> Utiliza los botones de reproducción de la barra superior para controlar la música mientras navegas por la web';
  
  $('#btnPrevTip').on('click', function() {
    if (actualPosition == 0) {
      actualPosition = tips.length - 1;
    } else {
      actualPosition--;
    }
    
    printActualTip();
  });
  
  $('#btnNextTip').on('click', function() {
    if (actualPosition == tips.length - 1) {
      actualPosition = 0;
    } else {
      actualPosition++;
    }
    
    printActualTip();
  });
  
  $('#btnRemoveTips').on('click', function() {
    $('#tipsNavBar').addClass('hidden');
  });
  
  function printActualTip() {
    
    var tipParagraph = $('#tipParagraph');
    
    tipParagraph.fadeOut(function() {
      tipParagraph.html(tips[actualPosition]);
      tipParagraph.fadeIn();
    });
    
    $('#tipPosition').html((actualPosition + 1) + '/' + tips.length); 
  }
  
  //First tip
  if (maintenance) {
    
    //Hide buttons
    $('#btnPrevTip').addClass('hidden');
    $('#btnNextTip').addClass('hidden');
    $('#btnRemoveTips').addClass('hidden');
    $('#tipPosition').addClass('hidden');
    
    //Show maintenance warn
    $('#tipParagraph').html(maintenanceText);
    
  } else {
    printActualTip();
  }
  
  
})();
