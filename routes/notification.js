var express = require('express');
var router = express.Router();

// const { verifyToken } = require('./middlewares'); 
// const { checkObjectId } = require('./middlewares'); 

var User = require('../schemas/user');
var Noti = require('../schemas/notification');

router.get('/list/:id', async(req, res, next)=>{
    const { id } = req.params;
    try {
        const notis = await Noti.find({to:id}).exec();
        if(notis){
            res.json({
                code: 200,
                msg: 'noti 목록 조회 성공',
                notis
            });
        }
    } catch (e) {
        console.error(e);
        next(e);
    }
});

router.post('/follow/:id', async(req, res, next)=>{
    const { me, other } = req.body;
    //DB알림목록에 저장
    const newNoti = {
        type: 'noti-follow',
        from: me.nickname,
        fromObjectId: me._id,
        to: other._id,
        profileImgPath: me.profileImgPath,
        profileImgName : me.profileImgName,
        haveRead: false,
    };
    let noti = new Noti(newNoti);
    (async()=>{
        try {
            await noti.save();
            res.json({
                code: 200,
                msg: '새로운 노티 생성 완료'
            })
        } catch (e) {
            console.error(e);
            next(e);
        }
    })();
});

router.patch('/toggle', async(req, res, next)=>{
    req.body.forEach(async(noti)=>{
        try {
            await Noti.findByIdAndUpdate(noti._id, noti, {new:true});
        } catch (e) {
            console.error(e);
        }
    });
    res.json({
        code: 200,
        msg: 'noti 읽음처리 성공',
        notiList:req.body
    })
});

module.exports = router;