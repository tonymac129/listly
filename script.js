const taskList = document.getElementById("task-list");
const completedList = document.getElementById("completed-list");
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const inputPriority = document.getElementById("input-priority");
const inputDate = document.getElementById("input-date");
const inputTag = document.getElementById("input-tag");
const inputStar = document.getElementById("input-star");
const completeBtn = document.getElementById("complete-btn");
const completeBtnText = document.getElementById("complete-btn-text");
const modeBtn = document.getElementById("mode");
const clearBtn = document.getElementById("clear");
const settingsBtn = document.getElementById("settings-btn");
const settingsPanel = document.getElementById("settings");
const sortDropdown = document.getElementById("sort-dropdown");
const filterDropdown = document.getElementById("filter-dropdown");
const caret = document.getElementById("caret");
const dragPlaceholder = document.createElement("div");
dragPlaceholder.classList.add("drag-placeholder");
let savedTasks = localStorage.getItem("tasks") ? JSON.parse(localStorage.getItem("tasks")) : [];
let savedTags = localStorage.getItem("tags") ? JSON.parse(localStorage.getItem("tags")) : [];
let completedTasks = localStorage.getItem("completed") ? JSON.parse(localStorage.getItem("completed")) : [];
let taskId = localStorage.getItem("id") ? parseInt(localStorage.getItem("id")) : 0;
let sortMethod = localStorage.getItem("sort-method") ? localStorage.getItem("sort-method") : "created";
let newItemStarred = false;
let newItemTags = [];
let newItemDate = null;
const priorityOrderMap = {
  High: 1,
  Medium: 2,
  Low: 3,
  None: 4,
};
const fp = flatpickr(inputDate, {
  onChange: (date) => {
    let modified = date.toString().split(" ");
    if (modified[3] !== new Date().getFullYear().toString()) {
      newItemDate = modified.slice(1, 3).join(" ") + ", " + modified[3];
    } else {
      newItemDate = modified.slice(1, 3).join(" ");
    }
  },
});
sortDropdown.value = sortMethod;

completeBtnText.innerText = `Completed (${completedTasks.length})`;

completeBtn.addEventListener("click", () => {
  completedList.classList.toggle("none");
  caret.classList.toggle("rotate");
});

modeBtn.addEventListener("click", () => {
  modeBtn.src = modeBtn.src.includes("dark.svg") ? "icons/light.svg" : "icons/dark.svg";
  localStorage.setItem("mode", modeBtn.src.includes("dark.svg"));
  document.body.classList.toggle("light-mode");
});

settingsBtn.addEventListener("click", () => {
  settingsPanel.classList.toggle("none");
});

sortDropdown.addEventListener("change", () => {
  sortTasks(savedTasks);
  localStorage.setItem("sort-method", sortDropdown.value);
});

filterDropdown.addEventListener("change", () => {
  filterTasks(savedTasks, filterDropdown.value);
});

document.addEventListener("click", (e) => {
  if (!settingsPanel.contains(e.target) && e.target !== settingsBtn) {
    settingsPanel.classList.add("none");
  }
});

clearBtn.addEventListener("click", () => {
  if (
    confirm(
      "Are you sure you want to clear all your data on Listly? This will remove everything and this action cannot be undone!"
    )
  ) {
    localStorage.clear();
    window.location.reload();
  }
});

if (localStorage.getItem("mode") == "true") {
  modeBtn.src = "icons/dark.svg";
  document.body.classList.toggle("light-mode");
}

if (savedTasks.length > 0) {
  taskList.innerHTML = "";
  taskList.style.justifyContent = "start";
  savedTasks.forEach((taskItem) => {
    appendTaskItem(taskItem.task, taskItem.id, taskItem.starred, taskItem.tags, taskItem.priority, taskItem.date);
  });
}

if (savedTags.length > 0) {
  updateFilterDropdown();
}

