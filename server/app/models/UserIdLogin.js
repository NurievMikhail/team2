'use strict';

const { makeModel } = require('hruhru');
const userIdLoginScheme = require('../schemes/userIdLoginScheme');

module.exports = makeModel(userIdLoginScheme, 'allUsers', true);
