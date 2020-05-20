const { selectData, knex } = require("../../public/database/mysql_db");
const {
  get_docs_share,
  getNode,
  createNode,
  deleteNode,
  deleteAllRelationShipNode,
  deleteRelationShipNode,
  deleteArrayNodeRelationship,
  deleteArrayNode,
  createArrRelateToNode,
  createMultipleNode,
  get_docs_share_id,
  get_docs_share_property,
} = require("../Modules/document_share");
const driverNeo4j = require("../../public/database/neo4j");
let session = driverNeo4j.session();
module.exports.get_docs_share = async (req, res) => {
  let docs_share = [];
  const user = await selectData("user", {
    filteringConditions: [["Id", "=", req.params.id]],
  });
  if (user.length === 0)
    return res.status(401).json({
      status_code: 401,
      message: "ID is not exits!",
    });
  session
    .run(`MATCH (Ind:user {Id: ${req.params.id}})<-[r: share]-(n) RETURN n,r `)
    .then(async (data) => {
      // Có được tất cả docs share là 1 array từ array get relationship của từng docs if(property của relationship docs === undifine đồng nghĩa nó được share trực tiếp)
      //  Ngược lại nó được share gián tiếp (có ID của user share)
      data.records.forEach((e) =>
        docs_share.push({
          Id_docs: e._fields[0].properties.Id.low,
          Id_user_share: e._fields[1].properties.Id_share.low,
        })
      );
      const Knex = knex();
      let docsShareMySql = await Knex.select("*")
        .from("documents") // Get user from email
        .whereIn("Id", [...docs_share.map((item) => item.Id_docs)]);
      let usersShare = await Knex.select(
        "Id",
        "FullName",
        "Email",
        "PhoneNumber"
      )
        .from("user") // Get user from email
        .whereIn("Id", [...docs_share.map((item) => item.Id_user_share)]);
      let result = docsShareMySql.map((item, index) => {
        return { ...item, user_share: { ...usersShare[index] } };
      });
      res.status(200).json({
        status_code: 200,
        message: "Get document share success",
        data: result,
      });
    });
};
/*
 *  Share_document được dùng cho người dùng share tài liệu của người dùng tải lên
 * Input : Id document share, array user được share
 */
const checkDocsExit = async (data, id) => {
  const document = await selectData("documents", {
    filteringConditions: [
      ["Id", "=", data],
      ["UserId", "=", id],
    ],
  });
  return document;
};
module.exports.share_document = async (req, res) => {
  const document = await checkDocsExit(req.body.id, req.body.id_user);
  if (document.length === 0)
    return res.status(401).json({
      status_code: 401,
      message: "Document is not exits!",
    });
  const Knex = knex();
  let userShare = await Knex.select("Id", "FullName")
    .from("user") // Get user from email
    .whereIn("Email", [...req.body.user_Share]);
  let idUser = userShare.map((item) => item.Id); // Get Id user
  let documentNode = await getNode("document_share", req.body.id); // check document exit in neo4j
  let rsUser = await session.run(
    `MATCH (d:user) WHERE d.Id IN [${[...idUser]}]  RETURN d `
  ); // Get users exits in neo4j
  //  filer user exits
  let userExits = rsUser.records.map((item) => ({
    Id: item._fields[0].properties.Id.low,
    FullName: item._fields[0].properties.FullName,
  }));
  //  filer user not exits
  let userNotExits = userShare.filter((item) =>
    userExits.findIndex((a) => a.Id === item.Id) === -1 ? item : ""
  );
  let docShare = await get_docs_share(
    "document_share",
    req.body.id,
    "share",
    "user"
  );
  //  Get all relationship of docshare if docs exits
  let rsRelationShipOfNode = docShare.records.map(
    (item) => item._fields[1].properties.Id.low
  );
  let temp = idUser.filter((item) =>
    rsRelationShipOfNode.findIndex((i) => i === item) === -1 ? item : ""
  );
  if (userExits.length === 0) {
    userShare.map(async (item) => {
      let rs = await createNode("user", {
        Id: item.Id,
        FullName: item.FullName,
      });
    });
  } else {
    if (userNotExits.length !== 0) {
      userNotExits.map(async (item) => {
        let rs = await createNode("user", {
          Id: item.Id,
          FullName: item.FullName,
        });
      });
    }
  }
  let ss = driverNeo4j.session();
  if (documentNode.records.length === 0) {
    let rs = await session.run(
      `CREATE (a:document_share {Id:${document[0].Id},Fullname:${document[0].Title}})return a`
    );
    if (rs.records.length === 0)
      return res.status(401).json({
        status_code: 401,
        message: "Share document is faild!",
      });
    let ses = driverNeo4j.session();
    let userNode = [...idUser, ...temp];
    setTimeout(() => {
      ses
        .run(
          `MATCH (a:document_share {Id: ${
            document[0].Id
          }}), (b:user) WHERE b.Id IN [${[
            ...userNode,
          ]}] MERGE (a)-[r:share {Id_share:${
            req.body.id_user
          }}]->(b) return a,b`
        )
        .then((result) => {});
    }, 2000);
  } else {
    let userNode = [...userNotExits.map((item) => item.Id), ...temp];
    setTimeout(() => {
      session
        .run(
          `MATCH (a:document_share {Id: ${
            document[0].Id
          }}), (b:user) WHERE b.Id IN [${[
            ...userNode,
          ]}] MERGE (a)-[r:share {Id_share:${
            req.body.id_user
          }}]->(b) return a,b`
        )
        .then((result) => {});
    }, 2000);
  }
  res.send("Share document");
};

