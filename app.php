<?
session_start();

// данные для авторизации
$arrUser = Array(
	'username' => 'demo', 
	'password' => 'demo'
);

// группа по-умолчанию при регистрации («Посетители»)	
$defPayerGroup = "3";
	
if(isset($_GET["act"])){
	if($_GET["act"] == "login"){
		if(isset($_POST['username']) && isset($_POST['password'])){
			// авторизуем пользователя и записываем с $_SESSION['is_athorized']
			if($_POST['username'] == $arrUser['username'] && $_POST['password'] == $arrUser['password']){
				$_SESSION['is_athorized'] = true;
			}
			else{
				header($_SERVER['SERVER_PROTOCOL'].' 404 Not Found');
			}
		}			
	}
	if($_GET["act"] == "logout"){
		session_destroy();
	}
	if($_GET["act"] == "getsession"){
		if($_SESSION['is_athorized'] === true){
			$jsonUser = json_encode($arrUser);
			echo $jsonUser;
		}
		else
		{
			header($_SERVER['SERVER_PROTOCOL'].' 404 Not Found');
		}
	}
	if($_GET["act"] == "addpayer"){
		if(!empty($_POST['name']) && !empty($_POST['email']) && !empty($_POST['phone'])){
						
			$newPayer = Array(
				"name" => trim($_POST['name']),
				"email" => trim($_POST['email']),
				"phone" => trim($_POST['phone']),				
			);
			
			try{
				$db = new PDO('sqlite:'.$_SERVER["DOCUMENT_ROOT"].'/data/payers.sqlite');
				$query = "INSERT INTO payers (name, email, phone) VALUES ('".$newPayer['name']."','".$newPayer['email']."','".$newPayer['phone']."')";
				$db->exec($query);
				$liID = $db->lastInsertId();
				$query2 = "INSERT INTO payergroups (payerID, groupID) VALUES ('".$liID."', '".$defPayerGroup."')";
				$db->exec($query2);
			}
			catch(PDOException $e){
				die($e->getMessage());
			}
		
			$newPayerJSON = json_encode($newPayer);
			echo $newPayerJSON;
		}		
	}
	if($_GET["act"] == "delpayer"){
		if(isset($_POST['payers']) && count($_POST['payers']) > 0){
		
			/*при удалении используем транзакцию*/
		
			try{						
				$db = new PDO('sqlite:'.$_SERVER["DOCUMENT_ROOT"].'/data/payers.sqlite','','',array(PDO::ATTR_PERSISTENT => true));					
			}catch(PDOException $e){
				$e->GetMessage("Не удалось подключиться");
			}
			
			try{
				$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
				
				$db->beginTransaction();
				$clause = implode(", ", $_POST['payers']);
				$res1 = $db->exec("DELETE FROM payers WHERE payers.id IN ($clause)");
				$res2 = $db->exec("DELETE FROM payergroups WHERE payergroups.payerID IN ($clause)");
							
				$db->commit();
				
			}catch(PDOException $e){
				$dbh->rollBack();
				die($e->GetMessage());
			}				
		}
	}
	if($_GET["act"] == "detail"){
		
		if(!empty($_GET["id"]))
		{
			$id = (int) $_GET["id"];
			try{
				// подключаемся к БД
				$db = new PDO('sqlite:'.$_SERVER["DOCUMENT_ROOT"].'/data/payers.sqlite');
				
				$query = "SELECT COUNT(*) FROM payers WHERE id=".$id;
				if($res = $db->query($query)){					
					if($cnt = $res->fetchColumn() > 0){
						// получаем все группы
						
						$query = "SELECT * FROM groups";
						$st = $db->query($query);
						
						if($res = $st->fetchAll(PDO::FETCH_ASSOC)){
							$arrGroups = Array();
							foreach($res as $k=>$v){
								$arrGroups[$k] = $v;
							}
						}
						
						// получаем данные пользователя по ID и текущие группы
						$query = "SELECT p.id, p.name, p.email, p.phone, g.id AS groupID, g.gname FROM payers AS p 
									LEFT JOIN payergroups as pg ON p.id = pg.payerID 
									LEFT JOIN groups as g ON pg.groupID = g.id WHERE p.id=".$id;
											
						$st = $db->query($query);
												
						if($res = $st->fetchAll(PDO::FETCH_ASSOC)){
							$arrPayer = Array();
							
							foreach($res as $key => $arrVal){
								if(count($arrPayer) == 0){
									$arrPayer["id"] = $arrVal["id"];
									$arrPayer["name"] = $arrVal["name"];
									$arrPayer["email"] = $arrVal["email"];
									$arrPayer["phone"] = $arrVal["phone"];
									$arrPayer["curgroups"] = Array($arrVal["groupID"]);
									$arrPayer["groups"] = $arrGroups;
								}
								else{
									$arrPayer["curgroups"][] = $arrVal["groupID"];
								}
							}												
						}				
						
						// если успешно, возвращаем в виде JSON
						header('Content-Type: text/html; charset= utf-8');
						$jsonPayer = json_encode($arrPayer);
						echo $jsonPayer;					
					}	
					else{
						header($_SERVER['SERVER_PROTOCOL'].' 404 Not Found');
					}
				}
			}
			catch(PDOException $e){
				die($e->GetMessage());
			}			
		}		
		else{
			header($_SERVER['SERVER_PROTOCOL'].' 404 Not Found');
		}
	}
	if($_GET["act"] == "save"){
		// обязательные поля
		if(!empty($_POST['id']) && !empty($_POST['name']) && count($_POST['groups']) > 0){
			$id = (int) $_POST['id'];
			$name = trim($_POST['name']);
			$email = (!empty($_POST['email'])) ? trim($_POST['email']) : '';
			$phone = (!empty($_POST['phone'])) ? trim($_POST['phone']) : '';
			$groups = $_POST['curgroups'];
			
			/*при редактировании используем транзакцию*/
			try{						
				$db = new PDO('sqlite:'.$_SERVER["DOCUMENT_ROOT"].'/data/payers.sqlite','','',array(PDO::ATTR_PERSISTENT => true));					
			}catch(PDOException $e){
				$e->GetMessage("Не удалось подключиться");
			}
			
			try{
				$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
				
				$db->beginTransaction();
				
				$res = $db->exec("UPDATE payers SET name='".$name."', email='".$email."', phone='".$phone."' WHERE id='".$id."'");
				$res2 = $db->exec("DELETE FROM payergroups WHERE payerID = '".$id."'");
				
				$query = "";
				foreach($groups as $arrval){
					$query .= "INSERT INTO payergroups (payerID, groupID) VALUES ('".$id."', '".$arrval."');";
				}
				$res3 = $db->exec($query);				
				$db->commit();
				
				$total = $res + $res2 + $res3;				
				
				echo $total;				
			}catch(PDOException $e){
				$dbh->rollBack();
				die($e->GetMessage());
			}			
		}	
	}
	if($_GET["act"] == "getpayments"){
		// получаем данные о платежах
		$arPayments = Array();
		
		try{
			$db = new PDO('sqlite:'.$_SERVER["DOCUMENT_ROOT"].'/data/payers.sqlite');
			$query = "SELECT p.id, p.name, pmt.payer, pmt.pmt_date, pmt.pmt_summ, pmt.pmt_comment 
			FROM payers as p, payments as pmt WHERE pmt.payer=p.id";
			
			$st = $db->query($query);
			
			while($res = $st->fetch(PDO::FETCH_ASSOC))
			{
				$arPayments[] = array(
					"pid" => $res["id"],
					"pmtdate" => $res["pmt_date"],
					"pname" => $res["name"],
					"pmtsumm" => $res["pmt_summ"],
					"pmtcomm" => $res["pmt_comment"]
				); 
			}
			
			$jsonPayments = json_encode($arPayments);
			echo $jsonPayments;
			
		}catch(PDOException $e){
			die($e->GetMessage());
		}
	}
}
else{
	$arrPayers = Array();
	try{
			$db = new PDO('sqlite:'.$_SERVER["DOCUMENT_ROOT"].'/data/payers.sqlite');
			$query = "SELECT p.id, p.name, p.email, p.phone, g.id AS groupID, g.gname FROM payers AS p 
					LEFT JOIN payergroups as pg ON p.id = pg.payerID 
					LEFT JOIN groups as g ON pg.groupID = g.id";
			$st = $db->query($query);
			
			while($res = $st->fetch(PDO::FETCH_ASSOC))
			{
				if(!array_key_exists($res["id"], $arrPayers)){
					$arrPayers[$res["id"]] = array(
						"id"=>$res["id"],
						"name" => $res["name"],
						"email" => $res["email"],
						"phone" => $res["phone"],
						"groups" => $res["gname"]
					);
				}
				else{
					$arrPayers[$res["id"]]["groups"] .= ", ".$res["gname"];
				}			
			}
			
			sort($arrPayers);
			
			header('Content-Type: text/html; charset= utf-8');
			$jsonPayers = json_encode($arrPayers);
			echo $jsonPayers;
	}
	catch(PDOException $e){
		die($e->getMessage());
	}
}
?>