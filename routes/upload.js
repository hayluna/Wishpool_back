var express = require('express');
var router = express.Router();
const multer = require('multer')
const inMemoryStorage = multer.memoryStorage();
const singleFileUpload = multer({ storage: inMemoryStorage });
const azureStorage = require('azure-storage');
const getStream = require('into-stream');
var Item = require('../schemas/item');

 
uploadFileToBlob = async (directoryPath, file) => {
 
    return new Promise((resolve, reject) => {
 
        const blobName = getBlobName(file.originalname);
        const stream = getStream(file.buffer);
        const streamLength = file.buffer.length;
        const blobService = azureStorage.createBlobService(process.env.AZURE_STORAGE_ACCOUNT_NAME, process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY); 
        
        console.log(directoryPath);
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
 
router.post('/item', singleFileUpload.single('thumbnail'), async(req, res, next) => {
    try {
        const image = await uploadFileToBlob('items', req.file); // images is a directory in the Azure container
        return res.json({
            code:200,
            msg: '사진 blob에 업로드 완료',
            image
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
