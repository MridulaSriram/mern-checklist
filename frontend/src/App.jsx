import { useEffect, useState } from "react";
import Signup from "./Signup";
import Login from "./Login";

const API_URL = "http://localhost:5000/api/tasks";

function App() {
  const [authScreen, setAuthScreen] = useState("signup");
  const [user, setUser] = useState(null);

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [attachment, setAttachment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    const loadTasks = async () => {
      setLoading(true);

      try {
        const token = localStorage.getItem("token");

        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load tasks");
        }

        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Failed to load tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [user]);

  const addTask = async (event) => {
    event.preventDefault();

    if (!title.trim() || !dueDate) {
      alert("Please enter a task name and completion date.");
      return;
    }

    const newTask = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      priority,
      dueDate,
      attachment: attachment.trim(),
    };

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      const savedTask = await response.json();

      setTasks((currentTasks) => [savedTask, ...currentTasks]);

      setTitle("");
      setDescription("");
      setCategory("");
      setPriority("medium");
      setDueDate("");
      setAttachment("");
    } catch (error) {
      console.error(error);
      alert("Could not save the task.");
    }
  };

  const completeTask = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/${id}`, {
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

      if (!response.ok) {
        throw new Error("Failed to complete task");
      }

      const updatedTask = await response.json();

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task._id === id ? updatedTask : task
        )
      );
    } catch (error) {
      console.error(error);
      alert("Could not complete the task.");
    }
  };

  const deleteTask = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task._id !== id)
      );
    } catch (error) {
      console.error(error);
      alert("Could not delete the task.");
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setTasks([]);
    setAuthScreen("login");
  };

  const TaskCard = ({ task, showComplete }) => (
    <div className="task-card">
      <h3>{task.title}</h3>

      {task.description && <p>{task.description}</p>}

      <p>
        <strong>Category:</strong>{" "}
        {task.category || "Not specified"}
      </p>

      <p>
        <strong>Priority:</strong> {task.priority}
      </p>

      <p>
        <strong>Created:</strong>{" "}
        {task.createdDate
          ? new Date(task.createdDate).toLocaleDateString()
          : "Not available"}
      </p>

      <p>
        <strong>Due:</strong>{" "}
        {new Date(task.dueDate).toLocaleDateString()}
      </p>

      {task.completedDate && (
        <p>
          <strong>Completed:</strong>{" "}
          {new Date(task.completedDate).toLocaleDateString()}
        </p>
      )}

      {task.attachment && (
        <p>
          <strong>Attachment:</strong> {task.attachment}
        </p>
      )}

      <div className="task-actions">
        {showComplete && (
          <button onClick={() => completeTask(task._id)}>
            Complete
          </button>
        )}

        <button
          className="delete-button"
          onClick={() => deleteTask(task._id)}
        >
          Delete
        </button>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div>
        {authScreen === "signup" ? (
          <>
            <Signup
              onSignup={() => {
                setAuthScreen("login");
              }}
            />

            <div style={{ textAlign: "center", marginTop: "15px" }}>
              <p>Already have an account?</p>

              <button onClick={() => setAuthScreen("login")}>
                Go to Login
              </button>
            </div>
          </>
        ) : (
          <>
            <Login
              onLogin={(loggedInUser) => {
                setUser(loggedInUser);
              }}
            />

            <div style={{ textAlign: "center", marginTop: "15px" }}>
              <p>Don't have an account?</p>

              <button onClick={() => setAuthScreen("signup")}>
                Create Account
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <div>
          <h1>My Checklist</h1>

          <p>
            Welcome, {user.name}! Plan your tasks, track deadlines,
            and stay organized.
          </p>
        </div>

        <button onClick={handleLogout}>Logout</button>
      </header>

      <form className="task-form" onSubmit={addTask}>
        <h2>Add New Task</h2>

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
          onChange={(event) => setDescription(event.target.value)}
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

        <label>Completion Date</label>

        <input
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Attachment name/link (optional)"
          value={attachment}
          onChange={(event) => setAttachment(event.target.value)}
        />

        <button type="submit">Add Task</button>
      </form>

      {loading ? (
        <p className="loading">Loading tasks...</p>
      ) : (
        <main className="columns">
          <section className="column todo">
            <h2>TO DO</h2>

            {todoTasks.length === 0 ? (
              <p>No tasks to do.</p>
            ) : (
              todoTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  showComplete={true}
                />
              ))
            )}
          </section>

          <section className="column missed">
            <h2>MISSED</h2>

            {missedTasks.length === 0 ? (
              <p>No missed tasks.</p>
            ) : (
              missedTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  showComplete={true}
                />
              ))
            )}
          </section>

          <section className="column completed">
            <h2>COMPLETED</h2>

            {completedTasks.length === 0 ? (
              <p>No completed tasks.</p>
            ) : (
              completedTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  showComplete={false}
                />
              ))
            )}
          </section>
        </main>
      )}
    </div>
  );
}

export default App;