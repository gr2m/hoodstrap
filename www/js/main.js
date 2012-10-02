// hoodie = new Hoodie("http://api.hoodoo.hoodie.dev")
// workaround due to current bug with couch being not accessible
// via api.hoodoo.hoodie.dev

baseUrl = localStorage.getItem('baseUrl') || "http://api.hoodstrap.hoodie.dev"
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
$hoodieAccountModal.on('shown', function() {
  $hoodieAccountModal.find('input').eq(0).focus()
})
$hoodieAccountModal.on('hide', function() {
  $hoodieAccountModal.find('.alert').remove()
  $hoodieAccountModal.find('input').val('')
})
$hoodieAccountModal.on('click', 'button[type=submit]', function() {
  $hoodieAccountModal.find('form:visible').submit()
  return false  
});

hoodie.my.account.on('signin signup passwordreset', function() {
  $hoodieAccountModal.modal('hide')
});