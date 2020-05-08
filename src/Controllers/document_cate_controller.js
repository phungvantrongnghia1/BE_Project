const { selectData, deleteData, updateData, insertData } = require("../../public/database/mysql_db");
const { validDocumentCategory } = require("../utils/validatation");
module.exports.get_document_cate = async (req, res) => {
    selectData('category_documents', {
        filteringConditions: [
        ]
    }).then(data => {
        if (Object.entries(data).length !== 0) return res.status(200).json({
            status_code: 200,
            message: "Get list document category is success",
            data: data
        })
        return res.status(401).json({
            status_code: 401,
            message: "Get list document category is fail"
        })
    })
}
module.exports.create_document_cate = async (req, res) => {
    const { error } = validDocumentCategory(req.body);
    if (error) return res.status(400).send(error.details[0].message)
    insertData('category_documents', [
        { ...req.body }
    ]).then(insertedId => {
        selectData('category_documents', {
            filteringConditions: [
                ['Id', '=', insertedId]
            ]
        }).then(data => {
            if (Object.entries(data).length !== 0) return res.status(200).json({
                status_code: 200,
                message: "Create document category is success",
                data: data
            })
            return res.status(401).json({
                status_code: 401,
                message: "Create document category is fail"
            })
        })
    })
}
module.exports.update_document_cate =  async (req, res) => {
    let dataUpdate = { ...req.body };
    delete dataUpdate.Id;
    updateData('category_documents', {
        fields: dataUpdate,
        filteringConditions: [
            ['Id', '=', req.body.Id]
        ]
    })
        .then(updateData => {
            if (updateData) {
                selectData('category_documents', {
                    filteringConditions: [
                        ['Id', '=', req.body.Id]
                    ]
                }).then(data => {
                    return res.status(200).json({
                        status_code: 200,
                        message: "Update document category is success",
                        data: data
                    })
                })
            }
            else {
                return res.status(401).json({
                    status_code: 401,
                    message: "Document category is not exits!"
                })
            }
        })
}
module.exports.delete_document_cate =  async (req, res) => {
    selectData('category_documents', {
        filteringConditions: [
            ['Id', '=', req.params.id]
        ]
    })
        .then(data => {
            if (Object.entries(data).length !== 0) {
                deleteData("category_documents", {
                    filteringConditions: [
                        ['Id', '=', req.params.id]
                    ]
                }).then(deleteData => {
                    if (deleteData) return res.status(200).json({
                        status_code: 200,
                        message: "Delete document category is success",
                        data: data
                    })
                    return res.status(401).json({
                        status_code: 401,
                        message: "Delete document category is fail"
                    })
                })
            }
            else {
                return res.status(401).json({
                    status_code: 401,
                    message: "Document category id is not exits!"
                })
            }
        })
}