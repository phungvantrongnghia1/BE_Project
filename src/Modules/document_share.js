const driverNeo4j = require('../../public/database/neo4j');
module.exports.get_docs_share = async (tableName, Id, rela, tableName2) => {
    let ss = driverNeo4j.session();
    let rs = await ss.run(`MATCH (n1:${tableName} {Id:${Id}})-[:${rela}]-(o:${tableName2})RETURN n1, o`);
    return rs;
}

module.exports.getNode = async (tableName, Id) => {
    let ss = driverNeo4j.session();
    let rs = await ss.run(`MATCH (a:${tableName} {Id:${Id}})return a`);
    return rs;
}
module.exports.createNode = async (tableName, data) => {
    let ss = driverNeo4j.session();
    let rs = await ss.run(`CREATE (:${tableName} {Id:${data.Id},FullName:"${data.FullName}"})`)
    return rs;
}
module.exports.deleteNode = async (tableName, Id) => {
    let ss = driverNeo4j.session();
    let rs = await ss.run(`MATCH (a:${tableName} {Id:${Id}}) DETACH DELETE a`);
    return rs;
}
module.exports.deleteAllRelationShipNode = async (tableName, Id, relate) => {
    let ss = driverNeo4j.session();
    let rs = await ss.run(`MATCH (p:${tableName} {Id:${Id}}) MATCH (p)-[r:${relate}]-() DELETE r`);
    return rs;
}
module.exports.deleteRelationShipNode = async (tableName1, tableName2, Id1, Id2, relate) => {
    let ss = driverNeo4j.session();
    let rs = await ss.run(`MATCH (p:${tableName1} {Id:${Id1}}) MATCH (p)-[r:${relate}]-(q:${tableName2} {Id:${Id2}}) DELETE r return p`);
    return rs;
}