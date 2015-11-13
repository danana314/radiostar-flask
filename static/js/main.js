$( function() {
  var active;
  var queue;
  
  // disable player control initially
  $(".player-control").children().prop('disabled',true);
  
  // Playback controls
  function startCallback() {
    $('#playstop').attr('src', 'static/img/control_stop.png');
  }
  
  function endCallback() {
    $('#playstop').attr('src', 'static/img/control_play_up.png');
    
    // move top in queue to active
    updateQueueView(queue);
    playActive();
  }
  
  function playActive() {
    responsiveVoice.speak(active, "UK English Female", {onstart: startCallback, onend: endCallback});
    
  }
  
  $('#playstop').on('click', function(e) {
    if (!responsiveVoice.isPlaying()) {
      playActive();
    } else {
      responsiveVoice.cancel();
      $('#playstop').attr('src', 'static/img/control_play_up.png');
    }
  });
  
  $('#next').on('click', function(e) {
    if (queue.length == 0) return;
    
    if (responsiveVoice.isPlaying()) {
      responsiveVoice.cancel();
      updateQueueView(queue);
      playActive();
    } else {
      updateQueueView(queue);
    }
  });
  
  // Update feed display
  function updateQueueView(data) {
    active = data[0];
    queue = data.splice(1);
    
    // enable player controls if at least one result
    if (active) {
      $(".player-control").children().prop('disabled',false);
    }
    
    // Queue first one
    $('#active-content').empty();
    $('#active-content').append(active.title + '<br/>');
    $('#active-content').append(active.desc);
    
    $('#queued-content ul').empty();
    for (var i = 0; i < queue.length; i++) {
      $('#queued-content ul').append('<li>'+queue[i].title+'</li>');
    }
  }
  
  // Handle responses from server
  function handleParsed(data) {
    var articles = data.titles.map(function(e, i) {
      return {'title': data.titles[i], 'desc': data.descriptions[i], 'link': data.links[i]};
    });
    updateQueueView(articles);
  }
  
  // get URL display name
  function getUrlDisplayName(url) {
    var a = document.createElement('a');
    a.href = url;
    return a.hostname;
  }
  
  // Show feed entry
  $('#add-url-btn').on('click', function(e) {
    // If url added
    url = $('input[name="url"]').val();
    if (url) {
      var name = getUrlDisplayName(url);
      $('#sources ul').append('<li class="pure-menu-item"><button class="pure-menu-link source-button" value'+url+'">'+name+'</button></li>');
    }
    
    // show or hide url input
    $('input[name="url"]').val('');
    
    $('#add-url-div').toggle('slow', function(){
    });
  });
  
  
  // Get articles from selected source
  $('.source-button').on('click', function(e) {
    
    $.post('/parse',
      {
        url: $(this).attr('value'),
      },
      handleParsed
    );
  });
});
  