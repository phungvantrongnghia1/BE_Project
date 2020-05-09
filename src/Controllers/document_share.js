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
module.exports.share_document = async (req, res) => {
    let result = [];
    // const document = await selectData('documents', {
    //     filteringConditions: [
    //         ['Id', '=', req.body.id]
    //     ]
    // })
    // if (document.length === 0) return res.status(401).json({
    //     status_code: 401,
    //     message: "Document id is not exits!"
    // })
    console.log(req.body.userShare);
    // let temp = req.body.userShare.split(',')
    // let arrQueRyUser = req.body.userShare.map(item => )
    // const user = await selectData('user', {
    //     filteringConditions: [
    //         ['Id', '=', req.params.id]
    //     ]
    // })
    // Input data ID_Document,[]: User shared
    // const list = await selectData('user', {
    //     filteringConditions: [
    //         ['Email', '=', 'nghia@gmail.com']
    //     ]
    // })
    const Knex = knex();

    // console.log("Data >>", list);
    // Knex('user')
    //     .select("*")
    //     .where('user.Id', req.body.userShare)
    //     .then(data =>
    //         // JSON.parse(JSON.stringify(data))
    //         console.log(data)
    //     )
    let userShare = await Knex.select('Id', 'FullName').from('user')
        .whereIn('Email', [...req.body.userShare])
    let idUser = userShare.map(item => item.Id)
    console.log(userShare);
    console.log(userShare[0].Id);
    console.log("ID >>", idUser);

    session.run(`MATCH (d:user) WHERE d.id IN [${[...idUser]}]  RETURN d `).then(result => {
        let userExits = result.records.map(item => ({ id: item._fields[0].properties.id.low, fullName: item._fields[0].properties.fullName }))
        let userNotExits = userShare.filter(item => userExits.find(i => i.id !== item.Id));
        // session.run(`FOREACH (props IN [...userNotExits]| 
        //     CREATE ({ a:props.a,b:props.b }))`).then(result => {})
        // Tạo các node chưa tồn tại 
        // Tạo relationship của document với các node user

    })
    // session.run(`MATCH (d:document_share {id:${req.body.id} }) RETURN d `).then(async result => {
    //     // console.log(result)
    //     // console.log(result.records);
    //     if (result.records.length === 0) {
    //         session.run(`CREATE (d:document_share{id: ${req.body.id},title:${document[0].Title}}) RETURN d  `).then(data => {
    //             console.log("length:>>", data.records[0].length);
    //             console.log("data >>", data.records[0]);
    //             if (data.records[0].length !== 1)
    //                 return res.status('405').json({
    //                     status_code: 405,
    //                     message: "System error!"
    //                 })
    //         })
    //     }
    // }
    // )


    // Get được list user được chia sẻ
    // Kiểm tra coi có document đó chưa nếu chưa có thì tạo node mới
    // Nếu có rồi thì tạo re




















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
    // const dataAld = session.run("MATCH (Ind:user {id: 1})<-[: share]-(n) RETURN n ").then(data => console.log(data.records))
    res.send("Share document");
}