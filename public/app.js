// Grab the articles as a json
$.getJSON("/articles", function (data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#articles").append(
      "<div class='card' style='width: 18rem;'>" +
      "<img src ='" + data[i].img + "' class='card-img-top' alt='...'" +
      "<h5 class='card-title'> <a href='" + data[i].link + "'target='_blank'>" + data[i].title + "</a> </h5>" +
      "<p class='card-text'>" + data[i].summary + "</p>" +
      "<h6 data-id='" + data[i]._id + "'> Click here to add and View a note!</h6> </div>"
    );
  }
});


// Whenever someone clicks a p tag
$(document).on("click", "h6", function () {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function (data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<label for= 'titleinput'> Title </lable> <input class='form control' id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<label for='bodyinput'> Note </label> <textarea class='form-control' id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      //Puts new notes on page
      $("#notes").append("</br> <div class='card' style='width: 18rem;'>" +
        "<p class='card-text'>" + data.note.title + "</p>" +
        "<p class='card-text'>" + data.note.body + "</p>" 
      )
      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function (data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});