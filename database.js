const mongoose = require('mongoose')

class Database {
    constructor() {
        this.connect()
    }

    connect() {
        mongoose
            .connect('mongodb://localhost:27017/twitter')
            .then(() => console.log('DB connected'))
            .catch((err) => {
                console.log(err)
            })
    }
}

module.exports = new Database()