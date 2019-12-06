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
router.post('/entry',async (req,res,next)=> {
  // 기존에 가입된 회원인지 확인(나중에 처리)





  // 미가입 상태일 경우 신규회원 가입 처리
  const hash = bcrypt.hashSync(req.body.password,12);


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
      res.json({ code: 200, result: '가입성공' });

    })
    .catch(function (err) {
      console.error(err);
      next(err); 
    });
});

// 로그인 처리
router.post('/login',(req,res,next)=>{
  
  User.findOne({userId:req.body.userId},function(err,user){
    // 에러발생 처리
      if(err){
        console.error('에러발생');
        next(err);
      }
    // 일치하는 사용자가 있을 경우
      if(user){

        const comparePwd = bcrypt.compareSync(req.body.password,user.password);
          if(comparePwd){
            
            // usrId,nickName을 토큰에 담는다
            const token = jwt.sign({
              userId:user.userId,
              nickName:user.nickName
            },process.env.JWT_SECRET,{
              expiresIn: '100m',
              issuer:'wishlist'
            });

            console.log(token);
            return res.json({ code:200, result:token});
            
            
          }else{
            console.log('불일치' + comparePwd);
          }
        
        // 일치하는 사용자가 없을 경우
      }else if(!user){
        console.log('미등록 사용자');
      }


    })
});

// 회원 정보 조회

router.get('/register',verifyToken,(req,res)=>{
  console.log(req.decoded);
  const userId = req.decoded.userId;

    const userData = User.findOne({
      userId:userId
    },(err,user)=>{
      
      if(err){
        console.error('에러발생');
        return res.status(500).json({code:500,message:'서버에러'});
      }

      console.log('user정보:' + userData);
      console.log('real user정보:' + user);
      return res.json({code:200,result:user});
    })
    
  }

)




// 비밀번호 수정




// 회원탈퇴





module.exports = router;