const express = require("express");
const Category = require("../models/Category");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Get all categories for the logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const categories = await Category.find({
      userId: req.userId,
    }).sort({ name: 1 });

    res.json(categories);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch categories",
    });
  }
});

// Add a new category
router.post("/", protect, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    const category = await Category.create({
      userId: req.userId,
      name: name.trim(),
    });

    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "This category already exists",
      });
    }

    res.status(500).json({
      message: "Failed to create category",
    });
  }
});

// Edit a category
router.put("/:id", protect, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    const category = await Category.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
      },
      {
        name: name.trim(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "This category already exists",
      });
    }

    res.status(500).json({
      message: "Failed to update category",
    });
  }
});

// Delete a category
router.delete("/:id", protect, async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete category",
    });
  }
});

module.exports = router;