import { useEffect, useState } from "react";
import Signup from "./Signup";
import Login from "./Login";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  const [showSignup, setShowSignup] = useState(false);

  const [tasks, setTasks] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [attachment, setAttachment] = useState("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) {
      loadTasks();
    }
  }, [token]);

  const loadTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to load tasks");
        return;
      }

      setTasks(data);
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to the server.");
    }
  };

  const handleSignup = () => {
    setShowSignup(false);
    setMessage("Account created. Please log in.");
  };

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setToken(localStorage.getItem("token"));
    setMessage("");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
    setTasks([]);
  };

  const handleAddTask = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!title || !dueDate) {
      setMessage("Task name and due date are required.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          category,
          priority,
          dueDate,
          attachment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to create task");
        return;
      }

      setTasks((previousTasks) => [data, ...previousTasks]);

      setTitle("");
      setDescription("");
      setCategory("");
      setPriority("medium");
      setDueDate("");
      setAttachment("");

      setMessage("Task added successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to the server.");
    }
  };

  const handleComplete = async (task) => {
    try {
      const response = await fetch(`${API_URL}/api/tasks/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "completed",
          completedDate: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to complete task");
        return;
      }

      setTasks((previousTasks) =>
        previousTasks.map((item) =>
          item._id === task._id ? data : item
        )
      );
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to the server.");
    }
  };

  const handleDelete = async (taskId) => {
    try {
      const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to delete task");
        return;
      }

      setTasks((previousTasks) =>
        previousTasks.filter((task) => task._id !== taskId)
      );
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to the server.");
    }
  };

  const isMissed = (task) => {
    if (task.status === "completed") {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);

    return due < today;
  };

  const todoTasks = tasks.filter(
    (task) => task.status !== "completed" && !isMissed(task)
  );

  const missedTasks = tasks.filter(
    (task) => task.status !== "completed" && isMissed(task)
  );

  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  );

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString();
  };

  const renderTask = (task, showCompleteButton = false) => {
    return (
      <div className="task-card" key={task._id}>
        <h3>{task.title}</h3>

        {task.description && (
          <p>
            <strong>Description:</strong> {task.description}
          </p>
        )}

        {task.category && (
          <p>
            <strong>Category:</strong> {task.category}
          </p>
        )}

        <p>
          <strong>Priority:</strong>{" "}
          {task.priority.charAt(0).toUpperCase() +
            task.priority.slice(1)}
        </p>

        <p>
          <strong>Due Date:</strong> {formatDate(task.dueDate)}
        </p>

        <p>
          <strong>Created Date:</strong> {formatDate(task.createdDate)}
        </p>

        <p>
          <strong>Completed Date:</strong>{" "}
          {formatDate(task.completedDate)}
        </p>

        {task.attachment && (
          <p>
            <strong>Attachment:</strong> {task.attachment}
          </p>
        )}

        <p>
          <strong>Status:</strong>{" "}
          {task.status === "completed"
            ? "Completed"
            : isMissed(task)
            ? "Missed"
            : "To Do"}
        </p>

        <div className="task-actions">
          {showCompleteButton && (
            <button onClick={() => handleComplete(task)}>
              Complete
            </button>
          )}

          <button onClick={() => handleDelete(task._id)}>
            Delete
          </button>
        </div>
      </div>
    );
  };

  if (!token || !user) {
    if (showSignup) {
      return (
        <>
          <Signup onSignup={handleSignup} />

          <div className="auth-switch">
            <button onClick={() => setShowSignup(false)}>
              Already have an account? Login
            </button>
          </div>
        </>
      );
    }

    return (
      <>
        <Login onLogin={handleLogin} />

        <div className="auth-switch">
          <button onClick={() => setShowSignup(true)}>
            Don't have an account? Sign Up
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1>MERN Checklist</h1>
          <p>Welcome, {user.name}!</p>
        </div>

        <button onClick={handleLogout}>Logout</button>
      </header>

      <section className="add-task-section">
        <h2>Add New Task</h2>

        <form onSubmit={handleAddTask}>
          <input
            type="text"
            placeholder="Task name"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />

          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
          />

          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          />

          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>

          <label>Completion / Due Date</label>

          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Attachment (optional)"
            value={attachment}
            onChange={(event) =>
              setAttachment(event.target.value)
            }
          />

          <button type="submit">Add Task</button>
        </form>

        {message && <p>{message}</p>}
      </section>

      <main className="checklist-container">
        <section className="checklist-column">
          <h2>TO DO</h2>

          {todoTasks.length === 0 ? (
            <p>No tasks to do.</p>
          ) : (
            todoTasks.map((task) => renderTask(task, true))
          )}
        </section>

        <section className="checklist-column">
          <h2>MISSED</h2>

          {missedTasks.length === 0 ? (
            <p>No missed tasks.</p>
          ) : (
            missedTasks.map((task) => renderTask(task, true))
          )}
        </section>

        <section className="checklist-column">
          <h2>COMPLETED</h2>

          {completedTasks.length === 0 ? (
            <p>No completed tasks.</p>
          ) : (
            completedTasks.map((task) => renderTask(task, false))
          )}
        </section>
      </main>
    </div>
  );
}

export default App;