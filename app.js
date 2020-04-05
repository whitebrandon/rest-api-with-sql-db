'use strict';

// load modules
const { sequelize } = require('./models');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
// const bcryptjs = require('bcryptjs');
// const auth = require('basic-auth');
const userRouter = require('./routes/users');
const courseRouter = require('./routes/courses');

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .then(() => {
    sequelize.sync();
  })
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
