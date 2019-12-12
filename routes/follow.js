
var express = require('express');
var router = express.Router();

// const { verifyToken } = require('./middlewares'); 
// const { checkObjectId } = require('./middlewares'); 

var User = require('../schemas/user');

//(혜은) follow리스트 조회용
router.get('/list/:id', async(req,res,next)=>{
    const { id } = req.params;
    console.log('팔로우 목록조회', id);
    try {
      let populated = await User.findById(id).populate('followingId').populate('followerId');
      let user = await User.findById(id);
      console.log('제발여22', populated);
      console.log('잠좀', user);
      if(user){
        res.json({
          code: 200,
          msg: '회원 및 팔로우 정보 조회 성공',
          populated,
          user
        });
      }else{
        res.json({
          code: 503, //내가 만든 커스텀 코드번호. 팔로우/팔로잉 내역이 없을 때 사용.
          msg: '팔로우/팔로잉 내역이 없습니다.',
        })
      }
    } catch (e) {
        console.error(e);
        next(e)
    }
  })

  router.get('/searchId', async(req,res,next)=>{
    const { searchQuery, id } = req.query; 
    //searchQuery값으로 찾는다. id는 내 아이디이다.
    try {
      console.log(id);
      //$ne : not equal, 나는 제외한다.
      let matchUsers = await User.find({userId: {$regex : '.*'+searchQuery+'.*'}, _id: {$ne: id}}).populate('followingId').populate('followerId');
        if(matchUsers.length != 0){
            console.log(matchUsers);
            res.json({
                code: 200,
                msg: '일치하는 사용자를 찾았습니다',
                matchUsers
            });
        }else{
            res.json({
                code: 503,
                msg: '일치하는 사용자가 없습니다.'
            })
        }
    } catch (e) {
        console.error(e);
    }
  });

  router.get('/searchPhone', async(req,res,next)=>{
    const { searchQuery, id } = req.query;
  //id값으로 찾고, 있으면 리턴, 없으면
  console.log('search', id);
  try {
      let matchUsers = await User.find({phone: {$regex : '.*'+searchQuery+'.*'}, _id: {$ne: id}}).populate('followingId').populate('followerId').exec();
      if(matchUsers.length != 0){
          console.log(matchUsers);
          res.json({
              code: 200,
              msg: '일치하는 사용자를 찾았습니다',
              matchUsers
          });
      }else{
          res.json({
              code: 503,
              msg: '일치하는 사용자가 없습니다.'
          })
      }
  } catch (e) {
      console.error(e);
  }

});

router.patch('/add/:id', async function(req, res, next){
  //:id : 내가 팔로우하려는 아디
  //req.body : 나의 유저객체
  try{
      //내 팔로잉 목록이 갱신된 객체로 덮어쓰기
      const { id } = req.params;
      const { user, followUser } = req.body; //프론트에서 넘어온 갱신된 유저 객체들
      
      //내가 팔로잉하는 상대의 팔로워목록이 갱신된 객체로 덮어쓰기
      const followingUser = await User.findByIdAndUpdate(followUser._id, followUser, {new:true}).exec();
      const newUser = await User.findByIdAndUpdate(user._id, user, {new:true}).exec();
      //new:true를 설정해야 업데이트 된 객체를 반환
      //설정하지 않으면 업데이트 되기 전의 객체를 반환
      console.log('1', newUser);
      console.log('2', followingUser);
      
      let populated = await User.findById(id).populate('followingId').populate('followerId').exec();
      
      if(newUser&&populated&&followingUser){
        res.status(201).json({
          code: 200,
          msg: '팔로우 수정 성공',
          populated,
          newUser,
        });
      }else{
        res.json({
          code: 503,
          msg: '찾는 사용자가 없습니다.',
        })
      }
  }catch(e){
      console.error(e);
      next(e);
  }
});

  module.exports = router;