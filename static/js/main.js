$( function() {
  var active;
  var queue;
  
  // Playback controls
  function endPlayCallback() {
    
  }
  $('#playBtn').on('click', function(e) {
    responsiveVoice.speak(active, "UK English Female", {onend: endPlayCallback});
    
  });
  
  // Update feed display
  function updateQueueView(data) {
    active = data[0];
    queue = data.splice(1);
    
    // Queue first one
    $('#activeContent').empty();
    $('#activeContent').append(active);
    
    $('#queuedContent ul').empty();
    for (var i = 0; i < queue.length; i++) {
      $('#queuedContent ul').append('<li>'+queue[i]+'</li>');
    }
  }
  
  // Handle responses from server
  function handleParsed(data) {
    updateQueueView(data.titles);
  }
  
  // get URL display name
  function getUrlDisplayName(url) {
    var a = document.createElement('a');
    a.href = url;
    return a.hostname;
  }
  
  // Show feed entry
  $('#addUrlBtn').on('click', function(e) {
    // If url added
    url = $('input[name="url"]').val();
    if (url) {
      var name = getUrlDisplayName(url);
      $('#sourceContainer ul').append('<li class="pure-menu-item"><button class="pure-menu-link source-button" value'+url+'">'+name+'</button></li>');
    }
    
    // show or hide url input
    $('input[name="url"]').val('');
    
    $('#addUrlDiv').toggle('slow', function(){
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
  