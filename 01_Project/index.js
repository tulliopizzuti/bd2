const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const bodyparser = require('body-parser');


var index = require('./server/routes/index.route')


const app = express();

dotenv.config( { path : '.env'} )
const PORT = process.env.PORT || 8080

app.use(morgan('tiny'));
app.use('/assets', express.static('assets'));
app.use('/',index.index);


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyparser.urlencoded({ extended : true}))
  
app.listen(PORT, ()=> { console.log(`Server is running on http://localhost:${PORT}`)});
module.exports = app;