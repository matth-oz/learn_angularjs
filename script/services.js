angular.module('bussApp')
	.factory('BussAppService', ['$http', function($http){
		return{
			payer:{},
			getPayers : function(){
				return $http.get('app.php');
			},
			addNewPayer : function(payer){				
				return $http.post('/addpayer/', payer).
				success(function(result){
					console.log('payer successfully saved!');
					return result;
				}).
				error(function(result){					
					console.log('Error!');
				});
				// добавляем нового плательщика
			},
			deletePayer : function(payers){
				var p = [];
				p['payers'] = payers;
				return $http.post('/delpayer/', p)
				.then(function(response){
					return response;
				});
			},
			getPayments : function(){
				return $http.get('/getpayments/');
			}
		}		
	}])
	.factory('UserService', ['$location', '$http', 'MenuService', function($location, $http, MenuService){
		var service = {
			locpath: $location.url(),
			isLoggedIn: false,
			userName: '',
			menuService: MenuService,
			session: function(){
				return $http.get('/getsession/')
				.then(function(success){
					service.isLoggedIn = true;
					service.userName = success.data.username;
					for (var i=0; i < service.menuService.length; i++){
						service.menuService[i].show = true;
					}					
				},function(error){
					self.errorMessage = error.data.msg;
				});
			},			
			login: function(user){
				return $http.post('/login/', user)
				.then(function(response){
					service.isLoggedIn = true;					
					return response;					
				});
			},
			
			logout: function(){
				return $http.get('/logout/')
				.then(function(response){
					service.isLoggedIn = false;
					for (var i=1; i < service.menuService.length; i++){
						service.menuService[i].show = false;
					}					
					return response;
				});
			}
			
		};
		return service;
	}])
	.factory('ItemsService', ['$http', function($http){
		return{
			payer: {},
			getPayer: function(id){
				return $http.get('/detail/' + id + '/');
			},
			savePayer: function(payer){
				return $http.post('/save/', payer)
					.success(function(result){
						console.log('Payer info succesfully changed!');
					})
					.error(function(result){
						console.log('Error!');
					});
			}
		}
	}]).
	factory('MenuService',[function(){
		var menu = [
				{
					name: 'Плательщики',
					href: '/',
					show: true
				},
				{
					name: 'Платежи',
					href: '/payments',
					show: false
				}
			];
		return menu;
	}]);