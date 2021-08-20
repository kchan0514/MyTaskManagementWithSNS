// プロパティにtwitter API用の認証情報を保存する。
function setVal(){
  PropertiesService.getScriptProperties().setProperty("CONSUMER_API_KEY", "your key");
  PropertiesService.getScriptProperties().setProperty("CONSUMER_API_SECRET", "your secrect");
}