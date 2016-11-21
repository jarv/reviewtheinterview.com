/*jslint devel: true*/
/*global XMLHttpRequest: false*/
/*global document: false*/
/*global Awesomplete: false*/
/*global localStorage: false*/
/*global XDomainRequest: false*/
/*global _: false*/

(function() {
  // functions
  //
  //
  var add_class,
      add_emoji_style,
      add_event_listener,
      add_event_listeners,
      add_id_to_storage,
      add_reviews,
      ajax_submit,
      autocompletion,
      check_pending,
      clear_input_fields,
      create_comment,
      create_cors_request,
      disable_all_input,
      fade_in_add,
      fade_in_out,
      fade_out_delete,
      get_array_from_storage,
      pad,
      post_update,
      remove_class,
      remove_id_from_storage,
      review_all,
      review_textinput,
      show_my_ids,
      show_pending_reviews,
      show_reviews,
      submit_review,
      time_convert,
      update_pending_divider;

  var UPDATE_URL = "https://3x1gqtafv9.execute-api.us-east-1.amazonaws.com/prod/update";
  var MY_ID_STORAGE = "my_ids"; // local storage for reviews created by the user.
  var RATED_ID_STORAGE = "rated_ids"; // local storage for reviews that have been rated already and shouldn't be seen.
  var FORM_IDS = ['input-review', 'input-company',
                  'input-position', 'input-location', 'input-button'];
  // functions
  //
  
  var MIN_LENGTHS = {
    'input-company': 3,
    'input-location': 5,
    'input-position': 3,
    'input-review': 10
  };

  var MAX_LENGTHS = {
    'input-company':  30,
    'input-location': 50,
    'input-position': 50,
    'input-review': 140
  };

  var OVERALL_LENGTH = 140;

  pad = function(num, size) {
      var s = "0000" + num;
      return s.substr(s.length-size);
  }

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
  }

  add_event_listener = function(event, obj, fn) {
    if (obj.addEventListener) {
      obj.addEventListener(event, fn, false);
    } else {
      obj.attachEvent("on"+event, fn); // old ie
    }
  }

  add_class = function(el, class_name) {
    if (el.classList) {
      el.classList.add(class_name);
    } else {
      el.class_name += ' ' + class_name;
    }
  }

  remove_class = function(el, class_name) {
    if (el.classList) {
      el.classList.remove(class_name);
    } else {
      el.class_name = el.class_name.replace(new RegExp('(^|\\b)' + class_name.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
  }

  fade_in_add = function(el, to_add, callback) {
    console.log("fade in add ");
    el.appendChild(to_add);
    add_class(to_add, "fadeInDown");  
    if (typeof callback === 'function') { callback(); }
  }

  fade_out_delete = function(el, callback) {
    console.log("fade out del");
    add_class(el, "fadeOut");  
    setTimeout(function() {
      el.parentNode.removeChild(el);
      remove_class(el, "fadeOut");
      if (typeof callback === 'function') { callback(); }
    }, 1500);
  }

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
  }

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

  clear_input_fields = function() {
    var f_el, span_el;
    FORM_IDS.forEach(function(entry) {
      if (entry === "input-button") {
        return;
      }
      f_el = document.getElementById(entry); 
      f_el.value = "";
      span_el = document.getElementById(entry.replace('input', 'span'));
      if (span_el !== null) {
        remove_class(span_el, "valid");
      }
    });
  }


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
  }

  fade_in_out = function(msg, id) {
    console.log("fade in out");
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
  }

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
  }

  remove_id_from_storage = function(id, storage_name, callback) {
    var local_ids, json_ids;
    local_ids = get_array_from_storage(storage_name);
    json_ids = JSON.stringify(_.without(local_ids,id));
    localStorage.setItem(storage_name, json_ids);
    if (typeof callback === 'function') {
      callback();
    }
  }

  add_id_to_storage = function(id, storage_name, callback) {
    var local_ids, json_ids;
    local_ids = get_array_from_storage(storage_name);
    
    json_ids = JSON.stringify(_.uniq(local_ids.concat([id])));
    localStorage.setItem(storage_name, json_ids);

    if (typeof callback === 'function') {
      callback();
    }
  }

  update_pending_divider = function() {
    var pdiv = document.getElementById('pending-submissions'),
        children = document.getElementById("pending-comments").childElementCount;
    if (children === 0) {
      pdiv.style.display = 'none';
    } else {   
      pdiv.style.display = '';
    }
  }

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

    div = document.getElementById('your-submissions');
    div.innerHTML = "";
    local_my_ids.reverse().forEach( function(id) {
      item = JSON.parse(localStorage.getItem(id));
      item.myid = "true";
      comment = create_comment(item);
      div.appendChild(comment);
      add_emoji_style(item);
    });
  }


  post_update = function(el, id, action) {
    var resp,
        xhr = create_cors_request("POST", UPDATE_URL),
        data = {}, elem, item;

    data = {
      "id": id,
      "action": action
    };

    item = JSON.parse(localStorage.getItem(id));
    if (item === null) {
      data.key = "";
    } else {
      data.key = item.key;
    }

    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onload = function() {
      remove_class(el, "spinner");
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
          fade_in_out("Error sending request.", "flash-error");  
        }
      }
    };

    xhr.send(JSON.stringify(data));
    add_class(el, "spinner");
  }


  create_comment = function(item) {
    var div_c = document.createElement('div');
    div_c.setAttribute("class", "comment animated bounceIn");

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
  }

  add_emoji_style = function(item) {
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
  }




