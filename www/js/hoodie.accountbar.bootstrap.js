// extend Hoodie with Hoodstrap module
Hoodie.extend('hoodstrap', (function() {

  // Constructor
  function Hoodstrap(hoodie) {

    this.hoodie = hoodie

    // setup logging
    this._logHoodieEvents()

    // update store
    this._displayStore()

    // all about authentication and stuff
    this._hoodifyAccountBar()
  }

  Hoodstrap.prototype = {

    // 
    _hoodifyAccountBar: function() {
      this.$hoodieAccountBar = $('.hoodie-accountbar')
      this.hoodie.my.account.authenticate().then(this._handleUserAuthenticated.bind(this), this._handleUserUnauthenticated.bind(this));

      this.hoodie.my.account.on('signin', this._handleUserAuthenticated.bind(this))
      this.hoodie.my.account.on('signout', this._handleUserUnauthenticated.bind(this))
    },

    // 
    _handleUserAuthenticated: function(username) {
      $('html').addClass('hoodie-signedin').removeClass('hoodie-signedout')
      this.$hoodieAccountBar.find('.hoodie-username').text(username)
    },

    // 
    _handleUserUnauthenticated: function(error) {
      $('html').removeClass('hoodie-signedin').addClass('hoodie-signedout')
    },

    // 
    _logHoodieEvents: function() {
      this.$hoodieLogBody = $('.hoodie-log tbody')

      var remotePrefix = this.hoodie.my.remote.name + ':',
          events = [
            'account:signin',
            'account:signup',
            'account:signout',
            'account:error:unauthenticated',
            'account:passwordreset:success',

            'remote:error:server',
            'remote:destroy',
            'remote:update',
            'remote:create',

            'store:destroy',
            'store:update',
            'store:create',
            'store:clear',
            'store:dirty:idle'
          ]

      for (var i = 0; i < events.length; i++) {
        this.hoodie.on(events[i], this._log(events[i]))
      }

      $('.hoodie-log').on('click', '.clear', function() {
        $hoodieLogBody.html('')
      })
    },

    // 
    _log: function(event) {
      return function(data) {
        var _ref, module, eventName, time, dataString;

        _ref       = event.split(/:/)
        module     = _ref[0]
        eventName  = [].slice.call(_ref, 1).join(':')
        time       = new Date().toTimeString().substring(0,8)
        dataString = this._humanizeData(data);

        this.$hoodieLogBody.prepend('<tr><td>'+time+'</td><td>'+module+'</td><td>'+eventName+'</td><td class="data">'+dataString+'</td></tr>') 
      }.bind(this)
    },

    // 
    _displayStore: function() {
      this.$hoodieStoreBody = $('.hoodie-store tbody')
      if( this.$hoodieStoreBody.length === 0 ) return;

      this._bootstrapStore()
      this._bindToStoreEvents()

      $('.hoodie-store').on('click', '.clear', function() {
        if(confirm('you sure?')) hoodie.my.store.clear()
      })
    },

    // 
    _bootstrapStore: function() {
      this.hoodie.my.store.loadAll().done(function(origObjects) {
        var html = ''
        for (var i = 0; i < origObjects.length; i++) {
          html += this._objectToHtml(origObjects[i])
        }
        this.$hoodieStoreBody.append(html)
      }.bind(this))
    },

    // 
    _bindToStoreEvents: function() {
      this.hoodie.my.store.on('create', function(object) {
        this.$hoodieStoreBody.append(this._objectToHtml(object))
      }.bind(this))
      this.hoodie.my.store.on('update', function(object) {
        $('#' + this._getHtmlIdFor(object)).replaceWith(this._objectToHtml(object))
      }.bind(this))
      this.hoodie.my.store.on('destroy', function(object) {
        $('#' + this._getHtmlIdFor(object)).remove()
      }.bind(this))
      this.hoodie.my.store.on('clear', function(object) {
        this.$hoodieStoreBody.html('')
      }.bind(this))
    },

    // 
    _objectToHtml: function(object) {
      var properties, type, id, rev, createdAt, updatedAt, html_id, data;

      properties  = $.extend({}, object)
      type        = properties.$type
      id          = properties.id
      rev         = properties._rev || '-'
      createdAt   = properties.$createdAt
      updatedAt   = properties.$updatedAt
      syncedAt    = properties._$syncedAt
      html_id     = type.replace(/\$/,'')+'_'+id

      delete properties.$type
      delete properties.id
      delete properties._rev
      delete properties.$createdAt
      delete properties.$updatedAt
      delete properties._$syncedAt
      // delete properties.$createdBy

      createdAt = createdAt ? createdAt.toISOString().substring(0,19).replace('T', ' ') : '-'
      updatedAt = updatedAt ? updatedAt.toISOString().substring(0,19).replace('T', ' ') : '-'
      syncedAt  = syncedAt  ? syncedAt.toISOString().substring(0,19).replace('T', ' ') : '-'
      data      = this._humanizeData(properties)

      return '<tr id="'+html_id+'"><td>'+type+'</td><td>'+id+'</td><td>'+rev+'</td><td>'+createdAt+'</td><td>'+updatedAt+'</td><td>'+syncedAt+'</td><td class="data">'+data+'</td></tr>'  
    },

    _getHtmlIdFor: function(object) {
      return object.$type.replace(/\$/,'')+'_'+object.id
    },

    _humanizeData: function(data) {
      if (typeof data === 'undefined') return '-'
      return JSON.stringify(data, "", 2).replace(/(^\{\n|\n\}$|)/g, '').replace(/ *"([^"]+)":/g,'<strong>$1:</strong>').replace(/,\n/g, '\n')
    }
  }

  return Hoodstrap
})() )


