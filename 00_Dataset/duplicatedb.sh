mongodump --archive="spotify_base" --db=spotify --host=localhost --port=27017
mongorestore --archive="spotify_base" --nsFrom='spotify.*' --nsTo='spotify_copy.*' --host=localhost --port=27017
