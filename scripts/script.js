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
    listTrackingData
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



function convertTouchToXY(event) {
    const touch = event.touches[0];
    return [touch?.clientX ?? 0, touch?.clientY ?? 0]
}

function handleDragStart(event, isTouch = false, currentDragItem, currentDragElement) {

    let x = event.clientX;
    let y = event.clientY;

    if (isTouch) [x, y] = convertTouchToXY(event);

    draggingData.currentDragItem = currentDragItem;
    draggingData.currentDragElement = currentDragElement;

    draggingData.currentDragElement.style.position = "relative";
    draggingData.currentDragElement.style.zIndex = 999;

    draggingData.currentVisualIndex = Number(draggingData.currentDragElement.getAttribute("index"));

    const rect = draggingData.currentDragElement.getBoundingClientRect();

    draggingData.offsetX = rect.left;
    draggingData.offsetY = rect.top + rect.height / 2;

    if (isTouch) return;
    // Create a transparent 1x1 pixel PNG
    const transparentImage = new Image();
    transparentImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA' +
        'AAABCAIAAADkYNOEAAAAFElEQVR42mJ8//8/AwAB/4B4rA2QAAAAAElFTkSuQmCC';

    // Set the transparent image as the drag image
    event.dataTransfer.setDragImage(transparentImage, 0, 0);
}

let sizeSet = false;
function handleDrag(event, isTouch = false, dataType, list) {
    if (draggingData.currentDragItem !== null && draggingData.currentDragElement !== null) {

        let x = event.clientX;
        let y = event.clientY;

        if (isTouch) [x, y] = convertTouchToXY(event);


        draggingData.currentDragElement.style.transition = "transform 0.0s";
        draggingData.currentDragElement.style.transform =
            `translate(${x - draggingData.offsetX + 5}px, ${y - draggingData.offsetY}px)`;

        let hoveredElement = document.elementFromPoint(x, y);
        // make sure it's not a string
        const hoveredIndex = hoveredElement.getAttribute("index") !== null ? Number(hoveredElement.getAttribute("index")) : null;


        if (hoveredIndex !== null) {
            // make sure we're modifiying the whole element
            hoveredElement = document.getElementById(`${dataType}-${hoveredIndex}`);

            function clear(element) {
                element.classList.remove("shift-up", "shift-down");
            }
            function up(element) {
                element.classList.add("shift-up");
                element.classList.remove("shift-down");
            }
            function down(element) {
                element.classList.add("shift-down");
                element.classList.remove("shift-up");
            }

            if (!sizeSet) {
                sizeSet = true;
                let style = window.getComputedStyle(hoveredElement);
                let height = parseFloat(hoveredElement.offsetHeight) + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
                document.documentElement.style.setProperty("--dynamic-height", `${height}px`);
            }
            console.log(draggingData.currentVisualIndex, hoveredIndex);

            const hoverContainsUp = hoveredElement.classList.contains("shift-up");
            const hoverContainsDown = hoveredElement.classList.contains("shift-down");

            if (draggingData.currentVisualIndex === hoveredIndex - 1) {
                up(hoveredElement);
            } else if (draggingData.currentVisualIndex === hoveredIndex + 1) {
                down(hoveredElement);
            } else {
                setTimeout(() => {
                    if (draggingData.currentVisualIndex === hoveredIndex && hoverContainsUp) {
                        clear(hoveredElement);
                        console.log("test", draggingData.currentVisualIndex, hoveredIndex);
                    }
                }, 1000);
            }

            draggingData.currentVisualIndex = hoveredIndex;

        }
    }
}



/* 
// function handleDrag(event, isTouch = false, dataType, list) {
//     if (draggingData.currentDragItem !== null && draggingData.currentDragElement !== null) {

//         let x = event.clientX;
//         let y = event.clientY;

//         if (isTouch) [x, y] = convertTouchToXY(event);


//         draggingData.currentDragElement.style.transition = "transform 0.0s";
//         draggingData.currentDragElement.style.transform =
//             `translate(${x - draggingData.offsetX + 5}px, ${y - draggingData.offsetY}px)`;

//         const hoveredElement = document.elementFromPoint(x, y);
//         const hoveredIndex = hoveredElement.getAttribute("index");
//         const dragElementIndex = draggingData.currentDragElement.getAttribute("index");


//         if (hoveredIndex !== null) {
//             const diff = Number(draggingData.currentVisualIndex) - Number(dragElementIndex);
//             draggingData.currentVisualIndex = hoveredIndex;



//             function up(element) {
//                 element.classList.add("shift-up");
//                 element.classList.remove("shift-down");
//             }
//             function down(element) {
//                 element.classList.add("shift-down");
//                 element.classList.remove("shift-up");
//             }
//             console.log(diff, "diff")

//             let style = window.getComputedStyle(hoveredElement);
//             let height = parseFloat(hoveredElement.offsetHeight) + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
//             document.documentElement.style.setProperty("--dynamic-height", `${height}px`);

//             for (let i = 0; i < list.length; i++) {
//                 if (i === dragElementIndex) continue;

//                 const element = document.getElementById(`${dataType}-${i}`);




//             }
//         }
//     }
// }
 */
