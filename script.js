// API Base URL
const API_BASE_URL = '/api';

// DOM Elements
const addForm = document.getElementById('add-form');
const editForm = document.getElementById('edit-form');
const editModal = document.getElementById('edit-modal');
const todosContainer = document.getElementById('todos-container');
const statusMessage = document.getElementById('status-message');

// Current editing todo ID
let currentEditingId = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadTodos();
});

// Setup event listeners
function setupEventListeners() {
    // Add form submission
    addForm.addEventListener('submit', handleAddTodo);
    
    // Edit form submission
    editForm.addEventListener('submit', handleEditTodo);
    
    // Load todos button
    document.getElementById('get-todos').addEventListener('click', loadTodos);
    
    // Refresh todos button
    document.getElementById('refresh-todos').addEventListener('click', loadTodos);
    
    // Modal close functionality
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', function(event) {
        if (event.target === editModal) {
            closeModal();
        }
    });
}

// Show status message
function showStatus(message, type = 'success') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type} show`;
    
    setTimeout(() => {
        statusMessage.classList.remove('show');
    }, 3000);
}

// API Functions

// GET - Load all todos
async function loadTodos() {
    try {
        showStatus('Loading todos...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/todos`);
        const result = await response.json();
        
        if (result.success) {
            displayTodos(result.data);
            showStatus(`Loaded ${result.data.length} todos successfully`);
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Error loading todos:', error);
        showStatus(`Error loading todos: ${error.message}`, 'error');
        todosContainer.innerHTML = '<p class="no-todos">Error loading todos. Please try again.</p>';
    }
}

// POST - Add new todo
async function handleAddTodo(event) {
    event.preventDefault();
    
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    
    if (!title) {
        showStatus('Please enter a title', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, description })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showStatus('Todo added successfully!');
            addForm.reset();
            loadTodos(); // Reload todos to show the new one
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Error adding todo:', error);
        showStatus(`Error adding todo: ${error.message}`, 'error');
    }
}

// PUT - Update todo
async function handleEditTodo(event) {
    event.preventDefault();
    
    if (!currentEditingId) return;
    
    const title = document.getElementById('edit-title').value.trim();
    const description = document.getElementById('edit-description').value.trim();
    const completed = document.getElementById('edit-completed').checked;
    
    if (!title) {
        showStatus('Please enter a title', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/todos/${currentEditingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, description, completed })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showStatus('Todo updated successfully!');
            closeModal();
            loadTodos(); // Reload todos to show the updated one
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Error updating todo:', error);
        showStatus(`Error updating todo: ${error.message}`, 'error');
    }
}

// DELETE - Delete todo
async function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this todo?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showStatus('Todo deleted successfully!');
            loadTodos(); // Reload todos to remove the deleted one
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Error deleting todo:', error);
        showStatus(`Error deleting todo: ${error.message}`, 'error');
    }
}

// Display functions
function displayTodos(todos) {
    if (!todos || todos.length === 0) {
        todosContainer.innerHTML = '<p class="no-todos">No todos found. Add your first todo above!</p>';
        return;
    }
    
    const todosHTML = todos.map(todo => {
        const createdDate = new Date(todo.createdAt).toLocaleDateString();
        const updatedDate = new Date(todo.updatedAt).toLocaleDateString();
        
        return `
            <div class="todo-item ${todo.completed ? 'completed' : ''}">
                <div class="todo-header">
                    <h3 class="todo-title">${escapeHtml(todo.title)}</h3>
                    <span class="todo-status ${todo.completed ? 'status-completed' : 'status-pending'}">
                        ${todo.completed ? 'Completed' : 'Pending'}
                    </span>
                </div>
                
                ${todo.description ? `<p class="todo-description">${escapeHtml(todo.description)}</p>` : ''}
                
                <div class="todo-meta">
                    <div class="todo-dates">
                        <small>Created: ${createdDate}</small>
                        ${createdDate !== updatedDate ? `<small>Updated: ${updatedDate}</small>` : ''}
                    </div>
                    <div class="todo-actions">
                        <button class="btn btn-warning btn-small" onclick="openEditModal('${todo._id}', '${escapeHtml(todo.title)}', '${escapeHtml(todo.description || '')}', ${todo.completed})">
                            Edit
                        </button>
                        <button class="btn btn-danger btn-small" onclick="deleteTodo('${todo._id}')">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    todosContainer.innerHTML = todosHTML;
}

// Modal functions
function openEditModal(id, title, description, completed) {
    currentEditingId = id;
    document.getElementById('edit-title').value = title;
    document.getElementById('edit-description').value = description;
    document.getElementById('edit-completed').checked = completed;
    editModal.style.display = 'block';
}

function closeModal() {
    editModal.style.display = 'none';
    currentEditingId = null;
    editForm.reset();
}

// Utility function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}