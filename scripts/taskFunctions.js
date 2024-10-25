import { taskLists, listTrackingData } from "./globalVars.js";
import { taskAdder } from "./htmlElements.js";
import { sanitizeInput, checkListCompletion } from "./utils.js";

export function addTask() {
    const taskDescription = sanitizeInput(taskAdder.value);
    if (taskDescription && taskLists[listTrackingData.currentListIndex]) {
        taskAdder.value = "";
        taskLists[listTrackingData.currentListIndex].tasks.push({ content: taskDescription, done: false });
        return true;
    } else {
        alert("Invalid task description or list does not exist!");
        return false;
    }
}

export function removeTask(index) {
    taskLists[listTrackingData.currentListIndex].tasks.splice(index, 1);
    checkListCompletion(taskLists[listTrackingData.currentListIndex]);
}