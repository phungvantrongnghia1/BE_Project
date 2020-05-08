const { selectData, deleteData, updateData, insertData } = require("../../public/database/mysql_db");
const { removeFile, upload } = require("../utils/file");
const driverNeo4j = require('../../public/database/neo4j');
let session = driverNeo4j.session();
module.exports.share_document = async (req, res) => {
    // Input data ID_User, ID_Document,[]: User shared
    console.log(req.body);
    // const list = await selectData('documents', {
    //     filteringConditions: [
    //         ['Id', '=', req.body.Id]
    //     ]
    // })
    // if (list.length === 0) return res.status(401).json({
    //     status_code: 401,
    //     message: "ID is not exits!"
    // })
    // Lấy tất cả các tài liệu được chia sẽ cho user theo ID
    // Truy xuất đến user coi có hk
    // 
    // const data = session.run('MATCH(n:user) return n').then(result => {
    //     result.records.forEach(item => console.log(item._fields[0].properties))
    // })
    const dataAld = session.run("MATCH (Ind:user {id: 1})<-[: share]-(n) RETURN n ").then(data => console.log(data.records))
res.send("Share document");
}