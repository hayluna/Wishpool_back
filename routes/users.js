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
  
  // 아이디가 존재하는지 DB에서 확인하여 User객체를 불러옴
  // Java 때와는 달리 리턴값은 User객체이다
  // 이 바로 아래 코드로는 Object라고만 나오지 user객체의 정보는 안 보임
  // const exitUser = User.findOne({"userId":req.body.userId});

  // 이런식으로 불러온 후 콜백 함수를 작성해서 처리해야 한다
  // user가 바로 찾아온 user객체. user의 정보를 볼 수가 있다
  User.findOne({userId:req.body.userId},function(err,user){
    // 에러발생 처리
      if(err){
        console.error('에러발생');
        next(err);
      }
    // 일치하는 사용자가 있을 경우
      if(user){
        console.log('가입된사용자');
        console.log('user정보:'+ user);

        // 비밀번호가 일치하는지 확인하기
        // compareSync()는 암호화 된 비번과 입력된 비번을 비교
        // 리턴값은 boolean
        const comparePwd = bcrypt.compareSync(req.body.password,user.password);
          if(comparePwd){
            console.log('일치여부'+ comparePwd);

            // 비번이 일치하므로 토큰 발행
            // 토큰에는 무슨 정보를 넣을까(비번,전화번호,이메일 빼고 전부??)
            
            const token = jwt.sign({
              userId:user.userId,
              nickName:user.nickName
            },process.env.JWT_SECRET,{
              expiresIn: '1m',
              issuer:'wishlist'
            });

            console.log(token);
            // 발행한 토큰을 클라이언트에게 전송(클라이언트는 로그인되면 토큰 수령)
            // res.json으로 응답 보내는건 한 번만 해야 한다.****
            // 한 번 보내는 응답에 응답 코드를 2번 이상 작성하면 에러발생
            // [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
            // for문을 쓸 때도 주의하기(여러개가 따로따로 날아가면 안 된다. 반드시 묶어서 날리기)
            return res.json({ code:200, result:token});
            
            
          }else{
            console.log('불일치' + comparePwd);
          }
        
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