const driverNeo4j = require('../../public/database/neo4j');
module.exports.get_docs_share = async (tableName, Id, rela, tableName2) => {
    let ss = driverNeo4j.session();
    let rs = await ss.run(`MATCH (n1:${tableName} {Id:${Id}})-[:${rela}]-(o:${tableName2})RETURN n1, o`);
    return rs;
}
module.exports.get_docs_share_property = async (tableName, Id, rela, tableName2, id_share) => {
    let ss = driverNeo4j.session();
    let rs = await ss.run(`MATCH (n1:${tableName} {Id:${Id}})-[:${rela} {Id_share:${id_share}}]-(o:${tableName2})RETURN n1, o`);
    return rs;
}
module.exports.get_docs_share_id = async (tableName, Id, rela, tableName2, Id2) => {
    let ss = driverNeo4j.session();
    let rs = await ss.run(`MATCH (n1:${tableName} {Id:${Id}})-[:${rela}]-(o:${tableName2} {Id:${Id2}})RETURN n1, o`);
    return rs;
}
module.exports.getNode = async (tableName, Id) => {
    let ss = driverNeo4j.session();
    let rs = await ss.run(`MATCH (a:${tableName} {Id:${Id}})return a`);
    return rs;
}
module.exports.createNode = async (tableName, data) => {
    let ss = driverNeo4j.session();
    let rs = await ss.run(`CREATE (:${tableName} {Id:${data.Id}})`)
    return rs;
}
module.exports.createArrRelateToNode = async (tableName1, tableName2, array, Id, Id_relate) => {
    console.log(array);
    let ss = driverNeo4j.session();
    let rs = await ss.run(`MATCH(a:${tableName1}),(b:${tableName2})
    WHERE a.Id IN [${array}] and b.Id = ${Id}
   create (a)<-[r:share {Id_share:${Id_relate}}]-(b)
   return a`);
    return rs;
}
module.exports.createMultipleNode = async (tableName, array) => {
    let ss = driverNeo4j.session();
    let rs = await ss.run(`FOREACH (a IN [${array}] |
        create (b:${tableName} {Id:a}))`);
    return rs;
}
module.exports.deleteNode = async (tableName, Id) => {
    let ss = driverNeo4j.session();
    let rs = await ss.run(`MATCH (a:${tableName} {Id:${Id}}) DETACH DELETE a`);
    return rs;
}
module.exports.deleteArrayNode = async (tableName, array) => {
    let ss = driverNeo4j.session();
    let rs = await ss.run(`MATCH (a:${tableName})
    WHERE a.Id IN [${array}]
     DETACH DELETE a`);
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
module.exports.deleteArrayNodeRelationship = async (tableName1, tableName2, array, Id, relate) => {

    let ss = driverNeo4j.session();
    let rs = await ss.run(` MATCH (d:${tableName1}) WHERE d.Id IN [${array}]
    MATCH (d)-[r:${relate}]-(q:${tableName2} {Id:${Id}}) DELETE r 
    return d,q`);
    return rs;
}