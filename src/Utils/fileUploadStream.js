const aws = require('aws-sdk');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const s3 = new aws.S3(
    {
        accessKeyId: 'AKIA5BRN3AJEU32LTO6B',
        secretAccessKey: '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',
        region: 'ap-south-1',
    },
);
const ImagesOrIconBucketName = 'akpl-tpf-products';

const awsStorageUploadImageOrIcons = async (file) => {
    let urlLink = '';

    const uploadParams = { Bucket: ImagesOrIconBucketName, Key: '', Body: '' };

    const fileStream = fs.createReadStream(file.filepath);
    fileStream.on('error', (error) => {
        console.log(error)
    });

    uploadParams.Body = fileStream;
    uploadParams.Key = path.basename(`${file.filepath}_${file.originalFilename}`);

    // call S3 to retrieve upload file to specified bucket
    urlLink = await s3.upload(uploadParams).promise();

    // console.log(urlLink);
    return  urlLink.Location
};

module.exports = {
    awsStorageUploadImageOrIcons,
};
