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

import {
    // functions
    addList,
    removeList
} from "./listFunctions.js";

import {
    // variables
    taskLists,
    draggingData,
    listTrackingData
} from "./globalVars.js";

import {
    // functions
    sanitizeInput,
    listExists,
    checkListCompletion
} from "./utils.js";

draggingData.currentDragImage.style.opacity = 0.75;
draggingData.currentDragImage.style.position = "absolute";
draggingData.currentDragImage.style.display = "none";
draggingData.currentDragImage.style.pointerEvents = "none";
document.body.appendChild(draggingData.currentDragImage);


addListButton.addEventListener("click", (event) => {
    const condition = addList();
    if (condition) { updateContainers(); }
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
    if (draggingData.currentDragElement !== null && currentDragItem !== null) {
        let touch = event.touches[0];
        let x = touch.clientX;
        let y = touch.clientY;

        const hoveredElement = document.elementFromPoint(x, y);

        if (currentDragItem.tasks !== null) {
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

                if (currentElement !== draggingData.currentDragElement) {
                    if (i == hoveredIndex) {
                        currentElement.addHoverClass();
                    } else {
                        currentElement.removeHoverClass();
                    }
                }
            }
        } else if (currentDragItem.content !== null) {
            for (let i = 0; i < taskLists[listTrackingData.currentListIndex].tasks.length; i++) {
                const hoveredIndex = hoveredElement.getAttribute("index");
                const currentElement = document.getElementById(`task-${i}`);

                if (hoveredElement === null) {
                    currentElement.removeHoverClass();
                    break;
                }
                if (hoveredIndex === null) {
                    currentElement.removeHoverClass();
                    break;
                }

                if (currentElement !== draggingData.currentDragElement) {
                    if (i == hoveredIndex) {
                        currentElement.addHoverClass();
                    } else {
                        currentElement.removeHoverClass();
                    }
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

        function moveList(fromIndex, toIndex) {
            // Make sure we're not trying to move the list to itself
            fromIndex = Number(fromIndex);
            toIndex = Number(toIndex);

            if (toIndex < 0) { return; }
            if (fromIndex === toIndex) return;

            // Remove the item from its current position
            const listToMove = taskLists.splice(fromIndex, 1)[0];

            // Insert the list at the new index
            taskLists.splice(toIndex, 0, listToMove);
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
            listElement.classList.remove("drag-placeholder");
        })

        listElement.addEventListener("dragover", (event) => {
            event.preventDefault();
        })

        listElement.addEventListener("drop", (event) => {
            event.preventDefault();

            let x = event.clientX;
            let y = event.clientY;

            const hoveredElement = document.elementFromPoint(x, y);

            if (hoveredElement !== draggingData.currentDragElement) {
                const hoveredIndex = hoveredElement.getAttribute("body-index") ?? hoveredElement.getAttribute("index");
                if (hoveredIndex !== null) {
                    // Perform the move operation using your function
                    moveList(draggingData.currentDragElement.getAttribute("body-index"), hoveredIndex);
                    updateContainers(); // Update the UI after moving
                }
            }
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
                const rect = draggingData.currentDragElement.getBoundingClientRect();
                draggingData.currentDragImage.style.top = `${event.clientY + 10}px`;
                draggingData.currentDragImage.style.left = `${rect.left}px`;
            }
        }

        dragHandle.addEventListener("dragstart", (event) => {
            currentDragItem = list;
            draggingData.currentDragElement = listElement;

            html2canvas(listElement).then((canvas) => {
                const dragImage = canvas;
                canvas.style.pointerEvents = "none";
                draggingData.currentDragImage.innerHTML = "";
                draggingData.currentDragImage.style.display = "block";
                draggingData.currentDragImage.appendChild(dragImage);
                listElement.classList.add("drag-placeholder");

            }).catch((error) => {
                console.error('Error generating drag image:', error);
            });
        });

        dragHandle.addEventListener("drag", (event) => {
            handleDrag(event);
        });

        dragHandle.addEventListener("dragend", (event) => {
            currentDragItem = null;
            draggingData.currentDragElement = null;
            draggingData.currentDragImage.style.display = "none"
        });

        // Touch events for mobile support
        dragHandle.addEventListener("touchstart", (event) => {
            event.preventDefault(); // Prevent scrolling
            currentDragItem = list; // Set the current drag item
            draggingData.currentDragElement = listElement;

            html2canvas(listElement).then((canvas) => {
                const dragImage = canvas;
                draggingData.currentDragImage.innerHTML = "";
                draggingData.currentDragImage.style.display = "block";
                draggingData.currentDragImage.appendChild(dragImage);
                listElement.classList.add("drag-placeholder");
            }).catch((error) => {
                console.error('Error generating drag image:', error);
            });
        });

        dragHandle.addEventListener("touchmove", (event) => {
            handleDrag(event, true); // Handle touch drag
        });


        dragHandle.addEventListener("touchend", (event) => {
            event.preventDefault();

            // Simulate a "drop" action
            let touch = event.changedTouches[0];
            let x = touch.clientX;
            let y = touch.clientY;

            const hoveredElement = document.elementFromPoint(x, y);

            if (hoveredElement !== draggingData.currentDragElement) {
                const hoveredIndex = hoveredElement.getAttribute("body-index") ?? hoveredElement.getAttribute("index");
                if (hoveredIndex !== null) {
                    // Perform the move operation using your function
                    moveList(draggingData.currentDragElement.getAttribute("body-index"), hoveredIndex);
                    updateContainers(); // Update the UI after moving
                }
            }

            for (let i = 0; i < taskLists.length; i++) {
                const element = document.getElementById(`list-body-${i}`);
                element.removeHoverClass();
                element.classList.remove("drag-placeholder");
            }
            currentDragItem = null;
            draggingData.currentDragElement = null;
            draggingData.currentDragImage.style.display = "none"; // Hide the drag image
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
            updateContainers();
        });


        function addStyling() {
            const defaultBrightness = taskLists[listTrackingData.currentListIndex] === list ? 1.4 : 1;
            const hoverBrightness = taskLists[listTrackingData.currentListIndex] === list ? 1.4 : 1.2;

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

            if (taskLists[listTrackingData.currentListIndex] === list) {
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
            if (taskLists[listTrackingData.currentListIndex] !== list) {
                listTrackingData.currentListIndex = taskLists.indexOf(list);
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
    if (taskLists[listTrackingData.currentListIndex] !== undefined) {

        for (let i = 0; i < taskLists[listTrackingData.currentListIndex].tasks.length; i++) {
            const task = taskLists[listTrackingData.currentListIndex].tasks[i];
            const index = i;

            const taskElement = document.createElement("div");
            const taskText = document.createElement("span");

            taskElement.setAttribute("index", index);
            taskElement.id = `task-${index}`;

            taskText.textContent = task.content;
            taskText.style.textDecoration = task.done ? "line-through" : "none";

            taskElement.classList.add("mt-3", "rounded");
            taskElement.style.width = "100%";
            taskElement.style.backgroundColor = "#c6c6c6";
            taskElement.style.transitionDuration = "0.25s";

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


            function removeHoverClass() {
                taskElement.classList.remove("under-drag");
                taskElement.classList.add("remove-drag");
                taskElement.classList.add("mt-3");

                taskText.style.pointerEvents = "auto";
                dragHandle.style.pointerEvents = "auto";
                editInput.style.pointerEvents = "auto";
                editButton.style.pointerEvents = "auto";
                removeButton.style.pointerEvents = "auto";

                setTimeout(() => {
                    taskElement.classList.remove("remove-drag");
                }, 250);
            }

            function addHoverClass() {
                taskElement.classList.add("under-drag")
                taskElement.classList.remove("mt-3");

                taskText.style.pointerEvents = "none";
                dragHandle.style.pointerEvents = "none";
                editInput.style.pointerEvents = "none";
                editButton.style.pointerEvents = "none";
                removeButton.style.pointerEvents = "none";
            }

            function moveList(fromIndex, toIndex) {
                fromIndex = Number(fromIndex);
                toIndex = Number(toIndex);

                if (toIndex < 0) { return; }
                if (fromIndex === toIndex) return;

                // Remove the item from its current position
                const taskToMove = taskLists[listTrackingData.currentListIndex].tasks.splice(fromIndex, 1)[0];

                // Insert the list at the new index
                taskLists[listTrackingData.currentListIndex].tasks.splice(toIndex, 0, taskToMove);
            }


            taskElement.addHoverClass = function () {
                addHoverClass();
            }
            taskElement.removeHoverClass = function () {
                removeHoverClass();
            }

            taskElement.addEventListener("dragenter", (event) => {
                event.preventDefault();
                if (currentDragItem !== task) {
                    addHoverClass();
                    previousHoverIndex = taskElement.getAttribute("index");
                }
            });

            taskElement.addEventListener("dragleave", (event) => {
                event.preventDefault();
                const hoveredIndex = document.elementFromPoint(event.clientX, event.clientY).getAttribute("index");
                if (
                    currentDragItem !== task &&
                    (
                        previousHoverIndex !== taskElement.getAttribute("index") ||
                        hoveredIndex === null ||
                        hoveredIndex === draggingData.currentDragElement.getAttribute("index")
                    )
                ) {
                    removeHoverClass();

                }
            });

            taskElement.addEventListener("dragend", (event) => {
                event.preventDefault();
                removeHoverClass();
                taskElement.classList.remove("drag-placeholder");
            })

            taskElement.addEventListener("dragover", (event) => {
                event.preventDefault();
            })

            taskElement.addEventListener("drop", (event) => {
                event.preventDefault();

                let x = event.clientX;
                let y = event.clientY;

                const hoveredElement = document.elementFromPoint(x, y);

                if (hoveredElement !== draggingData.currentDragElement) {
                    const hoveredIndex = hoveredElement.getAttribute("index");
                    if (hoveredIndex !== null) {
                        // Perform the move operation using your function
                        moveList(draggingData.currentDragElement.getAttribute("index"), hoveredIndex);
                        updateContainers(); // Update the UI after moving
                    }
                }
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
                    const rect = draggingData.currentDragElement.getBoundingClientRect();
                    draggingData.currentDragImage.style.top = `${event.clientY + 20}px`;
                    draggingData.currentDragImage.style.left = `${rect.left}px`;
                }
            }

            dragHandle.addEventListener("dragstart", (event) => {
                currentDragItem = task;
                draggingData.currentDragElement = taskElement;

                html2canvas(taskElement).then((canvas) => {
                    const dragImage = canvas;
                    canvas.style.pointerEvents = "none";
                    draggingData.currentDragImage.innerHTML = "";
                    draggingData.currentDragImage.style.display = "block";
                    draggingData.currentDragImage.appendChild(dragImage);
                    taskElement.classList.add("drag-placeholder");

                }).catch((error) => {
                    console.error('Error generating drag image:', error);
                });
            });

            dragHandle.addEventListener("drag", (event) => {
                handleDrag(event);
            });

            dragHandle.addEventListener("dragend", (event) => {
                currentDragItem = null;
                draggingData.currentDragElement = null;
                draggingData.currentDragImage.style.display = "none"
            });

            // Touch events for mobile support
            dragHandle.addEventListener("touchstart", (event) => {
                event.preventDefault(); // Prevent scrolling
                currentDragItem = task; // Set the current drag item
                draggingData.currentDragElement = taskElement;

                html2canvas(taskElement).then((canvas) => {
                    const dragImage = canvas;
                    draggingData.currentDragImage.innerHTML = "";
                    draggingData.currentDragImage.style.display = "block";
                    draggingData.currentDragImage.appendChild(dragImage);
                    taskElement.classList.add("drag-placeholder");
                }).catch((error) => {
                    console.error('Error generating drag image:', error);
                });
            });

            dragHandle.addEventListener("touchmove", (event) => {
                handleDrag(event, true); // Handle touch drag
            });


            dragHandle.addEventListener("touchend", (event) => {
                event.preventDefault();

                // Simulate a "drop" action
                let touch = event.changedTouches[0];
                let x = touch.clientX;
                let y = touch.clientY;

                const hoveredElement = document.elementFromPoint(x, y);

                if (hoveredElement !== draggingData.currentDragElement) {
                    const hoveredIndex = hoveredElement.getAttribute("index");
                    if (hoveredIndex !== null) {
                        // Perform the move operation using your function
                        moveList(draggingData.currentDragElement.getAttribute("index"), hoveredIndex);
                        updateContainers(); // Update the UI after moving
                    }
                }

                for (let i = 0; i < taskLists[listTrackingData.currentListIndex].tasks.length; i++) {
                    const element = document.getElementById(`task-${i}`);
                    element.removeHoverClass();
                    element.classList.remove("drag-placeholder");
                }
                currentDragItem = null;
                draggingData.currentDragElement = null;
                draggingData.currentDragImage.style.display = "none"; // Hide the drag image
            });



            doneButton.classList.add("me-1", "mb-1");
            editButton.classList.add("mb-1");

            const div = document.createElement("div");
            const div2 = document.createElement("div");

            div.classList.add("d-flex", "justify-content-between", "align-items-center", "flex-row");
            // div2.classList.add("")

            taskElement.setAttribute("index", index);
            div.setAttribute("index", index);
            div2.setAttribute("index", index);
            dragHandle.setAttribute("index", index);
            taskText.setAttribute("index", index);
            editInput.setAttribute("index", index);
            removeButton.setAttribute("index", index);
            doneButton.setAttribute("index", index);
            editButton.setAttribute("index", index);

            div.appendChild(dragHandle);
            div.appendChild(taskText);
            div.appendChild(editInput)
            div.appendChild(removeButton);

            div2.appendChild(doneButton);
            div2.appendChild(editButton);


            taskElement.appendChild(div);
            taskElement.appendChild(div2);

            taskContainer.appendChild(taskElement);
        };
    }

    localStorage.setItem("userList", JSON.stringify(taskLists));
}


function addTask() {
    const taskDescription = sanitizeInput(taskAdder.value);
    if (taskDescription && taskLists[listTrackingData.currentListIndex]) {
        taskAdder.value = "";
        taskLists[listTrackingData.currentListIndex].tasks.push({ content: taskDescription, done: false });
        updateContainers();
    } else {
        alert("Invalid task description or list does not exist!");
    }
}

function removeTask(index) {
    taskLists[listTrackingData.currentListIndex].tasks.splice(index, 1);
    checkListCompletion(taskLists[listTrackingData.currentListIndex]);
    updateContainers();
}





// display the lists and tasks
updateContainers();
