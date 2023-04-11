var User = require('../app/models/user');
var CourseCreated = require('../app/models/course_created');
var Video = require('../app/models/video');
var ffmpeg = require('fluent-ffmpeg');
var configDB = require('./database.js');

module.exports = function(app, server, multer, mongoose, Grid, fs) {

  var Schema = mongoose.Schema;
  mongoose.createConnection(configDB.url);
  var conn = mongoose.connection;
  Grid.mongo = mongoose.mongo;

  var storage =   multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, './uploads');
    },
    filename: function (req, file, callback) {
      callback(null, file.fieldname + '-' + Date.now());
    }
  });
  // var upload = multer({ storage : storage}).single('userPhoto');
  var upload = multer({ storage : storage}).array('userPhoto', 2);

  var gfs;

  conn.once('open', function() {
    console.log('open');
    gfs = Grid(conn.db);
    app.set('gridfs',gfs);
  });

  app.post('/addVideo',function(req,res){

      upload(req,res,function(err) {

          if(err) {
              console.log(err);
              return res.end("Error uploading file.");
          }
          
          // console.log(req.body);
          // console.log(req.file);
          console.log(req.files);

          // console.log(req.file.path);

          var tempfilenames;
          var fileduration;
  

          ffmpeg(req.files[0].path)
            .on('filenames', function(filenames) {
              //console.log('Will generate ' + filenames.join(', '))
              tempfilenames = filenames;
            })
            .on('codecData', function(data) {
              fileduration = data.duration;
              // console.log('Input duration is ' + data.duration);
              })
            .on('end', function() {
             // console.log('Screenshots taken');
          var writeStream = gfs.createWriteStream({
              filename: req.files[0].originalname
          });

          fs.createReadStream(req.files[0].path).pipe(writeStream);
          writeStream.on('close', function(file) {
            console.log(file.filename + ' written to DB');
          });
          
          var thumbnail = "WEBVTT\n\n";
          var marker = "WEBVTT\n\n";
          //var timerange = parseInt(fileduration)/10;
          var hours = 0;
          var mins = 0;
          var secs = 0;
         
          hours = fileduration.substring(0,2);
          mins = fileduration.substring(3,5);
          secs = fileduration.substring(6,8);
          
          var timerange = (parseInt(secs) + (parseInt(mins) * 60) + (parseInt(hours) * 3600)) * 0.1;
          var starttime = 0;
          var markerstarttime = 0;
          for(var loop=0; loop<tempfilenames.length-1; loop++) {
            thumbnail += starttime;
            thumbnail += " --> ";
            starttime += timerange;
            thumbnail += starttime;
            thumbnail += "\nscreenshots/";
            thumbnail += tempfilenames[loop];
            thumbnail += "\n\n";

            marker += markerstarttime;
            var temptime = markerstarttime;
            marker += " --> ";
            markerstarttime += timerange;
            marker += markerstarttime;
            marker += "\n"+temptime;
            marker += "\n\n";

          }

          // console.log(marker);

          //Thumbnail vtt file creation
          var vttfilename = req.files[0].originalname.substring(0, req.files[0].originalname.indexOf('.')) + ".vtt";
          fs.writeFile("./public/videos/"+vttfilename , thumbnail);
          // console.log("Thumbnail : "+thumbnail);
          var writeStream = gfs.createWriteStream({
                  filename: vttfilename
          });
          fs.createReadStream("./public/videos/"+vttfilename).pipe(writeStream);
               writeStream.on('close', function(file) {
                    //do nothing
                });

          //Marker vtt file creation
          var markervttfilename = "Marker_" + req.files[0].originalname.substring(0, req.files[0].originalname.indexOf('.')) + ".vtt";
          fs.writeFile("./public/videos/"+markervttfilename , marker);
          // console.log("Marker : "+marker);
          var writeStream = gfs.createWriteStream({
                  filename: markervttfilename
          });
          fs.createReadStream("./public/videos/"+markervttfilename).pipe(writeStream);
               writeStream.on('close', function(file) {
                    //do nothing
                });
           
          for(var i=0; i<tempfilenames.length-1; i++){
            var writeStream = gfs.createWriteStream({
                  filename: req.files[0].originalname + '-' + tempfilenames[i]
            });
              fs.createReadStream('./public/videos/screenshots/' + tempfilenames[i]).pipe(writeStream);
               writeStream.on('close', function(file) {
                    //do nothing
                });
          }

          var image_writeStream = gfs.createWriteStream({
                  filename: req.files[1].filename
          });
          fs.createReadStream(req.files[1].path).pipe(image_writeStream);
          image_writeStream.on('close', function(file) {
              //do nothing
          });

         
          var course_name = req.body.course_name;
          var currentCourse;

          // console.log(req);
          var user = req.user.user;
          var email = user.email;
          // console.log(req.body);
          // console.log(req.body.video_quizans);

          User.findOne({ 'user.email' : email  }, function(err, user) {
                if (err){ return done(err);}
                // console.log(user);
                var courses = user.user.courses_created;
                // if(courses.length > 0) {
                  var i = 0;
                  for(i=0; i<courses.length; i++) {
                    if(courses[i].course_name == course_name) {
                      // console.log("MAthced");
                      var newVideo = new Video();
                      newVideo.video_name = req.body.video_name;
                      newVideo.video_desc = req.body.video_desc;
                      newVideo.video_quiz_qn = req.body.video_quizqn;
                      if(req.body.video_quizans == '1'){
                        newVideo.video_quiz_ans = true;
                      }
                      else{
                        newVideo.video_quiz_ans = false;
                      }
                      newVideo.video_keyowords = req.body.video_keyword;
                      newVideo.video_filename = req.files[0].originalname;
                      newVideo.video_screenshots = tempfilenames;
                      newVideo.video_duration = fileduration;
                      newVideo.video_thumbnail_vttfile = vttfilename;
                      newVideo.video_marker_vttfile = markervttfilename;
                      newVideo.video_image = req.files[1].filename;
                      currentCourse = courses[i];
                      // console.log(currentCourse);
                      user.user.courses_created[i].videos.push(newVideo);
                      // console.log(user.user.courses_created[i].videos);
                      currentCourse = user.user.courses_created[i];
                      // console.log(currentCourseVideos);
                      user.markModified('user');
                      user.save();
                      break;
                    }

                  }
               
                res.render('edit_course.html', {
                  course_details : currentCourse
                });
            });

         
          //loop for deleting files from screenshots
            for(var i=0; i<tempfilenames.length-1; i++){
              fs.unlink('./public/videos/screenshots/' + tempfilenames[i]);
            }

            fs.unlink('./public/videos/'+markervttfilename);
              console.log('Files deleted');
          })

            .screenshots({
                timestamps: ['10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'],
                filename: 'thumbnail-at-%s-seconds.png',
                folder: './public/videos/screenshots/',
                size: '80x80'
           });    

          


      });
  });

}