function handleDragEnd(event, isTouch = false, dataType, dataMoveFunction, list) {

    let x = event.clientX;
    let y = event.clientY;

    if (isTouch) {
        [x, y] = convertTouchToXY(event);
    }

    const hoveredElement = document.elementFromPoint(x, y);
    const hoveredIndex = hoveredElement.getAttribute("index");

    // fix styling of the elements
    for (let i = 0; i < list.length; i++) {
        const element = document.getElementById(`${dataType}-${i}`);
        // remove the slider classes and reset transform
        element.classList.remove("shift-up");
        element.classList.remove("shift-down");
        element.style.transform = "";
    }

    const visIndex = draggingData.currentVisualIndex;
    const index = Number(draggingData.currentDragElement.getAttribute("index"));

    if (visIndex !== index) {
        dataMoveFunction(index, visIndex);

        draggingData.currentDragItem = null;
        draggingData.currentDragElement = null;

        updateContainers();
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

        const dragHandle = createDragHandle();


        dragHandle.addEventListener("dragstart", (event) => handleDragStart(event, false, list, listElement));
        dragHandle.addEventListener("drag", (event) => handleDrag(event, false, "list", taskLists));
        dragHandle.addEventListener("dragend", (event) => handleDragEnd(event, false, "list", moveList, taskLists));


        // make dragging work on mobile
        dragHandle.addEventListener("touchstart", (event) => handleDragStart(event, true, list, listElement));
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
                listElement.style.filter = `brightness(${defaultBrightness})`;
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
                // removeTask(index);
                removeTaskWithAnimation(index);
                // updateContainers();
            };


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

            function moveTask(fromIndex, toIndex) {
                fromIndex = Number(fromIndex);
                toIndex = Number(toIndex);

                if (toIndex < 0) { return; }
                if (fromIndex === toIndex) return;

                // Remove the item from its current position
                const taskToMove = taskLists[listTrackingData.currentListIndex].tasks.splice(fromIndex, 1)[0];

                if (fromIndex > toIndex) {
                    // move the task up on the page
                    taskLists[listTrackingData.currentListIndex].tasks.splice(toIndex, 0, taskToMove);
                } else {
                    // move the task down on the page
                    taskLists[listTrackingData.currentListIndex].tasks.splice(toIndex - 1, 0, taskToMove);
                }
            }


            taskElement.addHoverClass = function () {
                addHoverClass();
            }
            taskElement.removeHoverClass = function () {
                removeHoverClass();
            }

            taskElement.addEventListener("dragenter", (event) => {
                event.preventDefault();
                if (draggingData.currentDragItem !== task) {
                    addHoverClass();
                    draggingData.previousHoverIndex = taskElement.getAttribute("index");
                }
            });

            taskElement.addEventListener("dragleave", (event) => {
                event.preventDefault();
                const hoveredIndex = document.elementFromPoint(event.clientX, event.clientY).getAttribute("index");
                if (
                    draggingData.currentDragItem !== task &&
                    (
                        draggingData.previousHoverIndex !== taskElement.getAttribute("index") ||
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
                        moveTask(draggingData.currentDragElement.getAttribute("index"), hoveredIndex);
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
                if (draggingData.currentDragItem !== null) {
                    const rect = draggingData.currentDragElement.getBoundingClientRect();
                    draggingData.currentDragImage.style.top = `${event.clientY + 20}px`;
                    draggingData.currentDragImage.style.left = `${rect.left}px`;
                }
            }

            dragHandle.addEventListener("dragstart", (event) => {
                draggingData.currentDragItem = task;
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
                draggingData.currentDragItem = null;
                draggingData.currentDragElement = null;
                draggingData.currentDragImage.style.display = "none"
            });

            // Touch events for mobile support
            dragHandle.addEventListener("touchstart", (event) => {
                event.preventDefault(); // Prevent scrolling
                draggingData.currentDragItem = task; // Set the current drag item
                draggingData.currentDragElement = taskElement;
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
                        moveTask(draggingData.currentDragElement.getAttribute("index"), hoveredIndex);
                        updateContainers(); // Update the UI after moving
                    }
                }

                for (let i = 0; i < taskLists[listTrackingData.currentListIndex].tasks.length; i++) {
                    const element = document.getElementById(`task-${i}`);
                    // element.removeHoverClass();
                    // element.classList.remove("drag-placeholder");
                }
                draggingData.currentDragItem = null;
                draggingData.currentDragElement = null;
                draggingData.currentDragImage.style.display = "none"; // Hide the drag image
            });



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
