const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const bodyparser = require('body-parser');
const connectDB = require('./server/db/db');
var indexRoutes = require('./server/routes/index.routes');
var apiRoutes = require('./server/routes/api.routes');
var artistRoutes = require('./server/routes/artist.routes');
const app = express();
dotenv.config( { path : '.env'} )
const PORT = process.env.PORT || 8080
connectDB();
app.use(morgan('tiny'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/assets', express.static('assets'));
app.use('/',indexRoutes);
app.use('/artist',artistRoutes);
app.use('/api',apiRoutes);




app.use(bodyparser.urlencoded({ extended : true}))
  
app.listen(PORT, ()=> { console.log(`Server is running on http://localhost:${PORT}`)});
module.exports = app;