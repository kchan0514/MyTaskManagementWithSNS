let num_complete=0;

function myFunction(){
  
  var myTaskLists = getTaskLists();
  Logger.log( myTaskLists );
  Logger.log( myTaskLists[0].id); //  = "aaaaaaaaaaaaaaaaaaaaaaaaaaaa" 
  Logger.log( myTaskLists[1].id); //  = "bbbbbbbbbbbbbbbbbbbbbbbbbbb"
  Logger.log( myTaskLists[0].name); //  = "My Tasks"
  Logger.log( myTaskLists[1].name); //  = "ToDo"
  //var myTaskLists = getTaskLists();
  var myTasks       = getTasks( myTaskLists[0].id )

  Logger.log( myTasks );
  Logger.log( "num of this week completed tasks:"+ num_complete +"/" +myTasks.length );
  //Logger.log( myTasks[0].title ); // = "first todo"

}

function getTaskLists() {
  var taskLists = Tasks.Tasklists.list().getItems();
  if (!taskLists) {
    return [];
  }
  return taskLists.map(function(taskList) {
    return {
      id: taskList.getId(),
      name: taskList.getTitle()
    };
  });
}

function getTasks(taskListId) {
  var tasks = Tasks.Tasks.list(taskListId, {
      showCompleted: true,
      showDeleted: true,
      showHidden: true,
      
    }).getItems();
  if (!tasks) {
    return [];
  }
  

  Logger.log(tasks);
  var week_tasks = [];
  

  Logger.log("here");
  let monday = getMondayOfThisWeek();
  let sunday = getSundayOfThisWeek();
  Logger.log(monday);
  Logger.log(sunday);
  if (tasks.length) {
    Logger.log("length:"+tasks.length);
    for (var i = 0; i < tasks.length; i++) {
      var task = tasks[i];
      Logger.log(task.title);
      Logger.log(task.due);
      Logger.log(task.status);
      if (new Date(task.due) >= monday && new Date(task.due) < sunday) {
        week_tasks.push(task);
        Logger.log("push");   
        if(task.status == "completed"){
          num_complete++;
          
        }
      }
    }
  }

  if (!week_tasks) {
    Logger.log("Nothing ");
    return [];
  }

  Logger.log("week task length:"+week_tasks.length);
  Logger.log("completed:"+ num_complete);
  Logger.log("return");
  return week_tasks.map(function(task) {
    return {
      id: task.getId(),
      title: task.getTitle(),
      notes: task.getNotes(),
      completed: Boolean(task.getCompleted()),
      due: task.due,
    };
  }).filter(function(task) {
    return task.title;
  });
}

function getSundayOfThisWeek(){
  let today = new Date();
  let this_year = today.getFullYear();
  let this_month = today.getMonth();
  let date = today.getDate();
  let day_num = today.getDay();
  let this_monday = date - day_num + 1;
  let this_sunday = this_monday + 7;
  let this_sunday_date = new Date(this_year, this_month, this_sunday);
  return this_sunday_date;
}
function getMondayOfThisWeek(){
  let today = new Date();
  let this_year = today.getFullYear();
  let this_month = today.getMonth();
  let date = today.getDate();
  let day_num = today.getDay();
  let this_monday = date - day_num + 1;
  let this_monday_date = new Date(this_year, this_month, this_monday);
  return this_monday_date;
}