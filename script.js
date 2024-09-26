"use strict";

const listContainer = document.getElementById("listContainer");
const taskContainer = document.getElementById("taskContainer");
let currentList = "example task list name";
const taskLists = {
    "example task list name": [
        {
            "content": "example task content",
            "done": false
        }
    ]
}

function updateContainers() {
    // Clear existing content
    listContainer.innerHTML = "";
    taskContainer.innerHTML = "";

    // Populate listContainer
    for (const listName in taskLists) {
        const listItem = document.createElement("div");
        listItem.textContent = listName;
        listItem.classList.add("list-item", "p-2", "border", "mb-2");

        // Highlight the current list
        if (listName === currentList) listItem.classList.add("bg-primary", "text-white");

        // Make list item clickable to switch to this task list
        listItem.onclick = () => {
            currentList = listName;
            updateContainers();
        };

        listContainer.appendChild(listItem);
    }

    // Populate taskContainer
    const tasks = taskLists[currentList];
    tasks.forEach((task, index) => {
        const taskDiv = document.createElement("div");
        taskDiv.classList.add("d-flex", "align-items-center", "p-2", "border", "mb-2", "rounded");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.done;
        checkbox.classList.add("mr-2");
        checkbox.onchange = () => {
            task.done = checkbox.checked;
        };

        const taskContent = document.createElement("span");
        taskContent.textContent = task.content;
        taskContent.classList.add(task.done ? "text-decoration-line-through" : "");

        taskDiv.appendChild(checkbox);
        taskDiv.appendChild(taskContent);
        taskContainer.appendChild(taskDiv);
    });
}

function addList() {
    const listName = prompt("Enter new list name:");
    if (listName && !taskLists[listName]) {
        taskLists[listName] = [];
        currentList = listName;
        updateContainers();
    }
}

function addTask() {
    const taskContent = prompt("Enter task content:");
    if (taskContent) {
        taskLists[currentList].push({ content: taskContent, done: false });
        updateContainers();
    }
}

function removeList() {
    delete taskLists[currentList];
    currentList = Object.keys(taskLists)[0] || ""; // Switch to another list or empty string
    updateContainers();
}

function removeTask() {
    delete taskLists[currentList]["example task list name"];
    updateContainers();
}