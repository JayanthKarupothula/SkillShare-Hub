var mongoose = require('mongoose');

var videoSchema = mongoose.Schema({
		video_name	: String,
		video_desc  : String,
		video_quiz_qn : String,
		video_quiz_ans : Boolean,
		video_keyowords : { type: Array, "default" :[] },
		video_filename : String,
		video_duration : String,
		video_screenshots : { type: Array, "default" : []},
		video_thumbnail_vttfile : String,
		video_marker_vttfile : String,
		video_likes : { type: Array, "default" : []},
		video_dislikes : {type: Array, "default" : []},
		video_comments : { type: Array, "default" : []},
		video_image : String
});

videoSchema.methods.updateCourse = function(request, response){
	response.redirect('/course');
};



module.exports = mongoose.model('video', videoSchema);