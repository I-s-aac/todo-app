export const taskLists = JSON.parse(localStorage.getItem("userList")) ?? [];
export const listTrackingData = {
    "currentListIndex": 0
}
export const draggingData = {
    "currentVisualIndex": 0, // where the element looks like it is
    "currentDragItem": null,
    "currentDragElement": null,
    "offsetX": 0,
    "offsetY": 0
}