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
      this.hoodie.on('account:error:unauthenticated remote:error:unauthenticated', this._handleUserAuthenticationError.bind(this))
    },

    // 
    _handleUserAuthenticated: function(username) {
      $('html').attr('data-hoodie-account-status', 'signedin')
      this.$hoodieAccountBar.find('.hoodie-username').text(username)
    },

    // 
    _handleUserUnauthenticated: function() {
      $('html').attr('data-hoodie-account-status', 'signedout')
    },
    _handleUserAuthenticationError: function() {
      alert("Authentication Error. Please Sign In again.")
      this.$hoodieAccountBar.find('.hoodie-username').text(this.hoodie.my.account.username)
      $('html').attr('data-hoodie-account-status', 'error')
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
            'account:passwordreset',

            'remote:error:server',
            'remote:destroy',
            'remote:update',
            'remote:create',
            'remote:error:unauthenticated',

            'store:destroy',
            'store:update',
            'store:create',
            'store:clear',
            'store:idle'
          ]

      for (var i = 0; i < events.length; i++) {
        this.hoodie.on(events[i], this._log(events[i]))
      }

      $('.hoodie-log').on('click', '.clear', function() {
        this.$hoodieLogBody.html('')
      }.bind(this))
    },

    // 
    _log: function(event) {
      return function(data, options) {
        var _ref, module, eventName, time, dataString;

        _ref       = event.split(/:/)
        module     = _ref[0]
        eventName  = [].slice.call(_ref, 1).join(':')
        time       = new Date().toTimeString().substring(0,8)
        dataString = this._humanizeData(data);
        optionsTag = options ? '<td>' + this._humanizeData(options) + '</td>' : ''

        this.$hoodieLogBody.prepend('<tr><td>'+time+'</td><td>'+module+'</td><td>'+eventName+'</td><td class="data">'+dataString+'</td></tr>') 
      }.bind(this)
    },

    // 
    _displayStore: function() {
      this.$hoodieStoreBody = $('.hoodie-store tbody')
      if( this.$hoodieStoreBody.length === 0 ) return;

      this._bootstrapStore()
      this._bindToStoreEvents()
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
        this._getElementFor(object).replaceWith(this._objectToHtml(object))
      }.bind(this))
      this.hoodie.my.store.on('destroy', function(object) {
        this._getElementFor(object).remove()
      }.bind(this))
      this.hoodie.my.store.on('clear', function(object) {
        this.$hoodieStoreBody.html('')
      }.bind(this))
    },

    // 
    _objectToHtml: function(object) {
      var properties, type, id, rev, createdAt, updatedAt, data;

      properties  = $.extend({}, object)
      type        = properties.$type
      id          = properties.id
      rev         = properties._rev || '-'
      createdAt   = properties.$createdAt
      updatedAt   = properties.$updatedAt
      syncedAt    = properties._$syncedAt

      delete properties.$type
      delete properties.id
      delete properties._rev
      delete properties.$createdAt
      delete properties.$updatedAt
      delete properties._$syncedAt
      // delete properties.$createdBy

      createdAt = createdAt ? createdAt.toISOString().substring(0,19).replace('T', ' ') : '-'
      updatedAt = updatedAt ? updatedAt.toISOString().substring(0,19).replace('T', ' ') : '-'
      syncedAt  =  syncedAt ?  syncedAt.toISOString().substring(0,19).replace('T', ' ') : '-'
      data      = this._humanizeData(properties)
      editData  = this._humanizeDataForEdit(properties)
      actions   = '<a href="#" data-hoodie-action="store-edit" class="icon-pencil"></a><br><a href="#" data-hoodie-action="store-destroy" class="icon-trash"></a>'
      return '<tr data-hoodie-store-key="'+type+'/'+id+'"><td>'+type+'</td><td>'+id+'</td><td>'+rev+'</td><td>'+createdAt+'</td><td>'+updatedAt+'</td><td>'+syncedAt+'</td><td class="data">'+data+'</td><td class="actions">'+actions+'</td></tr>'  
    },

    _getElementFor: function(object) {
      return $('[data-hoodie-store-key="'+object.$type+'/'+object.id+'"]')
    },

    _humanizeData: function(data) {
      switch (typeof data) {
        case 'undefined':
          return '<em>undefined</em>'
        case 'string':
        case 'number':
        case 'boolean':
          return data
        case 'object':
          if (Array.isArray(data)) {
            return data.map(this._humanizeData).join(',')
          } else {
            var rows = []
            for (var key in data) {
              rows.push('<tr><th>' + key + ':</th><td>' + this._humanizeData(data[key]) + '</td></tr>')
            }
            return '<table>' + rows.join('') +  '</table>'
          }
      }
    },
    _humanizeDataForEdit: function(data, indent) {
      if (!indent) indent = ''
      switch (typeof data) {
        case 'undefined':
          return ''
        case 'string':
        case 'number':
        case 'boolean':
          return data
        case 'object':
          if (Array.isArray(data)) {
            return data.map(this._humanizeData).join(',')
          } else {
            var rows = []
            for (var key in data) {
              if (/^\$/.test(key) || key === 'id') continue
              rows.push(indent + key + ': ' + this._humanizeDataForEdit(data[key], indent + '  '))
            }
            return rows.join('\n')
          }
      }
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
        , key
        , modal
        , data
      
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
        case 'store-clear':
          if(confirm('you sure?')) hoodie.my.store.clear()
          break
        case 'store-destroy':
          key   = $element.closest('[data-hoodie-store-key]').data('hoodie-store-key').split('/')
          hoodie.my.store.destroy(key[0], key[1])
          break
        case 'store-create':
        case 'store-edit':
          modal = $('#hoodieStoreModal')
          
          if (action === 'store-create') {
            modal.find('.store-create').show()
            modal.find('input[type=text], textarea').val('')
            modal.modal('show')
            return
          }

          modal.find('.store-create').hide()
          key   = $element.closest('[data-hoodie-store-key]').data('hoodie-store-key').split('/')
          hoodie.my.store.find(key[0], key[1])
          .done( function(object) {
            data = hoodie.hoodstrap._humanizeDataForEdit(object)

            modal.find('.data').attr('rows', data.split(/\n/).length + 3).val(data)
            modal.find('.type').val(object.$type)
            modal.find('.id').val(object.id)
            modal.modal('show')
          });
          
          break
      }
    })

    // bind to form submits
    $('body').on('submit.hoodie.data-api', '[data-hoodie-action]', function(event) {
      var $form = $(event.target)
        , action   = $form.data('hoodie-action')
        , username = $form.find('input.username').val()
        , password = $form.find('input.password').val()
        , email    = $form.find('input.email').val()
        , type     = $form.find('input.type').val()
        , id       = $form.find('input.id').val()
        , data     = $form.find('textarea.data').val()
        , attributes
        , update   = {}

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
          hoodie.my.account.changePassword(null, password)
          .done(function() { 
            $form.find('.alert').remove()
          })
          .fail(function(error) { 
            $form.prepend('<div class="alert alert-error"><strong>'+error.error+':</strong> '+error.reason+'</div>')
          })
          break
        case 'account-changeusername':
          hoodie.my.account.changeUsername(password, username)
          .done(function() { 
            $form.find('.alert').remove()
          })
          .fail(function(error) { 
            $form.prepend('<div class="alert alert-error"><strong>'+error.error+':</strong> '+error.reason+'</div>')
          })
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
        case 'store-update':
          attributes = data.split(/\n/)

          for (var i = 0, key_value; i < attributes.length; i++) {
            key_value = attributes[i].split(/\s*:\s*/)
            update[key_value[0]] = key_value[1]
          };
          hoodie.my.store.update(type, id, update)
          .done(function() { 
            $form.find('.alert').remove()
            $(event.currentTarget).closest('.modal').modal('hide')
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