// Import necessary libraries
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const EmployeeModel = require('./models/Employee');
const TodoModel = require('./models/Todo');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/employee');

// Secret key for JWT
const JWT_SECRET_KEY = 'your-secret-key';

// Function to create a JWT token
const createToken = (user) => {
  return jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET_KEY, { expiresIn: '24h' });
};

// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  EmployeeModel.findOne({ email: email })
    .then(user => {
      if (user) {
        if (user.password === password) {
          const token = createToken(user);
          res.json({ token, role: user.role});
        } else {
          res.status(401).json({ error: 'Incorrect password' });
        }
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// Register route
app.post('/register', (req, res) => {
  console.log(req.body)
  EmployeeModel.create(req.body)
    .then(user => {
      const token = createToken(user);
      res.json({ token, role: user.role });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - Missing token' });
  }

  // Remove the "Bearer " prefix
  const tokenWithoutBearer = token.replace("Bearer ", "");

  jwt.verify(tokenWithoutBearer, JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      console.log("Error decoding token:", err);
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  });
};

// Get all tasks for the logged-in user
app.get('/task', verifyToken, (req, res) => {
  const userId = req.userId;
  console.log('User ID from Token:', userId);

  TodoModel.find({ employee: userId })
    .then(tasks => {
      console.log('Tasks found:', tasks);
      res.json(tasks);
    })
    .catch(err => {
      console.error('Error:', err);
      res.status(500).json({ error: err.message });
    });
});

// Add a task (only accessible to authenticated users)
app.post('/task', verifyToken, (req, res) => {
  const { task } = req.body;
  const userId = req.userId; // The user ID from the decoded token

  // Create the task with the user ID
  TodoModel.create({ task, employee: userId })
    .then(result => res.json(result))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Update a task (only accessible to authenticated users)
app.put('/task/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const userId = req.userId; // The user ID from the decoded token

  const updateFields = {};
if (req.body.task) {
  updateFields.task = req.body.task;
}
if (req.body.done !== undefined) {
  updateFields.done = req.body.done;
}

TodoModel.findOneAndUpdate(
  { _id: id, employee: userId },
  updateFields,
  { new: true }
)
.then(result => {
      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: 'Task not found' });
      }
    })
    .catch(err => res.status(500).json({ error: err.message }));
});


//Delete a task (only accessible to authenticated users)
app.delete('/task/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const userId = req.userId; // The user ID from the decoded token

  // Delete the task if it belongs to the user
  TodoModel.findOneAndDelete({ _id: id, employee: userId })
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: 'Task not found' });
      }
    })
    .catch(err => res.status(500).json({ error: err.message }));
});


// Protected route  Get all tasks
app.get('/admin/tasks', verifyToken, (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Forbidden - Admin access only' });
  }
  TodoModel.find()
    .then(result => res.json(result))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Delete a task by ID (only accessible to admin)
app.delete('/admin/tasks/:id', verifyToken, (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Forbidden - Admin access only' });
  }

  const { id } = req.params;

  TodoModel.findByIdAndDelete(id)
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: 'Task not found' });
      }
    })
    .catch(err => res.status(500).json({ error: err.message }));
});


// Example: Get all users (only accessible to admin)
app.get('/admin/users', verifyToken, (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Forbidden - Admin access only' });
  }

  EmployeeModel.find()
    .then(users => res.json(users))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Delete a user by ID (only accessible to admin)
app.delete('/admin/users/:id', verifyToken, (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Forbidden - Admin access only' });
  }

  const { id } = req.params;

  EmployeeModel.findByIdAndDelete(id)
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// Update user role by ID (only accessible to admin)
app.put('/admin/users/:id/update-role', verifyToken, (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Forbidden - Admin access only' });
  }

  const { id } = req.params;
  const { role } = req.body;

  EmployeeModel.findByIdAndUpdate({ _id: id }, { role: role })
    .then(result => res.json(result))
    .catch(err => res.status(500).json({ error: err.message }));
});

//Start
app.listen(3001, () => {
  console.log('Server is running');
});
