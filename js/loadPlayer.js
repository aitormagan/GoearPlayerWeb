(function() {

  //Audio Element
  var audio  = document.createElement("audio"),
      br = $('#lastBR'),
      canPlayMP3 = (typeof audio.canPlayType === "function" && audio.canPlayType("audio/mpeg") !== "");
            
  if (canPlayMP3){                            //HTML5 Player
    audio.setAttribute('id','audioPlayer');
    //audio.setAttribute('src','');
    audio.setAttribute('controls','');
    //audio.setAttribute('preload','metadata');
    audio.setAttribute('style', 'width: 95%;');
    audio.appendChild(document.createTextNode('Your browser does not support the audio element.'));
    
    br.after(audio);

  }else{                                        //Flash Player
    var object = document.createElement('object');
    object.setAttribute('id', 'dewplayerjs');
    object.setAttribute('name', 'dewplayer');
    object.setAttribute('type','application/x-shockwave-flash');
    object.setAttribute('data','dewplayer-vol.swf');
    object.setAttribute('width','240');
    object.setAttribute('height','20');
    
    var param1 = document.createElement('param');
    param1.setAttribute('name', 'movie');
    param1.setAttribute('value', 'dewplayer.swf');
    
    var param2 = document.createElement('param');
    param2.setAttribute('name', 'flashvars');
    param2.setAttribute('value', 'mp3=mu.mp3&javascript=on');
    
    var param3 = document.createElement('param');
    param3.setAttribute('name', 'wmode');
    param3.setAttribute('value', 'transparent');
    
    var alternate = document.createElement('div');
    alternate.setAttribute('class', 'alert alert-warning');
    alternate.innerHTML = '<strong>ATENCIÓN: </strong> Para reproducir música online es necesraio que tengas instalado Adobe Flash Player o un navegador capaz de reproducir archivos MP3 (Internet Explorer 10+, Google Chrome, Safari,...)';
    
    object.appendChild(param1);
    object.appendChild(param2);
    object.appendChild(param3);
    object.appendChild(alternate);
    br.after(object);

    var flashvars = { mp3: '' };
    var params = {  wmode: 'transparent' };
    var attributes = { id: 'dewplayer' };
    
    swfobject.embedSWF("dewplayer.swf", "dewplayer_content", "240", "20", "9.0.0", false, flashvars, params, attributes);
  }
})();
