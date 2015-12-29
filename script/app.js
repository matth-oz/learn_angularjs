angular.module('bussApp', ['ngRoute'], function($httpProvider)
{
  // Используем x-www-form-urlencoded Content-Type
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
  
  // Переопределяем дефолтный transformRequest в $http-сервисе
  $httpProvider.defaults.transformRequest = [function(data)
  {
    /**
     * рабочая лошадка; преобразует объект в x-www-form-urlencoded строку.
     * @param {Object} obj
     * @return {String}
     */ 
    var param = function(obj)
    {
      var query = '';
      var name, value, fullSubName, subValue, innerObj, i;
      
      for(name in obj)
      {
        value = obj[name];
        
        if(value instanceof Array)
        {
          for(i=0; i<value.length; ++i)
          {
            subValue = value[i];
            fullSubName = name + '[' + i + ']';
            innerObj = {};
            innerObj[fullSubName] = subValue;
            query += param(innerObj) + '&';
          }
        }
        else if(value instanceof Object)
        {
          for(subName in value)
          {
            subValue = value[subName];
            fullSubName = name + '[' + subName + ']';
            innerObj = {};
            innerObj[fullSubName] = subValue;
            query += param(innerObj) + '&';
          }
        }
        else if(value !== undefined && value !== null)
        {
          query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
        }
      }
      
      return query.length ? query.substr(0, query.length - 1) : query;
    };
    
    return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
  }];
})
.config(function($routeProvider){
	$routeProvider.when('/', {
		templateUrl: 'views/payers_list.html',
		controller: 'PayersListCtrl as payersListCtrl'
	}).when('/login', {
		 templateUrl: 'views/login.html'
	}).when('/detail/:id/',{
		//controller: 'EditPayerController as editPayerController',
		templateUrl: 'views/edit.html'
	}).when('/payments',{
		templateUrl: 'views/payments_list.html',
		controller: 'PaymentsListCtrl as paymentsListCtrl'
	});
	
	$routeProvider.otherwise({
		redirectTo: '/'
	});
})
.directive('chclass', function(){
	return{
		link: function(scope, element, attrs){
			element.on('click', function(){
				if($(this).hasClass('active-lnk') === false){
					$('ul.top-menu a').removeClass('active-lnk');
					$(this).addClass('active-lnk');
				}								
			});
		}
	}
});