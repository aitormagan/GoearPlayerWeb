(function() {

  //Audio Element
  var audioPlayer  = document.createElement("audio"),
      barAndVolume = $('#playerBarAndVolume'),
      canPlayMP3 = (typeof audioPlayer.canPlayType === "function" && audioPlayer.canPlayType("audio/mpeg") !== ""),
      regresive = false;
            
  if (canPlayMP3){                            //HTML5 Player
    audioPlayer.setAttribute('id','audioPlayer');
    barAndVolume.append(audioPlayer);

    function updateVolumeIcon() {

      $('#volumeIcon').removeClass();

      if (audioPlayer.muted || audioPlayer.volume === 0) {
        $('#volumeIcon').addClass('glyphicon glyphicon-volume-off');
      } else if (audioPlayer.volume < 0.4) {
        $('#volumeIcon').addClass('glyphicon glyphicon-volume-down');
      } else {
        $('#volumeIcon').addClass('glyphicon glyphicon-volume-up');
      }
    }

    function updateDuration() {
      if (regresive) {
        $('#duration').html('-' + getMinsAndSecs(audioPlayer.duration - audioPlayer.currentTime));
      } else {
        $('#duration').html(getMinsAndSecs(audioPlayer.duration));
      }
    }

    function updatePlayerPos(percentage) {
      $('#progessLength').attr('style','width: ' + percentage + '%');
      $('#progessLength').attr('aria-valuenow', percentage);
    }

    function setVolume(volume) {
      $('#volumePos').attr('style', 'width: ' + volume * 100 + '%');
      $('#volumePos').attr('aria-valuenow', volume * 100);
    }

    function getMinsAndSecs(secsTot) {

      var retunedValue = '00:00';

      function pad(value) {
        return value < 10 ? '0' + value : value;
      }

      if (!isNaN(secsTot)) {
        var mins = Math.floor(secsTot / 60);
        var secs = Math.floor(secsTot % 60);

        returnedValue = pad(mins) + ':' + pad(secs);

      }

      return returnedValue;

    }

    function canVolumeBeChanged() {
      var volumeChanged = true;
      var previousVolume = audioPlayer.volume;	//Save previous volume
      audioPlayer.volume = 0;						//Change the volume

      //Has the volume been changed? (in iOS the volume cannot be changed)
      if (audioPlayer.volume === 1) {
        volumeChanged = false;
      }

      audioPlayer.volume = previousVolume;		//Set previous volume

      return volumeChanged;
    }

    //When the user want to change the volume (not compatible with iOS devices)
    $('#volumeBarPlayer').on('click', function(e) {

      //Get relative position
      var offset = e.offsetX || e.pageX - $('#volumeBarPlayer').offset().left;	//Firefox!
      var width = this.offsetWidth;
      var percentage = offset / width;

      //More responsive
      percentage = Math.round(100 * percentage);
      var OFFSET = 5;
      var mod = percentage % OFFSET;

      if (mod > OFFSET / 2) {
        percentage += OFFSET - mod;
      } else {
        percentage -= mod;
      }

      percentage = percentage / 100;

      //Set volume
      audioPlayer.volume = percentage;

    });

    //When the user want to play another part of the current song
    $('#progressBarPlayer').on('click', function(e) {
      //Get relative position
      var offset = e.offsetX || e.pageX - $('#progressBarPlayer').offset().left;	//Firefox!
      var width = this.offsetWidth;
      var percentage = offset / width;

      //Calculate position
      var totalSize = audioPlayer.duration;
      var pos = percentage * totalSize;

      //Seek
      audioPlayer.currentTime = pos;

      //Active bar
      //$('#progressBarPlayer').addClass('progress-striped active');
    });

    //When the user activate or desactivate mute
    $('#volumeIcon').on('click', function(e) {
      audioPlayer.muted = !audioPlayer.muted;
      updateVolumeIcon();
    });

    //When the user activate or desactivate mute
    $('#duration').on('click', function(e) {
      regresive = !regresive;
      updateDuration();
    });

    //Action when the player is playing a song to get the time
    audioPlayer.addEventListener('timeupdate', function(e) {
      var percentage = 100 * (this.currentTime / this.duration);
      updatePlayerPos(percentage);
      $('#currentTime').html(getMinsAndSecs(this.currentTime));
      updateDuration();
    });

    //Action when the volumen has changed
    audioPlayer.addEventListener('volumechange', function(e) {
      setVolume(this.volume);
      updateVolumeIcon();
    });

    //Action when the player is started
    audioPlayer.addEventListener('play', function(e) {
      $('#playerBtnPause').removeClass('hidden');
      $('#playerBtnPlay').addClass('hidden');
      $('#navBarPauseButton').removeClass('hidden');
      $('#navBarPlayButton').addClass('hidden');
    });

    //Action when the player is paused
    audioPlayer.addEventListener('pause', function(e) {
      $('#playerBtnPause').addClass('hidden');
      $('#playerBtnPlay').removeClass('hidden');
      $('#navBarPauseButton').addClass('hidden');
      $('#navBarPlayButton').removeClass('hidden');
    });

    //Action when the src is resseted
    audioPlayer.addEventListener('emptied', function(e) {
      //Init pause and play button
      $('#playerBtnPlay').removeClass('hidden');
      $('#playerBtnPause').addClass('hidden');
    });

    $('#playerBtnRepeat').on('click', function() {
      audioPlayer.loop = !audioPlayer.loop;
    });

    //Init repeat button
    if (audioPlayer.loop) {
      $('#playerBtnRepeat').button('toggle');
    }

    //Hide volume bar if volume cannot be changed
    if (!canVolumeBeChanged()) {
      $('#volumeDiv').addClass('hidden');
    }

    //Init buttons
    $('#navBarPauseButton').addClass('hidden');
    $('#navBarPlayButton').removeClass('hidden');
    $('#playerBtnPause').addClass('hidden');
    $('#playerBtnPlay').removeClass('hidden');

  } else {                                        //Flash Player
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
    barAndVolume.empty();         //Remove HTML5 Player
    barAndVolume.append(object);  //Include Flash Player

    var flashvars = { mp3: '' };
    var params = {  wmode: 'transparent' };
    var attributes = { id: 'dewplayer' };
    
    swfobject.embedSWF("dewplayer.swf", "dewplayer_content", "240", "20", "9.0.0", false, flashvars, params, attributes);

    //Init buttons
    $('#navBarPauseButton').removeClass('hidden');
    $('#navBarPlayButton').removeClass('hidden');
    $('#playerBtnPlay').removeClass('hidden');
    $('#playerBtnPause').removeClass('hidden');
  }
})();
