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
    session.run(`MATCH (Ind:user {Id: ${req.params.id}})<-[: share]-(n) RETURN n `).then(data => {
        data.records.forEach(e => result.push(e._fields[0].properties)
        )
        res.status(200).json({
            status_code: 200,
            message: "Get document share success",
            data: result
        })
    })

}
/*
*  Share_document được dùng cho người dùng share tài liệu của người dùng tải lên
* Input : Id document share, array user được share
*/
const checkDocsExit = async (data) => {
    const document = await selectData('documents', {
        filteringConditions: [
            ['Id', '=', data]
        ]
    })
    return document;
}
module.exports.share_document = async (req, res) => {
    const document = await checkDocsExit(req.body.id);
    if (document.length === 0) return res.status(401).json({
        status_code: 401,
        message: "Document id is not exits!"
    })
    const Knex = knex();
    let userShare = await Knex.select('Id', 'FullName').from('user') // Get user from email
        .whereIn('Email', [...req.body.userShare])
    let idUser = userShare.map(item => item.Id) // Get Id user
    let documentNode = await getNode('document_share', req.body.id); // check document exit in neo4j
    let rsUser = await session.run(`MATCH (d:user) WHERE d.Id IN [${[...idUser]}]  RETURN d `); // Get users exits in neo4j
    //  filer user exits
    let userExits = rsUser.records.map(item => ({ Id: item._fields[0].properties.Id.low, FullName: item._fields[0].properties.FullName }))
    //  filer user not exits
    let userNotExits = userShare.filter(item => userExits.findIndex(a => a.Id === item.Id) === - 1 ? item : "");
    let docShare = await get_docs_share('document_share', req.body.id, 'share', 'user');
    //  Get all relationship of docshare if docs exits
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
/*
 * Derection_share được dùng cho người dùng chia sẻ tài liệu từ tài liệu được chia sẽ cho người dùng
 * Input : Id document share, array user share
 * B1: Check document exits; bỏ qua
 * B2: Create relationship derection_share from user to doc_share
 * B3: Create relationship share from doc_share to user share note add property for relationship{Id_share:Id_User share}
 * B4: Done ! sent response to client success !
 */
module.exports.derection_share = async (req, res) => {
    const Knex = knex();
    const document = await checkDocsExit(req.body.Id);
    if (document.length === 0) return res.status(401).json({
        status_code: 401,
        message: "Document id is not exits!"
    })
    const user = await selectData('user', {
        filteringConditions: [
            ['Id', '=', req.body.id_user]
        ]
    })
    if (user.length === 0) return res.status(401).json({
        status_code: 401,
        message: "ID user is not exits!"
    })
    let userShare = await Knex.select('Id', 'FullName').from('user') // Get user from email
        .whereIn('Email', [...req.body.userShare])
    let idUser = userShare.map(item => item.Id) // Get Id user
    let documentNode = await getNode('document_share', req.body.Id); // check document exit in neo4j
    let rsUser = await session.run(`MATCH (d:user) WHERE d.Id IN [${[...idUser]}]  RETURN d `); // Get users exits in neo4j
    //  filer user exits
    let userExits = rsUser.records.map(item => ({ Id: item._fields[0].properties.Id.low, FullName: item._fields[0].properties.FullName }))
    //  filer user not exits
    let userNotExits = userShare.filter(item => userExits.findIndex(a => a.Id === item.Id) === - 1 ? item : "");
    let docShare = await get_docs_share('document_share', req.body.Id, 'share', 'user');
    //  Get all relationship of docshare if docs exits
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
    let userNode = [...idUser, ...temp];
    let ses = driverNeo4j.session();    
    setTimeout(() => {
        ses.run(`MATCH (a:document_share {Id: ${document[0].Id}}), (b:user {Id:${req.body.id_user}})  MERGE (b)-[r:derect_share]->(a) return a,b`).then(result => {
            ses.run(`MATCH (a:document_share {Id: ${document[0].Id}}), (b:user) WHERE b.Id IN [${[...userNode]}] MERGE (a)-[r:share {id_share:${req.body.id_user}}]->(b) return a,b`).then(result => {
                res.status(200).json({
                    status_code: 200,
                    message: "Share is success"
                })
            })
        })
    }, 2000)
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
