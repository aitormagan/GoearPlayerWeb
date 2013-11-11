(function() {

  //Temporal javascript file... It will only be available for a month

  //Variables
  var FAV_SONGS_ITEM_NAME = 'favSongs';
  var favoritesSongs = [];
  var transform = false;

  //Get songs
  var favoritesSongsJSON = localStorage.getItem(FAV_SONGS_ITEM_NAME);

  if (favoritesSongsJSON) {
    favoritesSongs = JSON.parse(favoritesSongsJSON);
  }

  //Is necessary to execute transform process?
  if (favoritesSongs[0] && favoritesSongs[0].imgpath) {
    transform = true;
  }

  if (transform) {

    //Transform
    var newFavs = favoritesSongs.map(function(fav) {
      return {
        title: fav.title,
        artist: fav.artist,
        id: fav.id,
        songtime: fav.songtime
      }
    });

    //Save new favs
    localStorage.setItem(FAV_SONGS_ITEM_NAME, JSON.stringify(newFavs));

    //Page is required to be reloaded
    $('#loadingModal').modal('show');
    location.reload();
  }

})();