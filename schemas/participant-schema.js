const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true
}
const participantSchema = mongoose.Schema({
    _channel: reqString,
    participantID: reqString,
    participantName: reqString,
    participantTwitch: reqString
})

module.exports = mongoose.model('participants', participantSchema)