!function ($) {

  "use strict"; // jshint ;_;

 /* Hoodie DATA-API
  * =============== */

  $(function () {
    // bind to click events
    $('body').on('click.hoodie.data-api', '[data-hoodie-action]', function(event) {
      var $element = $(event.target)
        , action   = $element.data('hoodie-action')
      
      switch(action) {
        case 'account-signout':
          window.hoodie.my.account.signOut()
          .fail(function(error) { 
            alert("Ooops, something went wrong");
          })
          break
        case 'account-destroy':
          if(! confirm("you sure? Destroy account with all its data?")) return;

          window.hoodie.my.account.destroy()
          .fail(function(error) { 
            alert("Ooops, something went wrong");
          })
          break
      }
    })

    // bind to form submits
    $('body').on('submit.hoodie.data-api', '[data-hoodie-action]', function(event) {
      var $form = $(event.target)
        , action   = $form.data('hoodie-action')
        , username = $form.find('input.username').val()
        , password = $form.find('input.password').val()

      $form.find('.alert').remove()
      switch(action) {
        case 'account-signin':
          hoodie.my.account.signIn(username, password)
          .done(function() { 
            $form.find('.alert').remove()
          })
          .fail(function(error) { 
            $form.prepend('<div class="alert alert-error"><strong>'+error.error+':</strong> '+error.reason+'</div>')
          })
          break
        case 'account-signup':
          hoodie.my.account.signUp(username, password)
          .done(function() { 
            $form.find('.alert').remove()
          })
          .fail(function(error) { 
            $form.prepend('<div class="alert alert-error"><strong>'+error.error+':</strong> '+error.reason+'</div>')
          })
          break
        case 'account-changepassword':
          //
          break
        case 'account-changeusername':
          //
          break
        case 'account-resetpassword':
          hoodie.my.account.resetPassword(email)
          .done(function() {
            alert("send new password to " + email)
            $form.find('.alert').remove()
          })
          .fail(function(error) { 
            $form.prepend('<div class="alert alert-error"><strong>'+error.error+':</strong> '+error.reason+'</div>')
          })
          break
      }

      event.preventDefault();
    })
  })

}(window.jQuery);