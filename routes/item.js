var express = require('express');
var router = express.Router();
var Item = require('../schemas/item');

const { checkObjectId } = require('./middlewares');

//이미지 업로드용 모듈
const multer = require('multer')
const inMemoryStorage = multer.memoryStorage();
const singleFileUpload = multer({ storage: inMemoryStorage });
const azureStorage = require('azure-storage');
const getStream = require('into-stream');


// production모드가 아닐 때 dotenv모듈을 통해 환경변수 읽어들인다.
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
//blob관련 클래스
const blobService = azureStorage.createBlobService(process.env.AZURE_STORAGE_ACCOUNT_NAME, process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY); 

//이미지 업로드용 함수들
uploadFileToBlob = async (directoryPath, file) => {
 
    return new Promise((resolve, reject) => {
 
        const blobName = getBlobName(file.originalname);
        const stream = getStream(file.buffer);
        const streamLength = file.buffer.length;
        // const blobService = azureStorage.createBlobService(process.env.AZURE_STORAGE_ACCOUNT_NAME, process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY); 
        blobService.createBlockBlobFromStream('images', `${directoryPath}/${blobName}`, stream, streamLength, err => {
            if (err) {
                reject(err);
            } else {
                resolve({ filename: blobName, 
                    originalname: file.originalname, 
                    size: streamLength, 
                    path: `images/${directoryPath}/${blobName}`,
                    url: `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/images/${directoryPath}/${blobName}` });
            }
        });
 
    });
 
};
 
const getBlobName = originalName => {
    const identifier = Math.random().toString().replace(/0\./, ''); // remove "0." from start of string
    return `${identifier}-${originalName}`;
};

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
//특정유저의 리스트 불러오기
router.get('/othersList/:id', checkObjectId, async function(req, res, next) {
    const { id } = req.params;
    try{
        let items = await Item.find( {userId : id, visibleTo:'public'} ).sort({createdAt: -1}).exec();
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
//detail:id
//itemDetail.vue의 각 페이지 item에 들어갈 내용
router.get('/detail/:id', async function(req, res, next){
    try{
        const res = await Item.findOne({ _id: req.params.id });
        res.json({
            code: 200,
            msg: '아이템 조회성공',
            item
        })
    }catch(e){
        console.error(e);
        next(e);
    }
});

router.patch('/toggle/:id', async function(req, res, next){
    try{
        const { id } = req.params;
        await Item.findByIdAndUpdate(id, req.body, {new: true}).exec();
        // const items = await Item.find( {userId:req.body.userId}).sort({createdAt: -1}).exec();
        res.json({
            code: 200,
            msg: '아이템 수정 성공',
            // items
        });
    }catch(e){
        console.error(e);
        next(e);
    }
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
router.patch('/modify/:id', singleFileUpload.single('thumbnail'), async function(req, res, next){
    let image = null;
    try{
        if(req.file){
            image = await uploadFileToBlob('items', req.file); // images is a directory in the Azure container
        }
    }catch (error) {
        console.error(error);
    }
    if(image){
       req.body.itemImgPath = image.url; 
       req.body.itemImgName = image.filename;
    }
   if(req.body.itemPrice == 'null'){
       req.body.itemPrice = '';
   }
    try{
        const { id } = req.params;
        const test = await Item.findByIdAndUpdate(id, req.body, {new: true}).exec();
        await blobService.deleteBlobIfExists('images', `items/${req.body.prevImgName}`,function(error, result){
            if(error){
                console.error('blob삭제 실패');
            }else{
                // console.log('blob 삭제 성공')
            }
        });
        res.json({
            code: 200,
            msg: '아이템 수정 성공',
        });
    }catch(e){
        console.error(e);
        next(e);
    }
});


//detail페이지에서 삭제 누르면 실행되는 컨트롤러
router.delete('/detail/:id', async function(req, res, next){
    const { id } = req.params;
    (async()=>{
        try{
            await Item.findByIdAndRemove({_id:id}, function(err, docs){
                blobService.deleteBlobIfExists('images', `items/${docs.itemImgName}`,function(error, result){
                    if(error){
                        console.error('blob삭제 실패');
                    }else{
                        // console.log('blob 삭제 성공')
                    }
                })
            });
            res.json({code:200, msg:'아이템삭제성공'});
        }catch(e){
            console.error(e);
            next(e); 
        }
        
    })();
    
})
//detail페이지에서 삭제 누르면 실행되는 컨트롤러
router.patch('/delete/:id', async function(req, res, next){
    const { id } = req.params;
    (async()=>{
        try{
            await Item.findByIdAndRemove({_id:id});
            await blobService.deleteBlobIfExists('images', `items/${req.body.itemImgName}`,function(error, result){
                if(error){
                    console.error('blob삭제 실패');
                }else{
                    // console.log('blob 삭제 성공')
                }
            })
            // const items = await Item.find({userId:req.body.userId}).sort({createdAt: -1}).exec();
            res.json({
                code:200, 
                msg:'아이템삭제성공',
                // items
            });
        }catch(e){
            console.error(e);
            next(e); 
        }
        
    })();
    
})
//프로필에서 해당유저의 아이템 갯수 호출하는 API
router.get('/count/:id', async(req, res, next)=>{
    const { id } = req.params;
    try{
        let count = await Item.find({userId:id}).count();
        if(count){
            res.json({
                code: 200,
                msg: '아이템 갯수 조회 성공',
                count
            });
        }else{
            res.json({
                code: 50,
                msg: '아이템 갯수 조회 실패'
            })
        }
    }catch(e){
        console.error(e);
    }
})

//itemAdd.vue에서 생성된 내용 DB에 저장하기
router.post('/insert/:id', singleFileUpload.single('thumbnail'), async function(req, res, next){
    const { id } = req.params;
    let image = null;
    try{
        if(req.file){
            image = await uploadFileToBlob('items', req.file); // images is a directory in the Azure container
        }
    }catch (error) {
        console.error(error);
    }
    if(image){
       req.body.itemImgPath = image.url; 
       req.body.itemImgName = image.filename;
    // }else{
    //     let rand = Math.floor(Math.random() * 22)+1;
    //     if(rand<10){
    //         rand = '0'+rand+'.jpg';
    //     }else if(rand<12){
    //         rand= rand+'.jpg';
    //     }else{
    //         rand=rand+'.png';
    //     }
    //     req.body.itemImgPath = '/assets/samples/avatar-'+rand;
    }
   
    let item = new Item(req.body);
    // console.log(item);
    (async()=>{
        try {
            await item.save();
            try {
                res.json({
                    code: 200,
                    msg: '아이템 저장성공',
                    // items
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