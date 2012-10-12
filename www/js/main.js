baseUrl = localStorage.getItem('baseUrl') || "http://localhost:9292/localhost:5984"
// baseUrl = localStorage.getItem('baseUrl') || "http://api.hoodstrap.hoodie.dev"
$('#hoodieBaseUrl').text(baseUrl)

hoodie  = new Hoodie(baseUrl)
$('#changeHoodieBaseUrl').click(function(event) {
  $el = $(event.target)

  localStorage.setItem('baseUrl', prompt("enter hoodie base URL", "http://localhost:9292/localhost:5984"))

  hoodie.my.account.signOut()
  .done( location.reload )
  .fail( location.reload )
})

$hoodieAccountModal = $('#hoodieAccountModal')
.on('shown', function() {
  $hoodieAccountModal.find('input').eq(0).focus()
})
.on('hide', function() {
  $hoodieAccountModal.find('.alert').remove()
  $hoodieAccountModal.find('input').val('')
})

// 
hoodie.my.account.on('signin signup passwordreset', function() {
  $hoodieAccountModal.modal('hide')
});
