import mongoose from "mongoose";

const IssueModal = new mongoose.Schema({
    title: {
        type: String,
        required: true

    },
    description: {
        type: String,
        required: true
    },
    boardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Board"
    },
    sectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section"
    }
})

const Issue = mongoose.model("Issue", IssueModal);
export default Issue;