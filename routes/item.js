var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Item = require('../schemas/item');

const { checkObjectId } = require('./middlewares');

router.get('/', function (req, res, next) {
  // User.find({})
  //   .then((users) => {
  //     res.render('mongoose', { users });
  //   })
  //   .catch((err) => {
  //     console.error(err);
  //     next(err);
  //   });
});

//특정유저의 리스트 불러오기
router.get('/list/:id', checkObjectId, async function(req, res, next) {
    const { id } = req.params;
    
    //만약 string이 확실히 ObjectId인데 ObjectId로 넘어오지 않는다면.. 근데 이거 쓸필요없음. 미들웨어에서 어차피 못통과함. ㅋ.
//   const uid = mongoose.Types.ObjectId(id);

    //앞으로 해야할것. 내가 아닐경우 공개 리스트만 불러오기
    //나일경우 전부 불러오기
    try{
        let items = await Item.find( {userId : id} ).sort({createdAt: -1}).exec();
        if(!items){
            res.json({
                code: 404,
                msg: '조회 결과가 없습니다.',
            })
            return;
        }
        res.json({
            code: 200,
            msg: '아이템 조회 완료',
            items
        });
    }catch(e) {
        console.error(e);
    }
    
    
});

//itemList.vue의 items에 넣을 내용
router.get('/list/', async function(req, res, next) {
    try{
        let items = await Item.find().sort({createdAt: -1}).exec();
        res.json({
            code: 200,
            msg: '아이템 조회 완료',
            items
        });
    }catch(e) {
        console.error(e);
    }
});

//detail:id
//itemDetail.vue의 각 페이지 item에 들어갈 내용
router.get('/detail/:id', function(req, res, next){
    Item.findOne({ _id: req.params.id }).populate('categoryId')
    .then(item=>{
        res.json(item)
    })
    .catch(e=>{
        console.error(e);
        next(e);
    })
});

//modify:id
//itemModify.vue의 각 페이지 item에 들어갈 내용
router.get('/modify/:id', function(req, res, next){
    Item.findOne({ _id: req.params.id }).populate('categoryId')
    .then(item=>{
        res.json(item)
    })
    .catch(e=>{
        console.error(e);
        next(e);
    })
});

//modify:id
//itemModify.vue에서 변경된 내용 DB에 수정반영하기
router.patch('/modify/:id', async function(req, res, next){
    console.log('patch\n');
    //카테고리는 나중에 구현
    console.log('ppp'+req.body);
    try{
        const { id } = req.params;
        //findByIdAndUpdate는 조건식 주지 않고, id값만 첫번재 파라미터로 주면, 해당 객체를 반환해준다.
        const item = await Item.findByIdAndUpdate(id, req.body, {new: true}).exec();
        //new:true를 설정해야 업데이트 된 객체를 반환
        //설정하지 않으면 업데이트 되기 전의 객체를 반환
        console.log(item);
        res.status(201).json({
            code: 200,
            msg: '아이템 수정 성공',
            item
        });
    }catch(e){
        console.error(e);
        next(e);
    }
});

//detail페이지에서 삭제 누르면 실행되는 컨트롤러
router.delete('/detail/:id', function(req, res, next){
    const { id } = req.params;
    (async()=>{
        try{
            await Item.findByIdAndRemove(id).exec();
            try{
                const items = await Item.find().exec();
                res.json({
                    code: 200,
                    msg: '아이템 삭제 성공',
                    items
                })
            }catch(e){
                console.error(e);
                next(e);
            }   
        }catch(e){
            console.error(e);
            next(e); 
        }
        
    })();
})

//itemAdd.vue에서 생성된 내용 DB에 저장하기
router.post('/add', function(req, res, next){
    console.log(req.body);
    //카테고리는 나중에 구현
    let item = new Item(req.body);
    console.log(item);
    (async()=>{
        try {
            await item.save();
            let items =[];
            try {
                //저장 후 아이템 리스트로 가게 된다. 가기 전 아이템 리스트 업데이트가 필요하다.
                //새로운 아이템 리스트를 반환한다.
                items = await Item.find().exec();
                res.json({
                    code: 200,
                    msg: '아이템 저장성공',
                    items
                })
            } catch (e) {
                console.error(e);
            }
        } catch (e) {
            console.error(e);
            next(e);
        }
    })();
});



module.exports = router;