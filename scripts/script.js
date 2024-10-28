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
    // functions
    addTask,
    removeTask
} from "./taskFunctions.js";

import {
    // variables
    taskLists,
    draggingData,
    listTrackingData,
    mt_3Height
} from "./globalVars.js";

import {
    // functions
    sanitizeInput,
    listExists,
    checkListCompletion
} from "./utils.js";

import {
    // cool animation
    animateCut
} from "./animations.js";

import {
    // functions
    handleDragStart,
    handleDrag,
    handleDragEnd
} from "./dragging.js";

addListButton.addEventListener("click", (event) => {
    const condition = addList();
    if (condition) { updateContainers(); }
})

addTaskButton.addEventListener("click", (event) => {
    const condition = addTask();
    if (condition) { updateContainers(); }
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
});
listAdder.addEventListener("keydown", (event) => {
    if (event.key === "Enter") { addListButton.click(); }
});

listAdder.addEventListener("blur", (event) => {
    if (listAdder.value === "") {
        listAdderWarning.style.display = "none";
        listAdder.setAttribute("aria-invalid", false);
    }
})

taskAdder.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        addTaskButton.click();
    }
});


function removeTaskWithAnimation(index) {
    const taskElement = document.getElementById(`task-${index}`);
    if (taskElement) {
        animateCut(taskElement, () => {
            removeTask(index); // Call your remove task logic here
            updateContainers(); // Update the UI after removing
        });
    }
}

function removeListWithAnimation(list) {
    const index = taskLists.indexOf(list);
    const listElement = document.getElementById(`list-${index}`);
    if (listElement) {
        animateCut(listElement, () => {
            removeList(list);
            updateContainers();
        })
    }
}



