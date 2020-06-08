const neo4j = require('neo4j-driver');

let driver = neo4j.driver('neo4j://54.254.231.48:7687',neo4j.auth.basic('neo4j','123456'));

module.exports = driver;