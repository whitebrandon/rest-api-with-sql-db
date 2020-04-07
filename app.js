/** ****************************************
Treehouse Techdegree:
FSJS project 9 - REST API Project
Name: Brandon White
Date of Last Modification: 05/04/2019
***************************************** */

'use strict';

// load modules
const bodyParser = require('body-parser');
const morgan = require('morgan');
const express = require('express');
const { sequelize } = require('./models');
const userRouter = require('./routes/users');
const courseRouter = require('./routes/courses');

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .then(() => sequelize.sync())
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });


// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// ============================================================================ //
//                           MIDDLEWARE FUNCTIONS                               //
// ============================================================================ //

// setup morgan which gives us http request logging
app.use(morgan('dev'));
// parses incoming urlencoded requests that are json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// TODO setup your api routes here
app.use('/api/users', userRouter);
app.use('/api/courses', courseRouter);

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
