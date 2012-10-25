origin = location.protocol + '//' + location.hostname
defaultHostname = origin.replace(location.hostname, 'api.' + location.hostname)

// debug for now, api.* throws errors
defaultHostname = 'http://localhost:9292/localhost:5984'
baseUrl = localStorage.getItem('baseUrl') || defaultHostname
$('#hoodieBaseUrl').text(baseUrl)

hoodie  = new Hoodie(baseUrl)
$('#changeHoodieBaseUrl').click(function(event) {
  $el = $(event.target)

  localStorage.setItem('baseUrl', prompt("enter hoodie base URL", defaultHostname))

  reload = function() { location.reload() };
  hoodie.account.signOut()
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
hoodie.account.on('signin signup passwordreset', function() {
  $hoodieAccountModal.modal('hide')
});
