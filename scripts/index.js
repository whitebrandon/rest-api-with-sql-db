/** ****************************************
Treehouse Techdegree:
FSJS project 9 - REST API Project
Name: Brandon White
Date of Last Modification: 05/04/2019
***************************************** */

'use strict';

const auth = require('basic-auth');
const bcryptjs = require('bcryptjs');
const { User } = require('../models');

module.exports = {
  /**
   * Creates an error object for middleware functions
   * @param {String} errorMsg - the message for the error object
   * @param {String} errorName - the name of the error
   */
  createErrorObj: (errorMsg, errorName) => {
    const error = new Error(errorMsg);
    error.name = errorName;
    throw error;
  },

  /**
   * Middleware Function that Authenticates User
   */
  authenticateUser: async (req, res, next) => {
    try {
      const user = auth(req);
      if (user && user.name && user.pass) {
        const currentUser = await User.findOne({
          where: { emailAddress: user.name },
          attributes: ['id', 'firstName', 'lastName', 'emailAddress', 'password'],
        });
        if (currentUser) {
          if (bcryptjs.compareSync(user.pass, currentUser.password)) {
            req.user = {};
            Object.entries(currentUser.dataValues).forEach((item) => {
              const key = item[0];
              const value = item[1];
              if (key !== 'password') {
                req.user[key] = value;
              }
            });
            next();
          } else {
            this.createErrorObj('Unauthorized User', 'AuthenticationError');
          }
        } else {
          this.createErrorObj('User could not be found with that "emailAddress"', 'User Not Found');
        }
      } else {
        const err = new Error('Not Authorized.');
        err.name = 'AuthorizationHeaderError';
        throw err;
      }
    } catch (err) {
      if (err.name === 'AuthorizationHeaderError') {
        return res.status(401).json(err.message);
      }
      res.status(401).json({ errorMsg: err.message });
    }
    return undefined;
  },

  /**
   * Handler for try...catch
   * @param {Function} callback - the function that runs query
   */
  asyncHandler: (callback) => async (req, res, next) => {
    try {
      await callback(req, res, next);
    } catch (err) {
      if (err.name === 'SequelizeValidationError') {
        const errMessages = err.errors.map((item) => item.message);
        res.status(400).json({ errorMsg: errMessages });
      } else if (Array.isArray(err) && err[0].name === 'ValidationError') {
        res.status(400).json({ errorMsg: err.map((item) => item.message) });
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
        res.status(500).json(err);
      }
    }
    return undefined;
  }
};
