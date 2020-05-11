const { selectData, deleteData, updateData, insertData, knex } = require("../../public/database/mysql_db");
const { removeFile, upload } = require("../utils/file");

const driverNeo4j = require('../../public/database/neo4j');
let session = driverNeo4j.session();
module.exports.get_docs_share = async (req, res) => {
    let result = [];
    const user = await selectData('user', {
        filteringConditions: [
            ['Id', '=', req.params.id]
        ]
    })
    if (user.length === 0) return res.status(401).json({
        status_code: 401,
        message: "ID is not exits!"
    })
    session.run(`MATCH (Ind:user {id: ${req.params.id}})<-[: share]-(n) RETURN n `).then(data => {
        data.records.forEach(e => result.push(e._fields[0].properties)
        )
        res.status(200).json({
            status_code: 200,
            message: "Get document share success",
            data: result
        })
    })

}
const get_docs_share = async (tableName, Id, rela, tableName2) => {
    let ss = driverNeo4j.session();
    let rs = await ss.run(`MATCH (n1:${tableName} {Id:${Id}})-[:${rela}]-(o:${tableName2})RETURN n1, o`);
    return rs;
}
const getNode = async (tableName, Id) => {
    let ss = driverNeo4j.session();
    let rs = await ss.run(`MATCH (a:${tableName} {Id:${Id}})return a`);
    return rs;
}
const createNode = async (tableName, data) => {
    let ss = driverNeo4j.session();
    let rs = await ss.run(`CREATE (:${tableName} {Id:${data.Id},FullName:"${data.FullName}"})`)
    return rs;
}
module.exports.share_document = async (req, res) => {
    const document = await selectData('documents', {
        filteringConditions: [
            ['Id', '=', req.body.id]
        ]
    })
    if (document.length === 0) return res.status(401).json({
        status_code: 401,
        message: "Document id is not exits!"
    })
    const Knex = knex();
    let userShare = await Knex.select('Id', 'FullName').from('user')
        .whereIn('Email', [...req.body.userShare])
    let idUser = userShare.map(item => item.Id)
    let documentNode = await getNode('document_share', req.body.id);
    let rsUser = await session.run(`MATCH (d:user) WHERE d.Id IN [${[...idUser]}]  RETURN d `);
    let userExits = rsUser.records.map(item => ({ Id: item._fields[0].properties.Id.low, FullName: item._fields[0].properties.FullName }))
    let userNotExits = userShare.filter(item => userExits.findIndex(a => a.Id === item.Id) === - 1 ? item : "");
    let docShare = await get_docs_share('document_share', req.body.id, 'share', 'user');
    let rsRelationShipOfNode = docShare.records.map(item => item._fields[1].properties.Id.low);
    let temp = idUser.filter(item => rsRelationShipOfNode.findIndex(i => i === item) === -1 ? item : "");
    if (userExits.length === 0) {
        userShare.map(async item => {
            let rs = await createNode('user', { Id: item.Id, FullName: item.FullName })
        })
    }
    else {
        if (userNotExits.length !== 0) {
            userNotExits.map(async item => {
                let rs = await createNode('user', { Id: item.Id, FullName: item.FullName })
                console.log("dsada", rs);
            })
        }
    }
    let ss = driverNeo4j.session();
    if (documentNode.records.length === 0) {
        let rs = await session.run(`CREATE (a:document_share {Id:${document[0].Id},Fullname:${document[0].Title}})return a`);
        if (rs.records.length === 0) return res.status(401).json({
            status_code: 401,
            message: "Share document is faild!"
        })
        let ses = driverNeo4j.session();
        let userNode = [...idUser, ...temp];
        setTimeout(() => {
            ses.run(`MATCH (a:document_share {Id: ${document[0].Id}}), (b:user) WHERE b.Id IN [${[...userNode]}] MERGE (a)-[r:share]->(b) return a,b`).then(result => {
            })
        }, 2000)
    }
    else {
        let userNode = [...userNotExits.map(item => item.Id), ...temp];
        setTimeout(() => {
            session.run(`MATCH (a:document_share {Id: ${document[0].Id}}), (b:user) WHERE b.Id IN [${[...userNode]}] MERGE (a)-[r:share]->(b) return a,b`).then(result => {
            })
        }, 2000)

    }
    res.send("Share document");
}
const deleteNode = async (tableName, Id) => {
    let ss = driverNeo4j.session();
    let rs = await ss.run(`MATCH (a:${tableName} {Id:${Id}}) DETACH DELETE a`);
    return rs;
}
const deleteRelationShipNode = async (tableName, Id, relate) => {
    let ss = driverNeo4j.session();
    let rs = await ss.run(`MATCH (p:${tableName} {Id:${Id}}) MATCH (p)-[r:${relate}]-() DELETE r`);
    return rs;
}
module.exports.dele_user_shared = async (req, res) => {
    let delRe = await deleteRelationShipNode('user', 7, 'share');
    let docs = await get_docs_share('user', 7, 'share', 'document_share');
    console.log("delete >>", delRe);
    if (docs.records.length === 0) {
        let delNode = await deleteNode('user', 7)
        console.log("delNode >>", delNode);
    }
    console.log("docs >>>", docs);
    console.log(docs.records.length);
    // Xóa user được chia sẻ tài liệu
    // Input : [array user] , Id Document
    //  get ID của arr User 
    //  Delete relationship của arr user với DocsShare
    // Check node user empty relationship => delete node user
}
module.exports.delete_docs_share = async (req, res) => {
    // Delete docs share
    // Input Id docs
    // Get các node có relation với docs
    // xóa tất cả quan hệ của docs và xóa docs
    // Check từng node empty relationship => delete node
}
