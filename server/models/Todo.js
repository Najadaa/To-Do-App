const mongoose = require('mongoose')

const TodoSchema = new mongoose.Schema({
    task: String,
    done: {
        type: Boolean,
        default: false,
    },
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee',
    },
});

const TodoModel = mongoose.model("todos", TodoSchema)
module.exports = TodoModel