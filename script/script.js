function PaymentFrm(p){
	var o = this;
	this.root = $(p.root);
	this.actionStarter = $(p.actionStarter);
	this.popupOpener = $(p.popupOpener);
	this.popupCloser = $(p.popupCloser);
	this.popupTrg = $(p.popupTrg);
	this.frmCheckbx = $(p.frmCheckbx);
	this.chkbxSelall = $(p.chkbxSelall);
	this.srcnFld = $(p.srcnFld);
	this.dataTable = $(p.dataTable);
	
	var JSONFolder = '/demo/sbt-test/data/';
	var dynChkbx = p.dataTable+' '+p.frmCheckbx;
	
	/*всплывающая форма*/
	this.popupOpen = function(){
		$.fancybox.open({
				href: o.popupOpener.attr('href'),
				maxWidth	: 300,
				fitToView	: false,
				width		: '70%',
				height		: 'auto',
				autoSize	: false,
				closeClick	: false,
				openEffect	: 'none',
				closeEffect	: 'none',
				afterLoad: function(){
					o.popupCloser.click(function(){
						$.fancybox.close();
					})
				}
			});	
	}
	
	/*чекбоксы*/
	this.slctAllItems = function(){		
		if(o.chkbxSelall.is(':checked')){
			$(dynChkbx).prop('checked', true);			
		}
		else{
			$(dynChkbx).prop('checked', false);
		}
	}
	
	this.CheckCountSelItems = function(){
		var itemsQuant = $(dynChkbx).length;
		var itemsChecked = $(dynChkbx).filter(':checked').length;
				
		if(o.chkbxSelall.is(':checked') && itemsChecked < itemsQuant)
		{
			o.chkbxSelall.prop('checked', false);
		}	
		
	}
	
	/*ссылки-действия*/
	this.loadPayers = function()
	{
		var groups = [];	
		var customers = [];
		
		/*получаем группы плательщиков*/ 
		$.ajax({
			type: 'GET',
			dataType: 'json',
			url: JSONFolder+'customers-groups.json',
			success: function(data){
				$.each(data, function(key, value){
					groups[value.id] = value.title;				
				});		
				/*получаем плательщиков*/ 
				$.ajax({
					type: 'GET',
					dataType: 'json',
					url: JSONFolder+'customers.json',
					success: function(data){					
						
						 $.each(data, function(key, value){
						
							var tmpArr = [];
							tmpArr['id'] = value.id;
							tmpArr['fio'] = value.lastname;												
							tmpArr['fio'] += ' '+value.firstname; 
							if(value.middlename !== null)
							{
								tmpArr['fio'] += ' ' + value.middlename;
							}		
							tmpArr['email'] = (value.email !== null) ? value.email : '';
							tmpArr['phone'] = (value.phone !== null) ? value.phone : '';
							
							tmpArr['groups'] = '';						
							var arrCount = o.getKeysCount(value.groups);							
							
							if(arrCount > 0){
								
								if(arrCount == 1)
								{
									tmpArr['groups'] = groups[value.groups[0]];
								}
								else
								{									
									for(var i in value.groups){
										tmpArr['groups'] += groups[value.groups[i]] + ' ';										
									}
								}
							}											
							customers[key] = tmpArr;					
						
						});
						
						/*добавляем на страницу*/ 
						$.each(customers, function(key, value){
							var tr = $('<tr>');
							 $('<td><input type="checkbox" name="user_id"  value="'+value['id']+'" id="p-id'+value['id']+'" class="j-uid" /><label for="p-id'+value['id']+'"></label></td></td>').appendTo(tr);
							 $('<td class="p-fio">'+value['fio']+'</td>').appendTo(tr);
							 $('<td class="p-email">'+value['email']+'</td>').appendTo(tr);
							 $('<td class="p-phone">'+value['phone']+'</td>').appendTo(tr); 
							 $('<td class="p-groups">'+value['groups']+'</td>').appendTo(tr); 
							o.dataTable.append(tr);
						});						
						o.dataTable.show();							
					}
				});
				
				
			}
		})	
	}
	
	/*Получаем количество свойств в объекте*/ 
	this.getKeysCount =  function (obj){
		  var counter = 0;
		  for (var key in obj) {
			counter++;
		  }
		  return counter;
	}
	
	this.init = function(){
		o.popupOpener.click(function(){
			o.popupOpen();		
		});
		
		o.chkbxSelall.on('click',function(){
			o.slctAllItems();
		});
		
		
		o.dataTable.on('click', o.frmCheckbx, function(){
			o.CheckCountSelItems();
		})
		
		o.actionStarter.click(function(event){
			var actID = $(this).data('actname');
						
			switch(actID){
				case 'payers':
					o.loadPayers();
				break
				case 'providers':
					// функция для Поставщиков услуг
				break
				case 'arch_payments':
					// функция для Архив Платежей
				break
				case 'payments':
					// функция для Платежей
				break
				default:
				return null;
			}
			
			var rplLnk = $('<span class="active-lnk">'+$(this).text()+'</span>');
			$(this).replaceWith(rplLnk);
			event.preventDefault();
			
						
		});
	}
	
	this.init();
	
}


$(function(){
var paymentPage = new PaymentFrm({
	root: '.wrap',
	actionStarter: '.j-item',
	popupOpener: '.j-popup',
	popupCloser: '.j-pclose',
	popupTrg: '.addform-wrap',
	frmCheckbx: '.j-uid',
	chkbxSelall: '#j-selall',
	srcnFld: '.j-search',
	dataTable: '.payer-data'
 });
});