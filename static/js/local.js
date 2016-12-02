/*jslint devel: true*/
/*global XMLHttpRequest: false*/
/*global document: false*/
/*global Awesomplete: false*/
/*global localStorage: false*/
/*global XDomainRequest: false*/
/*global _: false*/

(function() {

  var add_class,
      add_emoji_style,
      add_event_listener,
      add_event_listeners,
      add_id_to_storage,
      add_reviews,
      add_tooltip,
      ajax_submit,
      autocompletion,
      clear_input_fields,
      contains_digits,
      create_comment,
      create_cors_request,
      disable_all_input,
      fade_in_add,
      fade_in_out,
      fade_out_delete,
			first_time_flash,
      get_array_from_storage,
      pad,
      post_update,
      remove_class,
      remove_id_from_storage,
      review_all,
      review_salaryinput,
      review_textinput,
      show_my_ids,
      show_pending_reviews,
      show_reviews,
      submit_review,
      time_convert,
      update_pending_divider,
			validate_all_input;

  var UPDATE_URL = "https://1alvmeby4e.execute-api.us-east-1.amazonaws.com/prod/update";
  var MY_ID_STORAGE = "my_ids"; // local storage for reviews created by the user.
  var RATED_ID_STORAGE = "rated_ids"; // local storage for reviews that have been rated already and shouldn't be seen.
  var FORM_IDS = ['input-review', 'input-company', 'currency', 'age', 'gender',
                  'input-position', 'input-location', 'input-button', 'input-salary'];
  // functions
  //
  
  var MIN_LENGTHS = {
    'input-company': 3,
    'input-location': 5,
    'input-position': 3,
    'input-review': 10,
    'input-salary': 3 
  };

  var MAX_LENGTHS = {
    'input-company':  30,
    'input-location': 50,
    'input-position': 40,
    'input-review': 140,
    'input-salary': 7 
  };

  var OVERALL_LENGTH = 140;

  pad = function(num, size) {
      var s = "0000" + num;
      return s.substr(s.length-size);
  };

  time_convert = function(t) {     
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

  add_event_listener = function(event, obj, fn) {
    if (obj.addEventListener) {
      obj.addEventListener(event, fn, false);
    } else {
      obj.attachEvent("on"+event, fn); // old ie
    }
  };

  add_class = function(el, class_name) {
    if (el.classList) {
      el.classList.add(class_name);
    } else {
      el.class_name += ' ' + class_name;
    }
  };

  remove_class = function(el, class_name) {
    if (el.classList) {
      el.classList.remove(class_name);
    } else {
      el.class_name = el.class_name.replace(new RegExp('(^|\\b)' + class_name.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
  };

  fade_in_add = function(el, to_add, callback) {
    el.appendChild(to_add);
    add_class(to_add, "fadeInDown");  
    if (typeof callback === 'function') { callback(); }
  };

  fade_out_delete = function(el, callback) {
    add_class(el, "fadeOut");  
    setTimeout(function() {
      el.parentNode.removeChild(el);
      remove_class(el, "fadeOut");
      if (typeof callback === 'function') { callback(); }
    }, 500);
  };

  create_cors_request = function(method, url) {
    var xhr = new XMLHttpRequest();
    if (xhr.withCredentials !== undefined) {

      // Check if the XMLHttpRequest object has a "withCredentials" property.
      // "withCredentials" only exists on XMLHTTPRequest2 objects.
      xhr.open(method, url, true);

    } else if (XDomainRequest !== "undefined") {

      // Otherwise, check if XDomainRequest.
      // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
      xhr = new XDomainRequest();
      xhr.open(method, url);

    } else {

      // Otherwise, CORS is not supported by the browser.
      xhr = null;

    }
    return xhr;
  };

	var major_positions = [
		"Software Engineer",
		"Senior Software Engineer",
		"Application analyst",
		"Computer Scientist",
		"Computer Analyst",
		"Database Administrator",
		"Data Analyst",
		"Data Scientist",
		"Network Analyst",
		"Network Administrator",
		"Programmer",
		"Security Engineer",
		"Software Design",
		"Software Architect",
		"Senior Software Architect",
		"Software Analyst",
		"Software Quality Analyst",
		"Software Quality Analyst",
		"System Administrator",
		"Web Developer",
		"Engineer",
		"System Reliability Engineer",
		"Senior System Reliability Engineer",
		"Front-end Developer"
	];


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
    "Hamburg, Germany",
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
    "Bydgoszcz, Poland",
		"Ljubljana, Slovenia",
    "Zürich, Switzerland",
    "Bern, Switzerland"
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

  clear_input_fields = function() {
    var f_el, span_el, rem_el;
    rem_el = document.getElementById("num-remaining");
		rem_el.innerHTML = '140';

    FORM_IDS.forEach(function(entry) {
      if (entry === "input-button") {
        return;
      }
      f_el = document.getElementById(entry); 
      f_el.value = "";
      span_el = document.getElementById(entry.replace('input', 'span'));
      if (span_el !== null) {
        remove_class(span_el, "valid");
        remove_class(span_el, "fa");
        remove_class(span_el, "fa-check-circle");
      }
    });
  };


  disable_all_input = function(value) {
    var el, e;
    FORM_IDS.forEach(function(entry) {
     el = document.getElementById(entry); 
     if (value) {
      add_class(el, "tint");
     } else {
      remove_class(el, "tint");
     }
     el.disabled = value;
    });
    e = document.getElementsByName("emoji");
    e.forEach(function(elem) { elem.disabled = value; });
  };

  first_time_flash = function() {
    localStorage.setItem("first_visit", "true");
		var el;
    el = document.getElementById("first-visit");
		add_event_listener("click", el, function() {
			add_class(el, "fadeOut");
      setTimeout(function() {
        el.style.display = 'none';
			}, 2000);
		});
		el.style.display = '';
	};

  fade_in_out = function(msg, id) {
    var el, to_add;
    el = document.getElementById("flash-wrapper");
    to_add = document.createElement('div');
    to_add.className = "flash animated " + id;
    to_add.innerHTML = '<span>' + msg + '</span>';
    fade_in_add(el, to_add, function() {
      setTimeout(function() {
        fade_out_delete(to_add);
      }, 2000);
    });
  };

  get_array_from_storage = function(storage_name) {
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

  remove_id_from_storage = function(id, storage_name, callback) {
    var local_ids, json_ids;
    local_ids = get_array_from_storage(storage_name);
    json_ids = JSON.stringify(_.without(local_ids,id));
    localStorage.setItem(storage_name, json_ids);
    localStorage.removeItem(id);
    if (typeof callback === 'function') {
      callback();
    }
  };

  add_id_to_storage = function(id, storage_name, callback) {
    var local_ids, json_ids;
    local_ids = get_array_from_storage(storage_name);
    
    json_ids = JSON.stringify(_.uniq(local_ids.concat([id])));
    localStorage.setItem(storage_name, json_ids);

    if (typeof callback === 'function') {
      callback();
    }
  };

  update_pending_divider = function() {
    var pdiv = document.getElementById('pending-submissions'),
        children = document.getElementById("pending-comments").childElementCount;
    if (children === 0) {
      pdiv.style.display = 'none';
    } else {   
      pdiv.style.display = '';
    }
  };

  show_my_ids = function() {
    var item, div, comment, ydiv,
        local_my_ids;
    local_my_ids = get_array_from_storage(MY_ID_STORAGE);
    ydiv = document.getElementById('your-submissions');
    if (local_my_ids.length === 0) {
      ydiv.style.display = 'none';
    } else {   
      ydiv.style.display = '';
    }

    div = document.getElementById('your-comments');
    div.innerHTML = "";
    local_my_ids.reverse().forEach( function(id) {
      item = JSON.parse(localStorage.getItem(id));
      item.myid = "true";
      comment = create_comment(item, 'your-comments');
      div.appendChild(comment);
      add_emoji_style(item);
    });
  };


  post_update = function(el, id, action) {
    var resp,
        xhr = create_cors_request("POST", UPDATE_URL),
        data = {}, elem, item;
    add_class(el, "no-hover");

    if (action === 'cancel') {
      remove_id_from_storage(id, MY_ID_STORAGE, null);
      fade_in_out("Submission no longer displayed and removed from browser storage.", "flash-info");  
      add_class(el.parentNode.parentNode, "animated");
      add_class(el.parentNode.parentNode, "fadeOut");
      setTimeout(show_my_ids, 1000);
      return;
    } 

    data = {
      "id": id,
      "action": action
    };

    // Not currently used but could be used to let the user delete users
    item = JSON.parse(localStorage.getItem(id));
    if (item === null) {
      data.key = "";
    } else {
      data.key = item.key;
    }

    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onload = function() {
      remove_class(el, "spinner");
      remove_class(el, "no-hover");
      if (xhr.status !== 200) {
        fade_in_out(xhr.responseText, "flash-error");
      } else {
        resp = JSON.parse(xhr.responseText);
        if (action === 'cancel') {
          remove_id_from_storage(resp.id, MY_ID_STORAGE, null);
          fade_in_out("Submission removed", "flash-info");  
          show_my_ids();
        } else {
          add_id_to_storage(resp.id, RATED_ID_STORAGE, null);
          fade_in_out("Feedback submitted, thanks!", "flash-info");  
          elem = document.getElementById(resp.id).parentNode;
          fade_out_delete(elem, update_pending_divider);
        }
      }
    };

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {   //if complete
        if(xhr.status !== 200) {  //check if "OK" (200)
          remove_class(el, "spinner");
          remove_class(el, "no-hover");
          fade_in_out("Error sending request.", "flash-error");  
        }
      }
    };

    xhr.send(JSON.stringify(data));
    add_class(el, "spinner");
  };

  add_tooltip = function(el, msg, type) {
    var t = document.createElement('div'); t.setAttribute("class", "tooltip " + type);
    var tc = document.createElement('div'); tc.setAttribute("class", "tooltip-content");
    tc.innerHTML = msg;  
    t.appendChild(tc);
    el.appendChild(t);
  };

  create_comment = function(item, type) {
    var detail, div_c, div_cc, h_comp_pos, p_review,
      div_detail, b;

    div_c = document.createElement('div');
    div_c.setAttribute("class", "comment animated bounceIn");

    div_cc = document.createElement('div');
    div_cc.setAttribute("class", "comment-content");
    div_cc.id = item.id;

    h_comp_pos = document.createElement('h1');
    h_comp_pos.innerHTML = item.company + ' : ' + item.position; 

    p_review = document.createElement('p');
    p_review.innerHTML = item.review;

    div_detail = document.createElement('div');
    div_detail.setAttribute("class", "comment-detail");
    detail = '<span class="date">' + time_convert(item.create_time) + '</span><div class="right">' +
      '<span class="location">' + item.location + '</span> ';
    if (item.age !== undefined && item.age !== 'rather-not-say') {
      detail += '<span class="age"> ' + item.age + '</span> ';
    }
    if (item.age !== undefined && item.gender !== 'rather-not-say') {
      detail += '<span class="gender">(' + item.gender + ')</span> ';
    }
    if (item.salary !== undefined && item.salary !== 'rather-not-say') {
      detail += '<span class="salary">' + parseInt(item.salary).toLocaleString() + ' ' + item.currency + ' </span>';
    }
    detail += '</div>';

    div_detail.innerHTML = detail;
    b = document.createElement('div');
    b.setAttribute("class", "emoji-comment-selector");
    // 2620 skull
    // 1f4a9 poo
    // 1f49f heart
    // 2611 check
    // 2705 check2
    // 274c cancel
    if (type === "your-comments") {
      var b1 = document.createElement('div'); b1.setAttribute("class", "rating cancel rating-small");
      add_tooltip(b1, "Remove", "small");
      b.appendChild(b1);
      add_event_listener("click", b1, function() { post_update(b1, item.id, 'cancel');   });
      add_class(div_cc, "blue-border");

    } else if (type === "pending-comments") {
      var b2 = document.createElement('div'); b2.setAttribute("class", "rating approve rating-big");
      add_tooltip(b2, "Approve!", "large");
      var b3 = document.createElement('div'); b3.setAttribute("class", "rating reject rating-big");
      add_tooltip(b3, "Reject!", "large");
      b.appendChild(b2); b.appendChild(b3);
      add_event_listener("click", b2, function() { post_update(b2, item.id, 'approve'); });
      add_event_listener("click", b3, function() { post_update(b3, item.id, 'reject'); });
      add_class(div_cc, "yellow-border");
    } else { // type === comments
      var b4 = document.createElement('div'); b4.setAttribute("class", "rating love rating-big");
      add_tooltip(b4, "Love it!", "large");
      var b5 = document.createElement('div'); b5.setAttribute("class", "rating poo rating-big");
      add_tooltip(b5, "Poo poo!", "large");
      b.appendChild(b4); b.appendChild(b5);
      add_event_listener("click", b4, function() { post_update(b4, item.id, 'love'); });
      add_event_listener("click", b5, function() { post_update(b5, item.id, 'poo'); });
    }

    div_cc.appendChild(b);

    div_cc.appendChild(h_comp_pos);
    div_cc.appendChild(p_review);
    div_cc.appendChild(div_detail);
    div_c.appendChild(div_cc);

    return div_c;
  };

  add_emoji_style = function(item) {
    var el = document.getElementById(item.id);
    add_class(el, item.emoji + "comment");
//    console.log(el);
//    var css = '#' + item.id + ':before' + '{ background-image: url("/img/' + item.emoji.replace(/^e/, '') + '.png"); }',
//        head = document.head || document.getElementsByTagName('head')[0],
//        style = document.createElement('style');
//
//    style.type = 'text/css';
//    if (style.styleSheet){
//      style.styleSheet.cssText = css;
//    } else {
//      style.appendChild(document.createTextNode(css));
//    }
//    head.appendChild(style);
  };

  add_reviews = function(data, wrapper_id, sample, callback) {
    var comment, filtered_data,
        div = document.getElementById(wrapper_id);

    filtered_data = _.reject(data, function(item) {
      return _.contains(get_array_from_storage(MY_ID_STORAGE), item.id) ||
        _.contains(get_array_from_storage(RATED_ID_STORAGE), item.id);
    });
    if (sample !== undefined) {
      filtered_data = _.sample(filtered_data, sample);
    }
    filtered_data.forEach( function(item) {
      comment = create_comment(item, wrapper_id);
      div.appendChild(comment);
      add_emoji_style(item);
    });
    if (typeof callback === 'function') { callback(); }
  };

	validate_all_input = function() {
		var review_el, company_el, position_el,
				location_el, validate_msg, sub_el,
        salary_el, age, gender;

    review_el = document.getElementById("input-review"); 
    company_el = document.getElementById("input-company"); 
    position_el = document.getElementById("input-position"); 
    location_el = document.getElementById("input-location"); 
    sub_el = document.getElementById("review-submit");
    salary_el = document.getElementById("input-salary");
    age = document.getElementById("age").value;
    gender = document.getElementById("gender").value;
    validate_msg = [review_textinput(review_el),
										review_textinput(company_el),
										review_textinput(position_el),
										review_textinput(location_el),
                    review_all(sub_el),
                    review_salaryinput(salary_el),
                    age === "" ? "Please select from the age dropdown" : null, 
                    gender === "" ? "Please select from the gender dropdown" : null];
		return(_.compact(validate_msg));
	};

  ajax_submit = function(form) {
    var i, input, resp,
        ii = form.length,
        xhr = create_cors_request("POST", form.action),
        data = {}, validate_arr;

		validate_arr = validate_all_input();
		if (validate_arr.length > 0) {
      fade_in_out(validate_arr.join('<br />'), "flash-info");
      return;
		}

    disable_all_input(true);
    for (i = 0; i < ii; ++i) {
      input = form[i];
      if (input.name) {
        if (input.type === 'radio') {
          if (input.checked) {
            data[input.name] = input.value;
          }
        } else if (input.name == 'salary') {
					data[input.name] = input.value.replace(/\D/g,'');
				} else {
          data[input.name] = input.value;
        }
      }
    }
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onload = function() {
      disable_all_input(false);
      if (xhr.status !== 200) {
        fade_in_out(xhr.responseText, "flash-error");  
      } else {
        fade_in_out("Submitted! Your submission will be pending until it is approved by another person viewing the site.", "flash-info");
        resp = JSON.parse(xhr.responseText);
        localStorage.setItem(resp.id, JSON.stringify(resp));
        add_id_to_storage(resp.id, MY_ID_STORAGE, show_my_ids);
        clear_input_fields();
      }
    };
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {   //if complete
        if (xhr.status !== 200) {  //check if "OK" (200)
          fade_in_out("Error sending review request.", "flash-error");  
          disable_all_input(false);
        }
      }
    };

    xhr.send(JSON.stringify(data));
  };

  submit_review = function(e) {
    var submit_form;
    e.preventDefault();
    submit_form = document.getElementById("review-submit");
    ajax_submit(submit_form);
  };


  review_all = function() {
    var total = 0, rem_wrap, remaining,
        rem_el, msg = null;
    rem_wrap = document.getElementById("num-remaining-wrap");
    total = total + document.getElementById("input-review").value.length;
    remaining = OVERALL_LENGTH - total;
    rem_el = document.getElementById("num-remaining");
    if (remaining > 0) {
      rem_el.innerHTML = remaining;
      remove_class(rem_wrap, "red-border");
    } else {
      rem_el.innerHTML = "0";
      add_class(rem_wrap, "red-border");
      msg = "Submission is too long";
    }
    return msg;
  };
  

  contains_digits = function(value) {
    if (value.length > 0) {
      if( ! /^[0-9]+$/.test(value) ) {
        return false;
      }
    }
    return true;
  };

  review_salaryinput = function(el) {
    var span_el, msg = null, clean_value,
				disp_name = el.id.replace("input-", "").charAt(0).toUpperCase() + el.id.replace("input-", "").slice(1);
		
		if (! el.value) {
			return;
		}
		clean_value = el.value.replace(/\D/g,'');
		el.value = parseInt(clean_value).toLocaleString()
    span_el = document.getElementById(el.id.replace('input', 'span'));

    if (clean_value.length > MAX_LENGTHS[el.id]) {
      add_class(el, "overflow");
      remove_class(span_el, "valid");
      remove_class(span_el, "fa");
      remove_class(span_el, "fa-check-circle");
			msg = disp_name + " is too long.";
    } else {
      remove_class(el, "overflow");
    }

    if (clean_value.length < MIN_LENGTHS[el.id]) {
			msg = disp_name + " is too short.";
		}
    if (clean_value.length <= MAX_LENGTHS[el.id] && clean_value.length >= MIN_LENGTHS[el.id]) {
      add_class(span_el, "valid");
      add_class(span_el, "fa");
      add_class(span_el, "fa-check-circle");
    } else {
      remove_class(span_el, "valid");
      remove_class(span_el, "fa");
      remove_class(span_el, "fa-check-circle");
    }
    return msg;
  };


  review_textinput = function(el) {
    var span_el, msg = null,
				disp_name = el.id.replace("input-", "").charAt(0).toUpperCase() + el.id.replace("input-", "").slice(1);
    span_el = document.getElementById(el.id.replace('input', 'span'));

    if (el.value.length > MAX_LENGTHS[el.id]) {
      add_class(el, "overflow");
      remove_class(span_el, "valid");
      remove_class(span_el, "fa");
      remove_class(span_el, "fa-check-circle");
			msg = disp_name + " is too long.";
    } else {
      remove_class(el, "overflow");
    }

    if (el.value.length < MIN_LENGTHS[el.id]) {
			msg = disp_name + " is too short.";
		}
    if (el.value.length <= MAX_LENGTHS[el.id] && el.value.length >= MIN_LENGTHS[el.id]) {
      add_class(span_el, "valid");
      add_class(span_el, "fa");
      add_class(span_el, "fa-check-circle");
    } else {
      remove_class(span_el, "valid");
      remove_class(span_el, "fa");
      remove_class(span_el, "fa-check-circle");
    }
    return msg;
  };

  add_event_listeners = function() {
     var sub_el, review_el, currency_el,
        company_el, position_el, location_el, clear_el, salary_el, d;
    review_el = document.getElementById("input-review"); 
    company_el = document.getElementById("input-company"); 
    position_el = document.getElementById("input-position"); 
    location_el = document.getElementById("input-location"); 
    salary_el = document.getElementById("input-salary"); 
    sub_el = document.getElementById("review-submit");
    clear_el = document.getElementById("clear-local-storage");
    currency_el = document.getElementById("currency");
    add_event_listener("submit", sub_el, submit_review);
    add_event_listener("input", review_el, function() { review_textinput(review_el); });
    add_event_listener("input", company_el, function() { review_textinput(company_el); });
    add_event_listener("input", position_el, function() { review_textinput(position_el); });
    add_event_listener("input", location_el, function() { review_textinput(location_el); });
    add_event_listener("input", salary_el, function() { review_salaryinput(salary_el); });
    add_event_listener("input", sub_el, function() { review_all(sub_el); });
    add_event_listener("awesomplete-selectcomplete", location_el, function() { review_textinput(location_el); });
    add_event_listener("awesomplete-selectcomplete", company_el, function() { review_textinput(company_el); });
    add_event_listener("awesomplete-selectcomplete", position_el, function() { review_textinput(position_el); });
    add_event_listener("click", clear_el, function(e) { e.preventDefault(); localStorage.clear(); fade_in_out("All local state removed, refresh page to see update", "flash-info"); });
    add_event_listener("change", currency_el, function(e) {
      e.preventDefault();
      d = document.getElementById("input-symbol");
      switch(currency_el.value) {
        case "USD":
          d.className = "input-symbol-dollar";      
          break;
        case "EUR":
          d.className = "input-symbol-euro";      
          break;
        case "GBP":
          d.className = "input-symbol-gbp";      
          break;
      }
    }); 
    // document.addEventListener("touchstart", function(){undefined;}, true);

  };

  autocompletion = function() {
    var complete_company = new Awesomplete(document.getElementById("input-company"));
    complete_company.list = major_company_list;
    var complete_location = new Awesomplete(document.getElementById("input-location"));
    complete_location.list = all_cities;
    var complete_positions = new Awesomplete(document.getElementById("input-position"));
		complete_positions.list = major_positions;
  };


  show_pending_reviews = function() {
    var data,
    request = create_cors_request("GET", "/pending-reviews/pending-reviews.json");
    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        data = JSON.parse(request.responseText);
				add_reviews(data, 'pending-comments', 2, update_pending_divider);
      } else {
        fade_in_out("Unable to get pending reviews", "flash-error");
      }
    };
    request.onreadystatechange = function() {
      if (request.readyState === 4){   //if complete
          if(request.status !== 200) {  //check if "OK" (200)
            fade_in_out("Error fetching pending reviews", "flash-error");  
          }
      }
    };
    request.onerror = function() {
      // There was a connection error of some sort
      fade_in_out("Error sending review request.", "flash-error");  
    };

    request.send();
  };

  show_reviews = function() {
    var request = create_cors_request("GET", "/reviews/reviews.json");
    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        var data = JSON.parse(request.responseText);
        add_reviews(data, 'comments');
      } else {
        fade_in_out("Unable to get reviews", "flash-error");
      }
    };
    request.onreadystatechange = function() {
      if (request.readyState === 4) {   //if complete
          if(request.status !== 200) {  //check if "OK" (200)
            fade_in_out("Error fetching reviews", "flash-error");  
          }
      }
    };
    request.onerror = function() {
      // There was a connection error of some sort
      fade_in_out("Error sending review request.", "flash-error");  
    };

    request.send();
  };
  // ----------------
  NodeList.prototype.forEach = Array.prototype.forEach;
  add_event_listeners();
  autocompletion();
  show_my_ids();
  show_reviews();
  show_pending_reviews();
	if (localStorage.getItem("first_visit") === null) { first_time_flash(); }
}());
