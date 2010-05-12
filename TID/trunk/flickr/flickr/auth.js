/* 
* This code is licensed under terms shown on this link:
* http://forge.morfeo-project.org/wiki/index.php/Gadgets_2009_License
*/

var FlickrAuthFactory = function () {
	
	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;
	
	function FlickrAuth () {
		/**** PRIVATE VARIABLES ****/
		this._frob = null;
		this._access = ''; 
		this._token = ''; 
	
		/**** PUBLIC METHODS ****/
		FlickrAuth.prototype.init = function (access_, token_) {
			this._access = access_;
			this._token = token_;
		}
		
		FlickrAuth.prototype.login = function (onSuccess_, onError_) {
			this._frob = null;
			this.getFrob(
				function(value_){
					this._frob = value_;
					onSuccess_();
				}.bind(this),
				function(err_){
					this._view.error(err_);
					this._view.showFlickrLogin();
				}.bind(this)
			);
		}

		FlickrAuth.prototype.logout = function () {
			this._access = '';
			this._token = '';
			FlickrGadgetFactory.getInstance().setAccess(this._access);
			FlickrGadgetFactory.getInstance().setAuthToken(this._token);
		}
	
		FlickrAuth.prototype.initSession = function (onSuccess_, onError_) {
			if (!this._frob){
				this._view.showFlickrLogin();
			}else{
				this.getToken(this._frob, 
					function (token_) {	
						this._token = token_;
						FlickrGadgetFactory.getInstance().setAuthToken(this._token);
						onSuccess_();
					}.bind(this), 
					function (msg_) {
						onError_(msg_)
					}.bind(this)
				);
			}
		}.bind(this)

		FlickrAuth.prototype.authenticate = function (onSuccess_, onError_) {
			this.validateToken(
				function (token_) {	
					this._token = token_;
					FlickrGadgetFactory.getInstance().setAuthToken(this._token);
					onSuccess_();
				}.bind(this), 
				function (msg_) {
					onError_(msg_)
				}.bind(this)
			);
		}
			
		
		FlickrAuth.prototype.getAuthToken = function () {
			return this._token;
		}
		
		FlickrAuth.prototype.isAuth = function () {
			return this._token != '';
		}
		
		FlickrAuth.prototype.isPublicAccess = function () {
			return this._access == 'public';
		}
		
		FlickrAuth.prototype.setPublicAccess = function () {
			this._access = 'public';
			FlickrGadgetFactory.getInstance().setAccess(this._access);
		}
		
		FlickrAuth.prototype.setPrivateAccess = function () {
			this._access = 'private';
			FlickrGadgetFactory.getInstance().setAccess(this._access);
		}
		
		FlickrAuth.prototype.hasAccess = function () {
			return this._access;
		}
		
		FlickrAuth.prototype.validateToken = function (onSuccess_, onError_) {
			this.checkToken(this._token,
				function(_token, _perms){
					if (_perms != 'delete'){
						onError_(FlickrGadgetFactory.getInstance().getTranslator().getLabel('tokenerror'));
					}else{
						onSuccess_(_token);
					}
				}.bind(this),
				function(_e)	{
					onError_(_e); 
				}.bind(this)
			);
		}

		FlickrAuth.prototype.getFrob = function (onSuccess_, onError_) {
			flickr.auth.getFrob(
				function(resp_) {
					if (resp_.stat == "fail"){
						onError_(FlickrGadgetFactory.getInstance().getTranslator().getLabel('flickrerror'));
						return;
					}			
					this._frob = resp_.frob._content;
					var url = flickr.auth.getLoginURL('delete', this._frob);
					window.open(url, 'FlickrLogin');
					onSuccess_(this._frob);
				}.bind(this),
				function(resp_) {
					onError_(FlickrGadgetFactory.getInstance().getTranslator().getLabel('flickrerror'));
				}.bind(this)
			);
		}
		
		FlickrAuth.prototype.getToken = function (_frob, onSuccess_, onError_) {
			flickr.auth.getToken(_frob,
				function(resp_)	{
					if (!resp_.auth || !resp_.auth.user || (resp_.stat == "fail")){
						onError_(FlickrGadgetFactory.getInstance().getTranslator().getLabel('flickrerror'));
					} else {
						var token = resp_.auth.token._content;
						onSuccess_(token);				
					}
				}.bind(this),
				function(resp_)	{
					onError_(FlickrGadgetFactory.getInstance().getTranslator().getLabel('flickrerror'));
				}.bind(this)
			);
		}

		FlickrAuth.prototype.checkToken = function (_token, onSuccess_, onError_) {
			flickr.auth.checkToken(_token,
				function(resp_)	{
					if (!resp_.auth || !resp_.auth.user || (resp_.stat == "fail")){
						onError_(FlickrGadgetFactory.getInstance().getTranslator().getLabel('flickrerror'));
					} else {
						var perms = resp_.auth.perms._content;
						var token = resp_.auth.token._content;
						onSuccess_(token, perms);
					}
				}.bind(this),
				function(resp_) {
					onError_(FlickrGadgetFactory.getInstance().getTranslator().getLabel('flickrerror'));
				}.bind(this)		
			);
		}
	}
	
	// *********************************
	// SINGLETON GET INSTANCE
	// *********************************
	return new function() {
		this.getInstance = function() {
			if (instance == null) {
				instance = new FlickrAuth();
			}
		return instance;
		}
	}
}();