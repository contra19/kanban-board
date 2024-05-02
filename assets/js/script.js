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

        // If the task is due today, make the card yellow. If it is overdue, make it red. If the due date is in the future leave the card green.
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
      // This is the function that creates the clone of the card that is dragged. This is purely visual and does not affect the data.
      helper: function (e) {
        // ? Check if the target of the drag event is the card itself or a child element. If it is the card itself, clone it, otherwise find the parent card  that is draggable and clone that.
        const original = $(e.target).hasClass('ui-draggable')
          ? $(e.target)
          : $(e.target).closest('.ui-draggable');
        // ? Return the clone with the width set to the width of the original card. This is so the clone does not take up the entire width of the lane. This is to also fix a visual bug where the card shrinks as it's dragged to the right.
        return original.clone().css({
          width: original.outerWidth(),
        });
      },
    });
}

// Todo: create a function to handle adding a new task
function handleAddTask(event){
    // If taskList is NULL set it to an empty array
    if (!taskList) {
        taskList = [];
    }

    // Get user input from form 
    const taskTitleInput = document.querySelector('#taskTitle');
    const dueDateInput = document.querySelector('#dueDate');
    const taskDescriptionInput = document.querySelector('#taskDescription');
    const newTaskId = generateTaskId();

    // Create a task object for storage
    let taskObj = {
        taskId: newTaskId,
        title: taskTitleInput.value.trim(),
        dueDate: dueDateInput.value.trim(),
        description: taskDescriptionInput.value.trim(),
        status:'to-do'
    };

    // Push new object to taskList
    taskList.push(taskObj);

    // Update localStorage with the updated taskList
    localStorage.setItem("tasks", JSON.stringify(taskList));

     // Render the task on the screen
    renderTaskList();

    // Clear the modal form inputs
    $('#taskTitle').val('');
    $('#dueDate').val('');
    $('#taskDescription').val('');
   
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event){
    const taskId = $(this).attr('data-task-id');
    // ? Remove project from the array. There is a method called `filter()` for this that is better suited which we will go over in a later activity. For now, we will use a `forEach()` loop to remove the project.
    taskList.forEach((task, index) => {
        if (task.taskId == taskId) {
            taskList.splice(index, 1);
        }
    });

    // ? We will use our helper function to save the projects to localStorage
    localStorage.setItem('tasks', JSON.stringify(taskList));

    // ? Here we use our other function to print projects back to the screen
    renderTaskList();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    
    // ? Get the task id from the event
    const taskId = ui.draggable[0].dataset.taskId;

    // ? Get the id of the lane that the card was dropped into
    const newStatus = event.target.id;
    
    for (let task of taskList) {
        // ? Find the project card by the `id` and update the project status.
        if (task.taskId == taskId) {
            task.status = newStatus;
        }
    }

    // ? Save the updated projects array to localStorage (overwritting the previous one) and render the new project data to the screen.
    localStorage.setItem('tasks', JSON.stringify(taskList));
    renderTaskList();

}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList();

    // Make dueDate a jQuery date picker
    $('#dueDate').datepicker({
            format: 'yyyy-mm-dd',
            autoclose: true
        });
    
    $('#addTaskBtn').click(function(event) {
        event.preventDefault();
        handleAddTask();        
        $('#taskFormModal').modal('hide');
    })

    // ? Make lanes droppable
    $('.lane').droppable({
    accept: '.draggable',
    drop: handleDrop,
    });
});
