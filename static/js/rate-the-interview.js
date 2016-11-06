/*jslint devel: true*/
/*global XMLHttpRequest: false*/
/*global document: false*/

/*****
 *
 *

          <div class="comment">
            <div class="comment-content">
              <h1>First Comment Title or Author</h1>
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Optio, aspernatur, quia modi minima debitis tempora ducimus quam vero impedit alias earum nemo error tenetur sed.</p>
              <p class="comment-detail">Date or details about this post</p>
            </div>
          </div>

          <div class="comment">
            <div class="comment-content">
              <h1>Another One</h1>
              <p></p>
              <p class="comment-detail">Date or details about this post</p>
            </div>
          </div>

          <div class="comment">
            <div class="comment-content">
              <h1>Another One</h1>
              <p></p>
              <p class="comment-detail">Date or details about this post</p>
            </div>
          </div>


          <div class="comment">
            <div class="comment-content">
              <h1>Another One</h1>
              <p></p>
              <p class="comment-detail">Date or details about this post</p>
            </div>
          </div>
          <div class="comment">
            <div class="comment-content">
              <h1>Another One</h1>
              <p></p>
              <p class="comment-detail">Date or details about this post</p>
            </div>
          </div>

          <div class="comment">
            <div class="comment-image">
              <img src="https://raw.githubusercontent.com/thoughtbot/refills/master/source/images/placeholder_square.png" alt="">
            </div>
            <div class="comment-content">
              <h1>First Comment Title or Author</h1>
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Optio, aspernatur, quia modi minima debitis tempora ducimus quam vero impedit alias earum nemo error tenetur sed.</p>
              <p class="comment-detail">Date or details about this post</p>
            </div>
          </div>

          <div class="comment">
            <div class="comment-image">
              <img src="https://raw.githubusercontent.com/thoughtbot/refills/master/source/images/placeholder_square.png" alt="">
            </div>
            <div class="comment-content">
              <h1>Another One</h1>
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Optio, aspernatur, quia modi minima debitis tempora ducimus quam vero impedit alias earum nemo error tenetur sed.</p>
              <p class="comment-detail">Date or details about this post</p>
            </div>
          </div>

*****/


(function() {

  var IMAGE_FROM_RATING = [
    "angry.png",
    "worried.png",
    "happy.png"
  ];

  var create_comment = function(item) {

    var div_c = document.createElement('div');
    div_c.setAttribute("class", "comment");

//    var div_ci = document.createElement('div');
//    div_ci.setAttribute("class", "comment-image");
//    div_ci.innerHTML = '<img src="/img/' + IMAGE_FROM_RATING[item.rating] + '" alt="">';

    var div_cc = document.createElement('div');
    div_cc.setAttribute("class", "comment-content");

    var h_comp_pos = document.createElement('h1');
    h_comp_pos.innerHTML = item.comp_disp + ' : ' + item.pos_disp; 

    var p_review = document.createElement('p');
    p_review.innerHTML = item.review;

    var p_created = document.createElement('p');
    p_created.setAttribute("class", "comment-detail");
    p_created.innerHTML = item.created;

    div_cc.appendChild(h_comp_pos);
    div_cc.appendChild(p_review);
    div_cc.appendChild(p_created);

//    div_c.appendChild(div_ci);
    div_c.appendChild(div_cc);

    return div_c;
  };

  var add_comments = function(data) {
    var div = document.getElementById('comments');
    data.forEach( function(item) {
      div.appendChild(create_comment(item));
    });
  };

	var request = new XMLHttpRequest();
	request.open('GET', '/reviews/reviews.json', true);

	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			// Success!
			var data = JSON.parse(request.responseText);
      add_comments(data);
			console.log(data);
		} else {
			// We reached our target server, but it returned an error
			alert("error");
		}
	};

	request.onerror = function() {
		// There was a connection error of some sort
		alert("error");
	};

	request.send();
}());
