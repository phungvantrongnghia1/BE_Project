var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_project"
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected to mysql!");
});

module.exports.mySQL = con;

const options = {
  client: 'mysql',
  connection: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_project'
  },
  useNullAsDefault: true
}

const knex = () => {
  return require('knex')(options)
};
const updateData = (tableName, options = { fields: {}, filteringConditions: [] }) => {
  const Knex = knex();
  const { fields, filteringConditions } = options

  return Knex(tableName)
    .where(builder => {
      filteringConditions.forEach(condition => {
        builder.where(...condition)
      });

    })
    .update(fields)
    .then(data => data)
    .finally(() => Knex.destroy());
}
const deleteData = (tableName, options = { filteringConditions: [] }) => {
  const Knex = knex();
  const { filteringConditions } = options

  return Knex(tableName)
    .where(builder => {
      filteringConditions.forEach(condition => {
        builder.where(...condition)
      });

    })
    .del()
    .then(data => data)
    .finally(() => Knex.destroy());
}
const selectData = (tableName, options = { fields: [], filteringConditions: [] }) => {
  const Knex = knex();
  const { fields, filteringConditions } = options

  return Knex(tableName)
    .select(fields)
    .where(builder => {
      filteringConditions.forEach(condition => {
        builder.where(...condition)
      });

    })
    .then(data =>
      JSON.parse(JSON.stringify(data))
    )
    .finally(() => Knex.destroy());
}
const insertData = (tableName, data) => {
  const Knex = knex();
  return Knex(tableName)
    .insert(data)
    .then(resp => resp)
    .finally(() => Knex.destroy());
}
module.exports.knex = knex;
module.exports.selectData = selectData;
module.exports.deleteData = deleteData;
module.exports.updateData = updateData;
module.exports.insertData = insertData;

