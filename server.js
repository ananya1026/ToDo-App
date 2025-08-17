const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@mongodb:27017/ToDo-App?authSource=admin';

// Middleware
app.use(cors());
app.use(express.json());

// Todo Schema
const ToDoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ToDo = mongoose.model('ToDo', ToDoSchema);

// Routes

// GET - Get all todos
app.get('/api/ToDos', async (req, res) => {
  try {
    const todos = await ToDo.find().sort({ createdAt: -1 });
    res.json({ success: true, data: todos, message: 'ToDos retrieved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving ToDos', error: error.message });
  }
});

// POST - Create a new todo
app.post('/api/ToDos', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const newTodo = new ToDo({ title, description });
    await newTodo.save();

    res.status(201).json({ success: true, data: newTodo, message: 'ToDo created successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error creating ToDo', error: error.message });
  }
});

// PUT - Update a todo
app.put('/api/ToDos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    const updatedTodo = await ToDo.findByIdAndUpdate(
      id,
      { title, description, completed, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ success: false, message: 'ToDo not found' });
    }

    res.json({ success: true, data: updatedTodo, message: 'ToDo updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error updating ToDo', error: error.message });
  }
});

// DELETE - Delete a todo
app.delete('/api/ToDos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTodo = await ToDo.findByIdAndDelete(id);

    if (!deletedTodo) {
      return res.status(404).json({ success: false, message: 'ToDo not found' });
    }

    res.json({ success: true, message: 'ToDo deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error deleting ToDo', error: error.message });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'ToDo API is running', timestamp: new Date().toISOString() });
});

// Connect to MongoDB and start server
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });
