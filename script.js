"use strict";

const listContainer = document.getElementById("listContainer");
const taskContainer = document.getElementById("taskContainer");
const listAdder = document.getElementById("listAdder");
let currentList = "example list name";

// tasks/lists are only removed if you click some button on the task/list, marking them as done will not remove them
const taskLists = {
    "example list name": {
        "tasks": [
            {
                "content": "string which is a description of a task",
                "done": false
            }
        ],
        "done": false // if all the tasks within are cleared, use strikethrough on the list
    }
}

function createRemoveButton() {
    const button = document.createElement("button");
    button.classList.add("btn", "btn-secondary", "btn-close");
    return button;
}

function updateContainers() {
    // Clear containers first
    listContainer.innerHTML = "";
    taskContainer.innerHTML = "";
    
    // Populate lists
    for (const listName in taskLists) {
        const listElement = document.createElement("h3");
        listElement.textContent = listName;
        listElement.style.textDecoration = taskLists[listName].done ? "line-through" : "none";
        listElement.onclick = () => {
            currentList = listName;
            updateContainers();
        };

        const removeButton = createRemoveButton();
        removeButton.onclick = (e) => {
            e.stopPropagation(); // Prevent switching to this list when removing
            removeList(listName);
        };

        listElement.appendChild(removeButton);
        listContainer.appendChild(listElement);
    }

    // Populate tasks of the current list
    if (taskLists[currentList]) {
        taskLists[currentList].tasks.forEach((task, index) => {
            const taskElement = document.createElement("div");
            taskElement.textContent = task.content;
            taskElement.style.textDecoration = task.done ? "line-through" : "none";

            const doneButton = document.createElement("button");
            doneButton.classList.add("btn", "btn-sm", "btn-secondary");
            doneButton.textContent = "Mark Done";
            doneButton.onclick = () => {
                task.done = !task.done;
                updateContainers();
                checkListCompletion(currentList);
            };

            const removeButton = document.createElement("button");
            removeButton.classList.add("btn", "btn-sm", "btn-secondary");
            removeButton.textContent = "Remove";
            removeButton.onclick = () => removeTask(index);

            taskElement.appendChild(doneButton);
            taskElement.appendChild(removeButton);
            taskContainer.appendChild(taskElement);
        });
    }
}

function addList() {
    const listName = sanitizeInput(listAdder.value);
    if (listName && !taskLists[listName]) {
        taskLists[listName] = { tasks: [], done: false };
        updateContainers();
    } else {
        alert("Invalid or duplicate list name!");
    }
}

function addTask() {
    const taskDescription = prompt("Enter the task description:");
    if (taskDescription && taskLists[currentList]) {
        taskLists[currentList].tasks.push({ content: taskDescription, done: false });
        updateContainers();
    } else {
        alert("Invalid task description or list does not exist!");
    }
}

function removeList(listName) {
    if (confirm(`Are you sure you want to remove the list "${listName}"?`)) {
        delete taskLists[listName];
        if (currentList === listName) currentList = Object.keys(taskLists)[0] || "example list name";
        updateContainers();
    }
}

function removeTask(index) {
    if (confirm("Are you sure you want to remove this task?")) {
        taskLists[currentList].tasks.splice(index, 1);
        checkListCompletion(currentList);
        updateContainers();
    }
}

function checkListCompletion(listName) {
    if (taskLists[listName].tasks.every(task => task.done)) {
        taskLists[listName].done = true;
    } else {
        taskLists[listName].done = false;
    }
}

function sanitizeInput(input) {
    // Allow only alphanumeric characters, basic punctuation, and whitespace
    return input.replace(/[^a-zA-Z0-9 .,!?-]/g, "");
}


// Initial update to display the example data
updateContainers();
