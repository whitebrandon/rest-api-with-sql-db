/** ****************************************
Treehouse Techdegree:
FSJS project 9 - REST API Project
Name: Brandon White
Date of Last Modification: 05/04/2019
***************************************** */

'use strict';

const express = require('express');

const router = express.Router();
const { Course, User } = require('../models');
const handler = require('../scripts');

/**
 * Helper
 * creates and throws error if user attempts to alter course not owned by them
 * @param {Object} course - the course that's being altered
 * @param {Object} req - the request object with contains the user id
 */
const createPermissionsError = (course, req) => {
  if (course.userId !== req.user.id) {
    const error = new Error('User does not have permissions for this course');
    error.name = 'AuthenticationError';
    throw error;
  }
};

const createCourseNotFoundError = () => {
  const error = new Error('Course not found');
  error.name = 'CourseExistError';
  throw error;
};

router.get('/', handler.asyncHandler(async (req, res) => {
  const courses = await Course.findAll({
    include: [
      {
        model: User,
        attributes: ['firstName', 'lastName', 'emailAddress'],
      }
    ],
    attributes: {
      exclude: ['createdAt', 'updatedAt'],
    }
  });
  return res.status(200).json(courses);
}));

router.post('/', handler.authenticateUser, handler.asyncHandler(async (req, res) => {
  const course = {};
  Object.entries(req.body).forEach((item) => {
    const key = item[0];
    const value = item[1];
    course[key] = value;
  });
  course.userId = req.user.id;
  const newCourse = await Course.create(course);
  return res.set({ Location: `https://localhost:${process.env.PORT || 5000}/api/courses/${newCourse.id}` }).status(201).send();
}));

router.get('/:id', handler.asyncHandler(async (req, res) => {
  const course = await Course.findOne({
    where: {
      id: parseInt(req.params.id, 10),
    },
    include: [
      {
        model: User,
        attributes: ['firstName', 'lastName', 'emailAddress'],
      }
    ],
    attributes: {
      exclude: ['createdAt', 'updatedAt'],
    }
  });
  return res.status(200).json(course);
}));

router.put('/:id', handler.authenticateUser, handler.asyncHandler(async (req, res) => {
  const course = await Course.findByPk(parseInt(req.params.id, 10));
  if (course) {
    createPermissionsError(course, req);
  } else {
    createCourseNotFoundError();
  }
  const validationErrArr = [];
  const userProvidedAttributes = Object.keys(req.body).filter((item) => item === 'title' || 'description');
  ['title', 'description'].forEach((attribute) => {
    if (!userProvidedAttributes.includes(attribute)) {
      const error = new Error(`Please provide a value for "${attribute}"`);
      error.name = 'ValidationError';
      validationErrArr.push(error);
    }
  });
  if (validationErrArr.length) {
    throw validationErrArr;
  }
  await course.update({
    title: req.body.title,
    description: req.body.description,
    estimatedTime: req.body.estimatedTime,
    materialsNeeded: req.body.materialsNeeded,
    userId: req.user.id
  });
  return res.status(204).send();
}));

router.delete('/:id', handler.authenticateUser, handler.asyncHandler(async (req, res) => {
  const course = await Course.findByPk(parseInt(req.params.id, 10));
  if (course) {
    createPermissionsError(course, req);
  } else {
    createCourseNotFoundError();
  }
  await course.destroy();
  // if status is set to 204 'no-content', send() will not send a res to client
  return res.status(204).send();
}));

module.exports = router;
