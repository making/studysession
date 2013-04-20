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
    url: '/candidates',
    comparator: function (model) {
        return -1 * model.get('like');
    }
});


// Views
studysession.CandidateListView = Backbone.View.extend({
    tagName: 'table',
    initialize: function () {
        this.collection.bind('sort', function (e) {
        }, this);
        this.collection.bind('add', function (candidate) {
            if (this.headerAppended) {
                this.$el.append(new studysession.CandidateListItemView({
                    model: candidate
                }).render().el);
            }
        }, this);
    },
    render: function (eventName) {
        this.$el.append('<tr><th>TITLE</th><th>GENRE</th><th>CREATOR</th><th>SPEAKER</th><th>ACTION</th></tr>');
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
    events: {
        'click .like': 'like',
        'click .delete': 'deleteCandidate'
    },
    like: function () {
        var model = this.model;
        $.ajax({
            url: model.url() + '/like',
            type: 'PUT',
            success: function (data) {
                model.set(data);
                model.collection.sort();
            }
        });
    },
    deleteCandidate: function () {
        if (confirm('Are you sure to delete ' + this.model.get('title') + '?')) {
            this.model.destroy({
                success: function () {
                    alert('deleted successfully!');
                }
            });
        }
        return false;
    },
    close: function () {
        this.$el.unbind();
        this.$el.remove();
    }
});

studysession.CandidateFormView = Backbone.View.extend({
    template: _.template($('#tpl-candidate-form').html()),
    initialize: function () {
        this.model.bind('change', this.render, this);
    },
    render: function (eventName) {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    events: {
        'change input': 'change',
        'click .save': 'saveCandidate'
    },
    change: function (event) {
        //var target = event.target;
        //console.log('changing ' + target.id + ' from: ' + target.defaultValue + ' to: ' + target.value);
    },
    saveCandidate: function () {
        this.model.set({
            title: $('#title').val(),
            genre: $('#genre').val(),
            creator: $('#creator').val(),
            speaker: $('#speaker').val().split(',')
        });
        var that = this;
        if (this.model.isNew()) {
            app.candidates.create(this.model, {
                success: function () {
                    app.navigate('candidates/' + that.model.id, false);
                }
            });
        } else {
            this.model.save();
        }
        return false;
    },
    close: function () {
        this.$el.unbind();
        this.$el.empty();
    }
});

// Router
studysession.AppRouter = Backbone.Router.extend({
    routes: {
        '': 'candidatesList',
        'candidates/:id': 'candidatesDetails',
        'candidates?form': 'candidatesForm'
    },
    initialize: function () {
    },
    candidatesList: function () {
        this.candidates = new studysession.Candidates();
        this.candidateListView = new studysession.CandidateListView({
            collection: this.candidates
        });
        var that = this;
        this.candidates.fetch({
            success: function () {
                $('#candidate-form').html('');
                $('#candidate-list').html(that.candidateListView.render().el);
                if (that.afterFetch) {
                    that.afterFetch.call(that);
                    that.afterFetch = null;
                }
            }
        });
    },
    candidatesDetails: function (id) {
        if (this.candidates) {
            this.candidate = this.candidates.get(id);
            if (this.candidateView) {
                this.candidateView.close();
            }
            this.candidateView = new studysession.CandidateFormView({
                model: this.candidate
            });
            $('#candidate-form').html(this.candidateView.render().el);
        } else {
            var that = this;
            this.afterFetch = function () {
                that.candidatesDetails(id);
            };
            this.candidatesList();
        }
    },
    candidatesForm: function () {
        if (this.candidates) {
            if (this.candidateView) {
                this.candidateView.close();
            }
            this.candidateView = new studysession.CandidateFormView({
                model: new studysession.Candidate()
            });
            $('#candidate-form').html(this.candidateView.render().el);
        } else {
            var that = this;
            this.afterFetch = function () {
                that.candidatesForm();
            };
            this.candidatesList();
        }
    }
});

var app = new studysession.AppRouter();
Backbone.history.start();


