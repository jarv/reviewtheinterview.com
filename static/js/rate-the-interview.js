/*jslint devel: true*/
/*global XMLHttpRequest: false*/
/*global document: false*/
/*global Awesomplete: false*/
/*global localStorage: false*/
(function() {

  var UPDATE_URL = "https://9w8m8oaxla.execute-api.us-east-1.amazonaws.com/prod/update";
  var MY_ID_STORAGE = "my_ids"; // local storage for reviews created by the user.
  var RATED_ID_STORAGE = "rated_ids"; // local storage for reviews that have been rated already and shouldn't be seen.

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
		var a = new Date(t * 10),
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

  var add_event_listener = function(event, obj, fn) {
    if (obj.addEventListener) {
      obj.addEventListener(event, fn, false);
    } else {
      obj.attachEvent("on"+event, fn); // old ie
    }
  };

	var remove_from_array = function(arr) {
			var what, a = arguments, L = a.length, ax;
			while (L > 1 && arr.length) {
					what = a[--L];
					ax = arr.indexOf(what);
					while (ax !== -1) {
					  arr.splice(ax, 1);
					  ax = arr.indexOf(what);
					}
			}
			return arr;
	};

	var remove_elem_by_id = function(id) {
			var elem = document.getElementById(id);
			return elem.parentNode.removeChild(elem);
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

  var get_array_from_storage = function(storage_name) {
    var ids;
    try {
      ids = JSON.parse(localStorage.getItem(storage_name));
    } catch(e) {
      ids = [];
    }
    if (ids === null) {
     ids = [];
    }
    return ids;
  };

  var remove_id_from_storage = function(id, storage_name, callback) {
    var local_ids, json_ids;
    local_ids = get_array_from_storage(storage_name);
    json_ids = JSON.stringify(remove_from_array(local_ids, id));
		localStorage.setItem(storage_name, json_ids);

    if (typeof callback === 'function') {
      callback();
    }
  };

  var add_id_to_storage = function(id, storage_name, callback) {
    var local_ids, json_ids;
    local_ids = get_array_from_storage(storage_name);
    
    json_ids = JSON.stringify(array_unique(local_ids.concat([id])));
		localStorage.setItem(storage_name, json_ids);

    if (typeof callback === 'function') {
      callback();
    }
  };

  var post_update = function(el, id, action) {
    var resp,
        xhr = new XMLHttpRequest(),
        data = {};

    data = {
      "id": id,
      "action": action === 'cancel' ? 'reject' : action
    };

    xhr = new XMLHttpRequest();
    xhr.open("POST", UPDATE_URL);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onload = function() {
      if (xhr.status !== 200) {
        show_error(xhr.responseText);	
        el.className = "";
        el.className = "rating " + action;
      } else {
        resp = JSON.parse(xhr.responseText);
        if (action === 'cancel') {
          remove_id_from_storage(resp.id, MY_ID_STORAGE, null);
          show_my_ids();
        } else {
          add_id_to_storage(resp.id, RATED_ID_STORAGE, null);
				  remove_elem_by_id(resp.id);
        }
        el.className = "";
        el.className = "rating " + action;
      }
    };
    xhr.send(JSON.stringify(data));
    el.className = "";
    el.className = "rating spinner";
  };


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
    // 274c cancel
    if (item.myid === "true") {
      var b1 = document.createElement('div'); b1.setAttribute("class", "rating cancel");
      b.appendChild(b1);
      add_event_listener("click", b1, function() { post_update(b1, item.id, 'cancel');   });
    } else if (item.pending === "true") {
      var b2 = document.createElement('div'); b2.setAttribute("class", "rating approve");
      var b3 = document.createElement('div'); b3.setAttribute("class", "rating reject");
      b.appendChild(b2); b.appendChild(b3);
      add_event_listener("click", b2, function() { post_update(b2, item.id, 'approve'); });
      add_event_listener("click", b3, function() { post_update(b3, item.id, 'reject'); });
    } else {
      var b4 = document.createElement('div'); b4.setAttribute("class", "rating love");
      var b5 = document.createElement('div'); b5.setAttribute("class", "rating poo");
      b.appendChild(b4); b.appendChild(b5);
      add_event_listener("click", b4, function() { post_update(b4, item.id, 'love'); });
      add_event_listener("click", b5, function() { post_update(b5, item.id, 'poo'); });
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


  var show_my_ids = function() {
    var item, div, comment,
        local_my_ids;
    console.log("show my ids");
    local_my_ids = get_array_from_storage(MY_ID_STORAGE);
    div = document.getElementById('pending-comments');
    div.innerHTML = "";
    local_my_ids.reverse().forEach( function(id) {
      item = JSON.parse(localStorage.getItem(id));
      item.myid = "true";
      comment = create_comment(item);
      div.appendChild(comment);
      add_emoji_style(item);
    });
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
			var i, input, resp,
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
		      resp = JSON.parse(xhr.responseText);
		      localStorage.setItem(resp.id, JSON.stringify(resp));
          add_id_to_storage(resp.id, MY_ID_STORAGE, show_my_ids);
				}
      };
			xhr.send(JSON.stringify(data));
	};

	var submit_review = function(e) {
    var submit_form;
    e.preventDefault();
    submit_form = document.getElementById("review-submit");
		ajax_submit(submit_form);
  };

  var add_event_listeners = function() {
 		var ele =  document.getElementById("review-submit");
    add_event_listener("submit", ele, submit_review);
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
  show_my_ids();

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
