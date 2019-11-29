var express = require('express');
var router = express.Router();

var User = require('../schemas/user');

// router.get('/', function (req, res, next) {
  // User.find({})
  //   .then((users) => {
  //     res.render('mongoose', { users });
  //   })
  //   .catch((err) => {
  //     console.error(err);
  //     next(err);
  //   });

  // 

// });

router.get('/', (req,res,next)=>{

  // User.find()
  //  .then((users)=>{
  //    res.json(users);
  //  })
  //  .error((err)=>{
  //    console.error(err);
  //    next(err);
  //  })
  User.find({})
  .then((users) => {
    res.json(users);
  })
  .catch((err) => {
    console.error(err);
    next(err);
  });
});  

// 회원가입
router.post('/',(req,res,next)=> {
  
  User.create({
    userId: req.body.userId,
    userName:req.body.userName,
    email:req.body.email,
    password:req.body.password,
    phone:req.body.phone,
    nickName:req.body.nickName,
    birth:req.body.birth, // 여기까지 확인
    entryType:req.body.entryType,

  })




});






module.exports = router;