defaultHostname = location.origin.replace(location.hostname, 'api.' + location.hostname)
baseUrl = localStorage.getItem('baseUrl') || defaultHostname
$('#hoodieBaseUrl').text(baseUrl)

hoodie  = new Hoodie(baseUrl)
$('#changeHoodieBaseUrl').click(function(event) {
  $el = $(event.target)

  localStorage.setItem('baseUrl', prompt("enter hoodie base URL", defaultHostname))

  reload = function() { location.reload() };
  hoodie.my.account.signOut()
    .done( reload )
    .fail( reload )
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
