var express = require('express');
var router = express.Router();

var User = require('../schemas/category');

router.get('/', function (req, res, next) {
  // User.find({})
  //   .then((users) => {
  //     res.render('mongoose', { users });
  //   })
  //   .catch((err) => {
  //     console.error(err);
  //     next(err);
  //   });
});

module.exports = router;