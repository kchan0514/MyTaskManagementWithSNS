// 明示的にツイートしたいタスク名リスト
const taskNames = ['瞑想', '筋トレ', "メモ書き"]
const taskMap = new Map();

// 完了したタスクのカウント変数
let num_complete=0;
// 完了したマップ外タスク
let num_others_completed =0;

for (let i = 0; i < taskNames.length; i++) {
    // マップの生成
    taskMap.set(taskNames[i], 0)
}

// OAuthでtwitterの認証用のURLを取得する関数
function getOAuthURL() {
  Logger.log(getService_().authorize());
}
 
//twitterサービス取得用のAPI
function getService_() {
  return OAuth1.createService('Twitter')
      .setAccessTokenUrl('https://api.twitter.com/oauth/access_token')
      .setRequestTokenUrl('https://api.twitter.com/oauth/request_token')
      .setAuthorizationUrl('https://api.twitter.com/oauth/authorize')
      .setConsumerKey(PropertiesService.getScriptProperties().getProperty("CONSUMER_API_KEY"))
      .setConsumerSecret(PropertiesService.getScriptProperties().getProperty("CONSUMER_API_SECRET"))
      .setCallbackFunction('authCallback_')
      .setPropertyStore(PropertiesService.getUserProperties());
}
 
function authCallback_(request) {
  var service = getService();
  var authorized = service.handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput('success!!');
  } else {
    return HtmlService.createHtmlOutput('failed');
  }    
}

// 成果をツイートするメイン関数
function TweetAchievements(){
  
  var myTaskLists = getTaskLists_();
  Logger.log( myTaskLists );
  var myTasks  = getWeekTasks_( myTaskLists[0].id )

  var tweettext="今週のGoogleTask達成率:\n";
  tweettext+="達成:"+num_complete +"/ 当初予定:" +myTasks.length+"\n";

  var percentage = (num_complete / myTasks.length) * 100;

　// 達成度に応じたコメント
  if(percentage < 30){
    tweettext+= percentage+"％！全然できてない！気合を入れよう！";
  }
  else if(percentage < 50){
    tweettext+= percentage+"％！もっと頑張ろう！";
  }
  else if(percentage < 80){
    tweettext+= percentage+"％！半分は超えた！できなかったものを見直そう！";
  }
  else if(percentage < 100){
    tweettext+= percentage+"％！かなりいい！合格レベル！";
  }
  else if(percentage == 100){
    tweettext+= percentage+"％！全コンプ！素晴らしい！";
  }

  tweettext+="\n";

  taskMap.forEach(function(value, key) {
    console.log(key + ' = ' + value)
    tweettext+=key+"を"+value+"回\n";
  });
  tweettext+="その他を"+ num_others_completed+"回\n";
  
  tweettext+="\n";
  tweettext+="やりました。\n";

  // タグ関連はここ
  //tweettext+="#ゼロ秒思考 #メモ書き #瞑想 #習慣";

  Logger.log( myTasks );
  Logger.log( tweettext );

  tweetText_(tweettext);

}

// GoogleのTask listを取得する関数
function getTaskLists_() {
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

// GoogleのTask listの中の各taskを取得する関数
function getWeekTasks_(taskListId) {
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
  
  let this_monday = getMondayOfThisWeek_();
  let next_monday = getMondayOfNextWeek_();
  Logger.log("対象開始日:"+this_monday);
  Logger.log("対象終了日:"+next_monday);
  if (tasks.length) {
    Logger.log("length:"+tasks.length);
    for (var i = 0; i < tasks.length; i++) {
      var task = tasks[i];
      Logger.log("取得したタスクタイトル:"+task.title);
      Logger.log("取得したタスク期限:"+task.due);
      Logger.log("取得したタスクステータス:"+task.status);
      // 今日が含まれる月曜日〜日曜日の１週間タスクだけを対象に抽出する。
      if (new Date(task.due) >= this_monday && new Date(task.due) < next_monday) {
        week_tasks.push(task);
        
        Logger.log("今週のタスクリストにpush");   
        if(task.status == "completed"){
          num_complete++;
          isFoundinMap = false;

          for (let i = 0; i < taskNames.length; i++) {
            　// マップに該当するタスクはカウントを増やす。
              if(task.title == taskNames[i]){
                var newValue = taskMap.get(taskNames[i])+1;
                taskMap.set(taskNames[i], newValue)
                Logger.log("set:"+'key:' + taskNames[i] + ' value:' + newValue);   
                isFoundinMap = true;
                break;
              }
          }

          // マップに該当するものが見つからない場合はその他に振り分ける
          if(isFoundinMap == false){
            num_others_completed++;
          }
        }
      }
    }
  }

  if (!week_tasks) {
    Logger.log("今週のタスクは見つかりませんでした。");
    return [];
  }

  Logger.log("今週のタスクの数:"+week_tasks.length);
  Logger.log("今週終わったタスクの数:"+ num_complete);

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


// 今週の月曜日を取得する関数
function getMondayOfThisWeek_(){
  let today = new Date();
  let this_year = today.getFullYear();
  let this_month = today.getMonth();
  let date = today.getDate();
  let day_num = today.getDay();
  let this_monday = date - day_num + 1;
  let this_monday_date = new Date(this_year, this_month, this_monday);
  return this_monday_date;
}

// 今週の日曜日を取得する関数
function getMondayOfNextWeek_(){
  let today = new Date();
  let this_year = today.getFullYear();
  let this_month = today.getMonth();
  let date = today.getDate();
  let day_num = today.getDay();
  let this_monday = date - day_num + 1;
  let next_monday = this_monday + 7;
  let next_monday_date = new Date(this_year, this_month, next_monday);
  return next_monday_date;
}

// ツイートする関数
function tweetText_(text) {
  var twitterService = getService_();
  
  if (twitterService.hasAccess()) {
    var twMethod = { method:"POST" };
    twMethod.payload = { status: text };
    Logger.log("request");
    var response = twitterService.fetch("https://api.twitter.com/1.1/statuses/update.json", twMethod);
    
    Logger.log(response.getContentText());
 
  } else {
    Logger.log(response);
  }
}
