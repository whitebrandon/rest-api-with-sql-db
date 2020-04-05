/** ****************************************
Treehouse Techdegree:
FSJS project 9 - REST API Project
Name: Brandon White
Date of Last Modification: 05/04/2019
***************************************** */

'use strict';

const express = require('express');

const router = express.Router();
const bcryptjs = require('bcryptjs');
const { User } = require('../models');
const handler = require('../scripts');

router.get('/', handler.authenticateUser, handler.asyncHandler(async (req, res) => res.status(200).json(req.user)));

router.post('/', handler.asyncHandler(async (req, res) => {
  const user = {};
  Object.entries(req.body).forEach((item) => {
    const key = item[0];
    const value = item[1];
    if (key === 'password') {
      user[key] = bcryptjs.hashSync(value);
    } else {
      user[key] = value;
    }
    if (key === 'emailAddress') {
      if (/^[^@]+@[^@.]+\.[a-z]+$/i.test(value)) {
        user[key] = value;
      } else {
        const error = new Error('Email is invalid. Please try again (ex. person@gmail.com).');
        error.name = 'InvalidEmailAddress';
        throw error;
      }
    }
  });
  await User.create(user);
  return res.set({ Location: '/' }).status(201).send();
}));

module.exports = router;
