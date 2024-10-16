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
    createEditButton,
    createDragHandle
} from "./htmlElements.js";

const taskLists = JSON.parse(localStorage.getItem("userList")) ?? [];
// format of lists
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
let currentDragItem = null;
let currentDragElement = null;
let currentDragImage = document.createElement("div");
currentDragImage.style.opacity = 0.75;
currentDragImage.style.position = "absolute";
currentDragImage.style.display = "none";
currentDragImage.style.pointerEvents = "none";
document.body.appendChild(currentDragImage);


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

document.addEventListener("touchmove", (event) => {
    if (currentDragElement !== null && currentDragItem !== null) {
        let touch = event.touches[0];
        let x = touch.clientX;
        let y = touch.clientY;

        const hoveredElement = document.elementFromPoint(x, y);

        // Loop through all task lists
        for (let i = 0; i < taskLists.length; i++) {
            const hoveredIndex = hoveredElement.getAttribute("body-index") ?? hoveredElement.getAttribute("index");
            const currentElement = document.getElementById(`list-body-${i}`);

            if (hoveredElement === null) {
                currentElement.removeHoverClass();
                break;
            }
            if (hoveredIndex === null) {
                currentElement.removeHoverClass();
                break;
            }

            if (currentElement !== currentDragElement) {
                if (i == hoveredIndex) {
                    currentElement.addHoverClass();
                } else {
                    currentElement.removeHoverClass();
                }
            }
        }
    }
});




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



        function removeHoverClass() {
            listElement.classList.remove("under-drag");
            listElement.classList.add("remove-drag");
            listElement.classList.add("mt-3");

            listElementRight.style.pointerEvents = "auto";
            listTitle.style.pointerEvents = "auto";
            dragHandle.style.pointerEvents = "auto";
            editInput.style.pointerEvents = "auto";
            editButton.style.pointerEvents = "auto";
            removeButton.style.pointerEvents = "auto";

            setTimeout(() => {
                listElement.classList.remove("remove-drag");
            }, 250);
        }

        function addHoverClass() {
            listElement.classList.add("under-drag")
            listElement.classList.remove("mt-3");

            listElementRight.style.pointerEvents = "none";
            listTitle.style.pointerEvents = "none";
            dragHandle.style.pointerEvents = "none";
            editInput.style.pointerEvents = "none";
            editButton.style.pointerEvents = "none";
            removeButton.style.pointerEvents = "none";
        }

        listElement.addHoverClass = function () {
            addHoverClass();
        }
        listElement.removeHoverClass = function () {
            removeHoverClass();
        }

        listElement.addEventListener("dragenter", (event) => {
            event.preventDefault();
            if (currentDragItem !== list) {
                addHoverClass();
            }
        });

        listElement.addEventListener("dragleave", (event) => {
            event.preventDefault();
            if (currentDragItem !== list) {
                removeHoverClass();
            }
        });

        listElement.addEventListener("dragend", (event) => {
            event.preventDefault();
            removeHoverClass();
        })

        listElement.addEventListener("dragover", (event) => {
            event.preventDefault();
        })

        listElement.addEventListener("drop", (event) => {
            event.preventDefault();

            removeHoverClass();
        });




        const dragHandle = createDragHandle();

        // Common function to handle the drag logic
        function handleDrag(event, isTouch = false) {
            if (isTouch) {
                // Get the touch point
                const touch = event.touches[0];
                event.clientX = touch.clientX;
                event.clientY = touch.clientY;
            }

            // Set the drag image position
            if (currentDragItem !== null) {
                currentDragImage.style.top = `${event.clientY + 10}px`;
            }
        }


        dragHandle.addEventListener("dragstart", (event) => {
            currentDragItem = list;
            currentDragElement = listElement;

            html2canvas(listElement).then((canvas) => {
                const dragImage = canvas;
                canvas.style.pointerEvents = "none";
                currentDragImage.innerHTML = "";
                currentDragImage.style.display = "block";
                currentDragImage.appendChild(dragImage);

            }).catch((error) => {
                console.error('Error generating drag image:', error);
            });
        });

        dragHandle.addEventListener("drag", (event) => {
            handleDrag(event);
        });

        dragHandle.addEventListener("dragend", (event) => {
            currentDragItem = null;
            currentDragElement = null;
            currentDragImage.style.display = "none"
        });

        // Touch events for mobile support
        dragHandle.addEventListener("touchstart", (event) => {
            event.preventDefault(); // Prevent scrolling
            currentDragItem = list; // Set the current drag item
            currentDragElement = listElement;

            html2canvas(listElement).then((canvas) => {
                const dragImage = canvas;
                currentDragImage.innerHTML = "";
                currentDragImage.style.display = "block";
                currentDragImage.appendChild(dragImage);
            }).catch((error) => {
                console.error('Error generating drag image:', error);
            });
        });

        dragHandle.addEventListener("touchmove", (event) => {
            handleDrag(event, true); // Handle touch drag
        });

        dragHandle.addEventListener("touchend", (event) => {
            event.preventDefault();
            for (let i = 0; i < taskLists.length; i++) {
                document.getElementById(`list-body-${i}`).removeHoverClass();
            }
            currentDragItem = null;
            currentDragElement = null;
            currentDragImage.style.display = "none"; // Hide the drag image
        });



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
            editInput.value = list.name;
            editInput.style.width = "100%"

            dragHandle.classList.add("bi", "bi-grip-vertical", "fs-2");

            listTitle.textContent = list.name;
            listTitle.style.textDecoration = list.done ? "line-through" : "none";

            listElement.classList.add(
                "bg-secondary", "p-1", "rounded",
                "d-flex", "justify-content-between",
                "align-items-center", "mt-3"
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

        let index = taskLists.indexOf(list); // identifier for mobile stuff

        listElement.id = `list-body-${index}`;
        listElement.setAttribute("body-index", index);
        listElementRight.setAttribute("index", index);
        listElementRight.setAttribute("index", index);
        listTitle.setAttribute("index", index);
        dragHandle.setAttribute("index", index);
        editInput.setAttribute("index", index);
        editButton.setAttribute("index", index);
        removeButton.setAttribute("index", index);

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
            const taskText = document.createElement("span");

            taskText.textContent = task.content;
            taskText.style.textDecoration = task.done ? "line-through" : "none";

            taskElement.classList.add("mt-3", "rounded");
            taskElement.style.width = "100%";
            taskElement.style.backgroundColor = "#c6c6c6";

            const editInput = document.createElement("textarea");
            editInput.style.display = "none";
            editInput.style.width = "75%";

            const editButton = createEditButton((event) => {
                if (editButton.innerText === "Edit") {

                    editInput.style.display = "inline-block";
                    taskText.style.display = "none";
                    editInput.value = taskText.innerText;


                    editButton.innerText = "Save";
                } else if (editButton.innerText === "Save") {

                    let newText = sanitizeInput(editInput.value);

                    if (newText !== "") {
                        task.content = newText;
                        updateContainers();
                    }

                    editInput.style.display = "none";
                    taskText.style.display = "inline-block";
                    editButton.innerText = "Edit";
                }
            });

            const doneButton = createDoneButton();
            doneButton.onclick = () => {
                task.done = !task.done;
                updateContainers();
            };

            const removeButton = createRemoveButton();
            removeButton.onclick = () => removeTask(index);

            doneButton.classList.add("me-1", "mb-1");
            editButton.classList.add("mb-1");
            removeButton.classList.add("mb-1");

            const div = document.createElement("div");

            div.classList.add("d-flex", "justify-content-center", "align-items-center")

            div.appendChild(doneButton);
            div.appendChild(editButton);
            div.appendChild(removeButton);
            taskElement.appendChild(taskText);
            taskElement.appendChild(editInput);
            taskElement.appendChild(div);

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
        taskAdder.value = "";
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
