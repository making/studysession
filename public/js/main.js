/**
 * Created with IntelliJ IDEA.
 * User: maki
 * Date: 2013/04/15
 * Time: 0:25
 * To change this template use File | Settings | File Templates.
 */
var studysession = {};

// Models
studysession.Candidate = Backbone.Model.extend({
    defaults: {
        id: null,
        title: '',
        genre: '',
        creator: '',
        speaker: [],
        like: 0
    },
    initialize: function () {
    }
});

// Collections
studysession.Candidates = Backbone.Collection.extend({
    model: studysession.Candidate,
    url: '/candidates'
});


// Views
studysession.CandidateListView = Backbone.View.extend({
    tagName: 'table',
    initialize: function () {
        this.collection.bind('reset', this.render, this);
    },
    render: function (eventName) {
	this.$el.append('<tr><th>TITLE</th><th>GENRE</th><th>CREATOR</th><th>SPEAKER</th><th>LIKE</th></tr>');
        this.collection.each(function (candidate) {
            this.$el.append(new studysession.CandidateListItemView({
                model: candidate
            }).render().el);
        }, this);
        return this;
    }
});

studysession.CandidateListItemView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($('#tpl-candidate-list-item').html()),
    render: function (eventName) {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});

studysession.CandidateView = Backbone.View.extend({
    template: _.template($('#tpl-candidate-form').html()),
    render: function (eventName) {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});

// Router
studysession.AppRouter = Backbone.Router.extend({
    routes: {
        '': 'list',
        'candidates/:id': 'details'
    },
    list: function () {
        this.candidates = new studysession.Candidates();
        this.candidateListView = new studysession.CandidateListView({collection: this.candidates});
	var that = this;
        this.candidates.fetch({success: function() {
	    $('#candidate-form').html('');
	    $('#candidate-list').html(that.candidateListView.render().el);
	}});
    },
    details: function (id) {
        this.candidate = this.candidates.get(id);
        this.candidateView = new studysession.CandidateView({model: this.candidate});
        $('#candidate-form').html(this.candidateView.render().el);
    }
});

var app = new studysession.AppRouter();
Backbone.history.start();


