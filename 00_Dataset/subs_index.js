db.tracks.updateMany({}, {$set: {"_id_artists": []}});
var i=0;
db.artists.find().forEach( function (art) {   

  db.tracks.find({id_artists:art.id}).forEach(function(tr){
    print(tr.name);

    tr._id_artists.push(art._id);
    db.tracks.save(tr);

  });
  i++;
  if((i%10000)===0){
    print("Total: "+i);
  }
});