baseUrl = localStorage.getItem('baseUrl') || "http://localhost:9292/localhost:5984"
// baseUrl = localStorage.getItem('baseUrl') || "http://api.hoodstrap.hoodie.dev"
$('#hoodieBaseUrl').val(baseUrl)

hoodie  = new Hoodie(baseUrl)
$('input#hoodieBaseUrl').change(function(event) {
  $el = $(event.target)
  localStorage.setItem('baseUrl', $el.val()) 
  
  hoodie.my.account.signOut()
  .done( function() { location.reload() })
  .fail( function() { location.reload() })
})

$hoodieAccountModal = $('#hoodieAccountModal')
.on('shown', function() {
  $hoodieAccountModal.find('input').eq(0).focus()
})
.on('hide', function() {
  $hoodieAccountModal.find('.alert').remove()
  $hoodieAccountModal.find('input').val('')
})
.on('click', 'button[type=submit]', function() {
  $hoodieAccountModal.find('form:visible').submit()
  return false  
});

// 
hoodie.my.account.on('signin signup passwordreset', function() {
  $hoodieAccountModal.modal('hide')
});