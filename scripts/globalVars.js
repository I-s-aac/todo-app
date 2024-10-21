export const taskLists = JSON.parse(localStorage.getItem("userList")) ?? [];
export const listTrackingData = {
    "currentListIndex": 0
}
export const draggingData = {
    "previousHoverIndex": 0,
    "currentDragItem": null,
    "currentDragElement": null,
    "currentDragImage": document.createElement("div")
}