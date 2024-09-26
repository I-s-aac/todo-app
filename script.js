"use strict";

const listContainer = document.getElementById("listContainer");
const taskContainer = document.getElementById("taskContainer");
let currentList = "example list name";
// tasks/lists are only removed if you click some button on the task/list, marking them as done will not remove them
const taskLists = {
    "example list name": {
        "tasks": [
            {
                "content": "string which is a description of a task",
                "done": false
            }
        ],
        "done": false // if all the tasks within are cleared, use strikethrough on the list
    }

}


function updateContainers() {

}

function addList() {

}

function addTask() {

}

function removeList() {

}

function removeTask() {

}