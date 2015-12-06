(function() {

  var rawXML = new Promise(function(done, reject) {
    $.ajax({
      url: "collage.xml",
      dataType: "xml",
    }).done(function(xml) {
      done(xml);
    }).fail(function() {
      reject(new Error("Could not load collage."));
    });
  });

  var popovers = [];
  var hideAllPopovers = function() {
    $.each(popovers, function(idx, el) {
      el.popover("hide");
    });
    popovers = [];
  };

  var openPopover = function() {
    hideAllPopovers();
    $(this).popover("show");
    popovers.push($(this));
  };

  var adjacencyList = {};
  var idToView = {};

  var addEdge = function(from, to) {
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

  var addNode = function(id, view) {
    if (id) {
      idToView[id] = view;
      adjacencyList[id] = {};
    }
  };

  var collageDiv = new Promise(function(done, reject) {
    rawXML.done(function(xml) {
      $div = $("<div class='collage'>");
      $xml = $(xml);
      $.each($xml.find("stanza"), function(idx, stanza) {
        $stanzaModel = $(stanza);
        $stanzaView = $("<div class='stanza'>");
        $.each($stanzaModel.find("line"), function(lIdx, line) {
          $lineModel = $(line);
          $lineView = $("<div class='line'>");
          $.each($lineModel.find("word"), function(wIdx, word) {
            $wordModel = $(word);
            $wordView = $("<span class='word'>").text($wordModel.attr("display"))
                                                .attr("page", $wordModel.attr("page"))
                                                .attr("line", $wordModel.attr("line"));
            var isKeyword = ($wordModel.attr("key") == "true");
            if (isKeyword) {
              $wordView.popover({ 
                title: "S. " + $wordModel.attr("page") + " Z. " + $wordModel.attr("line"), 
                content: $wordModel.text(),
                html: true,
                placement: "top",
                trigger: "manual"
              });
              $wordView.hover(openPopover, function() {});
              $wordView.click(openPopover);
              $wordView.addClass("key");
              addNode($wordModel.attr("id"), $wordView);
            }
            $lineView.append($wordView);
            $lineView.append(" ");
          });
          $stanzaView.append($lineView);
        });
        $div.append($stanzaView);
      });
      $.each($xml.find("edge"), function(idx, edge) {
        $edge = $(edge);
        addEdge($edge.attr("from-id"), $edge.attr("to-id"));
        if ($edge.attr("two-way") == "true") {
          addEdge($edge.attr("to-id"), $edge.attr("from-id"));
        }
      });
      done($div);
    }, reject);
  });

  var addDiv = function() {
    $(".jumbotron").click(hideAllPopovers);
    collageDiv.done(function(div) {
      $(div).fadeOut(0);
      $(".collage-container").append(div);
      $(div).fadeIn(2000);
    }, function(err) {
      console.error(err);
    });
  }

  // on load:
  $(addDiv);

})();
