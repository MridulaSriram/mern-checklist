const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  title: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    default: "",
  },

  category: {
    type: String,
    default: "",
    trim: true,
  },

  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },

  dueDate: {
    type: Date,
    required: true,
  },

  createdDate: {
    type: Date,
    default: Date.now,
  },

  completedDate: {
    type: Date,
    default: null,
  },

  attachment: {
    type: String,
    default: "",
  },

  status: {
    type: String,
    enum: ["todo", "completed"],
    default: "todo",
  },
});

module.exports = mongoose.model("Task", taskSchema);