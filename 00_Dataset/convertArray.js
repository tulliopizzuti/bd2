print("Artists: convert artists string in array");
db.artists.find().forEach( function (x) {   
  var re = new RegExp("'", 'g');
  var re2 = new RegExp('"', 'g');
  x.genres = x.genres.replace("[","").replace("]","").replace(re2,"").replace(re,"").split(", ");
  if(x.genres.length==1 && x.genres[0]===""){
    x.genres=[];
  }
  if(x.followers==""){
    x.followers=0;
  }
  db.artists.save(x);
});
print("Tracks: convert artists string in array");
db.tracks.find().forEach( function (x) {  
  var re2 = new RegExp('"', 'g');
  var re = new RegExp("'", 'g'); 
  x.artists = x.artists.replace("[","").replace("]","").replace(re2,"").replace(re,"").split(", ");
  x.id_artists = x.id_artists.replace("[","").replace("]","").replace(re,"").split(", ");
  if(x.artists.length==1 && x.artists[0]===""){
    x.artists=[];
  }if(x.id_artists.length==1 && x.id_artists[0]===""){
    x.id_artists=[];
  }
  db.tracks.save(x);
});
print("Tracks: convert release_date int32 year in string year-01-01");
db.tracks.find({release_date: {$type:16}}).forEach( function(x) {
    db.tracks.update({_id: x._id}, {$set: {release_date: x.release_date.toString()+"-01-01"}});
});
print("Tracks: convert release_date string to date");
db.tracks.find().forEach( function(x) {
    x.release_date=new Date(x.release_date);
  db.tracks.save(x);

});
/*print("Tracks: add objectID array");

db.tracks.updateMany({}, {$set: {"_id_artists": []}});
var i=0;
db.artists.find().forEach( function (art) {   

  db.tracks.find({id_artists:art.id}).forEach(function(tr){

    tr._id_artists.push(art._id);
    db.tracks.save(tr);

  });
  i++;
  if((i%1000)===0){
    print("Total: "+i);
  }
});
*/