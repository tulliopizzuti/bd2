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

print("Artists: create indexs");
db.artists.createIndex({"name":1});
db.artists.createIndex({"id":1});
db.artists.createIndex({"followers":1});
db.artists.createIndex({"popularity":1});



print("Tracks: create indexs");
db.tracks.createIndex({"name":1});
db.tracks.createIndex({"duration_ms":1});
db.tracks.createIndex({"popularity":1});
db.tracks.createIndex({"id_artists":1});
db.tracks.createIndex({"artists":1});
db.tracks.createIndex({"release_date":1});
db.tracks.createIndex(
    {'id_artists.1': 1},
    {partialFilterExpression: {'id_artists.1': {$exists: true}}}
);