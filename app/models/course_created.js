var mongoose = require('mongoose');

var courseCreatedSchema = mongoose.Schema({
		course_name				:String,
		course_description		:String,
	    course_genre        	:String,
	    course_author			:String,
	    videos					:{ type:Array, "default":[] }
});

courseCreatedSchema.methods.updateCourse = function(request, response){
	response.redirect('/course');
};



module.exports = mongoose.model('CourseCreated', courseCreatedSchema);