/* Update document share 
* todo: Cập nhật document share 
    * Tác vụ:
    *   - 1: Cập nhật document (Không cho)
    *   - 2: Cập nhật nhóm người được share 
    *   - 3: Cập nhật role (Đợi update sau)
*   * Input:  Id document, Array user_share     
*   Check user 
     - Tìm các user không còn được chia sẽ nữa xóa relatetionship của nó
     - Tìm các user chưa tồn tại tạo ra các user đó
     - Tạo relate từ node docs đến user được share
     *
 */
const filterUserShareByEmail = async (data) => {
  const Knex = knex();
  let userShare = await Knex.select("Id", "FullName")
    .from("user") // Get user from email
    .whereIn("Email", [...data]);
  let idUser = userShare.map((item) => item.Id); // Get id_user from client send to
  return idUser;
};
const getUserInNeo4jByArrId = async (data) => {
  let ExUser = await session.run(
    `MATCH (d:user) WHERE d.Id IN [${[...data]}]  RETURN d `
  ); // Get users exits in neo4j
  return (userExits = ExUser.records.map(
    (item) => item._fields[0].properties.Id.low
  ));
};
module.exports.update = async (req, res) => {
  const document = await checkDocsExit(req.body.id, req.body.id_user);
  if (document.length === 0)
    return res.status(401).json({
      status_code: 401,
      message: "Document id is not exits!",
    });
  const Knex = knex();
  let userShare = await Knex.select("Id", "FullName")
    .from("user") // Get user from email
    .whereIn("Email", [...req.body.user_Share]);
  let idUser = userShare.map((item) => item.Id); // Get id_user from client send to
  let docShare = await get_docs_share(
    "document_share",
    req.body.id,
    "share",
    "user"
  );
  let nodeExits = docShare.records.map(
    (record) => record._fields[1].properties.Id.low
  ); //Tất cả các node của docs củ share
  // Lọc ra các node chuẩn bị xóa bởi người dùng thông qua các user mới được update
  let nodeDelete = nodeExits.filter((item) =>
    idUser.findIndex((i) => i === item) < 0 ? item : null
  );
  // Delete relatetionship node delete
  let deleteNodeNeo4j = await deleteArrayNodeRelationship(
    "user",
    "document_share",
    nodeDelete,
    document[0].Id,
    "share"
  );
  let ss = driverNeo4j.session();
  // get node delete have ralationship
  let nodeHaveRelateQuery = await ss.run(`MATCH (a:user)<-[r:share]-(:document_share)
WHERE (a.Id IN [${nodeDelete}])
RETURN a`);
  let nodeHaveRelate = [];
  if (nodeHaveRelateQuery.records.length === 0) {
    await deleteArrayNode("user", nodeDelete);
    //null remove all node
  } else {
    //   not null filter node null remove it
    nodeHaveRelate = nodeHaveRelateQuery.records.map(
      (item) => item._fields[0].properties.Id.low
    );
    let nodeEmptyRelate = nodeDelete.filter((item) =>
      nodeHaveRelate.findIndex((i) => i === item) < 0 ? item : null
    );
    await deleteArrayNode("user", nodeEmptyRelate);
  }

  if (JSON.stringify(idUser) === JSON.stringify(nodeExits)) {
    return res.status(200).json({
      status_code: 200,
      message: "Update success",
    });
  } else {
    let newUser = idUser.filter((item) =>
      nodeExits.findIndex((i) => i === item) < 0 ? item : null
    );
    let ExUser = await session.run(
      `MATCH (d:user) WHERE d.Id IN [${[...idUser]}]  RETURN d `
    ); // Get users exits in neo4j
    //  filer user exits
    let userExits = ExUser.records.map(
      (item) => item._fields[0].properties.Id.low
    );
    // create relate from docs to userNotRelateExits
    let userNotExits = idUser.filter((item) =>
      userExits.findIndex((i) => i === item) < 0 ? item : null
    );
    // create node user and create relationship
    if (userNotExits.length !== 0) {
      await createMultipleNode("user", userNotExits);
    }
    let rs = await createArrRelateToNode(
      "user",
      "document_share",
      newUser,
      req.body.id,
      req.body.id_user // change width ID user login
    );
    return res.status(200).json({
      status_code: 200,
      message: "Update success",
    });
  }
};

