export const listContainer = document.getElementById("listContainer");
export const taskContainer = document.getElementById("taskContainer");
export const listAdder = document.getElementById("listAdder");
export const taskAdder = document.getElementById("taskAdder");
export const listAdderWarning = document.getElementById("listAdderWarning");
export const addTaskButton = document.getElementById("addTaskButton");
export const addListButton = document.getElementById("addListButton");

function baseButton() {
    const button = document.createElement("button");
    button.classList.add("btn", "btn-secondary", "btn-sm");

    return button;
}

export function createRemoveButton(action) {
    const button = baseButton();
    button.classList.add("btn-close", "ms-3");
    button.classList.remove("btn-sm");
    button.addEventListener("click", action);

    return button;
}
export function createDoneButton() {
    const button = baseButton();
    button.classList.add("btn-toggle", "ms-3");
    button.innerText = "Mark Complete";

    return button;
}
export function createEditButton(action) {
    const button = baseButton();
    button.innerText = "Edit";
    button.addEventListener("click", action);

    return button;
}

export function createDragHandle() {
    const dragHandle = document.createElement("span");
    dragHandle.classList.add("bi", "bi-grip-vertical", "fs-2", "drag-handle"); // Add any necessary classes for styling
    dragHandle.setAttribute("draggable", "true"); // Make it draggable
    dragHandle.style.cursor = "grab"; // Change cursor to indicate dragging capability
    return dragHandle;
}