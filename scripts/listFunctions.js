import { listAdder } from "./htmlElements.js";
import { taskLists, listTrackingData } from "./globalVars.js";
import { sanitizeInput, listExists } from "./utils.js";
// these functions will return true or false on whether to call updateContainers
export function addList() { 
    const listName = sanitizeInput(listAdder.value);
    if (!listExists(listName) && listName !== "") {
        taskLists.push({ name: listName, tasks: [], done: false });
        listAdder.value = "";
        return true;
    }
    return false;
}

export function removeList(list) {
    if (listTrackingData.currentListIndex === taskLists.indexOf(list)) listTrackingData.currentListIndex = 0;
    taskLists.splice(taskLists.indexOf(list), 1);
    return true;
}