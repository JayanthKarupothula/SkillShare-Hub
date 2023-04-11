var mongoose = require('mongoose');

var courseEnrolledSchema = mongoose.Schema({
	course_enrolled     		: {
	course_names				: { type:Array, "default":[] }
    }
});

courseEnrolledSchema.methods.updateCourse = function(request, response){
	response.redirect('/course');
};



module.exports = mongoose.model('CourseEnrolled', courseEnrolledSchema);