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
            $wordView = $("<span class='word'>").text($wordModel.attr("display"));
            if ($wordModel.attr("key") == "true") {
              $wordView.addClass("key");
            }
            $lineView.append($wordView);
            $lineView.append(" ");
          });
          $stanzaView.append($lineView);
        });
        $div.append($stanzaView);
      });
      done($div);
    }, reject);
  });

  var addDiv = function() {
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
