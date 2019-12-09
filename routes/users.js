var express = require('express');
var router = express.Router();
const bcrypt =require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('./middlewares'); 

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
// 가입하자마자 로그인 되도록 처리
router.post('/entry',(req,res,next)=> {
  // 기존에 가입된 회원인지 확인(나중에 처리)


  // 단방향 해쉬 암호화(해독불가)
  const hash = bcrypt.hashSync(req.body.password,12);
  
  // 미가입 상태일 경우 신규회원 가입 처리
  const user = new User({

    userName:req.body.userName,
    userId:req.body.userId,
    password:hash,
    email:req.body.email,
    phone:req.body.phone,
    nickName:req.body.nickName,
    birth:req.body.birth, 
    entryType:req.body.entryType,

  });
  user.save()
    .then(function(result){
      console.log(result);

      // 회원 가입과 동시에 로그인하게끔 처리
      const token = jwt.sign({
        userId:user.userId,
      },process.env.JWT_SECRET,{
        expiresIn: '1d',
        issuer:'wishlist'
      });

      
      return res.json({ code:200, result:token});
    })
    .catch(function (err) {
      console.error(err);
      next(err); 
    });
});

// 로그인 처리
router.post('/login',(req,res,next)=>{
  
  User.findOne({userId:req.body.userId,userState:true},function(err,user){
    // 에러발생 처리
      if(err){
        console.error('에러발생');
        next(err);
      }
    // 일치하는 사용자가 있을 경우
      if(user){
        const comparePwd = bcrypt.compareSync(req.body.password,user.password);
          if(comparePwd){
            
            const token = jwt.sign({
              userId:user.userId,
            },process.env.JWT_SECRET,{
              expiresIn: '1d',
              issuer:'wishlist'
            });

            console.log(token);
            return res.json({ code:200, result:token});
            
          }else{
            console.log('불일치' + comparePwd);
            return res.json({code:500,message:'암호가 일치하지 않습니다'});
          }
        
        // 일치하는 사용자가 없을 경우
      }else if(!user){
        console.log('미등록 사용자');
        return res.json({code:500,message:'등록된 사용자가 아닙니다'});
      }
    })
});

// 회원 정보 조회
router.get('/profile',verifyToken,(req,res)=>{
  const userId = req.decoded.userId;
    console.log('호출');
    User.findOne({
      userId:userId
    },(err,user)=>{
      if(err){
        console.error('에러발생');
        return res.status(500).json({code:500,message:'서버에러'});
      }

      if(user){
        console.log(user);
        return res.json({code:200,result:user});
      }else{
        return res.json({code:500,message:'유효하지 않은 회원입니다'});
      }
    })
} )

// 로그아웃
router.get('/logout',verifyToken,(req,res)=>{
  console.log('호출');
  console.log(req.decoded);
  const userId = req.decoded.userId;

    User.findOne({
      userId:userId
    },(err,user)=>{
      
      if(err){
        console.error('에러발생');
        return res.status(500).json({code:500,message:'서버에러'});
      }
      return res.json({code:200,result:'로그아웃'});
    })
  }
)

// 비밀번호 수정(이메일에서 호출)
router.patch('/resetPwd',verifyToken,(req,res)=>{
  console.log('호출' + req.decoded);
  const newPassword = req.body.password;
  const email = req.decoded.email;
  console.log('email=' + email);
  User.update(
    {email:email},{password:newPassword},(err,user)=>{
      if(err){
        console.error(err);
      }
      console.log('비밀번호 변경 완료');
      return res.json({code:200,result:'비밀번호 변경 완료'});
    })
})



// 회원탈퇴
router.patch('/deleteAccount',verifyToken,(req,res)=>{
  const userId = req.decoded.userId;
    User.update(
      {userId:userId},{userState:false},(err,user)=>{
          if(err){
            console.error(err);
          }
          console.log(userId + '님이 탈퇴하셨습니다.');
          return res.json({code:200,result:'탈퇴 완료'});

      })
  
   })

module.exports = router;
