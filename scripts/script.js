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

const taskLists = JSON.parse(localStorage.getItem("userList")) ?? [];
// const taskLists = [
//     {
//         "name": "example list name", // also the title of the list
//         "tasks": [
//             {
//                 "content": "string which is a description of a task",
//                 "done": false
//             }
//         ],
//         "done": false
//     }
// ]

let currentListIndex = 0; // index representing currently selected



addListButton.addEventListener("click", (event) => {
    addList();
})

addTaskButton.addEventListener("click", (event) => {
    addTask();
})

listAdderWarning.style.display = "none";

listAdder.addEventListener("input", (event) => {
    if (!listExists(sanitizeInput(listAdder.value))) {
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
    for (const list of taskLists) {

        checkListCompletion(list);
        const listElement = document.createElement("div");
        const listElementRight = document.createElement("div");
        const listTitle = document.createElement("h3");
        const dragHandle = document.createElement("span");

        const editInput = document.createElement("input");

        const editButton = createEditButton((event) => {
            if (editButton.innerText === "Edit") {

                editInput.style.display = "inline-block";
                listTitle.style.display = "none";


                editButton.innerText = "Save";
            } else if (editButton.innerText === "Save") {

                let listName = sanitizeInput(editInput.value);
                let foundList = listExists(listName);

                if (!foundList && listName !== "") {
                    list.name = listName;
                    updateContainers();
                }
                editInput.style.display = "none";
                listTitle.style.display = "inline-block";
                editButton.innerText = "Edit";
            }
        });

        const removeButton = createRemoveButton((event) => {
            event.stopPropagation(); // prevent switching to this list
            removeList(list);
        });


        function addStyling() {
            const defaultBrightness = taskLists[currentListIndex] === list ? 1.4 : 1;
            const hoverBrightness = taskLists[currentListIndex] === list ? 1.4 : 1.2;

            editButton.style.display = "none";
            editButton.classList.add("text-dark");
            
            editInput.style.display = "none";
            editInput.placeholder = list.name;
            editInput.style.width = "100%"

            dragHandle.classList.add("bi", "bi-grip-vertical", "fs-2");

            listTitle.textContent = list.name;
            listTitle.style.textDecoration = list.done ? "line-through" : "none";

            listElement.classList.add(
                "bg-secondary", "p-1", "rounded",
                "d-flex", "justify-content-between",
                "align-items-center", "mb-3"
            );
            listElementRight.classList.add(
                "d-flex", "align-items-center"
            )
            listElement.style.transition = ".25s";

            if (taskLists[currentListIndex] === list) {
                listElement.style.filter = "brightness(1.4)";
                editButton.style.display = "inline-block";
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
            if (taskLists[currentListIndex] !== list) {
                currentListIndex = taskLists.indexOf(list);
                console.log(currentListIndex);
                updateContainers();
            }
        };


        listElement.appendChild(dragHandle);
        listElement.appendChild(listTitle);
        listElement.appendChild(editInput);

        listElementRight.appendChild(editButton);
        listElementRight.appendChild(removeButton);

        listElement.appendChild(listElementRight);

        listContainer.appendChild(listElement);
    }

    // display tasks to page
    if (taskLists[currentListIndex] !== undefined) {

        taskLists[currentListIndex].tasks.forEach((task, index) => {
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

    localStorage.setItem("userList", JSON.stringify(taskLists));
}

function listExists(listName) {
    for (const list of taskLists) {
        if (list.name === listName) {
            return true;
        }
    }
    return false;
}

function addList() {
    const listName = sanitizeInput(listAdder.value);
    if (!listExists(listName) && listName !== "") {
        taskLists.push({ name: listName, tasks: [], done: false });
        listAdder.value = "";
        updateContainers();
    }
}

function addTask() {
    const taskDescription = sanitizeInput(taskAdder.value);
    if (taskDescription && taskLists[currentListIndex]) {
        taskLists[currentListIndex].tasks.push({ content: taskDescription, done: false });
        updateContainers();
    } else {
        alert("Invalid task description or list does not exist!");
    }
}

function removeList(list) {
    if (currentListIndex === taskLists.indexOf(list)) currentListIndex = 0;
    taskLists.splice(taskLists.indexOf(list), 1);
    updateContainers();
}

function removeTask(index) {
    taskLists[currentListIndex].tasks.splice(index, 1);
    checkListCompletion(taskLists[currentListIndex]);
    updateContainers();
}

function checkListCompletion(list) {
    if (list.tasks.length > 0) {
        if (list.tasks.every(task => task.done === true)) {
            list.done = true;
        } else {
            list.done = false;
        }
    }
}

function sanitizeInput(input) {
    // Allow only alphanumeric characters, basic punctuation, and whitespace
    return input.replace(/[^a-zA-Z0-9 .,!?-]/g, "");
}


// Initial update to display the example data
updateContainers();
