const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config()

const DB_CONNECT_OPTION = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}
const connectionBD = async () => {
    await mongoose.connect(process.env.DB_URL, DB_CONNECT_OPTION, (err) => {
        if (err) throw err;

        console.log('Successfully connected mongoodb');
    });

}

module.exports = connectionBD;