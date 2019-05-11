$(window).on('load', function() {
  $('#canvas-container canvas').fadeIn();
})

$('.client-access').click(function() {
  $('.overlay').fadeIn();
});

$('.overlay').click(function() {
  $(this).fadeOut();
});

$('.credits-button').click(function() {
  $('.credits').fadeToggle();
  $('.logo-central').fadeToggle();
  $('.left-text').fadeToggle();
});

$('#canvas-container').click(function() {
  $('.credits').fadeOut();
  $('.logo-central').fadeIn();
  $('.left-text').fadeIn();
});