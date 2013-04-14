/**
 * Created with IntelliJ IDEA.
 * User: maki
 * Date: 2013/04/14
 * Time: 20:47
 * To change this template use File | Settings | File Templates.
 */
var mongoose = require('mongoose')
    , Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var db = mongoose.connect('mongodb://localhost/studysession');

// Model Definitions
var Candidate = new Schema({
    id: {type: Number, min: 0, index: true},
    title: {type: String, required: true},
    genre: {type: String, required: true},
    creator: {type: String, required: true},
    speaker: {type: [
        {type: String}
    ]},
    like: {type: Number, min: 0, default: 0}
});


Candidate.pre('save', function (next) {
    if (!this.isNew) return next();
    var model = this;
    model.db.db.executeDbCommand({
        findAndModify: 'sequence',
        query: { name: model.collection.name },
        update: { $set: { name: model.collection.name }, $inc: { sequence: 1 } },
        new: true,
        upsert: true
    }, function (err, data) {
        if (!err && data.documents[0].ok) {
            model.id = data.documents[0].value.sequence;
            next();
        } else {
            next(err || new Error(data.documents[0].errmsg));
        }
    });
});

exports.Candidate = db.model('Candidate', Candidate);