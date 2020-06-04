const neo4j = require('neo4j-driver');

let driver = neo4j.driver('bolt://54.251.164.115:7687',neo4j.auth.basic('neo4j','123456'));
module.exports = driver;