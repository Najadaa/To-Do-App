import { useEffect, useState } from 'react';
import axios from 'axios';
import Menu from './Menu';
import { AiFillDelete } from 'react-icons/ai';
import { toast } from 'react-toastify';

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [activeTab, setActiveTab] = useState('users'); // Initialize with 'users'
    const token = localStorage.getItem('token');

    useEffect(() => {
        // Fetch users and tasks data from the server with JWT token

        axios.get('http://localhost:3001/admin/users', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(result => setUsers(result.data))
            .catch(err => console.log(err));

        axios.get('http://localhost:3001/admin/tasks', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(result => setTasks(result.data))
            .catch(err => console.log(err));

    }, [token]); // Only include dependencies needed for the useEffect

    const handleDeleteUser = (userId) => {
        axios.delete(`http://localhost:3001/admin/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(result => {
                const updatedUsers = users.filter(user => user._id !== userId);
                setUsers(updatedUsers);
            })
            .catch(err => console.log(err));
    };

    const handleDeleteTask = (taskId) => {
        axios.delete(`http://localhost:3001/admin/tasks/${taskId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(result => {
                const updatedTasks = tasks.filter(task => task._id !== taskId);
                setTasks(updatedTasks);
            })
            .catch(err => console.log(err));
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleRoleChange = (userId, newRole) => {
        axios.put(`http://localhost:3001/admin/users/${userId}/update-role`, { role: newRole }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then(result => {
            // Update the user role in the local state
            const updatedUsers = users.map(user => {
              if (user._id === userId) {
                return {
                  ...user,
                  role: newRole,
                };
              }
              return user;
            });
            setUsers(updatedUsers);
          })
          .catch(err => console.log(err));
      };
      
    return (
        <div>
                   <Menu />

            <h2>Admin Dashboard</h2>

            <ul className="nav nav-tabs" id="adminTabs" role="tablist">
                <li className="nav-item">
                    <a
                        className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => handleTabChange('users')}
                    >
                        Users
                    </a>
                </li>
                <li className="nav-item">
                    <a
                        className={`nav-link ${activeTab === 'tasks' ? 'active' : ''}`}
                        onClick={() => handleTabChange('tasks')}
                    >
                        Tasks
                    </a>
                </li>
            </ul>

            <div className="tab-content">
                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="tab-pane fade show active" id="users" role="tabpanel">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user._id}>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}>
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-link"
                                                onClick={() => handleDeleteUser(user._id)}
                                            >
                                                <AiFillDelete />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Tasks Tab */}
                {activeTab === 'tasks' && (
                    <div className="tab-pane fade show active" id="tasks" role="tabpanel">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Task</th>
                                    <th>Done</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map(task => (
                                    <tr key={task._id}>
                                        <td>{task.task}</td>
                                        <td>{task.done ? 'Yes' : 'No'}</td>
                                        <td>
                                            <button
                                                className="btn btn-link"
                                                onClick={() => handleDeleteTask(task._id)}
                                            >
                                                <AiFillDelete />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;