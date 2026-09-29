import { useEffect, useMemo, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function App({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved !== "false";
  });

  const [showCategoryManager, setShowCategoryManager] =
    useState(false);

  const [newCategory, setNewCategory] = useState("");
  const [editingCategoryId, setEditingCategoryId] =
    useState(null);
  const [editingCategoryName, setEditingCategoryName] =
    useState("");

  const [categoryMessage, setCategoryMessage] =
    useState("");

  const token = localStorage.getItem("token");

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  /* =====================================================
     LOAD TASKS
  ===================================================== */

  const loadTasks = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/tasks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setTasks(data);
      } else {
        console.error(data);
      }
    } catch (error) {
      console.error(
        "Failed to load tasks:",
        error
      );
    }
  };

  /* =====================================================
     LOAD CATEGORIES
  ===================================================== */

  const loadCategories = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/categories`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setCategories(data);
      } else {
        console.error(data);
      }
    } catch (error) {
      console.error(
        "Failed to load categories:",
        error
      );
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    if (token) {
      loadTasks();
      loadCategories();
    }
  }, []);

  /* =====================================================
     DARK MODE
  ===================================================== */

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);

    document.body.className = darkMode
      ? "dark-mode"
      : "light-mode";
  }, [darkMode]);

  /* =====================================================
     ADD TASK
  ===================================================== */

  const addTask = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    if (!dueDate) {
      alert("Please select a due date.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/tasks`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            category,
            priority,
            dueDate,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setTasks((previous) => [
          data,
          ...previous,
        ]);

        setTitle("");
        setDescription("");
        setCategory("");
        setPriority("medium");
        setDueDate("");
      } else {
        alert(
          data.message ||
            "Failed to add task."
        );
      }
    } catch (error) {
      console.error(
        "Failed to add task:",
        error
      );

      alert(
        "Unable to connect to the backend."
      );
    }
  };

  /* =====================================================
     COMPLETE TASK
  ===================================================== */

  const completeTask = async (id) => {
    try {
      const response = await fetch(
        `${API_URL}/api/tasks/${id}`,
        {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify({
            status: "completed",
            completedDate: new Date(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setTasks((previous) =>
          previous.map((task) =>
            task._id === id
              ? data
              : task
          )
        );
      } else {
        alert(
          data.message ||
            "Failed to complete task."
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  /* =====================================================
     DELETE TASK
  ===================================================== */

  const deleteTask = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/api/tasks/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setTasks((previous) =>
          previous.filter(
            (task) => task._id !== id
          )
        );
      } else {
        alert(
          data.message ||
            "Failed to delete task."
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  /* =====================================================
     ADD CATEGORY
  ===================================================== */

  const addCategory = async (event) => {
    event.preventDefault();

    const name = newCategory.trim();

    if (!name) {
      setCategoryMessage(
        "Please enter a category name."
      );
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/categories`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            name,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setCategories((previous) => [
          ...previous,
          data,
        ]);

        setNewCategory("");

        setCategoryMessage(
          "Category added successfully!"
        );
      } else {
        setCategoryMessage(
          data.message ||
            "Failed to add category."
        );
      }
    } catch (error) {
      console.error(error);

      setCategoryMessage(
        "Unable to connect to the backend."
      );
    }
  };

  /* =====================================================
     START EDITING CATEGORY
  ===================================================== */

  const startEditingCategory = (item) => {
    setEditingCategoryId(item._id);
    setEditingCategoryName(item.name);
    setCategoryMessage("");
  };

  /* =====================================================
     UPDATE CATEGORY
  ===================================================== */

  const updateCategory = async (id) => {
    const name =
      editingCategoryName.trim();

    if (!name) {
      setCategoryMessage(
        "Category name cannot be empty."
      );
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/categories/${id}`,
        {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify({
            name,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        const oldCategory =
          categories.find(
            (item) => item._id === id
          );

        setCategories((previous) =>
          previous.map((item) =>
            item._id === id
              ? data
              : item
          )
        );

        /*
          If an existing task was using the
          old category name, update that task
          locally as well.
        */

        if (oldCategory) {
          setTasks((previous) =>
            previous.map((task) =>
              task.category ===
              oldCategory.name
                ? {
                    ...task,
                    category: data.name,
                  }
                : task
            )
          );
        }

        if (
          category === oldCategory?.name
        ) {
          setCategory(data.name);
        }

        if (
          categoryFilter ===
          oldCategory?.name
        ) {
          setCategoryFilter(data.name);
        }

        setEditingCategoryId(null);
        setEditingCategoryName("");

        setCategoryMessage(
          "Category updated successfully!"
        );
      } else {
        setCategoryMessage(
          data.message ||
            "Failed to update category."
        );
      }
    } catch (error) {
      console.error(error);

      setCategoryMessage(
        "Unable to connect to the backend."
      );
    }
  };

  /* =====================================================
     DELETE CATEGORY
  ===================================================== */

  const deleteCategory = async (id) => {
    const item = categories.find(
      (categoryItem) =>
        categoryItem._id === id
    );

    if (!item) return;

    const confirmed = window.confirm(
      `Delete the category "${item.name}"?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/api/categories/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setCategories((previous) =>
          previous.filter(
            (categoryItem) =>
              categoryItem._id !== id
          )
        );

        if (category === item.name) {
          setCategory("");
        }

        if (
          categoryFilter === item.name
        ) {
          setCategoryFilter("all");
        }

        setCategoryMessage(
          "Category deleted successfully!"
        );
      } else {
        setCategoryMessage(
          data.message ||
            "Failed to delete category."
        );
      }
    } catch (error) {
      console.error(error);

      setCategoryMessage(
        "Unable to connect to the backend."
      );
    }
  };

  /* =====================================================
     DATE FORMAT
  ===================================================== */

  const formatDate = (date) => {
    if (!date) return "No date";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =====================================================
     MISSED TASK
  ===================================================== */

  const isMissed = (task) => {
    if (task.status === "completed") {
      return false;
    }

    if (!task.dueDate) {
      return false;
    }

    const today = new Date();

    today.setHours(
      23,
      59,
      59,
      999
    );

    const due = new Date(
      task.dueDate
    );

    return due < today;
  };

  /* =====================================================
     FILTER TASKS
  ===================================================== */

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const searchText =
        search.toLowerCase();

      const matchesSearch =
        task.title
          ?.toLowerCase()
          .includes(searchText) ||
        task.description
          ?.toLowerCase()
          .includes(searchText);

      const matchesPriority =
        priorityFilter === "all" ||
        task.priority ===
          priorityFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        task.category ===
          categoryFilter;

      return (
        matchesSearch &&
        matchesPriority &&
        matchesCategory
      );
    });
  }, [
    tasks,
    search,
    priorityFilter,
    categoryFilter,
  ]);

  /* =====================================================
     TASK COLUMNS
  ===================================================== */

  const todoTasks =
    filteredTasks.filter(
      (task) =>
        task.status !==
          "completed" &&
        !isMissed(task)
    );

  const missedTasks =
    filteredTasks.filter(
      (task) =>
        task.status !==
          "completed" &&
        isMissed(task)
    );

  const completedTasks =
    filteredTasks.filter(
      (task) =>
        task.status ===
        "completed"
    );

  /* =====================================================
     STATISTICS
  ===================================================== */

  const totalTasks =
    tasks.length;

  const completedCount =
    tasks.filter(
      (task) =>
        task.status ===
        "completed"
    ).length;

  const missedCount =
    tasks.filter((task) =>
      isMissed(task)
    ).length;

  const pendingCount =
    totalTasks -
    completedCount;

  /* =====================================================
     TASK CARD
  ===================================================== */

  const TaskCard = ({ task }) => (
    <div className="task-card">
      <div className="task-card-top">
        <h3>{task.title}</h3>

        <button
          className="delete-button"
          onClick={() =>
            deleteTask(task._id)
          }
          title="Delete task"
        >
          🗑️
        </button>
      </div>

      {task.description && (
        <p className="task-description">
          {task.description}
        </p>
      )}

      <div className="task-tags">
        {task.priority && (
          <span
            className={`priority-badge ${task.priority}`}
          >
            {task.priority.toUpperCase()}
          </span>
        )}

        {task.category && (
          <span className="category-badge">
            📂 {task.category}
          </span>
        )}
      </div>

      <div className="task-date">
        📅 {formatDate(task.dueDate)}
      </div>

      {task.status !==
        "completed" && (
        <button
          className="complete-button"
          onClick={() =>
            completeTask(task._id)
          }
        >
          ✓ Mark Completed
        </button>
      )}

      {task.status ===
        "completed" && (
        <div className="completed-label">
          ✓ Completed
        </div>
      )}
    </div>
  );

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="app-container">
      {/* HEADER */}

      <header className="app-header">
        <div className="brand-section">
          <div className="brand-icon">
            ✓
          </div>

          <div>
            <h1>TaskFlow</h1>

            <p>
              Stay organized. Get
              things done.
            </p>
          </div>
        </div>

        <div className="header-actions">
          <div className="user-profile">
            <div className="user-avatar">
              {user?.name
                ? user.name
                    .charAt(0)
                    .toUpperCase()
                : "U"}
            </div>

            <div className="user-info">
              <strong>
                {user?.name ||
                  "User"}
              </strong>

              <span>
                {user?.email || ""}
              </span>
            </div>
          </div>

          <button
            className="theme-button"
            onClick={() =>
              setDarkMode(
                (previous) =>
                  !previous
              )
            }
            title="Toggle dark mode"
          >
            {darkMode
              ? "☀️"
              : "🌙"}
          </button>

          <button
            className="logout-button"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN */}

      <main className="main-content">
        {/* STATISTICS */}

        <section className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">
              📋
            </span>

            <div>
              <span className="stat-label">
                Total Tasks
              </span>

              <strong>
                {totalTasks}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">
              ⏳
            </span>

            <div>
              <span className="stat-label">
                Pending
              </span>

              <strong>
                {pendingCount}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">
              ⚠️
            </span>

            <div>
              <span className="stat-label">
                Missed
              </span>

              <strong>
                {missedCount}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">
              ✅
            </span>

            <div>
              <span className="stat-label">
                Completed
              </span>

              <strong>
                {completedCount}
              </strong>
            </div>
          </div>
        </section>

        {/* ADD TASK */}

        <section className="add-task-section">
          <div className="section-heading">
            <div>
              <h2>
                ➕ Add New Task
              </h2>

              <p>
                Create a task and
                keep your day
                organized.
              </p>
            </div>
          </div>

          <form
            className="task-form"
            onSubmit={addTask}
          >
            <div className="form-group">
              <label>
                Task Title *
              </label>

              <input
                type="text"
                placeholder="What needs to be done?"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target
                      .value
                  )
                }
              />
            </div>

            <div className="form-group">
              <label>
                Description
              </label>

              <textarea
                placeholder="Add some details..."
                value={
                  description
                }
                onChange={(event) =>
                  setDescription(
                    event.target
                      .value
                  )
                }
              />
            </div>

            <div className="form-row">
              {/* CATEGORY */}

              <div className="form-group">
                <label>
                  Category
                </label>

                <div className="category-select-row">
                  <select
                    value={
                      category
                    }
                    onChange={(
                      event
                    ) =>
                      setCategory(
                        event.target
                          .value
                      )
                    }
                  >
                    <option value="">
                      Select category
                    </option>

                    {categories.map(
                      (item) => (
                        <option
                          key={
                            item._id
                          }
                          value={
                            item.name
                          }
                        >
                          {item.name}
                        </option>
                      )
                    )}
                  </select>

                  <button
                    type="button"
                    className="manage-category-button"
                    onClick={() =>
                      setShowCategoryManager(
                        (
                          previous
                        ) =>
                          !previous
                      )
                    }
                    title="Manage categories"
                  >
                    ⚙️
                  </button>
                </div>
              </div>

              {/* PRIORITY */}

              <div className="form-group">
                <label>
                  Priority
                </label>

                <select
                  value={
                    priority
                  }
                  onChange={(event) =>
                    setPriority(
                      event.target
                        .value
                    )
                  }
                >
                  <option value="low">
                    Low
                  </option>

                  <option value="medium">
                    Medium
                  </option>

                  <option value="high">
                    High
                  </option>
                </select>
              </div>

              {/* DUE DATE */}

              <div className="form-group">
                <label>
                  Due Date *
                </label>

                <input
                  type="date"
                  value={
                    dueDate
                  }
                  onChange={(event) =>
                    setDueDate(
                      event.target
                        .value
                    )
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              className="add-task-button"
            >
              ➕ Add Task
            </button>
          </form>
        </section>

        {/* CATEGORY MANAGER */}

        {showCategoryManager && (
          <section className="category-manager">
            <div className="section-heading">
              <div>
                <h2>
                  ⚙️ Manage
                  Categories
                </h2>

                <p>
                  Create, rename,
                  or delete your
                  personal
                  categories.
                </p>
              </div>

              <button
                type="button"
                className="close-category-button"
                onClick={() => {
                  setShowCategoryManager(
                    false
                  );
                  setCategoryMessage(
                    ""
                  );
                }}
              >
                ✕
              </button>
            </div>

            {/* ADD CATEGORY */}

            <form
              className="category-add-form"
              onSubmit={
                addCategory
              }
            >
              <input
                type="text"
                placeholder="New category name"
                value={
                  newCategory
                }
                onChange={(event) =>
                  setNewCategory(
                    event.target
                      .value
                  )
                }
              />

              <button type="submit">
                ➕ Add Category
              </button>
            </form>

            {categoryMessage && (
              <p className="category-message">
                {categoryMessage}
              </p>
            )}

            {/* CATEGORY LIST */}

            <div className="category-list">
              {categories.length ===
              0 ? (
                <p className="empty-category-message">
                  No categories
                  yet. Add your
                  first category
                  above.
                </p>
              ) : (
                categories.map(
                  (item) => (
                    <div
                      className="category-manager-item"
                      key={
                        item._id
                      }
                    >
                      {editingCategoryId ===
                      item._id ? (
                        <>
                          <input
                            value={
                              editingCategoryName
                            }
                            onChange={(
                              event
                            ) =>
                              setEditingCategoryName(
                                event
                                  .target
                                  .value
                              )
                            }
                            autoFocus
                          />

                          <div>
                            <button
                              type="button"
                              onClick={() =>
                                updateCategory(
                                  item._id
                                )
                              }
                            >
                              ✓ Save
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategoryId(
                                  null
                                );

                                setEditingCategoryName(
                                  ""
                                );
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <span>
                            📂{" "}
                            {item.name}
                          </span>

                          <div>
                            <button
                              type="button"
                              onClick={() =>
                                startEditingCategory(
                                  item
                                )
                              }
                              title="Edit category"
                            >
                              ✏️
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteCategory(
                                  item._id
                                )
                              }
                              title="Delete category"
                            >
                              🗑️
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )
                )
              )}
            </div>
          </section>
        )}

        {/* FILTERS */}

        <section className="filter-section">
          <div className="search-box">
            🔍

            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />
          </div>

          <select
            value={
              priorityFilter
            }
            onChange={(event) =>
              setPriorityFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              All Priorities
            </option>

            <option value="low">
              Low
            </option>

            <option value="medium">
              Medium
            </option>

            <option value="high">
              High
            </option>
          </select>

          <select
            value={
              categoryFilter
            }
            onChange={(event) =>
              setCategoryFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              All Categories
            </option>

            {categories.map(
              (item) => (
                <option
                  key={
                    item._id
                  }
                  value={
                    item.name
                  }
                >
                  {item.name}
                </option>
              )
            )}
          </select>
        </section>

        {/* TASK BOARD */}

        <section className="task-board">
          {/* TO DO */}

          <div className="task-column">
            <div className="column-header todo-header">
              <div>
                <span className="column-icon">
                  📌
                </span>

                <h2>
                  TO DO
                </h2>
              </div>

              <span className="column-count">
                {
                  todoTasks.length
                }
              </span>
            </div>

            <div className="task-list">
              {todoTasks.length ===
              0 ? (
                <div className="empty-state">
                  <div>
                    🎉
                  </div>

                  <p>
                    No pending
                    tasks
                  </p>
                </div>
              ) : (
                todoTasks.map(
                  (task) => (
                    <TaskCard
                      key={
                        task._id
                      }
                      task={
                        task
                      }
                    />
                  )
                )
              )}
            </div>
          </div>

          {/* MISSED */}

          <div className="task-column">
            <div className="column-header missed-header">
              <div>
                <span className="column-icon">
                  ⚠️
                </span>

                <h2>
                  MISSED
                </h2>
              </div>

              <span className="column-count">
                {
                  missedTasks.length
                }
              </span>
            </div>

            <div className="task-list">
              {missedTasks.length ===
              0 ? (
                <div className="empty-state">
                  <div>
                    ✨
                  </div>

                  <p>
                    No missed
                    tasks
                  </p>
                </div>
              ) : (
                missedTasks.map(
                  (task) => (
                    <TaskCard
                      key={
                        task._id
                      }
                      task={
                        task
                      }
                    />
                  )
                )
              )}
            </div>
          </div>

          {/* COMPLETED */}

          <div className="task-column">
            <div className="column-header completed-header">
              <div>
                <span className="column-icon">
                  ✅
                </span>

                <h2>
                  COMPLETED
                </h2>
              </div>

              <span className="column-count">
                {
                  completedTasks.length
                }
              </span>
            </div>

            <div className="task-list">
              {completedTasks.length ===
              0 ? (
                <div className="empty-state">
                  <div>
                    📝
                  </div>

                  <p>
                    No completed
                    tasks yet
                  </p>
                </div>
              ) : (
                completedTasks.map(
                  (task) => (
                    <TaskCard
                      key={
                        task._id
                      }
                      task={
                        task
                      }
                    />
                  )
                )
              )}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}

      <footer className="app-footer">
        <p>
          TaskFlow • Your personal
          task manager
        </p>
      </footer>
    </div>
  );
}

export default App;