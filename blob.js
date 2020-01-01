// Azure blob strorage이용을 위해 필요한 클래스들 임포트
const {
    StorageSharedKeyCredential,
    BlobServiceClient
    } = require('@azure/storage-blob');
const {AbortController} = require('@azure/abort-controller');

// 파일시스템 이용을 위한 모듈들
const fs = require("fs"); //파일시스템모듈
const path = require("path"); //Blob storage로 파일을 업로드할 때, 절대경로 설정을 위해 필요한 모듈

// production모드가 아닐 때 dotenv모듈을 통해 환경변수 읽어들인다.
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// env파일에 기록된 Azure storage정보들을 가져온다.
const STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const ACCOUNT_ACCESS_KEY = process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY;

//업로드할 때 파일사이즈 계산을 위한 상수들
const ONE_MEGABYTE = 1024 * 1024;
const FOUR_MEGABYTES = 4 * ONE_MEGABYTE;
const ONE_MINUTE = 60 * 1000; //Aborter클래스는 타임아웃을 관리하는데, 타임아웃 길이가 얼마나 될지 나타내는 상수

exports.showContainerNames = async (aborter, blobServiceClient) =>{
    let iter = await blobServiceClient.listContainers(aborter);
    for await (const container of iter) {
      console.log(` - ${container.name}`);
    }
}

//로컬 파일을 업로드하는 함수정의
exports.uploadLocalFile = async function (aborter, containerClient, filePath) {
    filePath = path.resolve(filePath);

    const fileName = path.basename(filePath);

    const blobClient = containerClient.getBlobClient(fileName);
    const blockBlobClient = blobClient.getBlockBlobClient();

    return await blockBlobClient.uploadFile(filePath,aborter);
}

exports.uploadStream = async function (aborter, containerClient, filePath) {
    filePath = path.resolve(filePath);

    const fileName = path.basename(filePath).replace('.md', '-stream.md');

    const blobClient = containerClient.getBlobClient(fileName);
    const blockBlobClient = blobClient.getBlockBlobClient();

    const stream = fs.createReadStream(filePath, {
      highWaterMark: FOUR_MEGABYTES,
    });

    const uploadOptions = {
        bufferSize: FOUR_MEGABYTES,
        maxBuffers: 5,
    };

    return await blockBlobClient.uploadStream(
                    stream, 
                    uploadOptions.bufferSize, 
                    uploadOptions.maxBuffers,
                    aborter);
}

exports.showBlobNames = async function (aborter, containerClient) {

    let iter = await containerClient.listBlobsFlat(aborter);
    for await (const blob of iter) {
      console.log(` - ${blob.name}`);
    }
}

// [Node.js only] A helper method used to read a Node.js readable stream into string
exports.streamToString = async function (readableStream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      readableStream.on("data", (data) => {
        chunks.push(data.toString());
      });
      readableStream.on("end", () => {
        resolve(chunks.join(""));
      });
      readableStream.on("error", reject);
    });
}

exports.downloadBlob = async (path) =>{
     //다운로드함수는 stream으로 리턴된다.
     const downloadResponse = await blockBlobClient.download(0,aborter);
     const downloadedContent = await streamToString(downloadResponse.readableStreamBody); //읽을 수 있는 스트링으로 변환한다.
 
     console.log(`Downloaded blob content: "${downloadedContent}"`);
}

exports.execute = async function () {

    const containerName = "img_items";
    const blobName = "quickstart.txt";
    const content = "Hello Node SDK";
    const localFilePath = "../readme.md";

    //요청 파이프라인에 storage account credential들을 감싸 제공하는 역할
    const credentials = new StorageSharedKeyCredential(STORAGE_ACCOUNT_NAME, ACCOUNT_ACCESS_KEY);

    const blobServiceClient = new BlobServiceClient(`https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,credentials);

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);
    const blockBlobClient = blobClient.getBlockBlobClient();
    
    const aborter = AbortController.timeout(30 * ONE_MINUTE);

    await containerClient.create();
    console.log(`Container: "${containerName}" is created`);

    console.log("Containers:");
    await showContainerNames(aborter, blobServiceClient);
    
    await blockBlobClient.upload(content, content.length, aborter);
    console.log(`Blob "${blobName}" is uploaded`);
    
    //로컬파일을 업로드하는 함수 호출
    await uploadLocalFile(aborter, containerClient, localFilePath);
    console.log(`Local file "${localFilePath}" is uploaded`);

    await uploadStream(aborter, containerClient, localFilePath);
    console.log(`Local file "${localFilePath}" is uploaded as a stream`);

    console.log(`Blobs in "${containerName}" container:`);

    await showBlobNames(aborter, containerClient);

    //다운로드함수는 stream으로 리턴된다.
    const downloadResponse = await blockBlobClient.download(0,aborter);
    const downloadedContent = await streamToString(downloadResponse.readableStreamBody); //읽을 수 있는 스트링으로 변환한다.

    console.log(`Downloaded blob content: "${downloadedContent}"`);

    //blob을 삭제하는 함수
    await blockBlobClient.delete(aborter);
    console.log(`Block blob "${blobName}" is deleted`);
    
    //container를 삭제하는 함수
    await containerClient.delete(aborter);
    console.log(`Container "${containerName}" is deleted`);
}

// execute().then(() => console.log("Done")).catch((e) => console.log(e));