function updateContainers() {
    // clear containers
    listContainer.innerHTML = "";
    taskContainer.innerHTML = "";

    let index = 0;
    // display lists to page
    for (const list of taskLists) {

        checkListCompletion(list);
        const listElement = document.createElement("div");
        const listElementRight = document.createElement("div");
        const listTitle = document.createElement("h3");

        // switch selected list
        listElement.addEventListener("click", () => {
            if (taskLists[listTrackingData.currentListIndex] !== list) {
                listTrackingData.currentListIndex = listElement.getAttribute("index");
                updateContainers();
            }
        });

        function moveList(fromIndex, toIndex) {
            // convert to numbers, just in case
            fromIndex = Number(fromIndex);
            toIndex = Number(toIndex);

            // don't move it if it's wonky
            if (toIndex < 0) { return; }
            if (fromIndex === toIndex) return;

            const listToMove = taskLists.splice(fromIndex, 1)[0];

            // move it
            taskLists.splice(toIndex, 0, listToMove);

            listTrackingData.currentListIndex = toIndex;
        }

        listElement.addEventListener("transitionstart", () => {
            listElement.setAttribute("doingAnimation", "true");
        });
        listElement.addEventListener("transitionend", () => {
            listElement.setAttribute("doingAnimation", "false");
        });
        listElement.addEventListener("transitioncancel", () => {
            listElement.setAttribute("doingAnimation", "false");
        });

        const dragHandle = createDragHandle();

        dragHandle.addEventListener("dragstart", (event) => handleDragStart(event, false, list, listElement, "list"));
        dragHandle.addEventListener("drag", (event) => handleDrag(event, false, "list", taskLists));
        dragHandle.addEventListener("dragend", (event) => handleDragEnd(event, false, "list", moveList, taskLists));


        // make dragging work on mobile
        dragHandle.addEventListener("touchstart", (event) => handleDragStart(event, true, list, listElement, "list"));
        dragHandle.addEventListener("touchmove", (event) => handleDrag(event, true, "list", taskLists));
        dragHandle.addEventListener("touchend", (event) => handleDragEnd(event, true, "list", moveList, taskLists));


        const editInput = document.createElement("input");

        // simulate clicking on the save button when pressing enter
        editInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                editButton.click();
            }
        })

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
            removeListWithAnimation(list);
        });


        function addStyling() {
            const defaultBrightness = taskLists[listTrackingData.currentListIndex] === list ? 1.4 : 1;
            const hoverBrightness = taskLists[listTrackingData.currentListIndex] === list ? 1.4 : 1.2;

            editButton.style.display = "none";
            editButton.classList.add("text-dark");

            editInput.style.display = "none";
            editInput.value = list.name;
            editInput.style.width = "100%";

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
            listElement.style.transition = "0.25s";

            if (taskLists[listTrackingData.currentListIndex] === list) {
                if (draggingData.currentDragItem === null && draggingData.currentDragElement === null) {
                    listElement.style.filter = `brightness(${defaultBrightness})`;
                    editButton.style.display = "inline-block";
                }
            }

            listElement.onmouseenter = () => {
                if (draggingData.currentDragItem === null && draggingData.currentDragElement === null) {
                    listElement.style.filter = `brightness(${hoverBrightness})`;
                }
            }
            listElement.onmouseleave = () => {
                if (draggingData.currentDragItem === null && draggingData.currentDragElement === null) {
                    listElement.style.filter = `brightness(${defaultBrightness})`;
                }
            }
        }
        addStyling();




        // identification for the parent element
        listElement.id = `list-${index}`;

        listElement.setAttribute("index", index);
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

        index++; // increment index

    }

    // display tasks to page
    if (taskLists[listTrackingData.currentListIndex] !== undefined) {

        for (let i = 0; i < taskLists[listTrackingData.currentListIndex].tasks.length; i++) {
            const task = taskLists[listTrackingData.currentListIndex].tasks[i];
            const index = i;

            const taskElement = document.createElement("div");
            const taskText = document.createElement("div");

            taskElement.addEventListener("transitionstart", () => {
                taskElement.setAttribute("doingAnimation", "true");
            });
            taskElement.addEventListener("transitionend", () => {
                taskElement.setAttribute("doingAnimation", "false");
            });
            taskElement.addEventListener("transitioncancel", () => {
                taskElement.setAttribute("doingAnimation", "false");
            });

            taskElement.setAttribute("index", index);
            taskElement.id = `task-${index}`;

            taskText.textContent = task.content;
            taskText.style.textDecoration = task.done ? "line-through" : "none";
            taskText.classList.add("text-wrap");
            taskText.style.width = "90%";
            taskText.style.overflowWrap = "break-word";
            taskText.style.wordBreak = "break-all";

            taskElement.classList.add("mt-3", "rounded");
            taskElement.style.width = "100%";
            taskElement.style.backgroundColor = "#c6c6c6";
            taskElement.style.transitionDuration = "0.25s";

            function moveTask(fromIndex, toIndex) {
                fromIndex = Number(fromIndex);
                toIndex = Number(toIndex);

                if (toIndex < 0) { return; }
                if (fromIndex === toIndex) return;

                // Remove the item from its current position
                const taskToMove = taskLists[listTrackingData.currentListIndex].tasks.splice(fromIndex, 1)[0];
                taskLists[listTrackingData.currentListIndex].tasks.splice(toIndex, 0, taskToMove);

                // if (fromIndex > toIndex) {
                //     // move the task up on the page
                // } else {
                //     // move the task down on the page
                //     taskLists[listTrackingData.currentListIndex].tasks.splice(toIndex - 1, 0, taskToMove);
                // }
            }

            const editInput = document.createElement("textarea");
            editInput.style.display = "none";
            editInput.style.width = "75%";

            editInput.addEventListener("keydown", (event) => {
                if (event.key === "Enter") {
                    editButton.click();
                }
            });

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
            removeButton.onclick = () => {
                removeTaskWithAnimation(index);
            };


            const dragHandle = createDragHandle();


            dragHandle.addEventListener(
                "dragstart",
                (event) => handleDragStart(event, false, task, taskElement, "task")
            );
            dragHandle.addEventListener(
                "drag",
                (event) => handleDrag(event, false, "task", taskLists[listTrackingData.currentListIndex].tasks)
            );
            dragHandle.addEventListener(
                "dragend",
                (event) => handleDragEnd(event, false, "task", moveTask, taskLists[listTrackingData.currentListIndex].tasks)
            );


            // make dragging work on mobile
            dragHandle.addEventListener(
                "touchstart",
                (event) => handleDragStart(event, true, task, taskElement, "task")
            );
            dragHandle.addEventListener(
                "touchmove",
                (event) => handleDrag(event, true, "task", taskLists[listTrackingData.currentListIndex].tasks)
            );
            dragHandle.addEventListener(
                "touchend",
                (event) => handleDragEnd(event, true, "task", moveTask, taskLists[listTrackingData.currentListIndex].tasks)
            );



            doneButton.classList.add("me-1", "mb-1");
            editButton.classList.add("mb-1");

            const div = document.createElement("div");
            const div2 = document.createElement("div");

            div.classList.add("d-flex", "justify-content-between", "align-items-center", "flex-row");

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

// display the lists and tasks
updateContainers();