if (completedTasks.length > 0) {
  completedList.innerHTML = "";
  completedList.style.justifyContent = "start";
  completedTasks.forEach((taskItem) => {
    appendCompleted(taskItem.task, taskItem.id, taskItem.tags);
  });
}

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (taskInput.value.trim().length > 0) {
    if (taskList.children.length == 0) {
      taskList.innerHTML = "";
      taskList.style.justifyContent = "start";
    }
    let taskValue = taskInput.value.trim();
    let taskObj = {
      task: taskValue,
      starred: newItemStarred,
      tags: newItemTags,
      priority: inputPriority.value,
      date: newItemDate,
      id: taskId,
    };
    taskId++;
    savedTasks.push(taskObj);
    localStorage.setItem("tasks", JSON.stringify(savedTasks));
    localStorage.setItem("id", taskId);
    appendTaskItem(taskObj.task, taskObj.id, taskObj.starred, taskObj.tags, taskObj.priority, taskObj.date);
    if (sortDropdown.value !== "custom") sortTasks(savedTasks);
    taskInput.value = "";
    taskInput.focus();
    inputPriority.value = "None";
    newItemDate = null;
    newItemStarred = false;
    inputStar.src = "icons/star.svg";
  }
});

inputDate.addEventListener("click", () => {
  fp.open();
});

inputTag.addEventListener("click", (e) => {
  e.preventDefault();
  document.querySelector(".tag-panel")?.remove();
  let mouseX = e.clientX;
  let mouseY = e.clientY - 280;
  appendTagPanel(mouseX, mouseY, -1, function (itemTags) {
    newItemTags = itemTags;
  });
});

inputStar.addEventListener("click", (e) => {
  e.preventDefault();
  inputStar.src = newItemStarred ? "icons/star.svg" : "icons/starred.svg";
  newItemStarred = !newItemStarred;
});

