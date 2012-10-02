// hoodie = new Hoodie("http://api.hoodoo.hoodie.dev")
// workaround due to current bug with couch being not accessible
// via api.hoodoo.hoodie.dev
hoodie = new Hoodie("http://localhost:9292/localhost:5984")

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