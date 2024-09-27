"use strict";

const listContainer = document.getElementById("listContainer");
const taskContainer = document.getElementById("taskContainer");
const listAdder = document.getElementById("listAdder");
const taskAdder = document.getElementById("taskAdder");
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
    button.classList.add("btn", "btn-secondary", "btn-close", "ms-3");
    return button;
}

function createDoneButton() {
    const button = document.createElement("button");
    button.classList.add("btn", "btn-secondary", "btn-sm", "btn-toggle", "ms-3");
    button.innerText = "Mark Complete";
    return button
}

function updateContainers() {
    // clear containers
    listContainer.innerHTML = "";
    taskContainer.innerHTML = "";

    // display lists to page
    for (const listName in taskLists) {
        checkListCompletion(listName);
        const listElement = document.createElement("h4");
        listElement.textContent = listName;
        listElement.style.textDecoration = taskLists[listName].done === true ? "line-through" : "none";
        listElement.classList.add("bg-secondary", "p-1", "rounded");
        if (currentList === listName) {
            listElement.style.filter = "brightness(1.5)";
        }
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

    // display tasks to page
    if (taskLists[currentList] !== undefined) {
        // taskAdder.style.display = "inline-block";
        // document.querySelector(`label[for="taskAdder"]`).textContent = "";

        taskLists[currentList].tasks.forEach((task, index) => {
            const taskElement = document.createElement("div");
            taskElement.textContent = task.content;
            taskElement.style.textDecoration = task.done ? "line-through" : "none";
            taskElement.classList.add("mt-3");

            const doneButton = createDoneButton();
            doneButton.onclick = () => {
                task.done = !task.done;
                updateContainers();
            };

            const removeButton = createRemoveButton();
            removeButton.onclick = () => removeTask(index);

            taskElement.appendChild(doneButton);
            taskElement.appendChild(removeButton);
            taskContainer.appendChild(taskElement);
        });
    } else {
        // taskAdder.style.display = "none";
        // document.querySelector(`label[for="taskAdder"]`).textContent = "Create or select a list in order to add tasks";
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
    const taskDescription = sanitizeInput(taskAdder.value);
    if (taskDescription && taskLists[currentList]) {
        taskLists[currentList].tasks.push({ content: taskDescription, done: false });
        updateContainers();
    } else {
        alert("Invalid task description or list does not exist!");
    }
}

function removeList(listName) {
    delete taskLists[listName];
    if (currentList === listName) currentList = Object.keys(taskLists)[0] || "";
    updateContainers();
}

function removeTask(index) {
    taskLists[currentList].tasks.splice(index, 1);
    checkListCompletion(currentList);
    updateContainers();
}

function checkListCompletion(listName) {
    if (taskLists[listName].tasks.length > 0) {
        if (taskLists[listName].tasks.every(task => task.done === true)) {
            taskLists[listName].done = true;
        } else {
            taskLists[listName].done = false;
        }
    }
}

function sanitizeInput(input) {
    // Allow only alphanumeric characters, basic punctuation, and whitespace
    return input.replace(/[^a-zA-Z0-9 .,!?-]/g, "");
}


// Initial update to display the example data
updateContainers();