function appendTaskItem(text, id, starred, tags, priority, date) {
  const newTaskItem = document.createElement("div");
  newTaskItem.classList.add("task-item");
  const checkBox = document.createElement("img");
  checkBox.classList.add("task-checkbox");
  checkBox.src = "icons/uncheck.svg";
  const taskText = document.createElement("span");
  taskText.classList.add("task-text");
  taskText.innerHTML = text;
  const taskDate = document.createElement("span");
  taskDate.classList.add("task-date");
  taskDate.innerHTML = date;
  const taskItemInfo = document.createElement("span");
  taskItemInfo.classList.add("task-item-info");
  taskItemInfo.appendChild(taskText);
  if (date) {
    taskItemInfo.appendChild(taskDate);
  }
  const tagsContainer = document.createElement("div");
  tagsContainer.classList.add("tags-container");
  tags.forEach((tag) => {
    const tagDisplay = document.createElement("span");
    tagDisplay.innerHTML = tag;
    tagDisplay.classList.add("tag");
    tagsContainer.appendChild(tagDisplay);
  });
  const priorityDisplay = document.createElement("span");
  priorityDisplay.classList.add("tags-container");
  const taskBtns = document.createElement("div");
  taskBtns.classList.add("task-btns");
  const priorityDropdown = document.createElement("select");
  priorityDropdown.classList.add("priority-dropdown");
  priorityDropdown.innerHTML = `<option value="None">None</option><option value="Low">Low</option><option value="Medium">Mid</option><option value="High">High</option>`;
  priorityDisplay.appendChild(priorityDropdown);
  priorityDropdown.value = priority;
  if (priority !== "None" && priority) {
    priorityDropdown.classList.add("tag", priorityDropdown.value.toLowerCase(), "priority");
  }
  const dateBtn = document.createElement("img");
  dateBtn.classList.add("task-btn");
  dateBtn.src = "icons/date.svg";
  taskBtns.appendChild(dateBtn);
  const addBtn = document.createElement("img");
  addBtn.classList.add("task-btn");
  addBtn.src = "icons/tag.svg";
  taskBtns.appendChild(addBtn);
  const editBtn = document.createElement("img");
  editBtn.classList.add("task-btn");
  editBtn.src = "icons/edit.svg";
  taskBtns.appendChild(editBtn);
  const starBtn = document.createElement("img");
  starBtn.classList.add("task-btn");
  starBtn.src = starred ? "icons/starred.svg" : "icons/star.svg";
  if (starred) starBtn.classList.add("starred");
  taskBtns.appendChild(starBtn);
  const deleteBtn = document.createElement("img");
  deleteBtn.classList.add("task-btn");
  deleteBtn.src = "icons/delete.svg";
  taskBtns.appendChild(deleteBtn);
  newTaskItem.setAttribute("data-id", id);
  newTaskItem.appendChild(checkBox);
  newTaskItem.appendChild(taskItemInfo);
  newTaskItem.appendChild(tagsContainer);
  newTaskItem.appendChild(priorityDisplay);
  newTaskItem.appendChild(taskBtns);
  taskList.appendChild(newTaskItem);
  newTaskItem.draggable = true;

  checkBox.draggable = false;
  Array.from(taskBtns.children).forEach((btn) => {
    btn.draggable = false;
  });

  let draggedElement = null;

  taskList.addEventListener("dragstart", (e) => {
    draggedElement = e.target;
    e.dataTransfer.setData("text/plain", e.target.getAttribute("data-id"));
    setTimeout(() => {
      e.target.style.display = "none";
    }, 0);
  });

  taskList.addEventListener("drop", (e) => {
    e.preventDefault();

    if (draggedElement && dragPlaceholder.parentNode) {
      taskList.insertBefore(draggedElement, dragPlaceholder);
      sortDropdown.value = "custom";
      localStorage.setItem("sort-method", "custom");
      let newOrderArray = [];
      Array.from(taskList.children).forEach((item) => {
        savedTasks.forEach((task) => {
          if (task.id === parseInt(item.getAttribute("data-id"))) {
            newOrderArray.push(task);
          }
        });
      });
      savedTasks = newOrderArray;
      localStorage.setItem("tasks", JSON.stringify(savedTasks));
    }

    dragPlaceholder.remove();
  });

  taskList.addEventListener("dragend", (e) => {
    e.target.style.display = "flex";
    dragPlaceholder.remove();
  });

  taskList.addEventListener("dragleave", (e) => {
    if (!taskList.contains(e.relatedTarget)) {
      dragPlaceholder.remove();
    }
  });

  checkBox.addEventListener("mouseenter", () => {
    checkBox.src = "icons/check.svg";
  });

  checkBox.addEventListener("mouseleave", () => {
    checkBox.src = "icons/uncheck.svg";
  });

  checkBox.addEventListener("click", () => {
    if (completedList.children.length == 0) {
      completedList.innerHTML = "";
      completedList.style.justifyContent = "start";
    }

    let checkIndex = savedTasks.findIndex((item) => item.id === id);
    let taskData = savedTasks[checkIndex];
    savedTasks.splice(checkIndex, 1);
    localStorage.setItem("tasks", JSON.stringify(savedTasks));
    completedTasks.push(taskData);
    localStorage.setItem("completed", JSON.stringify(completedTasks));
    newTaskItem.remove();
    appendCompleted(taskData.task, taskData.id, taskData.tags);
    if (taskList.children.length == 0) {
      taskList.style.justifyContent = "center";
      taskList.innerHTML = "No tasks added. Type one below to get started!";
    }
    completeBtnText.innerText = `Completed (${completedTasks.length})`;
  });

  priorityDropdown.addEventListener("change", () => {
    let editIndex = savedTasks.findIndex((item) => item.id === id);
    savedTasks[editIndex] = {
      task: taskText.innerHTML,
      starred: starred,
      tags: tags,
      priority: priorityDropdown.value,
      date: date,
      id: id,
    };
    priority = priorityDropdown.value;
    localStorage.setItem("tasks", JSON.stringify(savedTasks));
    sortTasks(savedTasks);
    priorityDropdown.classList.remove("none");
    priorityDropdown.classList.remove("low");
    priorityDropdown.classList.remove("medium");
    priorityDropdown.classList.remove("high");
    priorityDropdown.classList.add("tag", priorityDropdown.value.toLowerCase(), "priority");
  });

  dateBtn.addEventListener("click", () => {
    const datePicker = flatpickr(dateBtn, {
      onChange: (date) => {
        let newItemDate;
        let modified = date.toString().split(" ");
        if (modified[3] !== new Date().getFullYear().toString()) {
          newItemDate = modified.slice(1, 3).join(" ") + ", " + modified[3];
        } else {
          newItemDate = modified.slice(1, 3).join(" ");
        }
        if (taskItemInfo.children.length > 1) {
          taskItemInfo.removeChild(taskItemInfo.children[1]);
        }
        const taskDate = document.createElement("span");
        taskDate.classList.add("task-date");
        taskDate.innerHTML = newItemDate;
        taskItemInfo.appendChild(taskDate);
        date = newItemDate;
        let dateIndex = savedTasks.findIndex((item) => item.id === id);
        savedTasks[dateIndex] = {
          task: taskText.innerHTML,
          starred: starred,
          tags: tags,
          priority: priority,
          date: date,
          id: id,
        };
        localStorage.setItem("tasks", JSON.stringify(savedTasks));
        sortTasks(savedTasks);
      },
    });
    datePicker.open();
  });

  addBtn.addEventListener("click", (e) => {
    let mouseX = e.clientX;
    let mouseY = e.clientY;
    document.querySelector(".tag-panel")?.remove();
    appendTagPanel(mouseX, mouseY, id, function (itemTags) {
      let addIndex = savedTasks.findIndex((item) => item.id === id);
      savedTasks[addIndex] = {
        task: taskText.innerHTML,
        starred: starred,
        tags: itemTags,
        priority: priority,
        date: date,
        id: id,
      };
      localStorage.setItem("tasks", JSON.stringify(savedTasks));
      tagsContainer.innerHTML = "";

      filterTasks(savedTasks, filterDropdown.value);
      itemTags.forEach((tag) => {
        const tagDisplay = document.createElement("span");
        tagDisplay.innerHTML = tag;
        tagDisplay.classList.add("tag");
        tagsContainer.appendChild(tagDisplay);
      });
    });
  });

  editBtn.addEventListener("click", () => {
    taskText.contentEditable = true;
    taskText.classList.add("editing");
    taskText.focus();
    const selection = window.getSelection();
    selection.removeAllRanges();
    const range = document.createRange();
    range.selectNodeContents(taskText);
    selection.addRange(range);
    taskText.addEventListener("blur", () => {
      if (taskText.innerHTML.replace(/[\Q&nbsp;\E\Q<br>\E]/g, "").trim().length > 1) {
        let editIndex = savedTasks.findIndex((item) => item.id === id);
        savedTasks[editIndex] = {
          task: taskText.innerHTML,
          starred: starred,
          tags: tags,
          priority: priority,
          date: date,
          id: id,
        };
        localStorage.setItem("tasks", JSON.stringify(savedTasks));
        sortTasks(savedTasks);
        taskText.contentEditable = false;
        taskText.style.outline = "none";
        taskText.classList.remove("editing");
      } else {
        taskText.focus();
        taskText.classList.add("invalid-edit");
        setTimeout(() => {
          taskText.classList.remove("invalid-edit");
        }, 1000);
      }
    });
  });

  starBtn.addEventListener("click", () => {
    starBtn.classList.toggle("starred");
    starBtn.src = starred ? "icons/star.svg" : "icons/starred.svg";
    let starIndex = savedTasks.findIndex((item) => item.id === id);
    starred = !starred;
    savedTasks[starIndex] = {
      task: taskText.innerHTML,
      starred: starred,
      tags: tags,
      priority: priority,
      date: date,
      id: id,
    };
    localStorage.setItem("tasks", JSON.stringify(savedTasks));
    sortTasks(savedTasks);
  });

  deleteBtn.addEventListener("click", () => {
    let removeIndex = savedTasks.findIndex((item) => item.id === id);
    savedTasks.splice(removeIndex, 1);
    localStorage.setItem("tasks", JSON.stringify(savedTasks));
    newTaskItem.remove();
    if (taskList.children.length == 0) {
      taskList.style.justifyContent = "center";
      taskList.innerHTML = "No tasks added. Type one below to get started!";
    }
  });
}

