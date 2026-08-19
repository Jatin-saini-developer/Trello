import mongoose, { Schema } from "mongoose";

const SectionModal = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    boardId :{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Board',
    }
})

const Section = mongoose.model("Section", SectionModal);
export default Section;