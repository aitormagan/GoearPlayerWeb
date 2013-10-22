(function() {

  //Variables
  var currentSearch = '';
  var page = 0;
  var NORMAL_STYLE = 'cursor: pointer;';
  var HIGHLIGHTED_STYLE = NORMAL_STYLE + 'background-color: #f5f5f5;';
  var playingAll = false;
  var playingAllEnabled = false;
  var currentRow = null;
  var currentNavBarUpdater = null;
  var searchType;
  var baseTitle = document.title;
  var playIcon = document.createElement('i');
  var audioPlayer = document.getElementById('audioPlayer');
  var dewPlayer = document.getElementById("dewplayerjs");
  var favoritesSongs = [];
  var FAV_SONGS_ITEM_NAME = 'favSongs';
  var showingFavs = false;

  //Favorites functions
  function isSongFavorite(songId) {

    var pos = -1;
    for (var i = 0; i < favoritesSongs.length && pos === -1; i++) {
      if (favoritesSongs[i].id === songId) {
        pos = i;
      }
    }

    return pos;
  }

  function showFavsTable(stop) {

    if (playingAll && !stop) {
      $('#btnConfirmSearch').off('click');
      $('#btnConfirmSearch').on('click', showFavsTable.bind({}, true));
      $('#playingAllModal').modal('show');
    } else {

      showingFavs = true;
      playingAll = false;

      //Show elements
      $('#playlistTable').addClass('hidden');
      $('#songsTable').removeClass('hidden');
      $('#loadMoreBtn').addClass('hidden');
      $('#mainDiv').removeClass('hidden');
      $('#downloadPlayListButton').addClass('hidden');
      $('#cancelPlayAllButton').addClass('hidden');
      $('#songsViewFavs').addClass('active');
      $('#songs').empty();

      if (playingAllEnabled) {
        $('#playAllButton').removeClass('hidden');
      }

      if (favoritesSongs.length === 0) {
        var elem = document.createElement('tr');
        var td = document.createElement('td');

        td.setAttribute('colspan', '4');
        td.innerHTML = '<p align="center"><em>Aún no tienes canciones favoritas. ¡Reproduce cualquier canción y empieza a agregar canciones a tus favoritas!</em></p>';

        elem.appendChild(td);
        document.getElementById('songs').appendChild(elem);

        $('#playAllButton').addClass('hidden');

      } else {
        //Simulate response
        var simulatedJSONResponse = {};
        simulatedJSONResponse.responseText = JSON.stringify(favoritesSongs);
        processSongs.apply(simulatedJSONResponse);
      }
    }

  }

  //Auxiliar Functions
  function sendReq(url, method, headers, content, callback) {

    try {

      var proxyURL = "proxy.php";
      var req = new XMLHttpRequest();
      req.open(method, proxyURL, true);

      //Set headers
      req.setRequestHeader('target-host', url);
      for (var head in headers) {
        req.setRequestHeader(head, headers[head]);
      }

      if (callback) {
        req.onload = callback;
      }
    
      req.onerror = function() {
        $('#songsButton').button('reset');
        $('#loadingModal').modal('hide');
        $('#errorModal').modal('show');
      }
    
      req.send(content);
    }catch (e) {
    }
  }

  function loadResults() {
    //Hide download play list button
    $('#downloadPlayListButton').addClass('hidden');
    
    if(searchType === 'playlists') {
      searchPlaylist();
    } else {
      searchSong();
    }
  }

  function processSongs() {
    try {

      //Show table
      $('#mainDiv').removeClass('hidden');

      var songs = JSON.parse(this.responseText);
    
      //Page number is increased if no errors arise
      page++;

      //Include results in the table
      for (var i = 0; i < songs.length; i++) {

        if (songs[i] !== 0) {

          //Player table
          var elem = document.createElement("tr");
          elem.info = songs[i];

          var playIconCell = document.createElement("td");
          playIconCell.setAttribute('style','width: 1%;');
      
          var title = document.createElement("td");
          title.innerHTML = songs[i].title;
      
          var artist = document.createElement("td");
          artist.innerHTML = songs[i].artist;
      
          var songtime = document.createElement("td");
          songtime.innerHTML = songs[i].songtime;

          elem.onclick = function() {
            playNode(this);
          }
      
          elem.setAttribute('style',NORMAL_STYLE);
          elem.appendChild(playIconCell);
          elem.appendChild(title);
          elem.appendChild(artist);
          elem.appendChild(songtime);

          //If the song is being played
          if (currentRow && currentRow.info.id === songs[i].id) {
            currentRow = elem;
            elem.setAttribute('style', HIGHLIGHTED_STYLE);
            playIconCell.appendChild(playIcon);
          }

          document.getElementById("songs").appendChild(elem);

          //NavBar
          /*var li = document.createElement("li");
          var a = document.createElement("a");
          
          a.setAttribute('href', '#');
          a.innerHTML = songs[i].artist + ' - ' + songs[i].title;
          a.onclick = function() {
            playNode(elem);
          }

          li.appendChild(a);

          document.getElementById("navBarSongList").appendChild(li);*/
        } else {
          $('#loadingModal').modal('hide');
          $('#noResultsModal').modal('show');
          $('#loadMoreBtn').addClass('hidden');
        }
      }
     
      $('#loadingModal').modal('hide');
      $('#songsButton').button('reset');
    } catch(e) {
      console.log(e);
      $('#songsButton').button('reset');
      $('#loadingModal').modal('hide');
      $('#errorModal').modal('show');
    }
  }

  function searchPlaylist() {
    
    $('#loadingModal').modal('show');
    $('#songsButton').button('loading');
    $('#playlistTable').removeClass('hidden');
    $('#songsTable').addClass('hidden');
    $('#playAllButton').addClass('hidden');
    
    var url = 'http://goear.com/apps/android/search_playlist_json.php?q='  + currentSearch + '&p=' + page;
    var headers = {};
    
    var callback = function() {
    
      try {
      
        //Show main div
        $('#mainDiv').removeClass('hidden');
        
        //Parse results
        var playlists = JSON.parse(this.responseText);
        
        //Page number is increased if no errors arise
        page++;
        
        //Set header
        //document.getElementById('playlistSearchTerm').innerHTML = currentSearch;
        
        //Include results in the table
        for (var i = 0; i < playlists.length; i++) {

          if (playlists[i] !== 0) {

            var elem = document.createElement("tr");
            elem.info = playlists[i];

            var title = document.createElement("td");
            title.innerHTML = playlists[i].title;
      
            var duration = document.createElement("td");
            if (playlists[i].songtime === '00:00:00') {
              duration.innerHTML = '<em>No Disponible</em>';
            } else {
              duration.innerHTML = playlists[i].songtime;
            }
      
            var songs = document.createElement("td");
            songs.innerHTML = playlists[i].plsongs + (playlists[i].plsongs == 1 ? ' canción' : ' canciones');
          
            elem.onclick = function() {
          
              $('#loadingModal').modal('show');
              $('#songsButton').button('loading');
            
              var url = 'http://www.goear.com/apps/android/playlist_songs_json.php?userid=null&secureid=null&v=' + this.info.id;
            
              var callback = function() {
                processSongs.apply(this);
              
                $('#playlistTable').addClass('hidden');
                $('#songsTable').removeClass('hidden');
                $('#loadMoreBtn').addClass('hidden');
                $('#downloadPlayListButton').removeClass('hidden');
            
                if (playingAllEnabled) {
                  $('#playAllButton').removeClass('hidden');
                }
                
                setTimeout(playAll, 1000);
              }

              //Set download play list button action (button will be shown later)
              var downloadPlaylist = function() {
                $('#playlistdownloadid').html(this.info.id);
                $('#downloadPlaylistModal').modal('show');
              }

              $('#downloadPlayListButton').off('click');
              $('#downloadPlayListButton').on('click', downloadPlaylist.bind(this));
            
              sendReq(url, 'GET', headers, '', callback);
            
            }

            elem.setAttribute('style',NORMAL_STYLE);
            elem.appendChild(title);
            elem.appendChild(duration);
            elem.appendChild(songs);

            document.getElementById("playlists").appendChild(elem);
          } else {
            $('#loadingModal').modal('hide');
            $('#noResultsModal').modal('show');
            $('#loadMoreBtn').addClass('hidden');
          }
        }
        
        $('#loadingModal').modal('hide');
        $('#songsButton').button('reset');
        
      } catch(e) {
        $('#songsButton').button('reset');
        $('#loadingModal').modal('hide');
        $('#noResultsModal').modal('show');
      }
    }
    
    sendReq(url, 'GET', headers, '', callback);
  }

  function searchSong() {

    $('#loadingModal').modal('show');
    $('#songsButton').button('loading');
    $('#playlistTable').addClass('hidden');
    $('#songsTable').removeClass('hidden');
    
    var url = 'http://goear.com/apps/android/search_songs_json.php?q='  + currentSearch + '&p=' + page;
    var headers = {};

    sendReq(url, 'GET', headers, '', processSongs);
  }
  
  function updateURL(){
    window.history.pushState('', '', '?search=' + currentSearch + '&type=' + searchType);
    document.title = baseTitle + ' - ' + currentSearch;
  }

  function playSong(songInfo) {

    var songURL = 'http://goear.com/plimiter.php?f=' + songInfo.id;
    //var songURL = 'http://www.goear.com/action/sound/get/' + songInfo.id
      
    //Show loading modal
    if (focused) {
      $('#loadingModal').modal('show');
    }
    
    //Show the player
    $('#playerDiv').removeClass('hidden');
    $('#mainDiv').removeClass('col-md-12');
    $('#mainDiv').addClass('col-md-8');

    //Stop current updater
    if (currentNavBarUpdater) {
      clearInterval(currentNavBarUpdater);
    }

    updateNavBarTitle();		//Initial Update
    currentNavBarUpdater = setInterval(updateNavBarTitle, 5000);	//Update every 5s
      
    //Set title
    var title = $('#title');

    if (songInfo.title === '') {
      title.html('N/A');
    } else {
      title.html(songInfo.title);
    }

    //Set artist
    var artist = $('#artist');
    if (songInfo.artist === '') {
      artist.html('N/A');
    } else {
      artist.html(songInfo.artist);
    }

    //Set songtime
    var songtime = $('#songtime');
    if (songInfo.songtime === '') {
      songtime.html('N/A');
    } else {
      songtime.html(songInfo.songtime);
    }

    //Set song length
    var size = $('#size');
    size.empty();
    var italics = document.createElement("em");
    italics.appendChild(document.createTextNode('Cargando...'));
    size.append(italics);

    //Set GoearID
    var goearID = $('#goearID');
    goearID.empty();
    goearID.append(document.createTextNode(songInfo.id));

    //Set image
    var img = document.getElementById("songimg");
    img.setAttribute('src',songInfo.imgpath);

    //Update fav button
    $('#playerBtnFav').removeClass('active');
    if (isSongFavorite(songInfo.id) !== -1) {
      $('#playerBtnFav').button('toggle');
    }

    //Update Link
    var link = document.getElementById('downloadLink');
    link.setAttribute('href', songURL);
    
    //Set audio
    if (audioPlayer !== null) {
      //$('#loadingModal').modal('show');	//Show the loading modal
      audioPlayer.src = songURL;          //Change de URL
      audioPlayer.load();                 //Load the MP3
    }

    //Function is required because player is not ready when it's show the first time
    function setFlashPlayer(songURL) {
      //Hide loading modal
      $('#loadingModal').modal('hide');
      
      if (dewPlayer != null && dewPlayer.dewset) {
        dewPlayer.dewset(songURL);
        return true;
      } else {
        return false;
      }
    };
    
    if (!audioPlayer && !setFlashPlayer(songURL)) {
      setTimeout(setFlashPlayer.bind({}, songURL), 1000);
    }
    
    //Load song size
    var NOT_AVAILABLE_MESSAGE = '<em>Temporalmente no disponible</em>';
    
    var reqSize = new XMLHttpRequest();
    reqSize.open('GET', 'filesize.php', true);
    reqSize.setRequestHeader('relayer-host', songURL);
    
    reqSize.onload = function() {
      var size = $('#size');
      size.empty();
      //size.append(document.createTextNode(JSON.parse(this.responseText)['mb'] + ' MB'));
      try {
        size.html(JSON.parse(this.responseText)['mb']);
      } catch (e) {
        size.html(NOT_AVAILABLE_MESSAGE);
      }
    }
    
    reqSize.onerror = function() {
      size.html(NOT_AVAILABLE_MESSAGE);
    }

    reqSize.send();
  }
  
  //Play Functions
  function playNode(nodeToPlay) {

    if(nodeToPlay) {
      
      var sameSong = false;

      if (currentRow) {
        sameSong = nodeToPlay === currentRow;
        if (!sameSong) {
          currentRow.setAttribute('style',NORMAL_STYLE);    //Remove highlighted style from the previous selected song
        }
      }

      if (!sameSong) {
        nodeToPlay.setAttribute('style',HIGHLIGHTED_STYLE);   //Highlighted style for the selected song
        nodeToPlay.firstChild.appendChild(playIcon);          //Change play icon position
        currentRow = nodeToPlay;                              //Set Current Song
        playSong(nodeToPlay.info);                            //Play Song
      } else {
        //Play song again - HTML5
        if (audioPlayer) {
          audioPlayer.play();
        }

        //Play song again - Flash
        if (dewPlayer) {
          dewPlayer.dewplay();
        }
      }
    }
  }

  function playAll() {
    if (playingAllEnabled) {
      playingAll = true;
            
      $('#playAllButton').addClass('hidden');
      $('#cancelPlayAllButton').removeClass('hidden');
      $('#loadingModal').removeClass('fade');
      
      var songsTable = document.getElementById('songs');
      var nodeToPlay = songsTable.firstChild;	
      
      if (currentRow && currentRow.parentNode === songsTable) {
        if (audioPlayer.ended) {
         if(currentRow.nextSibling) {
            nodeToPlay = currentRow.nextSibling;
          }
        } else {
          nodeToPlay = currentRow;
        }
      }

      playNode(nodeToPlay);
    }
  }

  function cancelPlayAll() {
    if (playingAllEnabled) {
      playingAll = false;
      $('#playAllButton').removeClass('hidden');
      $('#cancelPlayAllButton').addClass('hidden');
      $('#loadingModal').addClass('fade');
    }
  }

  //Nav Bar player functions
  function forward() {
    if (currentRow) {
      var nextRow = currentRow.nextSibling;
      if (nextRow) {
        playNode(nextRow);
      }
    }

    return false;
  }

  function backward() {
    if (currentRow) {
      var previousRow = currentRow.previousSibling;
      if (previousRow) {
        playNode(previousRow);
      }
    }

    return false;
  }

  function play() {
    //HTML5
    if (audioPlayer !== null) {
      audioPlayer.play();
    }

    //Flash
    if (dewPlayer) {
      dewPlayer.dewplay();
    }

    return false;
  }

  function pause() {
    //HTML 5
    if (audioPlayer !== null) {
      audioPlayer.pause();
    }

    //Flash
    if (dewPlayer) {
      dewPlayer.dewpause();
    }

    return false;
  }

  function updateNavBarTitle() {
    
    var titleNav = $('#actualSong');
    var MAX_LENGTH = 40;

    var setNavBarInfo = function(info) {
      
      titleNav.fadeOut(function() {
        if (info.length > MAX_LENGTH + 3) {
          titleNav.html(info.substring(0, MAX_LENGTH) + '...');
        } else {
          titleNav.html(info);
        }

        titleNav.fadeIn();
      });
    }

    if (currentRow) {
      if (titleNav.html() == currentRow.info.title || titleNav.html() == currentRow.info.title.substring(0, MAX_LENGTH) + '...') {
        setNavBarInfo(currentRow.info.artist);
      } else {
        setNavBarInfo(currentRow.info.title);
      } 
    }
  }
  
  //Main Function
  function updateSearch(stop) {
    
    if (playingAll && !stop) {
      $('#btnConfirmSearch').off('click');
      $('#btnConfirmSearch').on('click', updateSearch.bind({}, true));
      $('#playingAllModal').modal('show');
    } else {

      var PATTERN = new RegExp('^http\://(www\.)?goear\.com/(listen|playlist)/([a-zA-Z0-9]{7})/');

      var search = $('#searchInput').val();
      var type = $('#searchType').val();
      var regex = PATTERN.exec(search);

      if (regex) {              //Minihack: detect goear URLs
        var type = regex[2];
        var id = regex[3];
        
        if (type === 'playlist') {  //Playlists can be searched by their ID
          
          $('#searchInput').val(id);
          $('#searchType').val('playlists');
          
          updateSearch(stop);   //Reestart seatch
        } else {                //Songs cannot be searched by their ID
          $('#directSearchModal').modal('show');
          
          /* TODO: TEST METHOD!!!!
          $('#searchInput').val(id);
          $('#searchType').val('songs');
          
          $('#loadingModal').modal('show');
          
          //Is the only way to get song information
          sendReq('http://www.goear.com/externaltrackhost.php?f=' + id, 'GET', null, null, function() {
            
            //Parse XML
            var xmlDoc = new DOMParser().parseFromString(this.responseText,'text/xml');
            var elem = xmlDoc.getElementsByTagName('song')[0];
            var title = elem.getAttribute('title');
            var artist = elem.getAttribute('artist');
            
            if (artist === '' && title === '') {    //That song does not exist
              $('#noResultsModal').modal('show');
            } else {
              //Show song table and hide play list table
              $('#playlistTable').addClass('hidden');
              $('#songsTable').removeClass('hidden');
              $('#songs').empty();
              
              //Analyze song using the default method
              var simulatedJSONResponse = {};
              simulatedJSONResponse.responseText = JSON.stringify([{
                id: id,
                artist: artist,
                title: title,
                imgpath: 'http://static.goear.com/img/nodata.png',
                songtime: '<em>No disponible</em>'
              }]);
              
              processSongs.apply(simulatedJSONResponse);
              
            }
          });*/
        }

      } else if (showingFavs || (currentSearch !== search.trim() || searchType !== type)) {
        //Only search when current search differs from new search

        $('#loadMoreBtn').removeClass('hidden');
        $('#songs').empty();
        //$('#navBarSongList').empty();
        $('#playlists').empty();
        $('#songsViewFavs').removeClass('active');
      
        cancelPlayAll();

        //Define global variables
        currentSearch = search;
        searchType = type;
        page = 0;
        showingFavs = false;

        //Start search
        updateURL();    
        loadResults();
      }
    }
    
    //Avoid default action
    return stop;
  }
  
  //Set forms and buttons actions
  $('#formOnline').on('submit', updateSearch.bind({}, false));
  $('#cancelPlayAllButton').on('click', cancelPlayAll);
  $('#playAllButton').on('click', playAll);
  $('#loadMoreBtn').on('click', loadResults);
  $('#downloadLink').on('click', function() {
    $('#rightButtonModal').modal('show');
    return false;
  });
  $('#btnDownloadDesktopVersion').on('click', function() {
    $('#downloadDesktopBtn').click();
  });
  
  //Hide download button on iOS devides
  var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );
  if (iOS) {
    $('#downloadLink').addClass('hidden');
  }

  //Set play icon
  playIcon.setAttribute('class','glyphicon glyphicon-play');

  //Set up audio player
  if (audioPlayer) {
    playingAllEnabled = true;

    audioPlayer.addEventListener('error', function(e) {
      $('#loadingModal').modal('hide');
      $('#errorModal').modal('show');
      console.log(e);
    });

    audioPlayer.addEventListener('canplay', function() {
      audioPlayer.play();
      $('#loadingModal').modal('hide');
    });

    audioPlayer.addEventListener('ended', function() {
      if (playingAll) {
        var nextRow = currentRow.nextSibling;
        if (nextRow) {
          playNode(nextRow);
        } else {
          cancelPlayAll();
        }
      }
    });
  }

  //Set actions for navbar player buttons
  $('#navBarBackwardButton').click(backward);
  $('#navBarPlayButton').click(play);
  $('#navBarPauseButton').click(pause);
  $('#navBarForwardButton').click(forward);
  $('#navBarInfoSong').click(function() {
    $('#onlineBtn').click();
    return false;
  });

  //Set actions for player buttons
  $('#playerBtnBackward').click(backward);
  $('#playerBtnPlay').click(play);
  $('#playerBtnPause').click(pause);
  $('#playerBtnForward').click(forward);

  //Init favorites
  var favoritesSongsJSON = localStorage.getItem(FAV_SONGS_ITEM_NAME);
  if (favoritesSongsJSON) {
    favoritesSongs = JSON.parse(favoritesSongsJSON);
  }

  //Set action to fire when favorites button is clicked
  $('#playerBtnFav').click(function() {

    var songInfo = currentRow.info;

    //Look for that song on the fav array
    var pos = isSongFavorite(songInfo.id);

    if (pos === -1) {
      //Add song to favorites
      favoritesSongs.push(songInfo);

      if (favoritesSongs.length === 1) {
        $('#favsModal').modal('show');
      }
    } else {
      //Remove song from favorites
      favoritesSongs.splice(pos, 1);
    }

    //Refresh favs table
    if (showingFavs) {
      showFavsTable();
    }

    //Write to local storage
    localStorage.setItem(FAV_SONGS_ITEM_NAME, JSON.stringify(favoritesSongs));

    //Toggle button
    $('#playerBtnFav').button('toggle');
  });

  $('#songsViewFavs').on('click', showFavsTable.bind({}, false));

  //Show favs songs on start
  showFavsTable();

  //Get focus info
  var focused = true;

  window.onfocus = function() {
    focused = true;
  };
  window.onblur = function() {
    focused = false;
  };

  //Multimedia Buttons
  window.onkeydown = function(e) {
    if (e.keyCode == 176) { //Next
      forward();
    } else if (e.keyCode == 177) {  //Previous
      backward();
    } else if (e.keyCode == 179) {  //Play/Pause (only HTML5 Player)
      if (audioPlayer !== null) {
        if (audioPlayer.paused) {
          audioPlayer.play();
        } else {
          audioPlayer.pause();
        }
      }
    }
  }
})();
