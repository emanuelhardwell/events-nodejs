/*  */
/*  */
const mongoose = require("mongoose");
const { Schema } = mongoose;

const EventSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date_init: { type: Date, default: Date.now },
  date_end: { type: Date, default: Date.now },
  user: { type: String },
  noteid: { type: Schema.Types.ObjectId, ref: "Note", required: true },
});

module.exports = mongoose.model("Event", EventSchema);
