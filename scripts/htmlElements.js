export const listContainer = document.getElementById("listContainer");
export const taskContainer = document.getElementById("taskContainer");
export const listAdder = document.getElementById("listAdder");
export const taskAdder = document.getElementById("taskAdder");
export const listAdderWarning = document.getElementById("listAdderWarning");
export const addTaskButton = document.getElementById("addTaskButton");
export const addListButton = document.getElementById("addListButton");

export function createRemoveButton() {
    const button = document.createElement("button");
    button.classList.add("btn", "btn-secondary", "btn-close", "ms-3");
    return button;
}
export function createDoneButton() {
    const button = document.createElement("button");
    button.classList.add("btn", "btn-secondary", "btn-sm", "btn-toggle", "ms-3");
    button.innerText = "Mark Complete";
    return button;
}