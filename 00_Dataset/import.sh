#!/bin/bash
CSV_FILE=archive/*.csv
DB_NAME=spotify
for FILE in $CSV_FILE; do
	file_name="${FILE##*/}"
	file="${file_name%.*}"
	mongoimport -d $DB_NAME -c $file --type csv --file $FILE --headerline
done
