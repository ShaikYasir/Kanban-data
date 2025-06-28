// Task Management System
class TaskManager {
  constructor() {
    this.tasks = this.loadTasks();
    this.timer = null;
    this.timerInterval = null;
    this.currentTimerTask = null;
    this.isTimerRunning = false;
    this.timerMode = "work"; // 'work' or 'break'
    this.timeRemaining = 25 * 60; // 25 minutes in seconds

    this.init();
    this.loadScheduleData();
  }

  init() {
    this.setupEventListeners();
    this.renderTasks();
    this.updateStats();
    this.setCurrentDate();
    this.setupDragAndDrop();
  }

  setupEventListeners() {
    // Modal controls
    document
      .getElementById("addTaskBtn")
      .addEventListener("click", () => this.openAddTaskModal());
    document
      .getElementById("timerBtn")
      .addEventListener("click", () => this.openTimerModal());
    document
      .getElementById("dataBtn")
      .addEventListener("click", () => this.openDataModal());
    document
      .getElementById("closeAddTask")
      .addEventListener("click", () => this.closeAddTaskModal());
    document
      .getElementById("closeTimer")
      .addEventListener("click", () => this.closeTimerModal());
    document
      .getElementById("closeData")
      .addEventListener("click", () => this.closeDataModal());
    document
      .getElementById("cancelAddTask")
      .addEventListener("click", () => this.closeAddTaskModal());

    // Form submission
    document
      .getElementById("addTaskForm")
      .addEventListener("submit", (e) => this.handleAddTask(e));

    // Date selector
    document
      .getElementById("dateSelector")
      .addEventListener("change", (e) => this.handleDateChange(e));

    // Timer controls
    document
      .getElementById("startTimer")
      .addEventListener("click", () => this.startTimer());
    document
      .getElementById("pauseTimer")
      .addEventListener("click", () => this.pauseTimer());
    document
      .getElementById("resetTimer")
      .addEventListener("click", () => this.resetTimer());

    // Data management controls
    document
      .getElementById("exportDataBtn")
      .addEventListener("click", () => this.exportData());
    document
      .getElementById("exportTodayBtn")
      .addEventListener("click", () => this.exportTodayData());
    document
      .getElementById("createBackupBtn")
      .addEventListener("click", () => this.createManualBackup());
    document
      .getElementById("importDataBtn")
      .addEventListener("click", () =>
        document.getElementById("importFile").click()
      );
    document
      .getElementById("importFile")
      .addEventListener("change", (e) => this.handleFileImport(e));
    document
      .getElementById("restoreBackupBtn")
      .addEventListener("click", () => this.showBackupList());
    document
      .getElementById("clearAllDataBtn")
      .addEventListener("click", () => this.clearAllData());
    document
      .getElementById("resetToDefaultBtn")
      .addEventListener("click", () => this.resetToDefault());

    // Close modals when clicking outside
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        e.target.classList.remove("active");
      }
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeAllModals();
      }
      if (e.ctrlKey && e.key === "n") {
        e.preventDefault();
        this.openAddTaskModal();
      }
    });
  }

  loadScheduleData() {
    // Predefined schedule data based on the CSV
    const scheduleData = {
      placement: [
        "Solve 2 Leetcode problems",
        "Revise 1 ML project notebook",
        "Update resume bullet point",
        "Practice 1 mock interview question",
      ],
      upsc: [
        "Make current affairs notes from The Hindu",
        "Read 1 GS topic (Polity/History/Geography)",
        "Practice 5 CSAT questions",
        "Revise 1 NCERT chapter",
      ],
      defence: [
        "Revise 1 Defence GK topic",
        "Solve 10 Pathfinder MCQs",
        "Take a mini mock test (20 questions)",
        "Read CDS/AFCAT English comprehension passage",
      ],
      fitness: [
        "Drink 3L water",
        "Eat home-cooked meals only",
        "30 min morning walk or HIIT",
        "Track calories for the day",
      ],
      college: [
        "Attend classes & take notes",
        "Prepare slides for project",
        "Complete assignment or lab task",
        "Revise one subject for internal quiz",
      ],
    };

    // Auto-generate tasks for today if none exist
    const today = new Date().toISOString().split("T")[0];
    const todayTasks = this.tasks.filter((task) => task.date === today);

    if (todayTasks.length === 0) {
      this.generateDailyTasks(scheduleData, today);
    }
  }

  generateDailyTasks(scheduleData, date) {
    const categories = Object.keys(scheduleData);
    categories.forEach((category) => {
      const tasks = scheduleData[category];
      const randomTask = tasks[Math.floor(Math.random() * tasks.length)];

      const task = {
        id: this.generateId(),
        title: randomTask,
        description: `Daily ${category} task`,
        category: category,
        priority: "medium",
        estimatedTime: this.getEstimatedTime(category),
        status: "todo",
        date: date,
        createdAt: new Date().toISOString(),
        timeSpent: 0,
        completed: false,
      };

      this.tasks.push(task);
    });

    this.saveTasks();
    this.renderTasks();
    this.updateStats();
  }

  getEstimatedTime(category) {
    const timeMap = {
      placement: 45,
      upsc: 30,
      defence: 25,
      fitness: 15,
      college: 60,
    };
    return timeMap[category] || 30;
  }

  generateId() {
    return "task_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  }

  setCurrentDate() {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("dateSelector").value = today;
  }

  handleDateChange(e) {
    this.renderTasks();
    this.updateStats();
  }

  openAddTaskModal() {
    document.getElementById("addTaskModal").classList.add("active");
    document.getElementById("taskTitle").focus();
  }

  closeAddTaskModal() {
    document.getElementById("addTaskModal").classList.remove("active");
    document.getElementById("addTaskForm").reset();
  }

  openTimerModal() {
    document.getElementById("timerModal").classList.add("active");
  }

  closeTimerModal() {
    document.getElementById("timerModal").classList.remove("active");
  }

  openDataModal() {
    document.getElementById("dataModal").classList.add("active");
    this.updateDataInfo();
  }

  closeDataModal() {
    document.getElementById("dataModal").classList.remove("active");
  }

  closeAllModals() {
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.classList.remove("active");
    });
  }

  handleAddTask(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const selectedDate = document.getElementById("dateSelector").value;

    const task = {
      id: this.generateId(),
      title: document.getElementById("taskTitle").value,
      description: document.getElementById("taskDescription").value,
      category: document.getElementById("taskCategory").value,
      priority: document.getElementById("taskPriority").value,
      estimatedTime: parseInt(document.getElementById("taskTime").value),
      status: "todo",
      date: selectedDate,
      createdAt: new Date().toISOString(),
      timeSpent: 0,
      completed: false,
    };

    this.tasks.push(task);
    this.saveTasks();
    this.renderTasks();
    this.updateStats();
    this.closeAddTaskModal();

    this.showNotification("Task added successfully!", "success");
  }

  renderTasks() {
    const selectedDate = document.getElementById("dateSelector").value;
    const filteredTasks = this.tasks.filter(
      (task) => task.date === selectedDate
    );

    // Clear existing tasks
    document.getElementById("todoList").innerHTML = "";
    document.getElementById("inprogressList").innerHTML = "";
    document.getElementById("completedList").innerHTML = "";

    // Group tasks by status
    const tasksByStatus = {
      todo: filteredTasks.filter((task) => task.status === "todo"),
      inprogress: filteredTasks.filter((task) => task.status === "inprogress"),
      completed: filteredTasks.filter((task) => task.status === "completed"),
    };

    // Render tasks in each column
    Object.keys(tasksByStatus).forEach((status) => {
      const container = document.getElementById(`${status}List`);
      const count = document.getElementById(`${status}Count`);

      tasksByStatus[status].forEach((task) => {
        container.appendChild(this.createTaskElement(task));
      });

      count.textContent = tasksByStatus[status].length;
    });
  }

  createTaskElement(task) {
    const taskElement = document.createElement("div");
    taskElement.className = "task-item";
    taskElement.draggable = true;
    taskElement.dataset.taskId = task.id;

    const priorityClass = task.priority;
    const categoryClass = task.category;
    const timeSpentFormatted = this.formatTime(task.timeSpent);
    const estimatedTimeFormatted = this.formatTime(task.estimatedTime * 60);

    taskElement.innerHTML = `
            <div class="task-header">
                <div class="task-title">${task.title}</div>
                <div class="task-actions">
                    <button class="task-action-btn" onclick="taskManager.startTaskTimer('${
                      task.id
                    }')" title="Start Timer">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="task-action-btn" onclick="taskManager.editTask('${
                      task.id
                    }')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-action-btn" onclick="taskManager.deleteTask('${
                      task.id
                    }')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="task-meta">
                <span class="task-category ${categoryClass}">${
      task.category
    }</span>
                <span class="task-priority ${priorityClass}">${
      task.priority
    }</span>
                <span class="task-time">
                    <i class="fas fa-clock"></i>
                    ${estimatedTimeFormatted}
                </span>
            </div>
            ${
              task.description
                ? `<div class="task-description">${task.description}</div>`
                : ""
            }
            <div class="task-footer">
                <div class="task-timer">
                    <i class="fas fa-stopwatch"></i>
                    Time spent: ${timeSpentFormatted}
                </div>
                ${
                  task.status !== "completed"
                    ? `
                    <button class="timer-btn" onclick="taskManager.startTaskTimer('${task.id}')">
                        Start Timer
                    </button>
                `
                    : ""
                }
            </div>
        `;

    return taskElement;
  }

  setupDragAndDrop() {
    document.addEventListener("dragstart", (e) => {
      if (e.target.classList.contains("task-item")) {
        e.target.classList.add("dragging");
        e.dataTransfer.setData("text/plain", e.target.dataset.taskId);
      }
    });

    document.addEventListener("dragend", (e) => {
      if (e.target.classList.contains("task-item")) {
        e.target.classList.remove("dragging");
      }
    });

    document.querySelectorAll(".task-list").forEach((list) => {
      list.addEventListener("dragover", (e) => {
        e.preventDefault();
        list.classList.add("drag-over");
      });

      list.addEventListener("dragleave", () => {
        list.classList.remove("drag-over");
      });

      list.addEventListener("drop", (e) => {
        e.preventDefault();
        list.classList.remove("drag-over");

        const taskId = e.dataTransfer.getData("text/plain");
        const newStatus = list.closest(".kanban-column").dataset.status;

        this.updateTaskStatus(taskId, newStatus);
      });
    });
  }

  updateTaskStatus(taskId, newStatus) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      task.status = newStatus;
      if (newStatus === "completed") {
        task.completed = true;
        task.completedAt = new Date().toISOString();
      } else {
        task.completed = false;
        delete task.completedAt;
      }

      this.saveTasks();
      this.renderTasks();
      this.updateStats();
      this.showNotification(`Task moved to ${newStatus}`, "success");
    }
  }

  startTaskTimer(taskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      this.currentTimerTask = task;
      this.timeRemaining = task.estimatedTime * 60;
      this.openTimerModal();
      this.updateTimerDisplay();
    }
  }

  startTimer() {
    if (!this.isTimerRunning) {
      this.isTimerRunning = true;
      document.querySelector(".timer-circle").classList.add("active");

      this.timerInterval = setInterval(() => {
        this.timeRemaining--;
        this.updateTimerDisplay();

        if (this.timeRemaining <= 0) {
          this.timerComplete();
        }
      }, 1000);

      document.getElementById("startTimer").textContent = "Running...";
      document.getElementById("startTimer").disabled = true;
    }
  }

  pauseTimer() {
    if (this.isTimerRunning) {
      this.isTimerRunning = false;
      clearInterval(this.timerInterval);
      document.querySelector(".timer-circle").classList.remove("active");
      document.getElementById("startTimer").textContent = "Start";
      document.getElementById("startTimer").disabled = false;
    }
  }

  resetTimer() {
    this.pauseTimer();
    const workDuration =
      parseInt(document.getElementById("workDuration").value) || 25;
    this.timeRemaining = workDuration * 60;
    this.updateTimerDisplay();
  }

  timerComplete() {
    this.pauseTimer();

    if (this.currentTimerTask) {
      const sessionTime =
        parseInt(document.getElementById("workDuration").value) * 60;
      this.currentTimerTask.timeSpent += sessionTime;
      this.saveTasks();
      this.renderTasks();
      this.updateStats();
    }

    this.showNotification("Timer completed! Great work!", "success");
    this.playNotificationSound();

    // Switch to break mode
    this.timerMode = this.timerMode === "work" ? "break" : "work";
    const breakDuration =
      parseInt(document.getElementById("breakDuration").value) || 5;
    this.timeRemaining = breakDuration * 60;
    this.updateTimerDisplay();
  }

  updateTimerDisplay() {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    const timeString = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
    document.getElementById("timerTime").textContent = timeString;
  }

  deleteTask(taskId) {
    if (confirm("Are you sure you want to delete this task?")) {
      this.tasks = this.tasks.filter((t) => t.id !== taskId);
      this.saveTasks();
      this.renderTasks();
      this.updateStats();
      this.showNotification("Task deleted successfully!", "success");
    }
  }

  editTask(taskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      // Populate form with existing data
      document.getElementById("taskTitle").value = task.title;
      document.getElementById("taskDescription").value = task.description;
      document.getElementById("taskCategory").value = task.category;
      document.getElementById("taskPriority").value = task.priority;
      document.getElementById("taskTime").value = task.estimatedTime;

      // Remove the task and open modal for editing
      this.deleteTask(taskId);
      this.openAddTaskModal();
    }
  }

  updateStats() {
    const selectedDate = document.getElementById("dateSelector").value;
    const dayTasks = this.tasks.filter((task) => task.date === selectedDate);

    const totalTasks = dayTasks.length;
    const completedTasks = dayTasks.filter((task) => task.completed).length;
    const totalTimeSpent = dayTasks.reduce(
      (sum, task) => sum + task.timeSpent,
      0
    );
    const productivity =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    document.getElementById("totalTasks").textContent = totalTasks;
    document.getElementById("completedTasks").textContent = completedTasks;
    document.getElementById("timeSpent").textContent =
      this.formatTime(totalTimeSpent);
    document.getElementById("productivity").textContent = productivity + "%";
  }

  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${
                  type === "success" ? "check-circle" : "info-circle"
                }"></i>
                <span>${message}</span>
            </div>
        `;

    // Add styles
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === "success" ? "#d4edda" : "#d1ecf1"};
            color: ${type === "success" ? "#155724" : "#0c5460"};
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1100;
            animation: slideIn 0.3s ease;
        `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  playNotificationSound() {
    // Create audio context for notification sound
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log("Audio notification not supported");
    }
  }

  loadTasks() {
    try {
      const saved = localStorage.getItem("kanban_tasks");
      if (saved) {
        const tasks = JSON.parse(saved);
        // Validate and clean up tasks
        return tasks.filter((task) => task && task.id && task.title);
      }
      return [];
    } catch (error) {
      console.error("Error loading tasks:", error);
      this.showNotification(
        "Error loading saved tasks. Starting fresh.",
        "error"
      );
      return [];
    }
  }

  saveTasks() {
    try {
      // Create backup before saving
      this.createBackup();

      // Save main data
      localStorage.setItem("kanban_tasks", JSON.stringify(this.tasks));

      // Save metadata
      const metadata = {
        lastSaved: new Date().toISOString(),
        version: "1.0",
        taskCount: this.tasks.length,
      };
      localStorage.setItem("kanban_metadata", JSON.stringify(metadata));

      // Auto-export daily backup
      this.autoBackup();
    } catch (error) {
      console.error("Error saving tasks:", error);
      this.showNotification("Error saving tasks. Please try again.", "error");
    }
  }

  createBackup() {
    try {
      // Keep last 5 backups
      const backups = [];
      for (let i = 4; i >= 1; i--) {
        const backup = localStorage.getItem(`kanban_backup_${i}`);
        if (backup) {
          localStorage.setItem(`kanban_backup_${i + 1}`, backup);
        }
      }

      // Create new backup
      localStorage.setItem(
        "kanban_backup_1",
        JSON.stringify({
          tasks: this.tasks,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.warn("Backup creation failed:", error);
    }
  }

  autoBackup() {
    try {
      const today = new Date().toISOString().split("T")[0];
      const lastBackup = localStorage.getItem("last_daily_backup");

      if (lastBackup !== today) {
        // Create daily backup
        const dailyBackup = {
          date: today,
          tasks: this.tasks,
          stats: this.getDailyStats(),
        };
        localStorage.setItem(
          `daily_backup_${today}`,
          JSON.stringify(dailyBackup)
        );
        localStorage.setItem("last_daily_backup", today);

        // Clean old daily backups (keep last 30 days)
        this.cleanOldBackups();
      }
    } catch (error) {
      console.warn("Auto-backup failed:", error);
    }
  }

  cleanOldBackups() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("daily_backup_")) {
          const dateStr = key.replace("daily_backup_", "");
          const backupDate = new Date(dateStr);
          if (backupDate < thirtyDaysAgo) {
            localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.warn("Cleanup failed:", error);
    }
  }

  getDailyStats() {
    const today = new Date().toISOString().split("T")[0];
    const dayTasks = this.tasks.filter((task) => task.date === today);

    return {
      totalTasks: dayTasks.length,
      completedTasks: dayTasks.filter((task) => task.completed).length,
      totalTimeSpent: dayTasks.reduce((sum, task) => sum + task.timeSpent, 0),
      categories: dayTasks.reduce((acc, task) => {
        acc[task.category] = (acc[task.category] || 0) + 1;
        return acc;
      }, {}),
    };
  }

  restoreFromBackup(backupNumber = 1) {
    try {
      const backup = localStorage.getItem(`kanban_backup_${backupNumber}`);
      if (backup) {
        const backupData = JSON.parse(backup);
        this.tasks = backupData.tasks || [];
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.showNotification(
          `Restored from backup ${backupNumber}`,
          "success"
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Restore failed:", error);
      this.showNotification(
        "Restore failed. Backup may be corrupted.",
        "error"
      );
      return false;
    }
  }

  updateDataInfo() {
    try {
      const metadata = JSON.parse(
        localStorage.getItem("kanban_metadata") || "{}"
      );
      const storageSize = new Blob([JSON.stringify(this.tasks)]).size;

      document.getElementById("totalStoredTasks").textContent =
        this.tasks.length;
      document.getElementById("lastSavedTime").textContent = metadata.lastSaved
        ? new Date(metadata.lastSaved).toLocaleString()
        : "Never";
      document.getElementById("storageUsed").textContent = `${(
        storageSize / 1024
      ).toFixed(1)} KB`;

      // Count available backups
      let backupCount = 0;
      for (let i = 1; i <= 5; i++) {
        if (localStorage.getItem(`kanban_backup_${i}`)) backupCount++;
      }
      document.getElementById("availableBackups").textContent = backupCount;
    } catch (error) {
      console.error("Error updating data info:", error);
    }
  }

  exportTodayData() {
    const today = new Date().toISOString().split("T")[0];
    const todayTasks = this.tasks.filter((task) => task.date === today);

    const exportData = {
      date: today,
      tasks: todayTasks,
      stats: this.getDailyStats(),
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `daily_tasks_${today}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    this.showNotification("Today's tasks exported successfully!", "success");
  }

  createManualBackup() {
    try {
      this.createBackup();
      this.showNotification("Manual backup created successfully!", "success");
      this.updateDataInfo();
    } catch (error) {
      this.showNotification("Failed to create backup", "error");
    }
  }

  handleFileImport(event) {
    const file = event.target.files[0];
    if (file) {
      this.importData(file);
    }
  }

  showBackupList() {
    const backupList = document.getElementById("backupList");
    backupList.innerHTML = "";

    let hasBackups = false;

    // Show manual backups
    for (let i = 1; i <= 5; i++) {
      const backup = localStorage.getItem(`kanban_backup_${i}`);
      if (backup) {
        hasBackups = true;
        try {
          const backupData = JSON.parse(backup);
          const backupItem = this.createBackupListItem(
            `Manual Backup ${i}`,
            backupData.timestamp,
            backupData.tasks.length,
            () => this.restoreFromBackup(i),
            () => this.deleteBackup(`kanban_backup_${i}`)
          );
          backupList.appendChild(backupItem);
        } catch (error) {
          console.error(`Error parsing backup ${i}:`, error);
        }
      }
    }

    // Show daily backups (last 7 days)
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dailyBackup = localStorage.getItem(`daily_backup_${dateStr}`);

      if (dailyBackup) {
        hasBackups = true;
        try {
          const backupData = JSON.parse(dailyBackup);
          const backupItem = this.createBackupListItem(
            `Daily Backup`,
            dateStr,
            backupData.tasks.length,
            () => this.restoreFromDailyBackup(dateStr),
            () => this.deleteBackup(`daily_backup_${dateStr}`)
          );
          backupList.appendChild(backupItem);
        } catch (error) {
          console.error(`Error parsing daily backup ${dateStr}:`, error);
        }
      }
    }

    if (!hasBackups) {
      backupList.innerHTML =
        '<div class="no-backups">No backups available</div>';
    }
  }

  createBackupListItem(
    title,
    timestamp,
    taskCount,
    restoreCallback,
    deleteCallback
  ) {
    const item = document.createElement("div");
    item.className = "backup-item";

    item.innerHTML = `
            <div class="backup-info">
                <div class="backup-date">${title}</div>
                <div class="backup-details">${new Date(
                  timestamp
                ).toLocaleString()} • ${taskCount} tasks</div>
            </div>
            <div class="backup-actions">
                <button class="backup-btn restore">Restore</button>
                <button class="backup-btn delete">Delete</button>
            </div>
        `;

    item.querySelector(".restore").addEventListener("click", restoreCallback);
    item.querySelector(".delete").addEventListener("click", deleteCallback);

    return item;
  }

  restoreFromDailyBackup(dateStr) {
    try {
      const backup = localStorage.getItem(`daily_backup_${dateStr}`);
      if (backup) {
        const backupData = JSON.parse(backup);
        this.tasks = backupData.tasks || [];
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.showNotification(
          `Restored from daily backup (${dateStr})`,
          "success"
        );
        this.closeDataModal();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Daily restore failed:", error);
      this.showNotification(
        "Restore failed. Backup may be corrupted.",
        "error"
      );
      return false;
    }
  }

  deleteBackup(backupKey) {
    if (confirm("Are you sure you want to delete this backup?")) {
      localStorage.removeItem(backupKey);
      this.showBackupList();
      this.updateDataInfo();
      this.showNotification("Backup deleted", "success");
    }
  }

  clearAllData() {
    if (
      confirm(
        "⚠️ This will delete ALL tasks and data. This action cannot be undone. Are you sure?"
      )
    ) {
      if (
        confirm(
          "Last warning: This will permanently delete everything. Continue?"
        )
      ) {
        // Clear all task data
        this.tasks = [];
        localStorage.removeItem("kanban_tasks");
        localStorage.removeItem("kanban_metadata");

        // Clear all backups
        for (let i = 1; i <= 5; i++) {
          localStorage.removeItem(`kanban_backup_${i}`);
        }

        // Clear daily backups
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("daily_backup_")) {
            localStorage.removeItem(key);
          }
        }

        this.renderTasks();
        this.updateStats();
        this.updateDataInfo();
        this.showNotification("All data cleared successfully", "success");
        this.closeDataModal();
      }
    }
  }

  resetToDefault() {
    if (
      confirm(
        "This will replace all current tasks with default daily tasks. Continue?"
      )
    ) {
      // Create backup before reset
      this.createBackup();

      // Clear current tasks
      this.tasks = [];

      // Generate today's default tasks
      const today = new Date().toISOString().split("T")[0];
      this.loadScheduleData();

      this.renderTasks();
      this.updateStats();
      this.showNotification("Reset to default tasks completed", "success");
      this.closeDataModal();
    }
  }

  exportData() {
    const dataStr = JSON.stringify(this.tasks, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `tasks_backup_${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  }

  importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTasks = JSON.parse(e.target.result);
        this.tasks = importedTasks;
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.showNotification("Data imported successfully!", "success");
      } catch (error) {
        this.showNotification(
          "Error importing data. Please check the file format.",
          "error"
        );
      }
    };
    reader.readAsText(file);
  }
}

// Initialize the application
let taskManager;

document.addEventListener("DOMContentLoaded", () => {
  taskManager = new TaskManager();

  // Add keyboard shortcuts info to help
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === "?") {
      e.preventDefault();
      showKeyboardShortcuts();
    }
  });
});

function showKeyboardShortcuts() {
  const shortcuts = [
    { key: "Ctrl + N", description: "Add new task" },
    { key: "Esc", description: "Close modals" },
    { key: "Ctrl + Shift + ?", description: "Show this help" },
  ];

  const helpContent = shortcuts
    .map((s) => `<div><kbd>${s.key}</kbd> - ${s.description}</div>`)
    .join("");

  taskManager.showNotification(
    `
        <div style="text-align: left;">
            <strong>Keyboard Shortcuts:</strong><br>
            ${helpContent}
        </div>
    `,
    "info"
  );
}

// Service Worker Registration for PWA support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => console.log("SW registered: ", registration))
      .catch((registrationError) =>
        console.log("SW registration failed: ", registrationError)
      );
  });
}
