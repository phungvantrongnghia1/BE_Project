const { selectData, knex } = require("../../public/database/mysql_db");
const { get_docs_share, getNode, createNode, deleteNode, deleteAllRelationShipNode, deleteRelationShipNode } = require('../Modules/document_share');
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
module.exports.dele_user_shared = async (req, res) => {
    let user = await getNode('user', req.body.Id);
    if (user.records.length === 0) return res.status(401).json({
        status_code: 404,
        message: "User is not exits!"
    })
    await deleteRelationShipNode('user', 'document_share', req.body.Id, req.body.Id_document, 'share');
    let rsUser = await get_docs_share('user', req.body.Id, 'share', 'document_share');
    if (rsUser.records.length === 0) {
        await deleteNode('user', req.body.Id)
    }
    res.status(200).json({
        status_code: 200,
        message: "Delete relationship is success",
        data: { Id_user: req.body.Id }
    })
}
module.exports.delete_docs_share = async (req, res) => {
    let rsNode = await get_docs_share('document_share', req.body.Id, 'share', 'user');
    let userSh = rsNode.records.map(item => item._fields[1].properties);
    await deleteAllRelationShipNode('document_share', req.body.Id, 'share');
    userSh.map(async item => {
        let rsUser = await get_docs_share('user', item.Id.low, 'share', 'document_share');
        if (rsUser.records.length === 0) {
            await deleteNode('user', item.Id.low)
        }
    })
    await deleteNode('document_share', req.body.Id)
    res.status(200).json({
        status_code: 200,
        message: "Delete document is success",
        data: { Id: req.body.Id }
    })
}
