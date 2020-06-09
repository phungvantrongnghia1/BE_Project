const { selectData, deleteData, updateData, insertData } = require("../../public/database/mysql_db");
const { removeFile, upload } = require("../utils/file");
const s3 = require('../../public/database/s3.config');

module.exports.getList = async (req, res) => {
    const list = await selectData('documents', {
        filteringConditions: [
            ['UserId', '=', req.user.id]
        ]
    })
    return res.status(200).json({
        status_code: 200,
        message: "Get list document is successfull",
        data: list
    })
}

module.exports.getDetail = async (req, res) => {
    const list = await selectData('documents', {
        filteringConditions: [
            ['Id', '=', req.params.id]
        ]
    })
    const user = await selectData('user', {
        filteringConditions: [
            ['Id', '=', list[0].UserId]
        ]
    })
    delete user[0].Password;
    return res.status(200).json({
        status_code: 200,
        message: "Get document detail is successfull",
        data: { ...list[0], user: { ...user[0] } }
    })
}


module.exports.getListByID = async (req, res) => {
    const list = await selectData('documents', {
        filteringConditions: [
            ['Id', '=', req.params.id]
        ]
    })
    if (list.length === 0) return res.status(401).json({
        status_code: 401,
        message: "ID is not exits!"
    })
    return res.status(200).json({
        status_code: 200,
        message: "Get list document is successfull",
        data: list
    })
}
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
const deletefile = async (keyFile) => {
    const s3Client = s3.s3Client;
    const params = s3.deleteParams;
    params.Key = keyFile
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
module.exports.create = async (req, res) => {
    const category = await selectData('category_documents', {
        filteringConditions: [
            ['Id', '=', req.body.CategoryDocumentId]
        ]
    })
    if (category.length === 0) return res.status(401).json({
        status_code: 401,
        message: "CategoryDocumentId is not exits!"
    })
    const file = [req.files.file[0], req.files.image[0]];
    let fileResult = await uploadfile(file[0], 'application/pdf');
    let imageResult = await uploadfile(file[1], 'image/png');
    let documentNew = { ...req.body };
    documentNew.File = JSON.stringify({
        url: fileResult.key,
        fileName: fileResult.key
    })
    documentNew.Image = JSON.stringify({
        url: imageResult.key,
        fileName: imageResult.key
    })
    documentNew.UserId = req.user.id;
    const newDocument = await insertData('documents', [
        { ...documentNew }
    ])
    return res.status(200).json({
        status_code: 200,
        message: "Create document is success",
        data: documentNew
    })
}
module.exports.update = async (req, res) => {
    // Check ID insite login auth token
    let dataUpdate = { ...req.body };
    delete dataUpdate.Id;
    const document = await selectData('documents', {
        filteringConditions: [
            ['Id', '=', req.body.Id],
            ['UserId', '=', 4]
        ]
    })
    if (document.length === 0) return res.status(401).json({
        status_code: 401,
        message: "Id is not exits!"
    })
    if (req.body.CategoryDocumentId) {
        const category = await selectData('category_documents', {
            filteringConditions: [
                ['Id', '=', req.body.CategoryDocumentId]
            ]
        })

        if (category.length === 0) return res.status(401).json({
            status_code: 401,
            message: "CategoryDocumentId is not exits!"
        })
    }
    if (Object.entries(req.files).length !== 0) {
        if (req.files.file) {
            let path = JSON.parse(document[0].File).url;
            deletefile(path)
            let fileResult = await uploadfile(req.files.file[0], 'application/pdf');
            dataUpdate.File = JSON.stringify({
                url: fileResult.key,
                fileName: fileResult.key
            })


        }
        if (req.files.image) {
            let path = JSON.parse(document[0].Image).url;
            deletefile(path)
            let imageResult = await uploadfile(req.files.image[0], 'image/png');
            dataUpdate.Image = JSON.stringify({
                url: imageResult.key,
                fileName: imageResult.key

            })

        }
    }
    updateData('documents', {
        fields: dataUpdate,
        filteringConditions: [
            ['Id', '=', req.body.Id]
        ]
    })
        .then(updateData => {
            if (updateData) {
                selectData('documents', {
                    filteringConditions: [
                        ['Id', '=', req.body.Id]
                    ]
                }).then(data => {
                    return res.status(200).json({
                        status_code: 200,
                        message: "Update document is success",
                        data: data
                    })
                })
            }
            else {
                return res.status(200).json({
                    status_code: 404,
                    message: "Document is not exits!"
                })
            }
        })
}
module.exports.delete_document = async (req, res) => {
    const documentDelete = await selectData('documents', {
        filteringConditions: [
            ['Id', '=', req.params.id]
        ]
    })
    if (documentDelete.length === 0) return res.status(200).json({
        status_code: 401,
        message: "ID is not exits!"
    })
    let pathFile = "public" + JSON.parse(documentDelete[0].File).url;
    let pathImage = "public" + JSON.parse(documentDelete[0].Image).url;
    removeFile(pathFile);
    removeFile(pathImage);
    const deleteDoc = await deleteData("documents", {
        filteringConditions: [
            ['Id', '=', req.params.id]
        ]
    })
    return res.status(200).json({
        status_code: 200,
        message: "Delete document is successfull",
        data: documentDelete
    })
}
module.exports.get_category = async (req, res) => {
    try {
        const list = await selectData('category_documents', {
            filteringConditions: [
            ]
        })
        res.status(200).json({
            status_code: 200,
            message: "Get list category is success",
            data: list
        })
    } catch (err) {
        res.status(404).send(err.message);
    }
}