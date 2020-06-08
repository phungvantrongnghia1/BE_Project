const s3 = require('../../public/database/s3.config');
module.exports.doUpload = async (req, res) => {
    console.log('req.file', req.files)
    const s3Client = s3.s3Client;
    const file = [req.files.file[0], req.files.image[0]];
    console.log('file', file)
    file.map((item) => {
        console.log('item', item)
        const params = s3.uploadParams;

        params.Key = Date.now() + '-' + Math.round(Math.random() * 1E9) + item.originalname;
        params.Body = item.buffer;
        s3Client.upload(params, (err, data) => {
            if (err) {
                console.log('error', err)
                return;
            }
            // res.json({ message: 'File uploaded successfully! -> keyname = ' + req.file.originalname });
            console.log('req.file', data)
        });
    })
    // Đã upload multifile được rồi mà còn update
    // Làm thế nào cập nhật từng thần ?? Chất xóa nó rồi update cái mới lên lại
    // Xóa nó nữa 
    // Làm thế nào để view được 
}