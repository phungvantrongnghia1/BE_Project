const { selectData, deleteData, updateData, insertData } = require("../../public/database/mysql_db");
const { removeFile, upload } = require("../utils/file");

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
    const category = await selectData('category_documents', {
        filteringConditions: [
            ['Id', '=', req.body.CategoryDocumentId]
        ]
    })
    if (category.length === 0) return res.status(401).json({
        status_code: 401,
        message: "CategoryDocumentId is not exits!"
    })
    let documentNew = { ...req.body };
    documentNew.File = JSON.stringify({
        url: `/file/${req.files.file[0].filename}`,
        fileName: req.files.file[0].filename
    })
    documentNew.Image = JSON.stringify({
        url: `/file/${req.files.image[0].filename}`,
        fileName: req.files.image[0].filename
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
            ['UserId', '=', req.user.id]
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
            dataUpdate.File = JSON.stringify({
                url: `/file/${req.files.file[0].filename}`,
                fileName: req.files.file[0].filename
            })
            let path = "public/" + JSON.parse(document[0].File).url;
            removeFile(path)
        }
        if (req.files.image) {
            dataUpdate.Image = JSON.stringify({
                url: `/file/${req.files.image[0].filename}`,
                fileName: req.files.image[0].filename

            })
            let path = "public/" + JSON.parse(document[0].Image).url;
            removeFile(path)
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
                return res.status(401).json({
                    status_code: 401,
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