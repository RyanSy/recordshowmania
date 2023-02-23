$(document).ready(function() {
  $('#date').change(function() {
    $('#searchByDateForm').submit();
  });
  $('#state').change(function() {
    $('#searchByStateForm').submit();
  });
  $('#country').change(function() {
    $('#searchByCountryForm').submit();
  });
});
