const Telegraf = require('telegraf')
const request = require('request');
const path = require('path')
const fs = require('fs');
var bot_token = "";
exports.bot_token = bot_token;
const bot = new Telegraf(bot_token);
exports.bot = bot;

function getFilesFromDir(dir, fileTypes) {
  var filesToReturn = [];
  function walkDir(currentPath) {
    var files = fs.readdirSync(currentPath);
    for (var i in files) {
      var curFile = path.join(currentPath, files[i]);      
      if (fs.statSync(curFile).isFile() && fileTypes.indexOf(path.extname(curFile)) != -1) {
        filesToReturn.push(curFile.replace(dir, ''));
      } else if (fs.statSync(curFile).isDirectory()) {
       walkDir(curFile);
      }
    }
  };
  walkDir(dir);
  return filesToReturn; 
}
bot.on(['photo'], (ctx) => {
    var info = ctx.message;
        var file_id = info['photo'][0]['file_id']
        var from_user = info['from']['username']
        request('https://api.telegram.org/bot'+bot_token+'/getFile?file_id='+file_id, { json: true }, (err, res, body) => {
        if (err) { return console.log(err); }
        var path = body['result']['file_path'];
        var name = Date.now();

        var download = function(uri, filename, callback){
            request.head(uri, function(err, res){
              console.log('content-type:', res.headers['content-type']);
              console.log('content-length:', res.headers['content-length']);
          
              request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
            });
          };
        
          download("https://api.telegram.org/file/bot"+bot_token+"/"+path, "download_file/picture/"+name+"-----"+from_user+".jpg", function(){
            console.log('done');
            console.log("https://api.telegram.org/file/bot"+bot_token+"/"+path)
          });
})

        

    return ctx.reply('Image bien reçu !, téléchargement sur le serveur en cours !')
  })
  bot.on(['document'], (ctx) => {
        var info = ctx.message;
        var file_id = info['document']['file_id']
        var file_name = info['document']['file_name']
        var from_user = info['from']['username']

        request('https://api.telegram.org/bot'+bot_token+'/getFile?file_id='+file_id, { json: true }, (err, res, body) => {
        if (err) { return console.log(err); }
        var path = body['result']['file_path'];

        var download = function(uri, filename, callback){
            request.head(uri, function(err, res){
              console.log('content-type:', res.headers['content-type']);
              console.log('content-length:', res.headers['content-length']);
          
              request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
            });
          };
        
          download("https://api.telegram.org/file/bot"+bot_token+"/"+path, "download_file/file/"+file_name+"-----"+from_user, function(){
            console.log('done');
            console.log("https://api.telegram.org/file/bot"+bot_token+"/"+path)
          });
})

        

    return ctx.reply('Fichier bien reçu !, téléchargement sur le serveur en cours !')
  })

  setInterval(function() {
    var files = getFilesFromDir("toSend", [".txt", ".TXT", ".pdf", ".PDF", ".doc", ".DOC", ".docx", ".DOCX"])
    if(files.length > 0){

      for (i = 0; i < files.length; i++) {
        const url = 'https://api.telegram.org/bot'+bot_token+'/sendDocument'
        const urlss = "tosend/" + files[i];
        function deleteFile(){
          fs.unlinkSync(urlss);
        }
        let r = request(url, (err, res, body) => {
            if(err) console.log(err)
            console.log(body)
        })
        console.log(files[i])
        let f = r.form()
        f.append('chat_id', '476090013')
        f.append('document', fs.createReadStream("tosend/" + files[i]))
        setTimeout(deleteFile, 5000);
      }
    }else{
      console.log('r')
    }
  }, 60000);

  setInterval(function() {
    var image = getFilesFromDir("toSend", [".png", ".PNG", ".jpg", ".JPG", ".jpeg", ".JPEG", ".gif", ".GIF"])
    if(image.length > 0){

      for (i = 0; i < image.length; i++) {
        const url = 'https://api.telegram.org/bot'+bot_token+'/sendPhoto'

        let r = request(url, (err, res, body) => {
            if(err) console.log(err)
            console.log(body)
        })
        let f = r.form()
        const urls = "tosend/" + image[i];
        function deleteFile(){
          fs.unlinkSync(urls);
        }
        f.append('chat_id', '476090013')
        f.append('photo', fs.createReadStream("tosend/" + image[i]))
        setTimeout(deleteFile, 5000);
        
      }
    }else{
      console.log('r')
    }
  }, 60000);


bot.launch();