$('#copyright-year').html(new Date().getFullYear())

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

$('#selected-works li').each(function(index){  
  $(this).attr('style', 'transition-delay: ' + index * 0.1 + 's');
  $(this).addClass('shown');
});