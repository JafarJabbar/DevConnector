const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    text: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: true
    },
    likes: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'user'
            }
        }
    ],
    comments: [
        {
            text:{
              type: String,
              required:true
            },
            user: {
                type: Schema.Types.ObjectId,
                ref: 'user'
            },
            name: {
                type: String,
                required: true
            },
            avatar: {
                type: String,
                required: true
            },
        }
    ]
})