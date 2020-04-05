'use strict';

const auth = require('basic-auth');
const bcryptjs = require('bcryptjs');
const { User } = require('../models');

module.exports = {
  /**
   * Middleware Function that Authenticates User
   */
  authenticateUser: async (req, res, next) => {
    try {
      const user = auth(req);
      if (user && user.name && user.pass) {
        const currentUser = await User.findOne({ where: { emailAddress: user.name } });
        if (currentUser) {
          if (bcryptjs.compareSync(user.pass, currentUser.password)) {
            req.user = currentUser;
            next();
          } else {
            const error = new Error('Unauthorized User');
            error.name = 'AuthenticationError';
            throw error;
          }
        } else {
          const error = new Error('User could not be found with that "emailAddress"');
          error.name = 'User Not Found';
          throw error;
        }
      } else {
        const error = [];
        if (!user || !user.name) {
          const noEmail = new Error('Please be sure to include your "emailAddress"');
          noEmail.name = 'AuthorizationHeaderError';
          error.push(noEmail);
        }
        if (!user || !user.pass) {
          const noPassword = new Error('Please be sure to include your "password"');
          noPassword.name = 'AuthorizationHeaderError';
          error.push(noPassword);
        }
        throw error;
      }
    } catch (err) {
      if (Array.isArray(err) && err.filter((item) => item.name === 'AuthorizationHeaderError')) {
        const errMessages = err.map((item) => item.message);
        return res.status(400).json(errMessages);
      }
      res.status(401).json({ errorMsg: err.message });
    }
    return undefined;
  },

  // What situations can I have with authenticate user?

  /**
   * Handler for try...catch
   * @param {Function} callback - the function that runs query
   * @param {Object} model - the model instance
   */
  asyncHandler: (callback) => async (req, res, next) => {
    try {
      await callback(req, res, next);
    } catch (err) {
      if (err.name === 'SequelizeValidationError') {
        const errMessages = err.errors.map((item) => item.message);
        res.status(400).json({ errorMsg: errMessages });
      } else if (err.name === 'InvalidEmailAddress') {
        res.status(400).json({ errorMsg: err.message });
      } else if (err.name === 'SequelizeUniqueConstraintError') {
        res.json({
          errorMsg: 'The email address you\'ve entered has already been registered'
        });
      } else if (err.name === 'AuthenticationError') {
        res.status(403).json({ errorMsg: err.message });
      } else if (err.name === 'CourseExistError') {
        res.status(404).json({ errorMsg: err.message });
      } else {
        console.error(err);
        res.status(500).send(err);
      }
    }
    return undefined;
  }
};