/*
  check_pending = function(callback) {
    if (typeof callback === 'function') {
      callback();
    }
  };
*/


  add_reviews = function(data, wrapper_id) {
    var comment,
        div = document.getElementById(wrapper_id);
    data.forEach( function(item) {
      if (_.contains(get_array_from_storage(RATED_ID_STORAGE), item.id)) {
        return;
      }
      comment = create_comment(item);
      div.appendChild(comment);
      add_emoji_style(item);
    });
  }

  ajax_submit = function(form) {
    disable_all_input(true);
    var i, input, resp,
        ii = form.length,
        xhr = create_cors_request("POST", form.action),
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
  }

  submit_review = function(e) {
    var submit_form;
    e.preventDefault();
    submit_form = document.getElementById("review-submit");
    ajax_submit(submit_form);
  }


  review_all = function() {
    var total = 0, rem_wrap, f_el, remaining,
        rem_el;
    rem_wrap = document.getElementById("num-remaining-wrap");
    FORM_IDS.forEach(function(id) {
      f_el = document.getElementById(id);
      total = total + f_el.value.length;
    });
    remaining = OVERALL_LENGTH - total;
    rem_el = document.getElementById("num-remaining");
    if (remaining > 0) {
      rem_el.innerHTML = remaining;
      remove_class(rem_wrap, "red-border");
    } else {
      rem_el.innerHTML = "0";
      add_class(rem_wrap, "red-border");
    }
  }

  review_textinput = function(el) {
    var span_el;
    span_el = document.getElementById(el.id.replace('input', 'span'));

    if (el.value.length > MAX_LENGTHS[el.id]) {
      add_class(el, "overflow");
      remove_class(span_el, "valid");
    } else {
      remove_class(el, "overflow");
    }

    if (el.value.length <= MAX_LENGTHS[el.id] && el.value.length >= MIN_LENGTHS[el.id]) {
      add_class(span_el, "valid");
    } else {
      remove_class(span_el, "valid");
    }
  }

  add_event_listeners = function() {
     var sub_el, review_el,
        company_el, position_el, location_el;
    review_el = document.getElementById("input-review"); 
    company_el = document.getElementById("input-company"); 
    position_el = document.getElementById("input-position"); 
    location_el = document.getElementById("input-location"); 
    sub_el = document.getElementById("review-submit");
    add_event_listener("submit", sub_el, submit_review);
    add_event_listener("input", review_el, function() { review_textinput(review_el); });
    add_event_listener("input", company_el, function() { review_textinput(company_el); });
    add_event_listener("input", position_el, function() { review_textinput(position_el); });
    add_event_listener("input", location_el, function() { review_textinput(location_el); });
    add_event_listener("input", sub_el, function() { review_all(sub_el); });
    // document.addEventListener("touchstart", function(){undefined;}, true);

  }

  autocompletion = function() {
    var complete_company = new Awesomplete(document.getElementById("input-company"));
    complete_company.list = major_company_list;
    var complete_location = new Awesomplete(document.getElementById("input-location"));
    complete_location.list = all_cities;
  }


  show_pending_reviews = function() {
    var pdiv, request, data;
    request = create_cors_request("GET", "/pending-reviews/pending-reviews.json");
    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        data = JSON.parse(request.responseText);
        pdiv = document.getElementById('pending-submissions');
        if (data.length === 0) {
          pdiv.style.display = 'none';
        } else {   
          pdiv.style.display = '';
          add_reviews(_.sample(data, 2), 'pending-comments');
        }
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
  }

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
  }
  // ----------------

  add_event_listeners();
  autocompletion();
  show_my_ids();
  show_reviews();
  show_pending_reviews();


}());
