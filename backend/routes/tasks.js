const express = require("express");
const Task = require("../models/Task");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Get all tasks belonging to the logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const tasks = await Task.find({
      userId: req.userId,
    }).sort({ createdDate: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch tasks",
    });
  }
});

// Get one task belonging to the logged-in user
router.get("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch task",
    });
  }
});

// Create a task for the logged-in user
router.post("/", protect, async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      userId: req.userId,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create task",
      error: error.message,
    });
  }
});

// Update a task belonging to the logged-in user
router.put("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json(task);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update task",
      error: error.message,
    });
  }
});

// Delete a task belonging to the logged-in user
router.delete("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete task",
    });
  }
});

module.exports = router;