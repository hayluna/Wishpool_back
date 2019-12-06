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
// 비밀번호 암호화 처리
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
<<<<<<< HEAD
              expiresIn: '60m',
=======
              expiresIn: '100m',
>>>>>>> 16b38b92c375f1e974a310ffa97af1b8c11416a7
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
//회원 프로파일 openapi가 호출되면 미들웨어모듈의 
//토큰 유효성 검사 공통모듈을 먼저수행하고 내부 데이터조회
//기능이 수행된다.




// middleware.js에서 작성한 verifyToken을 가지고 토큰에서
// 정보를 추출 후, req.decode에 담아 놓은 상태

router.get('/register',verifyToken,(req,res)=>{
  console.log(req.decoded);
  const userId = req.decoded.userId;

// 반드시 DB를 조회하는 코드의 콜백함수에서 실행해야만 한다
//  강사님 코드처럼 작성할 경우에는 에러 발생(mongoose 때문?)
  
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