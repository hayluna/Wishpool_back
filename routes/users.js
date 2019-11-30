var express = require('express');
var router = express.Router();

var User = require('../schemas/user');

router.get('/', (req,res,next)=>{
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
  
  const user = new User({

    userName:req.body.userName,
    userId:req.body.userId,
    password:req.body.password,
    email:req.body.email,
    phone:req.body.phone,
    nickName:req.body.nickName,
    birth:req.body.birth, 
    entryType:req.body.entryType,

  });
  user.save()
    .then(function(result){
      console.log(result);
      // 200으로 테스트(교재는 201)
      res.status(200).json(result);

    })
    .catch(function (err) {
      console.error(err);
      next(err); 
    });
});






module.exports = router;