print("Start artists");
db.artists.find().forEach( function (x) {   
  var re = new RegExp("'", 'g');
  x.genres = x.genres.replace("[","").replace("]","").replace(re,"").split(", ");
  if(x.genres.length==1 && x.genres[0]===""){
    x.genres=[];
  }
  db.artists.save(x);
});
print("Start tracks");
db.tracks.find().forEach( function (x) {  
  var re = new RegExp("'", 'g'); 
  x.artists = x.artists.replace("[","").replace("]","").replace(re,"").split(",");
  if(x.artists.length==1 && x.artists[0]===""){
    x.artists=[];
  }
  db.tracks.save(x);
});