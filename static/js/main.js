$(function() {
  
  'use strict';
  
  //--------------
  // Helper Functions
  //--------------
  
  // get URL display name
  function getUrlDisplayName(url) {
    var a = document.createElement('a');
    a.href = url;
    console.log(a);
    return a.hostname;
  }
  
  function stripTrailingSlash(str) {
    if(str.substr(-1) === '/') {
        return str.substr(0, str.length - 1);
    }
    return str;
  }
  
  //--------------
  // Models
  //--------------
  var Article = Backbone.Model.extend({
    
    defaults: function() {
      return {
        title: "empty article",
        description: "empty article",
        link: ""
      };
    },
  });
  
  var ActiveArticle = new Article();
  ActiveArticle.clear();
  
  //--------------
  // Collections
  //--------------
  var ArticleList = Backbone.Collection.extend({
    model: Article,
    url: '/parse',
    
    parse: function(response) {
      return response.result;
    }
  });
  
  var UnreadArticleList = new ArticleList();
  var ReadArticleList = new ArticleList();
  
  //--------------
  // Views
  //--------------
  
  // renders sources
  var SourceView = Backbone.View.extend({
    tagname: 'li',
    className: 'pure-menu-item',
    template: _.template($('#source-button-template').html()),
    
    render: function() {
      this.$el.html(this.template(this.model));
      return this;
    }
  });
  
  // renders individual articles
  var ArticleView = Backbone.View.extend({
    tagName: 'li',
    template: _.template($('#item-template').html()),
    
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },
    
    clear: function() {
      this.model.destroy();
    }
    
  });
  
  // renders to full app
  var AppView = Backbone.View.extend({
    el: '#app',
    
    events: {
      'click #playstop': 'togglePlayStop',
      'click #next': 'next',
      'click #add-url-btn': 'handleAddSource',
      'click .source-button': 'getArticles',
    },
    
    initialize: function() {
      this.listenTo(UnreadArticleList, 'add', this.addArticle);
      this.listenTo(UnreadArticleList, 'remove', this.removeArticle);
      this.listenTo(ActiveArticle, 'change', this.activeArticleChange);
      
      // Initialize sources
      this.addSource('https://news.google.com/news/section?output=rss', 'Google News');
      this.addSource('http://www.ozy.com/XmlServers/DailyDoseRSS.aspx', 'OZY');
      this.addSource('http://www.futurity.org/feed/', 'Futurity');
      this.addSource('http://www.theverge.com/rss/full.xml', 'The Verge');
      
      // disable player control initially
      this.disablePlayer();
    },
    
    handleAddSource: function() {
      // If url added
      var url = $('input[name="url"]').val();
      if (url) {
        this.addSource(url);
      }
      
      // show or hide url input
      $('input[name="url"]').val('');
      $('#add-url-div').toggle('slow', function(){
      });
    },
    
    addSource: function(url, name) {
      url = stripTrailingSlash(url);
      if (!name)
      {
        name = getUrlDisplayName(url);
      }
      
      var model = {url: url, name: name};
      var view = new SourceView({model: model});
      this.$('#sources').append(view.render().el);
    },
    
    getArticles: function(e) {
      UnreadArticleList.fetch({data: {url: e.target.value}, type: 'POST'});
    },
    
    addArticle: function(article) {
      var view = new ArticleView({model: article});
      this.$('#queued-content').append(view.render().el);
      
      this.enablePlayer();
    },
    
    removeArticle: function(article) {
      console.log('remove article');
      
      if (UnreadArticleList.length === 0) {
        this.disablePlayer();
      }
    },
    
    activeArticleChange: function(){
      console.log('article changed');
    },
    
    // Player methods
    enablePlayer: function() {
      $(".player-control").children().prop('disabled',false);
    },
    
    disablePlayer: function() {
      $(".player-control").children().prop('disabled',true);
    },
    
    togglePlayStop: function(e) {
      console.log('toggle play stop');
      // responsiveVoice.speak("hello naseem!", "UK English Female");
  
      if (!responsiveVoice.isPlaying()) {
        this.playActive();
      } else {
        responsiveVoice.cancel();
        $('#playstop').attr('src', 'static/img/control_play_up.png');
      }
    },
    
    next: function(e) {
      console.log('next');
      if (UnreadArticleList.length === 0) {
        console.log('no more new articles');
        return;
      }
  
      if (responsiveVoice.isPlaying()) {
        responsiveVoice.cancel();
      }
      
      ReadArticleList.add(ActiveArticle);
      ActiveArticle.clear();
      this.playActive();
    },
    
    playActive: function() {
      // if active article not set, pull one from unread list
      if (!ActiveArticle.id) {
        ActiveArticle.set(UnreadArticleList.pop().toJSON());
      }
      
      // play
      responsiveVoice.speak(ActiveArticle.get("description"), "UK English Female", {
        onstart: function() {
          console.log('playing');
          $('#playstop').attr('src', 'static/img/control_stop.png');
        },
        onend: function() {
          $('#playstop').attr('src', 'static/img/control_play_up.png');
    
          App.next();
        },
      });
    },
    
    
  });
  
  var App = new AppView();
  
  // var active;
  // var queue;
  
  // // Playback controls
  // function startCallback() {
  //   $('#playstop').attr('src', 'static/img/control_stop.png');
  // }
  
  // function endCallback() {
  //   $('#playstop').attr('src', 'static/img/control_play_up.png');
    
  //   // move top in queue to active
  //   updateQueueView(queue);
  //   playActive();
  // }
  
  // function playActive() {
  //   responsiveVoice.speak(active, "UK English Female", {onstart: startCallback, onend: endCallback});
  // }
  
  // $('#playstop').on('click', function(e) {
  //   if (!responsiveVoice.isPlaying()) {
  //     playActive();
  //   } else {
  //     responsiveVoice.cancel();
  //     $('#playstop').attr('src', 'static/img/control_play_up.png');
  //   }
  // });
  
  // $('#next').on('click', function(e) {
  //   if (queue.length == 0) return;
    
  //   if (responsiveVoice.isPlaying()) {
  //     responsiveVoice.cancel();
  //     updateQueueView(queue);
  //     playActive();
  //   } else {
  //     updateQueueView(queue);
  //   }
  // });
  
});
  