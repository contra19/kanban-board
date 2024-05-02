// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

// Todo: create a function to generate a unique task id
function generateTaskId() {
    // If nextId does not exist set it to 0 
    if (!nextId) {
        nextId = 0;
    }
    
    // Increment by 1 from last taskId
    nextId++;

    // Save new nextId value to localStorage 
    localStorage.setItem("nextId", JSON.stringify(nextId));
    
    // Return the new taskID
    return nextId;
}

// Create the card elements and assign card text.
function createTaskCard(task) {
    const taskCard = $('<div>').addClass('card task-card draggable my-3').attr('data-task-id', task.taskId);
    const cardHeader = $('<div>').addClass('card-header h4').text(task.title);
    const cardBody = $('<div>').addClass('card-body');
    const cardDescription = $('<p>').addClass('card-text').text(task.description);
    const cardDueDate = $('<p>').addClass('card-text').text(task.dueDate);
    const cardDeleteBtn = $('<button>').addClass('btn btn-danger delete border-light').text('Delete').attr('data-task-id', task.taskId);
    cardDeleteBtn.on('click', handleDeleteTask);

    // Set the card background color based on due date relative to today.
    if (task.status === 'done') {
        taskCard.addClass('bg-success text-white'); // Green background for 'done' tasks
    } else if (task.dueDate) {
        const now = dayjs();
        const taskDueDate = dayjs(task.dueDate, 'YYYY-MM-DD');

        // If the task is due today, make the card yellow. If it is overdue, make it red.
        if (now.isSame(taskDueDate, 'day')) {
            taskCard.addClass('bg-warning text-white');
            cardDeleteBtn.addClass('border-light');
        } else if (now.isAfter(taskDueDate)) {
            taskCard.addClass('bg-danger text-white');
            cardDeleteBtn.addClass('border-light');
        }
    }

    // Append the above elements to the card container elements.
    cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
    taskCard.append(cardHeader, cardBody);

    // Return the completed card
    return taskCard;
}

// Render the taskList and make cards draggable
function renderTaskList() {
    // If taskList is NULL set it to an empty array
    if (!taskList) {
        taskList = [];
    }

    // Empty existing task cards out of the lanes
    const todoList = $('#todo-cards');
    todoList.empty();
  
    const inProgressList = $('#in-progress-cards');
    inProgressList.empty();
  
    const doneList = $('#done-cards');
    doneList.empty();
  
    // Loop through taskList and create cards for task and append to proper lane based on status
    for (let task of taskList) {
      if (task.status === 'to-do') {
        todoList.append(createTaskCard(task));
      } else if (task.status === 'in-progress') {
        inProgressList.append(createTaskCard(task));
      } else if (task.status === 'done') {
        doneList.append(createTaskCard(task));
        }
    }
    
    // Make task cards draggable  
    $('.draggable').draggable({
      opacity: 0.7,
      zIndex: 100,
      // Clone the card for visual effect.
      helper: function (e) {
        // Verify the target of the drag event is the card itself or a child element.
        const original = $(e.target).hasClass('ui-draggable')
          ? $(e.target)
          : $(e.target).closest('.ui-draggable');
        // Return the clone with the same dimentions as the original card.
        return original.clone().css({
          width: original.outerWidth(),
        });
      },
    });
}

// Add a new task
function handleAddTask(event){
     // Get user input from form 
     const taskTitleInput = document.querySelector('#taskTitle');
     const dueDateInput = document.querySelector('#dueDate');
     const taskDescriptionInput = document.querySelector('#taskDescription');
 
     // Check if input elements exist before accessing their values
     const taskTitle = taskTitleInput ? taskTitleInput.value.trim() : '';
     const dueDate = dueDateInput ? dueDateInput.value.trim() : '';
     const taskDescription = taskDescriptionInput ? taskDescriptionInput.value.trim() : '';
 
     // Check if any field is left blank
     if (!taskTitle){
         alert("Task Title is required to submit the task!");
         return; 
     } else if (!dueDate) {
         alert("Task Due Date is required to submit the task!");
         return; 
     } else if (!taskDescription) {
         alert("Task Description is required to submit the task!");
         return; 
     }
 
     // If all fields are filled generate a new taskId
     const newTaskId = generateTaskId();
 
     // Create a task object for storage
     let taskObj = {
         taskId: newTaskId,
         title: taskTitle,
         dueDate: dueDate,
         description: taskDescription,
         status:'to-do'
     };
 
     // Push new task to taskList
     taskList.push(taskObj);
 
     // Update localStorage with the updated taskList
     localStorage.setItem("tasks", JSON.stringify(taskList));
 
     // Render tasks on the screen
     renderTaskList();
 
     // Clear the modal form inputs
     $('#taskTitle').val('');
     $('#dueDate').val('');
     $('#taskDescription').val('');
     
     // Close modal after successful form submission
     $('#taskFormModal').modal('hide');
   
}

// Delete a task
function handleDeleteTask(event){
    const taskId = $(this).attr('data-task-id');
    // Remove project from the array.
    taskList.forEach((task, index) => {
        if (task.taskId == taskId) {
            taskList.splice(index, 1);
        }
    });

    // Save the projects to localStorage
    localStorage.setItem('tasks', JSON.stringify(taskList));

    // Render tasks on the screen
    renderTaskList();
}

// Drop task into a new swim lane
function handleDrop(event, ui) {
    
    // Get the task id from the target task
    const taskId = ui.draggable[0].dataset.taskId;

    // Get the id of the lane that the task was dropped into
    const newStatus = event.target.id;
    
    // Find the task card by the `id` and update the task status.
    for (let task of taskList) {        
        if (task.taskId == taskId) {
            task.status = newStatus;
        }
    }

    // Save the updated tasks array to localStorage.
    localStorage.setItem('tasks', JSON.stringify(taskList));

    // Render task on the screen
    renderTaskList();

}

// When the page loads, render the taskList, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList();

    // Make dueDate a jQuery date picker
    $('#dueDate').datepicker({
            format: 'yyyy-mm-dd',
            autoclose: true
        });
    
    // Event listener for addTaskBtn
    $('#addTaskBtn').click(function(event) {
        handleAddTask();
    })

    // Make lanes droppable
    $('.lane').droppable({
    accept: '.draggable',
    drop: handleDrop,
    });
});
