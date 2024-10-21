export const taskLists = JSON.parse(localStorage.getItem("userList")) ?? [];
export let currentListIndex = 0; // index representing currently selected
export let previousHoverIndex = 0;
export let currentDragItem = null;
export let currentDragElement = null;
export let currentDragImage = document.createElement("div");
