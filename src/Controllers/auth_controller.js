const { registerValidation, loginValidation } = require('../utils/validatation');
const brcypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv');
const { mySQL, knex } = require("../../public/database/mysql_db");
dotenv.config();
module.exports.login = async (req, res) => {
    const Knex = knex();
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message)
    Knex.from('user').select("*").where('Email', '=', req.body.Email)
        .then(async (rows) => {
            if (rows.length === 0) return res.status(200).json({
                status: 401,
                message: "Email or Password is not correct!"
            })
            const validPassword = await brcypt.compare(req.body.Password, rows[0].Password)
            if (!validPassword) return res.status(200).json({
                status: 401,
                message: "Email or Password is not correct!"
            })
            const token = jwt.sign({ id: rows[0].Id }, process.env.TOKEN_SECRET) // lấy id của user vừa login tạo token
            let result = {...rows[0]}
            result.token = token;
            delete result.Password
            // res.header('auth-token', token).send(token);
            res.header('auth-token', token).status(200).json({
                status_code: 200,
                message: "Login is successfull",
                data: result
            })
        })
        .catch((err) => { console.log(err); throw err })
}
module.exports.register = async (req, res) => {
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message)
    mySQL.query(`SELECT * FROM user WHERE Email = "${req.body.Email}"`, async function (err, result, fields) {
        if (err) throw err;
        if (Object.entries(result).length !== 0) return res.status(401).send("Email was exits!")
        const salt = await brcypt.genSalt(10);
        const hashPassword = await brcypt.hash(req.body.Password, salt);
        mySQL.query(`INSERT INTO user (FullName, DayOfBirth,Email,PhoneNumber,Description,Password) VALUES ('${req.body.FullName}','${req.body.DayOfBirth}','${req.body.Email}','${req.body.PhoneNumber}','${req.body.Description}','${hashPassword}')`, function (err, result) {
            if (err) throw err;
            res.status(200).json({
                status: 200,
                message: "Register is successfull",
                data: req.body
            })
        });

    });
}