function appendCompleted(text, id, tags) {
  const completedTaskItem = document.createElement("div");
  completedTaskItem.classList.add("task-item");
  const checkBox = document.createElement("img");
  checkBox.classList.add("task-checkbox");
  checkBox.src = "icons/check.svg";
  const taskText = document.createElement("span");
  taskText.classList.add("crossed-task");
  taskText.innerHTML = text;
  const taskBtns = document.createElement("div");
  taskBtns.classList.add("task-btns");
  const tagsContainer = document.createElement("div");
  if (tags) {
    tags.forEach((tag) => {
      const tagDisplay = document.createElement("span");
      tagDisplay.innerHTML = tag;
      tagDisplay.classList.add("tag");
      tagsContainer.appendChild(tagDisplay);
    });
  }
  const deleteBtn = document.createElement("img");
  deleteBtn.classList.add("task-btn");
  deleteBtn.src = "icons/delete.svg";
  completedTaskItem.setAttribute("data-id", id);
  completedTaskItem.appendChild(checkBox);
  completedTaskItem.appendChild(taskText);
  completedTaskItem.appendChild(tagsContainer);
  taskBtns.appendChild(deleteBtn);
  completedTaskItem.appendChild(taskBtns);
  completedList.appendChild(completedTaskItem);

  checkBox.addEventListener("click", () => {
    if (taskList.children.length == 0) {
      taskList.innerHTML = "";
      taskList.style.justifyContent = "start";
    }
    let checkIndex = completedTasks.findIndex((item) => item.id === id);
    let taskData = completedTasks[checkIndex];
    completedTasks.splice(checkIndex, 1);
    localStorage.setItem("completed", JSON.stringify(completedTasks));
    savedTasks.push(taskData);
    localStorage.setItem("tasks", JSON.stringify(savedTasks));
    sortTasks(savedTasks);
    completedTaskItem.remove();
    if (completedList.children.length == 0) {
      completedList.style.justifyContent = "center";
      completedList.innerHTML = "No completed tasks. Go get some work done!";
    }
    completeBtnText.innerText = `Completed (${completedTasks.length})`;
  });

  deleteBtn.addEventListener("click", () => {
    let removeIndex = completedTasks.findIndex((item) => item.id === id);
    completedTasks.splice(removeIndex, 1);
    localStorage.setItem("completed", JSON.stringify(completedTasks));
    completedTaskItem.remove();
    completeBtnText.innerText = `Completed (${completedTasks.length})`;
    if (completedList.children.length == 0) {
      completedList.style.justifyContent = "center";
      completedList.innerHTML = "No completed tasks. Go get some work done!";
    }
  });
}

