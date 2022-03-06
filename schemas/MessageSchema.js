const mongoose = require('mongoose')

const Schema = mongoose.Schema

const MessageSchema = new Schema({
    content: { type: String, trim: true },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    chat: { type: Schema.Types.ObjectId, ref: 'Chat' },
}, { timestamps: true })

var Message = mongoose.model('Message', MessageSchema)
module.exports = Message