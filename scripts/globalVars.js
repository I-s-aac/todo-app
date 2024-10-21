export const taskLists = JSON.parse(localStorage.getItem("userList")) ?? [];
export const listTrackingData = {
    "currentListIndex": 0
}
const draggingData = {
    "previousHoverIndex": 0,
    "currentDragItem": null,
    "currentDragElement": null,
    "currentDragImage": document.createElement("div")
}

draggingData.currentDragImage.style.opacity = 0.75;
draggingData.currentDragImage.style.position = "absolute";
draggingData.currentDragImage.style.display = "none";
draggingData.currentDragImage.style.pointerEvents = "none";
document.body.appendChild(draggingData.currentDragImage);

export { draggingData };