function appendTagPanel(mouseX, mouseY, id = -1, callback) {
  const tagPanel = document.createElement("div");
  tagPanel.style.left = mouseX + 25 + "px";
  tagPanel.style.top = mouseY + "px";
  const tagList = document.createElement("div");
  tagList.classList.add("tag-list");
  tagList.innerHTML = savedTags.length > 0 ? "" : "No tags";
  savedTags.forEach((tag) => {
    appendTag(tag);
  });

  tagPanel.appendChild(tagList);
  document.addEventListener("click", (e) => {
    if (
      !tagPanel.contains(e.target) &&
      !e.target.classList.contains("task-btn") &&
      !e.target.classList.contains("input-btn") &&
      !e.target.classList.contains("tag-delete")
    ) {
      let itemTags = [];
      tagList.querySelectorAll(".tag-item").forEach((tag) => {
        if (tag.children[0].checked) {
          itemTags.push(tag.children[1].innerText);
        }
      });
      tagPanel.remove();
      if (callback) callback(itemTags);
    }
  });
  const addTagBtn = document.createElement("button");
  addTagBtn.classList.add("add-tag-btn");
  addTagBtn.innerHTML = "Add Tag";
  addTagBtn.addEventListener("click", () => {
    if (!localStorage.getItem("tags") || JSON.parse(localStorage.getItem("tags")).length < 1) {
      tagList.innerHTML = "";
    }
    let newTagText = appendTag("New tag");
    newTagText.contentEditable = true;
    newTagText.focus();
    const selection = window.getSelection();
    selection.removeAllRanges();
    const range = document.createRange();
    range.selectNodeContents(newTagText);
    selection.addRange(range);
    newTagText.addEventListener("blur", () => {
      let content = newTagText.innerHTML.replace(/&nbsp;/g, "").trim();
      savedTags.push(content);
      localStorage.setItem("tags", JSON.stringify(savedTags));
      updateFilterDropdown();
      newTagText.contentEditable = false;
      newTagText.style.outline = "none";
    });
  });
  tagPanel.appendChild(addTagBtn);

  function appendTag(content) {
    const newTagItem = document.createElement("div");
    newTagItem.classList.add("tag-item");
    const tagItemBox = document.createElement("input");
    tagItemBox.type = "checkbox";
    let addIndex = savedTasks.findIndex((item) => item.id === id);
    if (addIndex > -1 && savedTasks[addIndex].tags?.includes(content)) {
      tagItemBox.checked = true;
    }

    newTagItem.appendChild(tagItemBox);
    const newTagText = document.createElement("span");
    newTagText.innerHTML = content;
    newTagItem.appendChild(newTagText);
    const tagDeleteBtn = document.createElement("img");
    tagDeleteBtn.classList.add("tag-delete");
    tagDeleteBtn.src = "icons/delete.svg";
    newTagItem.appendChild(tagDeleteBtn);
    tagList.appendChild(newTagItem);
    tagDeleteBtn.addEventListener("click", () => {
      savedTags.splice(savedTags.indexOf(content), 1);
      localStorage.setItem("tags", JSON.stringify(savedTags));
      updateFilterDropdown();
      newTagItem.remove();
      if (savedTags.length == 0) {
        tagList.innerHTML = "No tags";
      }
    });
    return newTagText;
  }

  document.documentElement.appendChild(tagPanel);
  tagPanel.classList.add("tag-panel");
}

