export const taskLists = JSON.parse(localStorage.getItem("userList")) ?? [];
export const listTrackingData = {
    "currentListIndex": 0
}
export const draggingData = {
    "currentVisualIndex": 0, // where the element looks like it is
    "currentDragItem": null,
    "currentDragElement": null,
    "currentDragType": null, // "list" or "task"
    "offsetX": 0,
    "offsetY": 0
}
let div = document.createElement("div");
div.classList.add("mt-3");
document.body.appendChild(div);
export const mt_3Height = parseFloat(getComputedStyle(div).marginTop); // needed for task dragging
div.remove();