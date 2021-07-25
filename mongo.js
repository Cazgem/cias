const mongoose = require('mongoose');

module.exports = async (mongopath) => {
    await mongoose.connect(`${mongopath}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    return mongoose
}