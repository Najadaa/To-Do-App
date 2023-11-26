// Home.js
import { useEffect, useState } from 'react';
import Menu from './Menu';
import axios from 'axios';
import { AiFillDelete } from 'react-icons/ai';
import { FaEdit } from 'react-icons/fa';
import { BsCircleFill, BsFillCheckCircleFill } from 'react-icons/bs';
import './App.css';

function Home() {
  const [todos, setTodos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedTask, setEditedTask] = useState('');
  const [task, setTask] = useState('');
  const activeTasks = todos.filter(todo => !todo.done);
  const completedTasks = todos.filter(todo => todo.done);
  const token = localStorage.getItem('token');


  useEffect(() => {
    axios.get(`http://localhost:3001/task`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(result => setTodos(result.data))
      .catch(err => console.log(err));
  }, []);


  const handleAdd = () => {
    if(task.trim() === ''){
        //don't add an empty task
        return;
    }
    axios.post('http://localhost:3001/task', { task }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(result => {
      setTodos([...todos, result.data]);
      setTask(() => '');
    })
    .catch(err => console.log(err))

}

  const handleEdit = (id) => {
    setEditingId(id);
    const todoToEdit = todos.find(todo => todo._id === id);
    setEditedTask(todoToEdit.task);
  };

  const handleSaveEdit = (id) => {
    axios.put(`http://localhost:3001/task/${id}`, { task: editedTask }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(result => {
        setEditingId(null);
        setEditedTask('');
  
        // Update the local state with the edited task text
        const updatedTodos = todos.map(todo => {
          if (todo._id === id) {
            return {
              ...todo,
              task: editedTask
            };
          }
          return todo;
        });
        setTodos(updatedTodos);
      })
      .catch(err => console.log(err));
  };
  

  const handleToggleDone = (id) => {
    const updatedTodos = todos.map(todo => {
      if (todo._id === id) {
        return {
          ...todo,
          done: !todo.done
        };
      }
      return todo;
    });
  
    setTodos(updatedTodos);
  
    // Find the task in the array to get the current done status
    const currentTask = todos.find(t => t._id === id);
  
    axios.put(`http://localhost:3001/task/${id}`, { done: !currentTask.done }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(result => {
        // Handle success if needed
      })
      .catch(err => console.log(err));
  };
  
  

  const handleDelete = (id) => {
    axios.delete(`http://localhost:3001/task/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(result => {
        const updatedTodos = todos.filter(todo => todo._id !== id);
        setTodos(updatedTodos);
      })
      .catch(err => console.log(err));
  };

  return (
    <div className="home">
       <Menu />
       <div className="create_form">
        <input type="text" placeholder="Enter Task" value={task} onChange={(e) => setTask(e.target.value)}> 
        </input>
        <button type="button" onClick={handleAdd} title="Add task">Add</button>
       </div>

      <br />
      {activeTasks.length === 0 && completedTasks.length === 0 && (
        <div>
          <h3>No task for the day</h3>
        </div>
      )}

      {activeTasks.length > 0 && (
        <div>
          <h3>Active Tasks</h3>
          {activeTasks.map(todo => (
            <div className="task" key={todo._id}>
              <div className="task-content">
                <div className="checkbox">
                  <span onClick={() => handleToggleDone(todo._id)}>
                    {todo.done ?
                      <BsFillCheckCircleFill className="icon checkmark"></BsFillCheckCircleFill>
                      : <BsCircleFill className="icon circle" title='Mark as done'></BsCircleFill>
                    }
                  </span>
                  {editingId === todo._id ? (
                    <input
                      type="text"
                      value={editedTask}
                      onChange={(e) => setEditedTask(e.target.value)}
                    ></input>
                  ) : (
                    <p className={todo.done ? "line_through" : ""}>{todo.task}</p>
                  )}
                </div>
              </div>
              <div className="action-icons">
                {editingId !== todo._id ? (
                  <FaEdit className="icon edit-icon" onClick={() => handleEdit(todo._id)} title="Edit task"></FaEdit>
                ) : (
                  <button onClick={() => handleSaveEdit(todo._id)}>Save</button>
                )}
                <AiFillDelete className="icon delete-icon" onClick={() => handleDelete(todo._id)} title="Delete task"></AiFillDelete>
              </div>
            </div>
          ))}
        </div>
      )}

      {completedTasks.length > 0 && (
        <div>
          <h3>Completed Tasks</h3>
          {completedTasks.map(todo => (
            <div className="task completed" key={todo._id}>
              <div className="task-content">
                <div className="checkbox">
                  <span onClick={() => handleToggleDone(todo._id)}>
                    <BsFillCheckCircleFill className='icon checkmark'></BsFillCheckCircleFill>
                  </span>
                  <p className="line_through">{todo.task}</p>
                </div>
              </div>
              <div className="action-icons">
                <AiFillDelete className="icon delete-icon" onClick={() => handleDelete(todo._id)} />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTasks.length === 0 && completedTasks.length > 0 && (
        <div>
          <h2>You are done for the day, good job!</h2>
        </div>
      )}
    </div>
  );
}

export default Home;
