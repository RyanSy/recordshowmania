function addFutureDate() {
    var div = document.createElement("div");
    var date = document.createElement("input");
    var deleteButton = document.createElement("input");
    var futureDatesArray = document.getElementsByClassName("future-date");

    div.setAttribute("class", "future-date form-inline");
    date.setAttribute("type", "date");
    date.setAttribute("class", "form-control col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3 mb-3");
    deleteButton.setAttribute("type", "button");
    deleteButton.setAttribute("class", "btn btn-danger ml-2 mb-3");
    deleteButton.setAttribute("onclick", "deleteFutureDate()");
    deleteButton.setAttribute("value", "Delete");

    for (var i = 0; i <= futureDatesArray.length; i++) {
      div.setAttribute("id", "futureDate" + i);
      date.setAttribute("name", "future_dates");
      deleteButton.setAttribute("id", "futureDateDeleteButton" + i);
    }

    div.appendChild(date);
    div.appendChild(deleteButton);

    document.getElementById("futureDatesContainer").appendChild(div);
  }

function deleteFutureDate() {
  var deleteButtonID = document.getElementById(event.target.id);
  var futureDateDiv = document.getElementById(deleteButtonID.closest("div").id);
  futureDateDiv.parentNode.removeChild(futureDateDiv);
}

var earlyAdmissionYes = document.getElementById('earlyAdmissionYes');
var earlyAdmissionNo = document.getElementById('earlyAdmissionNo');
var earlyAdmissionFields = document.getElementById('earlyAdmissionFields');

function displayEarlyAdmissionFields() {
  if (earlyAdmissionYes.checked) {
    earlyAdmissionFields.className = 'd-block';
    earlyAdmissionNo.removeAttribute('checked');
  }
  if (earlyAdmissionNo.checked) {
    earlyAdmissionFields.className = 'd-none';
    earlyAdmissionYes.removeAttribute('checked');
  }
}

function addFeaturedDealer() {
    var div = document.createElement("div");
    var text = document.createElement("input");
    var deleteButton = document.createElement("input");
    var featuedDealersArray = document.getElementsByClassName("featured-dealer");

    for (var i = 0; i <= featuedDealersArray.length; i++) {
      div.setAttribute("id", "featuredDealer" + i);
      deleteButton.setAttribute("id", "featuredDealerDeleteButton" + i);
    }

    div.setAttribute("class", "featured-dealer form-inline");
    text.setAttribute("type", "text");
    text.setAttribute("name", "featured_dealers");
    text.setAttribute("class", "form-control col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3 mb-3");
    deleteButton.setAttribute("type", "button");
    deleteButton.setAttribute("class", "btn btn-danger ml-2 mb-3");
    deleteButton.setAttribute("onclick", "deleteFeaturedDealer()");
    deleteButton.setAttribute("value", "Delete");

    div.appendChild(text);
    div.appendChild(deleteButton);

    document.getElementById("featuredDealersContainer").appendChild(div);
  }

function deleteFeaturedDealer() {
  var deleteButtonID = document.getElementById(event.target.id);
  var featuredDealerDiv = document.getElementById(deleteButtonID.closest("div").id);
  featuredDealerDiv.parentNode.removeChild(featuredDealerDiv);
}
