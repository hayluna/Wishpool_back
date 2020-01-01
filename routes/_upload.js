// production모드가 아닐 때 dotenv모듈을 통해 환경변수 읽어들인다.
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
  }

  // Azure blob strorage이용을 위해 필요한 클래스들 임포트
  const {
    BlobServiceClient,
    StorageSharedKeyCredential,
    newPipeline
  } = require('@azure/storage-blob');
  
  const express = require('express');
  const router = express.Router();
  var User = require('../schemas/user');
  var Item = require('../schemas/item');
//   const containerName1 = 'thumbnails';

  const multer = require('multer');
  const inMemoryStorage = multer.memoryStorage();
  const uploadStrategy = multer({ storage: inMemoryStorage }).single('image');
  
  const getStream = require('into-stream');
  
//   const containerName2 = 'images';
  
  //업로드할 때 파일사이즈 계산을 위한 상수
  const ONE_MEGABYTE = 1024 * 1024;
  const uploadOptions = { bufferSize: 4 * ONE_MEGABYTE, maxBuffers: 20 };
  const ONE_MINUTE = 60 * 1000; //Aborter클래스는 타임아웃을 관리하는데, 타임아웃 길이가 얼마나 될지 나타내는 상수
  
  //요청 파이프라인에 storage account credential들을 감싸 제공하는 역할
  // env파일에 기록된 Azure storage정보들을 가져온다.
  const sharedKeyCredential = new StorageSharedKeyCredential(
    process.env.AZURE_STORAGE_ACCOUNT_NAME,
    process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY);
  const pipeline = newPipeline(sharedKeyCredential);
  
  const blobServiceClient = new BlobServiceClient(
    `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
    pipeline
  );
  
  const getBlobName = originalName => {
    // Use a random number to generate a unique file name, 
    // removing "0." from the start of the string.
    const identifier = Math.random().toString().replace(/0\./, '');
    return `${identifier}-${originalName}`;
  };
  
//   router.get('/', async (req, res, next) => {
  
//     let viewData;
  
//     try {
//       const containerClient = blobServiceClient.getContainerClient(containerName1);
//       const listBlobsResponse = await containerClient.listBlobFlatSegment();
  
//       for await (const blob of listBlobsResponse.segment.blobItems) {
//         console.log(`Blob: ${blob.name}`);
//       }
  
//       viewData = {
//         title: 'Home',
//         viewName: 'index',
//         accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
//         containerName: containerName1
//       };
  
//       if (listBlobsResponse.segment.blobItems.length) {
//         viewData.thumbnails = listBlobsResponse.segment.blobItems;
//       }
//     } catch (err) {
//       viewData = {
//         title: 'Error',
//         viewName: 'error',
//         message: 'There was an error contacting the blob storage container.',
//         error: err
//       };
//       res.status(500);
//     } finally {
//       res.render(viewData.viewName, viewData);
//     }
//   });
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

  router.patch('/item/:id', uploadStrategy, async (req, res) => {
    const blobName = getBlobName(req.file.originalname);
    const stream = getStream(req.file.buffer);
    const containerClient = blobServiceClient.getContainerClient('img_items');;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
    try {
        const { id } = req.params;
        //req.file.buffer에 담긴 이미지를 blob으로 저장
      await blockBlobClient.uploadStream(stream,
        uploadOptions.bufferSize, uploadOptions.maxBuffers,
        { blobHTTPHeaders: { blobContentType: "image/jpeg" } });
        //저장 후 경로를 DB에 저장 후 응답객체에 보내기
        const item = await Item.findByIdAndUpdate(id, {itemImgPath:`https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`+'/img_items/'+blobName+'.jpg'})
        res.json({
            code: 200,
            msg:'아이템 이미지 저장 성공',
            item
        })
    } catch (err) {
      res.render('error', { message: err.message });
    }
  });
  router.post('/item', uploadStrategy, async (req, res) => {
    const blobName = getBlobName(req.file.originalname);
    const stream = getStream(req.file.buffer);
    const containerClient = blobServiceClient.getContainerClient('img_items');;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
    try {
      await blockBlobClient.uploadStream(stream,
        uploadOptions.bufferSize, uploadOptions.maxBuffers,
        { blobHTTPHeaders: { blobContentType: "image/*" } });
        //저장 후 경로를 응답객체에 보내기
        res.json({
            code: 200,
            msg:'아이템 이미지 저장 성공',
            url
        })
    } catch (err) {
      res.render('error', { message: err.message });
    }
  });
  module.exports = router;