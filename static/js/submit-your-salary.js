!function(){var e,n,t,a,i,o,r,l,s,c,d,u,m,p,g,f,v,y,h,S,E,w,b,I,B,C,A,T,k,N,M,L="https://3x1gqtafv9.execute-api.us-east-1.amazonaws.com/prod/update",D="my_ids",G="rated_ids",O=["input-review","input-company","input-position","input-location","input-button"],P={"input-company":3,"input-location":5,"input-position":3,"input-review":10},H={"input-company":30,"input-location":50,"input-position":40,"input-review":140},x=140;h=function(e,n){var t="0000"+e;return t.substr(t.length-n)},k=function(e){var n=new Date(10*e),t=new Date,a=new Date(Date.now()-864e5),i=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],o=n.getFullYear(),r=i[n.getMonth()],l=n.getDate(),s=n.getHours(),c=n.getMinutes();return n.setHours(0,0,0,0)===t.setHours(0,0,0,0)?"Today, "+h(s,2)+":"+h(c,2):n.setHours(0,0,0,0)===a.setHours(0,0,0,0)?"Yesterday, "+h(s,2)+":"+h(c,2):o===t.getFullYear()?l+" "+r+", "+h(s,2)+":"+h(c,2):l+" "+r+" "+o+", "+h(s,2)+":"+h(c,2)},t=function(e,n,t){n.addEventListener?n.addEventListener(e,t,!1):n.attachEvent("on"+e,t)},e=function(e,n){e.classList?e.classList.add(n):e.class_name+=" "+n},E=function(e,n){e.classList?e.classList.remove(n):e.class_name=e.class_name.replace(new RegExp("(^|\\b)"+n.split(" ").join("|")+"(\\b|$)","gi")," ")},p=function(n,t,a){n.appendChild(t),e(t,"fadeInDown"),"function"==typeof a&&a()},f=function(n,t){e(n,"fadeOut"),setTimeout(function(){n.parentNode.removeChild(n),E(n,"fadeOut"),"function"==typeof t&&t()},500)},u=function(e,n){var t=new XMLHttpRequest;return void 0!==t.withCredentials?t.open(e,n,!0):"undefined"!==XDomainRequest?(t=new XDomainRequest,t.open(e,n)):t=null,t};var F=["Software Engineer","Senior Software Engineer","Application analyst","Computer Scientist","Computer Analyst","Database Administrator","Data Analyst","Data Scientist","Network Analyst","Network Administrator","Programmer","Security Engineer","Software Design","Software Architect","Senior Software Architect","Software Analyst","Software Quality Analyst","Software Quality Analyst","System Administrator","Web Developer","Engineer","System Reliability Engineer","Senior System Reliability Engineer","Front-end Developer"],J=["Apple Inc.","Google","Samsung Electronics","Amazon.com","HP Inc.","Microsoft","IBM","Dell Technologies","Sony","Panasonic","Intel","LG Electronics","Facebook","General Electric","Twitter","LinkedIn","eBay","Netflix","Yahoo"],R=["London, United Kingdom","Berlin, Germany","Madrid, Spain","Rome, Italy","Paris, France","Bucharest, Romania","Vienna, Austria","Hamburg, Germany","Budapest, Hungary","Warsaw, Poland","Barcelona, Spain","Munich, Germany","Milan, Italy","Prague, Czech Republic","Sofia, Bulgaria","Brussels[Notes","Birmingham, United Kingdom","Cologne, Germany","Naples, Italy","Stockholm, Sweden","Turin, Italy","Marseille, France","Amsterdam, Netherlands","Zagreb, Croatia","Valencia, Spain","Leeds, United Kingdom","Kraków, Poland","Frankfurt, Germany","Łódź, Poland","Seville, Spain","Palermo, Italy","Zaragoza, Spain","Athens, Greece","Riga, Latvia","Wrocław, Poland","Helsinki, Finland","Rotterdam, Netherlands","Stuttgart, Germany","Düsseldorf, Germany","Glasgow, United Kingdom","Genoa, Italy","Dortmund, Germany","Copenhagen, Denmark","Essen, Germany","Sheffield, United Kingdom","Málaga, Spain","Leipzig, Germany","Bremen, Germany","Dublin, Ireland","Lisbon, Portugal","Dresden, Germany","Vilnius, Lithuania","Poznań, Poland","Gothenburg, Sweden","Bradford, United Kingdom","Manchester, United Kingdom","Hanover, Germany","The Hague, Netherlands","Antwerp, Belgium","Nuremberg, Germany","Edinburgh, United Kingdom","Lyon, France","Duisburg, Germany","Liverpool, United Kingdom","Gdańsk, Poland","Bristol, United Kingdom","Toulouse, France","Tallinn, Estonia","Murcia, Spain","Bratislava, Slovakia Slovak Republic","Szczecin, Poland","Palma de Mallorca, Spain","Bologna, Italy","Florence, Italy","Las Palmas, Spain","Brno, Czech Republic","Bochum, Germany","Cardiff, United Kingdom","Bydgoszcz, Poland","Ljubljana, Slovenia","Zürich, Switzerland","Bern, Switzerland"],z=["New York City, New York","Los Angeles, California","Chicago, Illinois","Houston, Texas","Philadelphia, Pennsylvania","Phoenix, Arizona","San Antonio, Texas","San Diego, California","Dallas, Texas","San Jose, California","Austin, Texas","Jacksonville, Florida","Indianapolis, Indiana","San Francisco, California","Columbus, Ohio","Fort Worth, Texas","Charlotte, North Carolina","Detroit, Michigan","El Paso, Texas","Memphis, Tennessee","Boston, Massachusetts","Seattle, Washington","Denver, Colorado","Washington, DC","Nashville-Davidson, Tennessee","Baltimore, Maryland","Louisville/Jefferson, Kentucky","Portland, Oregon","Oklahoma , Oklahoma","Milwaukee, Wisconsin","Las Vegas, Nevada","Albuquerque, New Mexico","Tucson, Arizona","Fresno, California","Sacramento, California","Long Beach, California","Kansas , Missouri","Mesa, Arizona","Virginia Beach, Virginia","Atlanta, Georgia","Colorado Springs, Colorado","Raleigh, North Carolina","Omaha, Nebraska","Miami, Florida","Oakland, California","Tulsa, Oklahoma","Minneapolis, Minnesota","Cleveland, Ohio","Wichita, Kansas","Arlington, Texas"],U=z.concat(R);c=function(){var e,n,t;t=document.getElementById("num-remaining"),t.innerHTML="140",O.forEach(function(t){"input-button"!==t&&(e=document.getElementById(t),e.value="",n=document.getElementById(t.replace("input","span")),null!==n&&(E(n,"valid"),E(n,"fa"),E(n,"fa-check-circle")))})},m=function(n){var t,a;O.forEach(function(a){t=document.getElementById(a),n?e(t,"tint"):E(t,"tint"),t.disabled=n}),a=document.getElementsByName("emoji"),a.forEach(function(e){e.disabled=n})},v=function(){localStorage.setItem("first_visit","true");var n;n=document.getElementById("first-visit"),t("click",n,function(t){e(n,"fadeOut"),setTimeout(function(){n.style.display="none"},2e3)}),n.style.display=""},g=function(e,n){var t,a;t=document.getElementById("flash-wrapper"),a=document.createElement("div"),a.className="flash animated "+n,a.innerHTML="<span>"+e+"</span>",p(t,a,function(){setTimeout(function(){f(a)},2e3)})},y=function(e){var n;try{n=JSON.parse(localStorage.getItem(e))}catch(e){n=[]}return null===n&&(n=[]),n},w=function(e,n,t){var a,i;a=y(n),i=JSON.stringify(_.without(a,e)),localStorage.setItem(n,i),localStorage.removeItem(e),"function"==typeof t&&t()},i=function(e,n,t){var a,i;a=y(n),i=JSON.stringify(_.uniq(a.concat([e]))),localStorage.setItem(n,i),"function"==typeof t&&t()},N=function(){var e=document.getElementById("pending-submissions"),n=document.getElementById("pending-comments").childElementCount;0===n?e.style.display="none":e.style.display=""},B=function(){var e,t,a,i,o;o=y(D),i=document.getElementById("your-submissions"),0===o.length?i.style.display="none":i.style.display="",t=document.getElementById("your-comments"),t.innerHTML="",o.reverse().forEach(function(i){e=JSON.parse(localStorage.getItem(i)),e.myid="true",a=d(e,"your-comments"),t.appendChild(a),n(e)})},S=function(n,t,a){var o,r,l,s=u("POST",L),c={};return e(n,"no-hover"),"cancel"===a?(w(t,D,null),g("Submission no longer displayed and removed from browser storage.","flash-info"),e(n.parentNode.parentNode,"animated"),e(n.parentNode.parentNode,"fadeOut"),void setTimeout(B,1e3)):(c={id:t,action:a},l=JSON.parse(localStorage.getItem(t)),null===l?c.key="":c.key=l.key,s.setRequestHeader("Content-type","application/json; charset=UTF-8"),s.onload=function(){E(n,"spinner"),E(n,"no-hover"),200!==s.status?g(s.responseText,"flash-error"):(o=JSON.parse(s.responseText),"cancel"===a?(w(o.id,D,null),g("Submission removed","flash-info"),B()):(i(o.id,G,null),g("Feedback submitted, thanks!","flash-info"),r=document.getElementById(o.id).parentNode,f(r,N)))},s.onreadystatechange=function(){4===s.readyState&&200!==s.status&&(E(n,"spinner"),E(n,"no-hover"),g("Error sending request.","flash-error"))},s.send(JSON.stringify(c)),void e(n,"spinner"))},r=function(e,n,t){var a=document.createElement("div");a.setAttribute("class","tooltip "+t);var i=document.createElement("div");i.setAttribute("class","tooltip-content"),i.innerHTML=n,a.appendChild(i),e.appendChild(a)},d=function(n,a){var i=document.createElement("div");i.setAttribute("class","comment animated bounceIn");var o=document.createElement("div");o.setAttribute("class","comment-content"),o.id=n.id;var l=document.createElement("h1");l.innerHTML=n.company+" : "+n.position;var s=document.createElement("p");s.innerHTML=n.review;var c=document.createElement("div");c.setAttribute("class","comment-detail"),c.innerHTML='<span class="date">'+k(n.create_time)+'</span><span class="location">Location: '+n.location+"</span>";var d=document.createElement("div");if(d.setAttribute("class","emoji-comment-selector"),"your-comments"===a){var u=document.createElement("div");u.setAttribute("class","rating cancel rating-small"),r(u,"Remove","small"),d.appendChild(u),t("click",u,function(){S(u,n.id,"cancel")}),e(o,"blue-border")}else if("pending-comments"===a){var m=document.createElement("div");m.setAttribute("class","rating approve rating-big"),r(m,"Approve!","large");var p=document.createElement("div");p.setAttribute("class","rating reject rating-big"),r(p,"Reject!","large"),d.appendChild(m),d.appendChild(p),t("click",m,function(){S(m,n.id,"approve")}),t("click",p,function(){S(p,n.id,"reject")}),e(o,"yellow-border")}else{var g=document.createElement("div");g.setAttribute("class","rating love rating-big"),r(g,"Love it!","large");var f=document.createElement("div");f.setAttribute("class","rating poo rating-big"),r(f,"Poo poo!","large"),d.appendChild(g),d.appendChild(f),t("click",g,function(){S(g,n.id,"love")}),t("click",f,function(){S(f,n.id,"poo")})}return o.appendChild(d),o.appendChild(l),o.appendChild(s),o.appendChild(c),i.appendChild(o),i},n=function(e){var n="#"+e.id+':before{ background-image: url("/img/'+e.emoji.replace(/^e/,"")+'.png"); }',t=document.head||document.getElementsByTagName("head")[0],a=document.createElement("style");a.type="text/css",a.styleSheet?a.styleSheet.cssText=n:a.appendChild(document.createTextNode(n)),t.appendChild(a)},o=function(e,t,a,i){var o,r,l=document.getElementById(t);r=_.reject(e,function(e){return _.contains(y(D),e.id)||_.contains(y(G),e.id)}),void 0!==a&&(r=_.sample(r,a)),r.forEach(function(e){o=d(e,t),l.appendChild(o),n(e)}),"function"==typeof i&&i()},M=function(){var e,n,t,a,i,o;return e=document.getElementById("input-review"),n=document.getElementById("input-company"),t=document.getElementById("input-position"),a=document.getElementById("input-location"),o=document.getElementById("review-submit"),i=[I(e),I(n),I(t),I(a),b(o)],_.compact(i)},l=function(e){var n,t,a,o,r=e.length,l=u("POST",e.action),s={};if(o=M(),o.length>0)return void g(o.join("<br />"),"flash-info");for(m(!0),n=0;n<r;++n)t=e[n],t.name&&("radio"===t.type?t.checked&&(s[t.name]=t.value):s[t.name]=t.value);l.setRequestHeader("Content-type","application/json; charset=UTF-8"),l.onload=function(){m(!1),200!==l.status?g(l.responseText,"flash-error"):(g("Submitted! Your submission will be pending until it is approved by another person viewing the site.","flash-info"),a=JSON.parse(l.responseText),localStorage.setItem(a.id,JSON.stringify(a)),i(a.id,D,B),c())},l.onreadystatechange=function(){4===l.readyState&&200!==l.status&&(g("Error sending review request.","flash-error"),m(!1))},l.send(JSON.stringify(s))},T=function(e){var n;e.preventDefault(),n=document.getElementById("review-submit"),l(n)},b=function(){var n,t,a,i=0,o=null;return n=document.getElementById("num-remaining-wrap"),i+=document.getElementById("input-review").value.length,t=x-i,a=document.getElementById("num-remaining"),t>0?(a.innerHTML=t,E(n,"red-border")):(a.innerHTML="0",e(n,"red-border"),o="Submission is too long"),o},I=function(n){var t,a=null,i=n.id.replace("input-","").charAt(0).toUpperCase()+n.id.replace("input-","").slice(1);return t=document.getElementById(n.id.replace("input","span")),n.value.length>H[n.id]?(e(n,"overflow"),E(t,"valid"),E(t,"fa"),E(t,"fa-check-circle"),a=i+" is too long."):E(n,"overflow"),n.value.length<P[n.id]&&(a=i+" is too short."),n.value.length<=H[n.id]&&n.value.length>=P[n.id]?(e(t,"valid"),e(t,"fa"),e(t,"fa-check-circle")):(E(t,"valid"),E(t,"fa"),E(t,"fa-check-circle")),a},a=function(){var e,n,a,i,o,r;n=document.getElementById("input-review"),a=document.getElementById("input-company"),i=document.getElementById("input-position"),o=document.getElementById("input-location"),e=document.getElementById("review-submit"),r=document.getElementById("clear-local-storage"),t("submit",e,T),t("input",n,function(){I(n)}),t("input",a,function(){I(a)}),t("input",i,function(){I(i)}),t("input",o,function(){I(o)}),t("input",e,function(){b(e)}),t("awesomplete-selectcomplete",o,function(){I(o)}),t("awesomplete-selectcomplete",a,function(){I(a)}),t("awesomplete-selectcomplete",i,function(){I(i)}),t("click",r,function(e){e.preventDefault(),localStorage.clear(),g("All local state removed, refresh page to see update","flash-info")})},s=function(){var e=new Awesomplete(document.getElementById("input-company"));e.list=J;var n=new Awesomplete(document.getElementById("input-location"));n.list=U;var t=new Awesomplete(document.getElementById("input-position"));t.list=F},C=function(){var e,n=u("GET","/pending-reviews/pending-reviews.json");n.onload=function(){n.status>=200&&n.status<400?(e=JSON.parse(n.responseText),o(e,"pending-comments",2,N)):g("Unable to get pending reviews","flash-error")},n.onreadystatechange=function(){4===n.readyState&&200!==n.status&&g("Error fetching pending reviews","flash-error")},n.onerror=function(){g("Error sending review request.","flash-error")},n.send()},A=function(){var e=u("GET","/reviews/reviews.json");e.onload=function(){if(e.status>=200&&e.status<400){var n=JSON.parse(e.responseText);o(n,"comments")}else g("Unable to get reviews","flash-error")},e.onreadystatechange=function(){4===e.readyState&&200!==e.status&&g("Error fetching reviews","flash-error")},e.onerror=function(){g("Error sending review request.","flash-error")},e.send()},a(),s(),B(),A(),C(),null===localStorage.getItem("first_visit")&&v()}();