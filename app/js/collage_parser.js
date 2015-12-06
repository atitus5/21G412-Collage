'use-strict';

(function() {

  var FADE_TIME = 500;  // Duration of fades
  var FADE_OPACITY = 0.4;  // Fade to opacity (on a scale of 0 to 1)

  var rawXML = new Promise(function(done, reject) {  // The contents of the collage XML file
    $.ajax({
      url: "collage.xml",
      dataType: "xml",
    }).done(function(xml) {
      done(xml);
    }).fail(function() {
      reject(new Error("Could not load collage."));
    });
  });

  var hideAllPopovers = function() {  // Hides all popovers
    fadeRestore();  // Restore all words to default opacity
    $(".popover").popover("hide");  // Hide the popovers
    $(".word").attr("popover-open", "false"); // Register that the popovers for all words are closed
  };

  var openPopover = function() {  // Open popover.  "this" is the <span class="word"> element
    hideAllPopovers();  // Hide all open popovers
    $(this).popover("show");  //  Show current popover
    $(this).attr("popover-open", "true");  // Log that the popover is open
    fadeWordsNotConnectedTo($(this).attr("word-id"));  // Fade word not related to current word
  };

  var togglePopover = function() {  // Toggles whether the popover is visible or not (on click of word).  "this" is the <span class="word"> element.
    if ($(this).attr("popover-open") === "true") {  
      hideAllPopovers();  // It is currently open.  Close it.
    } else {
      openPopover.call(this);  // It is not open.  Open it.
    }
  };

  var adjacencyList = {};  // Adjacency list of {word: {connected_word1: true, connected_word2: true}}
  var idToView = {};  // Maps word ID to the jQuery element for the word

  var addEdge = function(from, to) {  // Adds an edge from from to to
    if (from && to) {
      if (!idToView[from]) {
        console.error("Unknown node referenced in edge:  " + from);
        return;
      }
      if (!idToView[to]) {
        console.error("Unknown node referenced in edge:  " + to);
        return;
      }
      adjacencyList[from][to] = true;
    }
  };

  var addNode = function(id, view) {  // Adds a node
    if (id) {
      idToView[id] = view;
      adjacencyList[id] = {};
    }
  };

  var fadeWordsNotConnectedTo = function(id) {  // Fades out all words not related to word with word-id id.
    $.each($(".word"), function(idx, word) {
      var $word = $(word);
      if ($word.attr("word-id") != id && !adjacencyList[id][$word.attr("word-id")]) {
        $word.fadeTo(FADE_TIME, FADE_OPACITY);
      }
    });
  };

  var fadeRestore = function() {  // Restores all words to full opacity
    $(".word").fadeTo(FADE_TIME, 1.0);
  };

  var collageDiv = new Promise(function(done, reject) {  // Promise to generate collage div
    rawXML.done(function(xml) {
      var $div = $("<div class='collage'>");
      var $xml = $(xml);
      $.each($xml.find("stanza"), function(idx, stanza) {  // For each stanza:
        var $stanzaModel = $(stanza);
        var $stanzaView = $("<div class='stanza'>");
        $.each($stanzaModel.find("line"), function(lIdx, line) {  // For each line:
          var $lineModel = $(line);
          var $lineView = $("<div class='line'>");
          $.each($lineModel.find("word"), function(wIdx, word) {  // For each word:
            var $wordModel = $(word);
            var $wordView = $("<span class='word'>").text($wordModel.attr("display"))  // Create word element with word as text
                                                .attr("page", $wordModel.attr("page"))  // With page number attribute
                                                .attr("line", $wordModel.attr("line"))  // With line number attribute
                                                .attr("word-id", $wordModel.attr("id"));  // With word ID attribue
            var isKeyword = ($wordModel.attr("key") === "true");  // Determine whether it is a keyword
            if (isKeyword) {  // If it is a keyword:
              $wordView.popover({ // Make a popover for it:
                title: "S. " + $wordModel.attr("page") + " Z. " + $wordModel.attr("line"),  // Title is page/line number
                content: $wordModel.text(),  // Content is taken from the XML CDATA
                container: 'body',  // Contained in body (so it can be wider than the word element)
                html: true,  // HTML is allowed in the content.
                placement: "top",  // Place it above the word
                trigger: "manual"  // It is opened/closed manually
              });
              $wordView.click(togglePopover);  // When a word is clicked, its popover is toggled
              $wordView.addClass("key");  // It is a keyword.  Add a class to show so
              addNode($wordModel.attr("id"), $wordView);  // Add the keyword node to the graph 
            }
            $lineView.append($wordView);
            $lineView.append(" ");
          });
          $stanzaView.append($lineView);
        });
        $div.append($stanzaView);
      });
      $.each($xml.find("edge"), function(idx, edge) { // Find the edges
        var $edge = $(edge);
        addEdge($edge.attr("from-id"), $edge.attr("to-id"));  // Add the edge to the graph
        if ($edge.attr("two-way") === "true") {  // If it's two-way, add the reverse edge too
          addEdge($edge.attr("to-id"), $edge.attr("from-id"));
        }
      });
      done($div);
    }, reject);
  });

  var addDiv = function() {
    collageDiv.done(function(div) { // When the collage div is ready...
      $(div).fadeOut(0);  // make it not visible
      $(".collage-container").append(div);  // Add it
      $(div).fadeIn(2000);  // fade it in
    }, function(err) {
      console.error(err);
    });
  };

  // on load:
  $(addDiv);

})();
