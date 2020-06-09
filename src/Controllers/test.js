const s3 = require('../../public/database/s3.config');
const env = require('../../public/database/s3.env.js');
const uploadfile = async (file, type) => {
    const s3Client = s3.s3Client;
    const params = s3.uploadParams;
    params.Key = Date.now() + '-' + Math.round(Math.random() * 1E9) + file.originalname;
    params.Body = file.buffer;
    params.ContentType = type;
    let s3UploadPromise = new Promise(function (resolve, reject) {
        s3Client.upload(params, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        })
    });
    return s3UploadPromise;
}
module.exports.doUpload = async (req, res) => {
    // console.log('req.file', req.files)
    // const s3Client = s3.s3Client;
    const file = [req.files.file[0], req.files.image[0]];
    // console.log('file', file)
    let fileResult = await uploadfile(file[0], 'application/pdf');
    console.log('fileResult', fileResult)
    // uploadfile(file[1],'image/png');
    // for (let i = 0; i < 2; i++) {
    //     const paramsFile = s3.uploadParams;
    //     paramsFile.Key = Date.now() + '-' + Math.round(Math.random() * 1E9) + file[0].originalname;
    //     paramsFile.Body = file[0].buffer;
    //     paramsFile.ContentType = 'application/pdf'
    // }
    // file.map((item) => {
    //     console.log('item', item)
    //     const params = s3.uploadParams;

    //     params.Key = Date.now() + '-' + Math.round(Math.random() * 1E9) + item.originalname;
    //     params.Body = item.buffer;
    //     s3Client.upload(params, (err, data) => {
    //         if (err) {
    //             console.log('error', err)
    //             return;
    //         }
    //         // res.json({ message: 'File uploaded successfully! -> keyname = ' + req.file.originalname });
    //         console.log('req.file', data)
    //     });
    // })
    // Đã upload multifile được rồi mà còn update
    // Làm thế nào cập nhật từng thần ?? Chất xóa nó rồi update cái mới lên lại
    // Xóa nó nữa 
    // Làm thế nào để view được 
}
const deletefile = async () => {
    const s3Client = s3.s3Client;
    const params = s3.deleteParams;
    params.Key = "1591720507148-225768898Home Test - Software Developer (Frontend).pdf"
    try {
        await s3Client.headObject(params).promise()
        console.log("File Found in S3")
        try {
            await s3Client.deleteObject(params).promise()
            console.log("file deleted Successfully")
        }
        catch (err) {
             console.log("ERROR in file Deleting : " + JSON.stringify(err))
        }
    } catch (err) {
            console.log("File not Found ERROR : " + err.code)
    }
}
module.exports.getfile = async (req, res) => {
   deletefile();
 
}

/*
 * Các mục đã làm thêm, update
 * Các mục chưa làm update, get url public cho client sử dụng được
 * update nhá :v
 * 
 */