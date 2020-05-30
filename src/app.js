const express = require('express');
const {mySQL} = require("../public/database/mysql_db");
const bodyParser = require('body-parser')
var cors = require('cors')

const authRoute = require("./Routes/auth");
const documentRouteCategory = require('./Routes/document_category');
const documentRoute = require('./Routes/document');
const documentShateRoute = require("./Routes/document_share");
const app = express();

const driverNeo4j = require('../public/database/neo4j');
let session = driverNeo4j.session();
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));


app.use(express.static('public'));
app.use('/user', authRoute)
app.use('/document-category', documentRouteCategory);
app.use('/document', documentRoute);
app.use('/document-share', documentShateRoute);
app.get('/', (req, res) => {
    // session
    //     .run('MATCH(n) RETURN n LIMIT 25')
    //     .then(function(result){
    //         result.records.forEach(record => {
    //                 console.log(record._fields[0].properties);
    //         });
    //     })
    //     .catch(function(err){
    //         console.log(err);
    //     })
    res.send("aloalao");
    // mysqlDB.query("SELECT * FROM user", function (err, result, fields) {
    //     if (err) throw err;
    //     console.log(result);
    //   });
})

app.listen(3200, (req, res) => {
    console.log("Server is running at port 3100");
})