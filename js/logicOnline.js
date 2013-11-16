(function() {

  //////////////////////////////////////////////////////////////////////
  /////////////////////////////VARIABLES////////////////////////////////
  //////////////////////////////////////////////////////////////////////
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
  var playIcon = document.createElement('span');
  var audioPlayer = document.getElementById('audioPlayer');
  var dewPlayer = document.getElementById("dewplayerjs");
  var favoriteSongs = [];
  var FAV_SONGS_ITEM_NAME = 'favSongs';
  var showingFavs = false;
  var playingPlaylist = false;

  //Set play icon class
  playIcon.setAttribute('class','glyphicon glyphicon-play');


  //////////////////////////////////////////////////////////////////////
  /////////////////////////AUXILIAR FUNCTIONS///////////////////////////
  //////////////////////////////////////////////////////////////////////

  function sendReq(url, method, headers, content, callback) {

    try {

      var proxyURL = 'proxy.php';
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
        $('#searchButton').button('reset');
        $('#loadingModal').modal('hide');
        $('#errorModal').modal('show');
      }

      req.send(content);
    }catch (e) {
      //Nothing to do...
    }

  }

  function updateURL(title, search, type) {
    window.history.pushState('', '', '?search=' + search + '&type=' + type);
    document.title = baseTitle + ' - ' + title;
  }
  
  function showNoMatchesAlert() {
    $('#playlistTable').addClass('hidden');
    $('#songsTable').addClass('hidden');
    $('#cancelPlayAllButton').addClass('hidden');
    $('#playAllButton').addClass('hidden');
    $('#loadMoreBtn').addClass('hidden');
    $('#noMatchesAlert').removeClass('hidden');
  }

  function processSongs(songs) {

    var correct = true;

    try {

      var songs = JSON.parse(songs);

      //Include results in the table
      for (var i = 0; i < songs.length; i++) {

        if (songs[i] !== 0) {

          //Player table
          var elem = document.createElement("tr");
          elem.info = songs[i];

          var playIconCell = document.createElement("td");
          playIconCell.setAttribute('style','width: 1px;');

          var title = document.createElement("td");
          title.innerHTML = songs[i].title;

          var artist = document.createElement("td");
          artist.innerHTML = songs[i].artist;

          var songtime = document.createElement("td");
          songtime.innerHTML = songs[i].songtime;

          var options = document.createElement("td");
          options.setAttribute('style','text-align: center;');

          playIconCell.onclick = title.onclick = artist.onclick = songtime.onclick = function() {
            playNode(this.parentNode);
          }

          elem.setAttribute('style',NORMAL_STYLE);
          elem.appendChild(playIconCell);
          elem.appendChild(title);
          elem.appendChild(artist);
          elem.appendChild(songtime);
          elem.appendChild(options);

          //If the song is being played
          if (currentRow && currentRow.info.id === songs[i].id) {
            currentRow = elem;
            elem.setAttribute('style', HIGHLIGHTED_STYLE);
            playIconCell.appendChild(playIcon);
          }

          document.getElementById('songs').appendChild(elem);

        } else {
          $('#loadingModal').modal('hide');
          $('#noResultsModal').modal('show');
          $('#loadMoreBtn').addClass('hidden');
        }
      }
      
      var table = document.getElementById('songs');
      if (table.children.length === 0) {
        showNoMatchesAlert();
      }

      //TODO: Hide songs table

      $('#loadingModal').modal('hide');
      $('#searchButton').button('reset');
    } catch(e) {
      console.log(e);
      $('#searchButton').button('reset');
      $('#loadingModal').modal('hide');
      $('#errorModal').modal('show');

      correct = false;
    }

    return correct;
  }
  
  function getArtistImg(artist) {
    return 'http://www.goear.com/band/picture/' + artist;
  }


  //////////////////////////////////////////////////////////////////////
  ///////////////////////////////SONGS//////////////////////////////////
  //////////////////////////////////////////////////////////////////////

  function searchSong() {

    //Show and hide elements
    $('#loadingModal').modal('show');
    $('#searchButton').button('loading');
    $('#playlistTable').addClass('hidden');
    $('#songsTable').removeClass('hidden');

    var url = 'http://goear.com/apps/android/search_songs_json.php?q='  + currentSearch + '&p=' + page;
    var headers = {};

    sendReq(url, 'GET', headers, '', function() {
      if(processSongs(this.responseText)) {
        page++;
      }
    });
  }


  //////////////////////////////////////////////////////////////////////
  /////////////////////////////PLAYLISTS////////////////////////////////
  //////////////////////////////////////////////////////////////////////

  function searchPlaylist() {

    //Show and hide elements
    $('#loadingModal').modal('show');
    $('#searchButton').button('loading');
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
              $('#searchButton').button('loading');

              var url = 'http://www.goear.com/apps/android/playlist_songs_json.php?userid=null&secureid=null&v=' + this.info.id;

              var callback = function() {
                processSongs(this.responseText);

                $('#playlistTable').addClass('hidden');
                $('#songsTable').removeClass('hidden');
                $('#loadMoreBtn').addClass('hidden');
                $('#downloadPlayListButton').removeClass('hidden');

                if (playingAllEnabled) {
                  $('#playAllButton').removeClass('hidden');
                }

                playingPlaylist = true;

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
        
        var table = document.getElementById('playlists');
        if (table.children.length === 0) {
          showNoMatchesAlert();
        }

        $('#loadingModal').modal('hide');
        $('#searchButton').button('reset');

      } catch(e) {
        $('#searchButton').button('reset');
        $('#loadingModal').modal('hide');
        $('#noResultsModal').modal('show');
      }
    }

    sendReq(url, 'GET', headers, '', callback);
  }


  //////////////////////////////////////////////////////////////////////
  //////////////////////////////NEW SEARCH//////////////////////////////
  //////////////////////////////////////////////////////////////////////

  function loadMoreResults() {
    if(searchType === 'playlists') {
      searchPlaylist();
    } else {
      searchSong();
    }
  }

  function newSearch(stop) {

    if (playingAll && !stop) {
      $('#btnConfirmSearch').off('click');
      $('#btnConfirmSearch').on('click', newSearch.bind({}, true));
      $('#playingAllModal').modal('show');
    } else {

      var PATTERN = new RegExp('^http\://(www\.)?goear\.com/(listen|playlist)/([a-zA-Z0-9]{7})/');

      var search = $('#searchInput').val();
      var type = $('#searchType').val();
      var regex = PATTERN.exec(search);

      if (regex) {
        //Minihack: detect goear URLs

        var type = regex[2];
        var id = regex[3];

        if (type === 'playlist') {  //Playlists can be searched by their ID

          //Set input properly
          $('#searchInput').val(id);
          $('#searchType').val('playlists');
          newSearch(stop);   //Restart search

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
             var song = {
               id: id,
               artist: artist,
               title: title,
               imgpath: 'http://www.goear.com/band/picture/' + artist,
               songtime: '<em>No disponible</em>'
             };

             processSongs.apply(song);

             }
           });*/
        }

      } else if (showingFavs || playingPlaylist || (currentSearch !== search.trim() || searchType !== type)) {
        //Only search when current search differs from new search

        //Show and hide elements
        $('#mainDiv').removeClass('hidden');
        $('#loadMoreBtn').removeClass('hidden');
        $('#noFavsSongsAlert').addClass('hidden');
        $('#noMatchesAlert').addClass('hidden');
        $('#buttonViewFavs').removeClass('active');
        $('#downloadPlayListButton').addClass('hidden');

        //Empty tables
        $('#songs').empty();
        $('#playlists').empty();

        //Cancel playing all
        cancelPlayAll();

        //Reset global variables
        currentSearch = search;
        searchType = type;
        page = 0;
        showingFavs = false;
        playingPlaylist = false;

        //Start search
        updateURL(currentSearch, currentSearch, type);
        loadMoreResults();
      }
    }
  }

  $('#loadMoreBtn').on('click', loadMoreResults);
  $('#formOnline').on('submit', function(ev) {
    ev.preventDefault();
    $('#searchInput').blur();
    newSearch(false);
  })


  //////////////////////////////////////////////////////////////////////
  /////////////////////////////FAVORITES////////////////////////////////
  //////////////////////////////////////////////////////////////////////

  function isSongFavorite(songId) {

    var pos = -1;
    for (var i = 0; i < favoriteSongs.length && pos === -1; i++) {
      if (favoriteSongs[i].id === songId) {
        pos = i;
      }
    }

    return pos;
  }

  function addOrRemoveFavorite(songInfo) {

    //Look for that song on the fav array
    var pos = isSongFavorite(songInfo.id);

    if (pos === -1) {
      //Process song
      var minInfo = {
        title: songInfo.title,
        artist: songInfo.artist,
        id: songInfo.id,
        songtime: songInfo.songtime
      }

      //Add song to favorites
      favoriteSongs.push(minInfo);

      //Show info about favorite songs
      if (favoriteSongs.length === 1) {
        $('#favsModal').modal('show');
      }
    } else {
      //Remove song from favorites
      favoriteSongs.splice(pos, 1);
    }

    //Write to local storage
    localStorage.setItem(FAV_SONGS_ITEM_NAME, JSON.stringify(favoriteSongs));

  }

  function changeFavProperties(pos, title, artist) {
    favoriteSongs[pos].title = title;
    favoriteSongs[pos].artist = artist;
    localStorage.setItem(FAV_SONGS_ITEM_NAME, JSON.stringify(favoriteSongs));
  }

  function exchangeFavPosition(initial, final) {
    var aux = favoriteSongs[final];
    favoriteSongs[final] = favoriteSongs[initial];
    favoriteSongs[initial] = aux;

    //Save item with new order
    localStorage.setItem(FAV_SONGS_ITEM_NAME, JSON.stringify(favoriteSongs));
  }

  function showFavsTable(stop, continuePlayingAll) {

    if (playingAll && !stop) {
      $('#btnConfirmSearch').off('click');
      $('#btnConfirmSearch').on('click', showFavsTable.bind({}, true, false));
      $('#playingAllModal').modal('show');
    } else {

      showingFavs = true;

      //Show elements
      $('#mainDiv').removeClass('hidden');
      $('#playlistTable').addClass('hidden');
      $('#songsTable').removeClass('hidden');
      $('#loadMoreBtn').addClass('hidden');
      $('#mainDiv').removeClass('hidden');
      $('#downloadPlayListButton').addClass('hidden');
      $('#buttonViewFavs').addClass('active');
      $('#noMatchesAlert').addClass('hidden');

      //Empty songs table
      $('#songs').empty();

      //Set playing all button properly
      if (playingAllEnabled && playingAll && continuePlayingAll) {
        playAll();
      } else if (playingAllEnabled) {     //Playing all is enabled but not active
        cancelPlayAll();
      }

      if (favoriteSongs.length === 0) {
      
        $('#songsTable').addClass('hidden');
        $('#noFavsSongsAlert').removeClass('hidden');
        $('#playAllButton').addClass('hidden');

      } else {

        //Simulate response
        processSongs(JSON.stringify(favoriteSongs));

        //Write up and down buttons
        var songs = document.getElementById('songs').children;

        function exchangeAndUpdate(initial, final) {
          exchangeFavPosition(initial, final);
          showFavsTable(true, true);
        }

        function changePropertiesAndUpdate(pos) {

          $('#favPropertyTitle').val(favoriteSongs[pos].title);
          $('#favPropertyArtist').val(favoriteSongs[pos].artist);
          $('#favPropertyDuration').val(favoriteSongs[pos].songtime);
          $('#favPropertyID').val(favoriteSongs[pos].id);

          $('#favUpdateApplyBtn').off('click');
          $('#favUpdateApplyBtn').on('click', function() {

            var title = $('#favPropertyTitle').val();
            var artist = $('#favPropertyArtist').val();

            changeFavProperties(pos, title, artist);
            showFavsTable(true, true);

            //If the song is currently playing, its info must be updated on the player
            if (currentRow.info.id === favoriteSongs[pos].id) {
              $('#title').html(title || 'N/A');
              $('#artist').html(artist || 'N/A');
              $('#songimg').attr('src', getArtistImg(artist));
            }

          });

          $('#changeFavPropertiesModal').modal('show');
        }
        
        function removeAndUpdate(pos) {

          var continuePlaying = true;

          if(currentRow.info.id === favoriteSongs[pos].id) {
            $('#playerBtnFav').removeClass('active');
            continuePlaying = false;
          }

          addOrRemoveFavorite(favoriteSongs[pos]);
          showFavsTable(true, continuePlaying);
        }

        for (var i = 0; i < songs.length; i++) {

          var optionsCell = songs[i].children[4];

          //Up button is not added to the first song
          if (i > 0) {
            var upButton = document.createElement('span');
            upButton.setAttribute('class','glyphicon glyphicon-chevron-up');
            upButton.setAttribute('style', 'cursor: pointer; color: #777777;');
            upButton.onclick = exchangeAndUpdate.bind(this, i, i-1);
            optionsCell.appendChild(upButton);
          }

          //Down button is not added to the last song
          if (i < songs.length - 1) {
            var downButton = document.createElement('span');
            downButton.setAttribute('class','glyphicon glyphicon-chevron-down');
            downButton.setAttribute('style', 'cursor: pointer; color: #777777;');
            downButton.onclick = exchangeAndUpdate.bind(this, i, i+1);
            optionsCell.appendChild(downButton);
          }

          //Edit button
          var editButton = document.createElement('span');
          editButton.setAttribute('class','glyphicon glyphicon-pencil');
          editButton.setAttribute('style', 'cursor: pointer; color: #777777;');
          editButton.onclick = changePropertiesAndUpdate.bind(this, i);
          optionsCell.appendChild(editButton);
          
          //Delete button
          var downButton = document.createElement('span');
          downButton.setAttribute('class','glyphicon glyphicon-remove');
          downButton.setAttribute('style', 'cursor: pointer; color: #777777;');
          downButton.onclick = removeAndUpdate.bind(this, i);
          optionsCell.appendChild(downButton);
        }
      }
    }
  }

  //Set action to fire when favorite button is clicked
  //Add/Remove song from favorite songs
  $('#playerBtnFav').click(function() {

    addOrRemoveFavorite(currentRow.info);

    //Refresh favs table
    if (showingFavs) {
      showFavsTable(true, false);
    }

    //Toggle button
    $('#playerBtnFav').button('toggle');

  });

  //Set action to fire when user wants to show favorite songs
  $('#buttonViewFavs').on('click', showFavsTable.bind({}, false));

  //Init favorites
  var favoriteSongsJSON = localStorage.getItem(FAV_SONGS_ITEM_NAME);
  if (favoriteSongsJSON) {
    favoriteSongs = JSON.parse(favoriteSongsJSON);
  }


  //////////////////////////////////////////////////////////////////////
  ///////////////////////////////PLAYER/////////////////////////////////
  //////////////////////////////////////////////////////////////////////

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
    title.html(songInfo.title || 'N/A');

    //Set artist
    var artist = $('#artist');
    artist.html(songInfo.artist || 'N/A');

    //Set songtime
    var songtime = $('#songtime');
    songtime.html(songInfo.songtime || 'N/A');

    //Set song length
    var size = $('#size');
    size.html('<em>Cargando...</em>');

    //Set GoearID
    var goearID = $('#goearID');
    goearID.html(songInfo.id || 'N/A');

    //Set image
    var img = document.getElementById('songimg');
    img.setAttribute('src', songInfo.imgpath || getArtistImg(songInfo.artist));

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
  
  function playNode(nodeToPlay) {

    if(nodeToPlay) {
      
      var sameSong = false;

      if (currentRow) {
        sameSong = nodeToPlay === currentRow;
        if (!sameSong) {
          currentRow.setAttribute('style', NORMAL_STYLE);    //Remove highlighted style from the previous selected song
        }
      }

      if (!sameSong) {
        nodeToPlay.setAttribute('style', HIGHLIGHTED_STYLE);  //Highlighted style for the selected song
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


  //////////////////////////////////////////////////////////////////////
  //////////////////////////PLAYER FUNCTIONS////////////////////////////
  //////////////////////////////////////////////////////////////////////

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

    //HTML 5 (if current time is higher than 5s then currentTime is set to 0)
    if (audioPlayer && audioPlayer.currentTime > 5) {
      audioPlayer.currentTime = 0;
    } else if (currentRow) {
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

  //Hide download button on iOS devides
  var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );
  if (iOS) {
    $('#downloadLink').addClass('hidden');
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

  $('#downloadLink').on('click', function() {
    $('#rightButtonModal').modal('show');
    return false;
  });

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


  //////////////////////////////////////////////////////////////////////
  //////////////////////////////PLAY ALL////////////////////////////////
  //////////////////////////////////////////////////////////////////////

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

  //Set action to be fired when buttons are clicked
  $('#cancelPlayAllButton').on('click', cancelPlayAll);
  $('#playAllButton').on('click', playAll);


  //////////////////////////////////////////////////////////////////////
  ///////////////////////////INIT OTHER THINGS//////////////////////////
  //////////////////////////////////////////////////////////////////////

  $('#btnDownloadDesktopVersion').on('click', function() {
    $('#downloadDesktopBtn').click();
  });


  //////////////////////////////////////////////////////////////////////
  ////////////////////////////GET FOCUS INFO////////////////////////////
  //////////////////////////////////////////////////////////////////////

  var focused = true;

  window.onfocus = function() {
    focused = true;
  };
  window.onblur = function() {
    focused = false;
  };

})();
