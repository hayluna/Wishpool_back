const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post("/mail", function(req, res, next){
  let email = req.body.email;

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
    text: 'That was easy!'  // 내용
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    }
    else {
      console.log('Email sent: ' + info.response);
    }
  });

  res.redirect("/");
})

module.exports = router;