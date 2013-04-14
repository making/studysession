var _ = require('underscore')
    , model = require('../model');
var Candidate = model.Candidate;
/*
 * GET candidates listing.
 */

exports.list = function (req, res) {
    Candidate.find({}, function (err, items) {
        res.send(items);
    });
};

exports.get = function (req, res) {
    var id = req.params.id;
    Candidate.findOne({'id': id}, function (err, item) {
        if (err) {
            res.send(400, err);
        } else if (item) {
            res.send(item);
        } else {
            res.send(404);
        }
    });
};

exports.post = function (req, res) {
    var candidate = new Candidate(req.body);
    if (!candidate.speaker) {
        candidate.speaker = [];
    }
    candidate.save(function (err) {
        if (err) {
            res.send(400, err);
        } else {
            res.send(201, candidate);
        }
    });
};

exports.put = function (req, res) {
    var id = req.params.id;
    Candidate.findOne({'id': id}, function (err, item) {
        if (err) {
            res.send(400, err);
        } else if (item) {
            item = _.extend(item, _.omit(req.body, 'id'));
            item.save(function (err) {
                if (err) {
                    res.send(400, err);
                } else {
                    res.send(item);
                }
            });
        } else {
            res.send(404);
        }
    });
};

exports.like = function (req, res) {
    var id = req.params.id;
    Candidate.findOne({'id': id}, function (err, item) {
        if (err) {
            res.send(400, err);
        } else if (item) {
            item.like++;
            item.save(function (err) {
                if (err) {
                    res.send(400, err);
                } else {
                    res.send(item);
                }
            });
        } else {
            res.send(404);
        }
    });
};

exports.del = function (req, res) {
    var id = req.params.id;
    Candidate.findOne({'id': id}, function (err, item) {
        if (err) {
            res.send(400, err);
        } else if (item) {
            item.remove(function (err) {
                if (err) {
                    res.send(400, err);
                } else {
                    res.send(204);
                }
            });
        } else {
            res.send(404);
        }
    });
};



