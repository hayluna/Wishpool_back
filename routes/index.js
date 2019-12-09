const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { verifyToken } = require('./middlewares');

// 이메일 전송 테스트용 
router.post("/mail", function(req, res, next){
  let email = req.body.email;

  const token = jwt.sign({
    email:email,
  },process.env.JWT_SECRET,{
    expiresIn: '3h',
    issuer:'wishlist'
  });
  
  // 이메일 발송 객체를 생성
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'wishlistunicorn@gmail.com',  // wishlist 이메일 계정
      pass: 'unicornstore'          // wishlist 이메일 계정의 비밀번호(나중에 빼기)
    }
  });
  
  let mailOptions = {
    from: 'wishlistunicorn@gmail.com',    // 발송 메일 주소 (위에서 작성한 gmail 계정 아이디)
    to: email ,                     // 수신 메일 주소
    subject: 'wishlist 회원 비밀번호 변경',   // 제목
    html: '<p>아래의 링크를 클릭해주세요 !</p>' +
      "<a href='http://localhost:8080/#/user/auth/" + token +"'>인증하기</a>"
  };
  // 메일을 발송
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    }
    else {
      console.log('Email sent: ' + info.response);
      return res.json({code:200,result:'비밀번호 재설정 메일 전송'});
    }
  });

})

module.exports = router;