//테스트용 더미데이터 만드는 임시 파일
var express = require('express');
var router = express.Router();

var User = require('../schemas/user');
var Item = require('../schemas/item');

//각 유저에게 아이템 10개씩 생성 call
//생성 후 주석처리.
router.get('/', async(req,res,next)=>{
    try{
        let users = await User.find().exec();
        console.log(users.length);
        let visibleTo = true;
        for(var j=0;j<users.length;j++){
            for(var i=0;i<10;i++){
                let itemName = users[j].userId+'-'+'아이템 '+(i+1);
                let userId = users[j]._id;
                visibleTo = !visibleTo;
                let newItem = {
                    itemName,
                    userId,
                    visibleTo
                }
                console.log(newItem);
                let item = await new Item(newItem);
                
                await item.save();
            }
        }
        let items = await Item.find().exec();
        res.json(items);
    }catch(e){
        console.error(e);
    }
   
});
//프로필 사진 임시로 추가
router.get('/photo', async(req,res,next)=>{
    try {
        let users = await User.find().exec();
        console.log(users.length);
        for(var i=0; i< users.length;i++){
            const id = users[i]._id;
            if(i<9){
                users[i].profileImgPath = '/assets/samples/avatar-0'+(i+1)+'.jpg';
            }else{
                users[i].profileImgPath = '/assets/samples/avatar-'+(i+1)+'.jpg';
            }
            const user = await User.findByIdAndUpdate(id, users[i], {new: true}).exec();
            console.log('여기',user);
        }
    } catch (e) {
        console.error(e);
    }
})
module.exports = router;