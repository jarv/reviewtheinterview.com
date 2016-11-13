/*jslint devel: true*/
/*global XMLHttpRequest: false*/
/*global document: false*/
/*global Awesomplete: false*/
/*global localStorage: false*/
(function() {

	var pad = function(num, size) {
			var s = "0000" + num;
			return s.substr(s.length-size);
	};

	var array_unique = function(array) {
    var a, i, j;
    a = array.concat();
    for(i=0; i<a.length; ++i) {
      for(j=i+1; j<a.length; ++j) {
        if(a[i] === a[j]) {
            a.splice(j--, 1);
        }
      }
    }
    return a;
	};

	var time_convert = function(t) {     
		var a = new Date(t * 1000),
				today = new Date(),
				yesterday = new Date(Date.now() - 86400000),
				months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
				year = a.getFullYear(),
				month = months[a.getMonth()],
				date = a.getDate(),
				hour = a.getHours(),
				min = a.getMinutes();
		if (a.setHours(0,0,0,0) === today.setHours(0,0,0,0)) {
			return 'Today, ' + pad(hour, 2) + ':' + pad(min, 2);
    }
    if (a.setHours(0,0,0,0) === yesterday.setHours(0,0,0,0)) {
			return 'Yesterday, ' + pad(hour, 2) + ':' + pad(min, 2);
    }
    if (year === today.getFullYear()) {
			return date + ' ' + month + ', ' + pad(hour, 2) + ':' + pad(min, 2);
    }
    return date + ' ' + month + ' ' + year + ', ' + pad(hour, 2) + ':' + pad(min, 2);
	};

  var major_company_list = [
    "Apple Inc.",
    "Google",
    "Samsung Electronics",
    "Amazon.com",
    "HP Inc.",
    "Microsoft",
    "IBM",
    "Dell Technologies",
    "Sony",
    "Panasonic",
    "Intel",
    "LG Electronics",
    "Facebook",
    "General Electric",
    "Twitter",
    "LinkedIn",
    "eBay",
    "Netflix",
    "Yahoo"
  ];

  var major_european_cities = [
    "London, United Kingdom",
    "Berlin, Germany",
    "Madrid, Spain",
    "Rome, Italy",
    "Paris, France",
    "Bucharest, Romania",
    "Vienna, Austria",
    "Hamburg[Notes",
    "Budapest, Hungary",
    "Warsaw, Poland",
    "Barcelona, Spain",
    "Munich, Germany",
    "Milan, Italy",
    "Prague, Czech Republic",
    "Sofia, Bulgaria",
    "Brussels[Notes",
    "Birmingham, United Kingdom",
    "Cologne, Germany",
    "Naples, Italy",
    "Stockholm, Sweden",
    "Turin, Italy",
    "Marseille, France",
    "Amsterdam, Netherlands",
    "Zagreb, Croatia",
    "Valencia, Spain",
    "Leeds, United Kingdom",
    "Kraków, Poland",
    "Frankfurt, Germany",
    "Łódź, Poland",
    "Seville, Spain",
    "Palermo, Italy",
    "Zaragoza, Spain",
    "Athens, Greece",
    "Riga, Latvia",
    "Wrocław, Poland",
    "Helsinki, Finland",
    "Rotterdam, Netherlands",
    "Stuttgart, Germany",
    "Düsseldorf, Germany",
    "Glasgow, United Kingdom",
    "Genoa, Italy",
    "Dortmund, Germany",
    "Copenhagen, Denmark",
    "Essen, Germany",
    "Sheffield, United Kingdom",
    "Málaga, Spain",
    "Leipzig, Germany",
    "Bremen, Germany",
    "Dublin, Ireland",
    "Lisbon, Portugal",
    "Dresden, Germany",
    "Vilnius, Lithuania",
    "Poznań, Poland",
    "Gothenburg, Sweden",
    "Bradford, United Kingdom",
    "Manchester, United Kingdom",
    "Hanover, Germany",
    "The Hague, Netherlands",
    "Antwerp, Belgium",
    "Nuremberg, Germany",
    "Edinburgh, United Kingdom",
    "Lyon, France",
    "Duisburg, Germany",
    "Liverpool, United Kingdom",
    "Gdańsk, Poland",
    "Bristol, United Kingdom",
    "Toulouse, France",
    "Tallinn, Estonia",
    "Murcia, Spain",
    "Bratislava, Slovakia Slovak Republic",
    "Szczecin, Poland",
    "Palma de Mallorca, Spain",
    "Bologna, Italy",
    "Florence, Italy",
    "Las Palmas, Spain",
    "Brno, Czech Republic",
    "Bochum, Germany",
    "Cardiff, United Kingdom",
    "Bydgoszcz, Poland"
  ];

  var major_us_cities = [
    "New York City, New York",
    "Los Angeles, California",
    "Chicago, Illinois",
    "Houston, Texas",
    "Philadelphia, Pennsylvania",
    "Phoenix, Arizona",
    "San Antonio, Texas",
    "San Diego, California",
    "Dallas, Texas",
    "San Jose, California",
    "Austin, Texas",
    "Jacksonville, Florida",
    "Indianapolis, Indiana",
    "San Francisco, California",
    "Columbus, Ohio",
    "Fort Worth, Texas",
    "Charlotte, North Carolina",
    "Detroit, Michigan",
    "El Paso, Texas",
    "Memphis, Tennessee",
    "Boston, Massachusetts",
    "Seattle, Washington",
    "Denver, Colorado",
    "Washington, DC",
    "Nashville-Davidson, Tennessee",
    "Baltimore, Maryland",
    "Louisville/Jefferson, Kentucky",
    "Portland, Oregon",
    "Oklahoma , Oklahoma",
    "Milwaukee, Wisconsin",
    "Las Vegas, Nevada",
    "Albuquerque, New Mexico",
    "Tucson, Arizona",
    "Fresno, California",
    "Sacramento, California",
    "Long Beach, California",
    "Kansas , Missouri",
    "Mesa, Arizona",
    "Virginia Beach, Virginia",
    "Atlanta, Georgia",
    "Colorado Springs, Colorado",
    "Raleigh, North Carolina",
    "Omaha, Nebraska",
    "Miami, Florida",
    "Oakland, California",
    "Tulsa, Oklahoma",
    "Minneapolis, Minnesota",
    "Cleveland, Ohio",
    "Wichita, Kansas",
    "Arlington, Texas"
  ];
  
  var all_cities = major_us_cities.concat(major_european_cities);

  var show_submitted = function(msg) {
    console.log("SUBMITTED " + msg);
  };
 
  var show_error = function(msg) {
    console.log("ERROR " + msg);
  };
  /*
  var show_inprogress = function(msg) {

  };
  */

  var create_comment = function(item) {
    var div_c = document.createElement('div');
    div_c.setAttribute("class", "comment");

    var div_cc = document.createElement('div');
    div_cc.setAttribute("class", "comment-content");
    div_cc.id = item.id;

    var h_comp_pos = document.createElement('h1');
    h_comp_pos.innerHTML = item.company + ' : ' + item.position; 

    var p_review = document.createElement('p');
    p_review.innerHTML = item.review;

    var p_created = document.createElement('p');
    p_created.setAttribute("class", "comment-detail");
    p_created.innerHTML = time_convert(item.create_time);

	  var b = document.createElement('div');
		b.setAttribute("class", "emoji-comment-selector");
    // 2620 skull
    // 1f4a9 poo
    // 1f49f heart
    // 2611 check
    // 2705 check2
    if (item.pending === "true") {
      console.log("not null");
      console.log(item);
      b.innerHTML = '<div class="rating e2705"></div> <div class="rating e2620"></div>';
    } else {
      b.innerHTML = '<div class="rating e1f49f"></div> <div class="rating e1f4a9"></div>';
    }

    div_cc.appendChild(b);

    div_cc.appendChild(h_comp_pos);
    div_cc.appendChild(p_review);
    div_cc.appendChild(p_created);
    div_c.appendChild(div_cc);

    return div_c;
  };

  var add_emoji_style = function(item) {
    var css = '#' + item.id + ':before' + '{ background-image: url("/img/' + item.emoji.replace(/^e/, '') + '.png"); }',
        head = document.head || document.getElementsByTagName('head')[0],
        style = document.createElement('style');

    style.type = 'text/css';
    if (style.styleSheet){
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
    head.appendChild(style);
  };


  var get_local_pending_ids = function() {
    var ids;
    try {
      ids = JSON.parse(localStorage.getItem("pending_ids"));
    } catch(e) {
      ids = [];
    }
    if (ids === null) {
     ids = [];
    }
    return ids;
  };

  var show_pending = function() {
    var item, local_pending_ids, div, comment;
    local_pending_ids = get_local_pending_ids();
    div = document.getElementById('pending-comments');
    div.innerHTML = "";
    local_pending_ids.reverse().forEach( function(id) {
      item = JSON.parse(localStorage.getItem(id));
      item.pending = "true";
      comment = create_comment(item);
      div.appendChild(comment);
      add_emoji_style(item);
    });
  };

  var update_pending = function(json, callback) {
    var pending, local_pending_ids, json_ids;

		pending = JSON.parse(json);
    local_pending_ids = get_local_pending_ids();
    
    json_ids = JSON.stringify(array_unique(local_pending_ids.concat([pending.id])));
		localStorage.setItem("pending_ids", json_ids);
		localStorage.setItem(pending.id, JSON.stringify(pending));

    if (typeof callback === 'function') {
      callback();
    }
  };
/*
  var check_pending = function(callback) {
    if (typeof callback === 'function') {
      callback();
    }
  };
*/


  var add_comments = function(data) {
    var comment,
        div = document.getElementById('comments');
    data.forEach( function(item) {
      comment = create_comment(item);
      div.appendChild(comment);
      add_emoji_style(item);
    });
  };

	var ajax_submit = function(form) {
			var i, input, 
					ii = form.length,
					xhr = new XMLHttpRequest(),
		 			data = {};

      for (i = 0; i < ii; ++i) {
        input = form[i];
        if (input.name) {
          if (input.type === 'radio') {
            if (input.checked) {
              data[input.name] = input.value;
            }
          } else {
            data[input.name] = input.value;
          }
        }
      }
			xhr.open("POST", form.action);
			xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
			xhr.onload = function() {
				if (xhr.status !== 200) {
					show_error(xhr.responseText);	
				} else {
          show_submitted("submitted");
          update_pending(xhr.responseText, show_pending);
				}
      };
			xhr.send(JSON.stringify(data));
	};

	var submit_review = function(e) {
    e.preventDefault();
    var submit_form = document.getElementById("review-submit");
		ajax_submit(submit_form);
  };

  var add_event_listeners = function() {
 		var ele =  document.getElementById("review-submit");
		if (ele.addEventListener) {
      ele.addEventListener("submit", submit_review, false); //Modern browsers
		} else if(ele.attachEvent){
      ele.attachEvent('onsubmit', submit_review); //Old IE
		}
  };

  var autocompletion = function() {
    var complete_company = new Awesomplete(document.getElementById("input-company"));
    complete_company.list = major_company_list;
    var complete_location = new Awesomplete(document.getElementById("input-location"));
    complete_location.list = all_cities;
  };
  // ----------------

  add_event_listeners();
  autocompletion();
  show_pending();

	var request = new XMLHttpRequest();
	request.open('GET', '/reviews/reviews.json', true);

	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			var data = JSON.parse(request.responseText);
      add_comments(data);
		} else {
			alert("error");
		}
	};

	request.onerror = function() {
		// There was a connection error of some sort
		alert("error");
	};

	request.send();
}());
