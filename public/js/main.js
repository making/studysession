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
	var that = this;
	this.collection.bind('add', function(candidate) {
	    if (that.headerAppended) {
		that.$el.append(new studysession.CandidateListItemView({
		    model: candidate
		}).render().el);
	    }
	});
    },
    render: function (eventName) {
	this.$el.append('<tr><th>TITLE</th><th>GENRE</th><th>CREATOR</th><th>SPEAKER</th><th>LIKE</th></tr>');
	this.headerAppended = true;
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
    initialize: function () {
	this.model.bind('change', this.render, this);
	this.model.bind('destroy', this.close, this);
    },
    render: function (eventName) {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    close: function () {
	this.$el.unbind();
	this.$el.remove();
    }
});

studysession.CandidateFormView = Backbone.View.extend({
    template: _.template($('#tpl-candidate-form').html()),
    initialize: function() {
	this.model.bind('change', this.render, this);
    },
    render: function (eventName) {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    events: {
	'change input' : 'change',
	'click .save' : 'saveCandidate',
	'click .delete' : 'deleteCandidate'
    },
    change: function (event) {
	//var target = event.target;
	//console.log('changing ' + target.id + ' from: ' + target.defaultValue + ' to: ' + target.value);	
    },
    saveCandidate: function() {
	this.model.set({
	    title: $('#title').val(),
	    genre: $('#genre').val(),
	    creator: $('#creator').val(),
	    speaker: $('#speaker').val().split(',')
	});
	if (this.model.isNew()) {
	    app.candidates.create(this.model);
	} else {
	    this.model.save();
	}
	return false;
    },
    deleteCandidate: function() {
	this.model.destroy({
	    success: function() {
		alert('deleted successfully!');
		window.history.back();
	    }
	});
	return false;
    },
    close: function() {
	this.$el.unbind();
	this.$el.empty();
    }
});

// Router
studysession.AppRouter = Backbone.Router.extend({
    routes: {
        '': 'list',
        'candidates/:id': 'details',
	'form': 'form'
    },
    initialize: function() {
    },
    list: function () {
        this.candidates = new studysession.Candidates();
        this.candidateListView = new studysession.CandidateListView({
	    collection: this.candidates
	});
	var that = this;
        this.candidates.fetch({
	    success: function() {
		$('#candidate-form').html('');
		$('#candidate-list').html(that.candidateListView.render().el);
	    }
	});
    },
    details: function (id) {
        this.candidate = this.candidates.get(id);
	if (this.candidateView) {
	    this.candidateView.close();
	}
        this.candidateView = new studysession.CandidateFormView({
	    model: this.candidate
	});
        $('#candidate-form').html(this.candidateView.render().el);
    },
    form: function() {
	if (this.candidateView) {
	    this.candidateView.close();
	}
	this.candidateView = new studysession.CandidateFormView({
	    model: new studysession.Candidate()
	});
	$('#candidate-form').html(this.candidateView.render().el);
    }
});

var app = new studysession.AppRouter();
Backbone.history.start();


