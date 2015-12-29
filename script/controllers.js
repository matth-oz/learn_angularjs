angular.module('bussApp')
	.controller('MainCtrl',['UserService', 'BussAppService', '$location',
		function(UserService, BussAppService, $location){
		var self = this;	
		
		self.payer = {};		
		
		self.userService = UserService;
		UserService.session();
		self.menu = UserService.menuService;
		
		self.logout = function(){
			UserService.logout().then(function(success){
				console.log(UserService.isLoggedIn);				
				$location.path('/');
			},
			function(error){
				self.errorMessage = error.data.msg;
			});			
		}			
	}])
	.controller('PayersListCtrl', ['UserService', 'BussAppService', '$location', 
		function(UserService, BussAppService, $location){
			var self = this;
			
			self.payer = {};
			
			self.SearchTxt = '';
			
			self.payers = [];
			
			self.checkedPayers = [];
			
			self.allChecked = false;
			
			self.userService = UserService;
			UserService.session();
			
			BussAppService.getPayers().then(function(resp){
				self.payers = resp.data;				
			});
			
			self.checkPayer = function(p){
				var index = self.checkedPayers.indexOf(p);
				
				if(index == -1){
					self.checkedPayers.push(p);
				}
				else{
					self.checkedPayers.splice(index, 1);
				}
				console.log(self.checkedPayers);
			}
			
			self.checkAllPayers = function(){
				var act = (self.checkedPayers.length < self.payers.length) ? 'check' : 'uncheck';
							
				if(act == 'check'){
					for(var i = 0; i <= self.payers.length-1; i++){						
						self.checkedPayers.push(self.payers[i].id);						
					}
					self.allChecked = true;
					console.log(self.checkedPayers);
					console.log(self.allChecked);
				}
				else{
					self.checkedPayers.splice(0, self.checkedPayers.length);
					self.allChecked = false;
					console.log(self.checkedPayers);
					console.log(self.allChecked);
				}
			}
						
			self.delPayers = function(payers){
				BussAppService.deletePayer(payers);
				$location.path('/ttt');				
			}
			
			self.addNewPayer = function(payer){
				//добавляем плательщика через сервис
				self.payer = payer;
				BussAppService.addNewPayer(self.payer);
				
				self.payer = null;
				self.npfrmIsShown = false;
				
				// неправильно, но работает как задумано.
				$location.path('/ttt');
			}
			
			// не показывать форму добавления плательщика
			self.npfrmIsShown = false;
			
			self.showNpfrm = function(){
				if(self.npfrmIsShown === false){
					self.npfrmIsShown = true;
				}
			}
			
	}])
	.controller('LoginCtrl', ['UserService', '$location', 
		function(UserService, $location){
			var self = this;
			self.user = {username: '', password: ''};
						
			self.login = function(){
				UserService.login(self.user).then(function(success){
					$location.path('/');
				}, function(error){
					self.errorMessage = error.data.msg;
				})
			};		
	}])
	.controller('EditPayerController', ['ItemsService', '$location', '$routeParams', 
		function(ItemsService, $location, $routeParams){
		var self = this;
		self.payer = {};
		self.payerCurGroups = [];
		
		self.savePayerInfo = function(payer){
			self.payer = payer;
			
			ItemsService.savePayer(self.payer);
			$location.path('/');
		}
		
		ItemsService.getPayer($routeParams.id)
			.then(function(resp){
				self.payerCurGroups = resp.data.curgroups;
				self.payer = resp.data;
				console.log(self.payer);
			},
			function(error){
				console.log('error!');
			});		
		
	}]).
	controller('PaymentsListCtrl', ['UserService', 'BussAppService', 
		function(UserService, BussAppService){
			var self = this;
			self.payments = [];
			
			self.npfrmIsShown = false;
			
			self.userService = UserService;
			UserService.session();
			
			BussAppService.getPayments().then(function(resp){
				self.payments = resp.data;				
			});		
	}]);