function sortTasks(savedTasks) {
  let sortOrder = sortDropdown.value;
  savedTasks.sort((a, b) => {
    if (sortOrder === "priority") {
      return priorityOrderMap[a.priority] - priorityOrderMap[b.priority];
    } else if (sortOrder === "created") {
      return a.id - b.id;
    } else if (sortOrder === "date") {
      if (a.date === null) return 1;
      if (b.date === null) return -1;
      return new Date(a.date) - new Date(b.date);
    } else if (sortOrder === "starred") {
      return a.starred === b.starred ? 0 : a.starred ? -1 : 1;
    } else if (sortOrder === "name") {
      return a.task.localeCompare(b.task);
    }
  });
  taskList.innerHTML = "";
  savedTasks.forEach((taskItem) => {
    appendTaskItem(taskItem.task, taskItem.id, taskItem.starred, taskItem.tags, taskItem.priority, taskItem.date);
  });
  if (filterDropdown.value !== "l-all") {
    filterTasks(savedTasks, filterDropdown.value);
  }

  localStorage.setItem("tasks", JSON.stringify(savedTasks));
}

function filterTasks(tasks, filterTag) {
  taskList.innerHTML = "";
  if (filterTag === "l-all") {
    sortTasks(savedTasks);
  }
  if (filterTag === "l-starred") {
    tasks.forEach((task) => {
      if (task.starred) {
        appendTaskItem(task.task, task.id, task.starred, task.tags, task.priority, task.date);
      }
    });
  }
  tasks.forEach((task) => {
    if (task.tags.includes(filterTag)) {
      appendTaskItem(task.task, task.id, task.starred, task.tags, task.priority, task.date);
    }
  });
  if (taskList.children.length == 0) {
    taskList.innerHTML = "No task items match this filter! Try again with a different filter in the Settings menu.";
  }
}

function updateFilterDropdown() {
  const children = Array.from(filterDropdown.children);
  for (let i = 2; i < children.length; i++) {
    children[i].remove();
  }
  savedTags.forEach((tag) => {
    const option = document.createElement("option");
    option.value = tag;
    option.innerText = tag;
    filterDropdown.appendChild(option);
  });
}

taskList.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  const hoveredItem = e.target.closest(".task-item");
  if (hoveredItem && hoveredItem !== dragPlaceholder) {
    hoveredItem.parentNode.insertBefore(dragPlaceholder, hoveredItem);
  }
});
