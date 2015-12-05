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
      $.each(xml.find("word"), function(idx, el) {
        $el = $(el);
        $div.append($("<span class='word'>").text($el.attr("display")));
      });
      done($div);
    }, reject);
  });

  var addDiv = function() {
    collageDiv.done(function(div) {
      $(".collage-container").append(div);
    }, function(err) {
      console.error(err);
    });
  }

  // on load:
  $(addDiv);

})();
