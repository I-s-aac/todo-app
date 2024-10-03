"use strict";

import {
    // html elements
    listContainer,
    taskContainer,
    listAdder,
    taskAdder,
    listAdderWarning,
    addTaskButton,
    addListButton,
    // functions
    createDoneButton,
    createRemoveButton,
    createEditButton
} from "./htmlElements.js";


const taskLists = {
    "example list name": {
        "tasks": [
            {
                "content": "string which is a description of a task",
                "done": false
            }
        ],
        "done": false
    }
}
let currentList = "example list name";


listAdderWarning.style.display = "none";

addListButton.addEventListener("click", (event) => {
    addList();
})

addTaskButton.addEventListener("click", (event) => {
    addTask();
})


listAdder.addEventListener("input", (event) => {
    if (checkForValidList(sanitizeInput(listAdder.value))) {
        listAdderWarning.style.display = "none";
        listAdder.setAttribute("aria-invalid", false);
    } else {
        listAdderWarning.style.display = "block";
        listAdder.setAttribute("aria-invalid", true);
    }
})

listAdder.addEventListener("blur", (event) => {
    if (listAdder.value === "") {
        listAdderWarning.style.display = "none";
        listAdder.setAttribute("aria-invalid", false);
    }
})




function updateContainers() {
    // clear containers
    listContainer.innerHTML = "";
    taskContainer.innerHTML = "";

    // display lists to page
    for (const listName in taskLists) {

        checkListCompletion(listName);
        const listElement = document.createElement("div");
        const listTitle = document.createElement("h3");

        const editButton = createEditButton((event) => {
            if (editButton.innerText === "Edit") {
                // do editing stuff
            } else if (editButton.innerText === "Save") {
                // do saving stuff
            }
        });

        const removeButton = createRemoveButton((event) => {
            event.stopPropagation(); // prevent switching to this list
            removeList(listName);
        });


        function addStyling() {
            const defaultBrightness = currentList === listName ? 1.4 : 1;
            const hoverBrightness = currentList === listName ? 1.4 : 1.2;

            listTitle.textContent = listName;
            listTitle.style.textDecoration = taskLists[listName].done === true ? "line-through" : "none";
            listElement.classList.add(
                "bg-secondary", "p-1", "rounded",
                "d-flex", "justify-content-center", "align-items-center"
            );
            listElement.style.transition = ".25s";

            if (currentList === listName) {
                listElement.style.filter = "brightness(1.4)";
            }
            listElement.onmouseenter = () => {
                listElement.style.filter = `brightness(${hoverBrightness})`;
            }
            listElement.onmouseleave = () => {
                listElement.style.filter = `brightness(${defaultBrightness})`;
            }
        }
        addStyling();


        listElement.onclick = () => {
            if (currentList !== listName) {
                currentList = listName;
                updateContainers();
            }
        };



        listElement.appendChild(listTitle);
        listElement.appendChild(editButton);
        listElement.appendChild(removeButton);

        listContainer.appendChild(listElement);
    }

    // display tasks to page
    if (taskLists[currentList] !== undefined) {

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
    }
}

function checkForValidList(listName) {
    return (listName && !taskLists[listName]);
}

function addList() {
    const listName = sanitizeInput(listAdder.value);
    if (checkForValidList(listName)) {
        taskLists[listName] = { tasks: [], done: false };
        listAdder.value = "";
        updateContainers();
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
