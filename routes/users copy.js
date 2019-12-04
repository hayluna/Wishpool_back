var express = require('express');
var router = express.Router();
const bcrpyt =require('bcrypt');
// const jwt = require('jsonwebtoken');
// const { verifyToken } = require('./middlewares'); 

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
router.post('/entry',(req,res,next)=> {
  // 기존에 가입된 회원인지 확인(나중에 처리)



// 미가입 상태일 경우 신규회원 가입 처리
// 비밀번호 암호화 처리
  const hash = bcrpyt.hash(req.body.password,12,(err,hash)=>{
    if(err){
      console.log('hasherr');
    }else if(hash){
      console.log('hash~');
    }
  });


  const user = new User({

    userName:req.body.userName,
    userId:req.body.userId,
    password:hash,
    // password:req.body.password,
    email:req.body.email,
    phone:req.body.phone,
    nickName:req.body.nickName,
    birth:req.body.birth, 
    entryType:req.body.entryType,

  });
  user.save()
    .then(function(result){
      console.log(result);
      res.status(200).json(result);

    })
    .catch(function (err) {
      console.error(err);
      next(err); 
    });
});

// 로그인 처리
router.post('/login',(req,res,next)=>{
  // 아이디가 존재하는지 DB에서 확인
  const exitUser = User.findOne({"userId":req.body.userId});

  User.findOne({userId:req.body.userId},function(err,user){
    // 에러발생 처리
      if(err){
        console.error('에러발생');
        next(err);
      }
    // 일치하는 사용자가 있을 경우
      if(user){
        console.log('가입된사용자');
        // 비밀번호가 일치하는지 확인
        // 콜백함수에서 err은 error, 그 뒤는 결과에 해당하는 객체
        User.findOne({password:req.body.password},function(err,pwd){
            if(err){
              console.log('비번찾다 에러발생');
              next(err);
            }
          // 비번이 일치할 경우 
            if(pwd){
              console.log('id,pwd일치');

            }else{
            // 비번이 일치하지 않을 경우  
              console.log('불일치');


            }

        });
        // 일치하는 사용자가 없을 경우
      }else if(!user){
        console.log('미등록 사용자');
      }


    })



  // if(exitUser){
  //   console.log('있음');
  // }else{
    
  //   console.log('없음');
  // }

});





// 비밀번호 수정




// 회원탈퇴





module.exports = router;