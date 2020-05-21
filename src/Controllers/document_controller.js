const { selectData, deleteData, updateData, insertData } = require("../../public/database/mysql_db");
const { removeFile, upload } = require("../utils/file");

module.exports.getList = async (req, res) => {
    const list = await selectData('documents', {
        filteringConditions: [
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
module.exports.create = async (req, res) => {
    const user = await selectData('user', {
        filteringConditions: [
            ['Id', '=', req.body.UserId]
        ]
    })
    const category = await selectData('category_documents', {
        filteringConditions: [
            ['Id', '=', req.body.CategoryDocumentId]
        ]
    })
    if (user.length === 0) return res.status(401).json({
        status_code: 401,
        message: "UserId is not exits!"
    })
    if (category.length === 0) return res.status(401).json({
        status_code: 401,
        message: "CategoryDocumentId is not exits!"
    })
    let documentNew = { ...req.body };
    documentNew.File = JSON.stringify({
        url: `/file/${req.files[0].filename}`
    })
    documentNew.Image = JSON.stringify({
        url: `/file/${req.files[1].filename}`
    })
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
    let dataUpdate = { ...req.body };
    if (req.body.UserId) return res.status(401).json({
        status_code: 401,
        message: "Incorrect data format!"
    })
    delete dataUpdate.Id;
    const document = await selectData('documents', {
        filteringConditions: [
            ['Id', '=', req.body.Id]
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
    if (req.file) {
        dataUpdate.File = JSON.stringify({
            url: req.file.path
        })
        let path = JSON.parse(document[0].File);
        removeFile(path.url)
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
                return res.status(401).json({
                    status_code: 401,
                    message: "Document is not exits!"
                })
            }
        })
}
module.exports.delete_document = async (req, res) => {
    console.log(req.params);
    const documentDelete = await selectData('documents', {
        filteringConditions: [
            ['Id', '=', req.params.id]
        ]
    })
    if (documentDelete.length === 0) return res.status(401).json({
        status_code: 401,
        message: "ID is not exits!"
    })
    let path = JSON.parse(documentDelete[0].File);
    removeFile(path.url);
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