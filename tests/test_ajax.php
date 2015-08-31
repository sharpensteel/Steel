<?php


function generateData(){
	if(!session_id()) session_start();

	$totalRecords = 300;



	if(isset($_SESSION['test_ajax_data'])){
		return $_SESSION['test_ajax_data'];
	}
	$names = ["Magnum", "colt", "Railgun", "MP-40", "AK-47", 'AK-74', 'TT', 'Nuclear'];

	$rows = [];

	$decrBody = "Object.getOwnPropertyNames() returns an array whose elements are strings corresponding to the enumerable and non-enumerable properties found directly upon obj. The ordering of the enumerable properties in the array is consistent with the ordering exposed by a for...in loop (or by Object.keys()) over the properties of the object. The ordering of the non-enumerable properties in the array, and among the enumerable properties, is not defined.";



	for($i = 0; $i < $totalRecords; $i++){

		$descr = substr($decrBody, 0, rand(0, strlen($decrBody)-1));
		$descr = substr($descr, rand(0, strlen($descr)-1));

		$row = [
			'id' => $i+1,
			'name' => $names[ rand(0, count($names)-1 )],
			'capacity' => 10 * rand(1,20),
			'description' => $descr,
			'is_real' => rand(0,1),
			'cost' => rand(0,1000000)." $"
		];
		$rows[] = $row;
	}


	$_SESSION['test_ajax_data'] = $rows;
	return $rows;
}


class Steel__UserReadableException extends \Exception{

}

function endpointTest(){
	$response = [];
	$requests = $_REQUEST['SteelPackets'];
	foreach ($requests as $request){
		try{
			switch($request['operation']){
			case 'FETCH':
				/*
				$packet:
				(class Steel.PacketOutGridFetch)
				array(3) {
					["operation"]=>
					string(5) "FETCH"
					["offset"]=>
					string(1) "0"
					["limit"]=>
					string(1) "0"
				}
				 */

				$offset = isset($request["offset"]) ? (int)$request["offset"] : 0;
				$limit = isset($request["limit"]) ? (int)$request["limit"] : 0;
				$sorting = isset($request["sorting"]) ? $request["sorting"] : [];

				$data = generateData();

				$totalRows = count($data);


				if($sorting && count($sorting)){
					usort($data, function ($item1, $item2) use ($sorting) {
						foreach($sorting as $sortCouple){
							$colName = $sortCouple[0];
							$direction = (int)$sortCouple[1];
							if ($item1[$colName] == $item2[$colName]) continue;
							return $direction * ($item1[$colName] > $item2[$colName] ? 1 : -1);
						}
						return 0;
					});
				}



				$rows = array_slice($data, $offset, $limit ? $limit : $totalRows);

				/* @var mixed[] fields same as in class Steel.PacketInGridFetch */
				$packetOut = [
					'operation' => 'AFTER_FETCH',
					'totalRows' => $totalRows,
					'offset' => $offset,
					'rows' => $rows,
					'sorting' => $sorting,
					'keyColumnName' => 'id'
				];

				$response[] = $packetOut;

				break;
			default:
				throw new Exception('operation '.$request['operation'].' not supported');
			}
		}
		catch(\Exception $e){
			error_log( $e->getFile().":".$e->getLine().":  ".$e->getMessage() );
			http_response_code(500);
			$errorMessage = 'server responds error!';
			if($e instanceof  Steel__UserReadableException){
				$errorMessage = $e->getMessage();
			}
			$packetOut = [
				'operation' => 'ERROR',
				'errorMessage' => $errorMessage,
				'errorRequest' => $request,
			];
			$response[] = $packetOut;
		}
	}

	header('Content-Type: application/json');
	echo json_encode($response,JSON_UNESCAPED_UNICODE);
	exit;
}

if(isset($_REQUEST['SteelPackets']) ){

	endpointTest();

}

$native_es6 = true;
$script_type = $native_es6 ? "text/javascript" : "text/babel";
?>

<html>
	<body style="font-family:Verdana; font-size:12px;">
		<script src="../../jquery-1.11.1.min.js"></script>

		<?php if(!$native_es6){?><script src="../../babel/browser.min.js"></script><?php } ?>

		<link type="text/css" rel="stylesheet" href="../css/base.css">

		<script type="<?=$script_type?>" src="../Core.js"></script>
		<script type="<?=$script_type?>" src="../DataProviderAjax.js"></script>
		<script type="<?=$script_type?>" src="../Grid.js"></script>

		<script type="<?=$script_type?>">
			"use strict";

			$(function(){


				var testDataproviderAjax = new Steel.DataProviderAjax("<?=$_SERVER['REQUEST_URI']?>");


				var settings = {
					dataProvider: testDataproviderAjax,
					sorting: [ ['name', 1], ['capacity', -1] ],
					limit: 20,
					fixedWidth:1200,
					fixedHeight:500,
				}

				var grid = new Steel.Grid(settings);
				window.g = grid;


				grid.renderInitial($('.grid_parent'));

				grid.fetchData();

			})

		</script>

		<div class="grid_parent">

		</div>

	</body>
</html>
