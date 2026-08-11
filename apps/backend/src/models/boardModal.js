import mongoose from 'mongoose';

const BoardModal = new mongoose.Schema({
    title: {
        type : String,
        required: true
    },
    orgId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Org',
        required: true
    }
})

const Board = mongoose.model("Board", BoardModal);
export default Board;