// Input id:Int,id_user:Int, user_Share:[]
module.exports.re_share = async (req, res) => {
  const Knex = knex();
  let docs = await get_docs_share_id(
    "user",
    req.body.id_user,
    "share",
    "document_share",
    req.body.id
  );
  if (docs.records.length === 0)
    return res.status(401).json({
      status_code: 401,
      message: "Document is not exits!",
    });
  const idUserShare = await filterUserShareByEmail(req.body.user_Share);
  const userExits = await getUserInNeo4jByArrId(idUserShare);
  const userNotExits = idUserShare.filter((item) =>
    userExits.findIndex((i) => i === item) < 0 ? item : null
  );
  let docShare = await get_docs_share_property(
    "document_share",
    req.body.id,
    "share",
    "user",
    req.body.id_user
  );
  let UserExitOnnode = docShare.records.map(
    (record) => record._fields[1].properties.Id.low
  ); //Tất cả các node của docs củ share
  //   Get user exit haven't relationship with node docs
  let UserNotExitOnnode = idUserShare
    .filter((item) =>
      UserExitOnnode.findIndex((i) => i === item) < 0 ? item : null
    )
    .filter((e) => (userExits.findIndex((u) => u === e) < 0 ? e : null));

  if (UserNotExitOnnode.length !== 0) {
    await createMultipleNode("user", userNotExits);
  }
  if (UserExitOnnode.length === 0) {
    let rs = await createArrRelateToNode(
      "user",
      "document_share",
      idUserShare,
      req.body.id,
      req.body.id_user // change width ID user login
    );
  } else {
    let rs = await createArrRelateToNode(
      "user",
      "document_share",
      userNotExits,
      req.body.id,
      req.body.id_user // change width ID user login
    );
  }
  console.log("idUserShare >>", idUserShare);
  console.log("userExits", userExits);
  console.log("userNotExits", userNotExits);
  console.log("UserExitOnnode >>", UserExitOnnode);
  console.log("UserNotExitOnnode >>", UserNotExitOnnode);
  return res.status(200).json({
    status_code: 200,
    message: "Share docs success",
  });
};
module.exports.dele_user_shared = async (req, res) => {
  let user = await getNode("user", req.body.Id);
  if (user.records.length === 0)
    return res.status(401).json({
      status_code: 404,
      message: "User is not exits!",
    });
  await deleteRelationShipNode(
    "user",
    "document_share",
    req.body.Id,
    req.body.Id_document,
    "share"
  );
  let rsUser = await get_docs_share(
    "user",
    req.body.Id,
    "share",
    "document_share"
  );
  if (rsUser.records.length === 0) {
    await deleteNode("user", req.body.Id);
  }
  res.status(200).json({
    status_code: 200,
    message: "Delete relationship is success",
    data: { Id_user: req.body.Id },
  });
};
module.exports.delete_docs_share = async (req, res) => {
  let rsNode = await get_docs_share(
    "document_share",
    req.body.Id,
    "share",
    "user"
  );
  let userSh = rsNode.records.map((item) => item._fields[1].properties);
  await deleteAllRelationShipNode("document_share", req.body.Id, "share");
  userSh.map(async (item) => {
    let rsUser = await get_docs_share(
      "user",
      item.Id.low,
      "share",
      "document_share"
    );
    if (rsUser.records.length === 0) {
      await deleteNode("user", item.Id.low);
    }
  });
  await deleteNode("document_share", req.body.Id);
  res.status(200).json({
    status_code: 200,
    message: "Delete document is success",
    data: { Id: req.body.Id },
  });
};
