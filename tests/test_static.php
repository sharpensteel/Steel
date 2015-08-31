<?php



$native_es6 = true;
$script_type = $native_es6 ? "text/javascript" : "text/babel";
?>

<html>
	<body>
		<script src="../../../libs/jquery-1.11.1.min.js"></script>
		
		<?php if(!$native_es6){?><script src="../../../libs/babel/browser.min.js"></script><?php } ?>
		
		<link type="text/css" rel="stylesheet" href="../css/base.css">
		
		<script type="<?=$script_type?>" src="../Core.js"></script>
		<script type="<?=$script_type?>" src="../DataProviderStatic.js"></script>
		<script type="<?=$script_type?>" src="../Grid.js"></script>
		
		<script type="<?=$script_type?>">
			"use strict";
			
			$(function(){
				var grid = new Steel.Grid();
				window.g = grid;
				
				
				var testDataproviderStatic = new Steel.DataProviderStatic(/*[
					new Steel.DataProvidDataProviderFielderField({name:'id',title:'Id'}),
					new Steel.DataProviderField({name:'name',title:'Name'}),
					new Steel.DataProviderField({name:'description',title:'Description'})
				]*/null,[
					{id:101, name: 'Dammmah', description: 'Ezfkeaskld als asdasd'},
					{id:102, name: 'Dammmah2', description: ''},
					{id:103, name: 'Dammmah3', description: '2331 !@#! @# !@#! @#@!#@<>'}
				]);
				
				
				var testDataproviderAjax = testDataproviderStatic;
				
				grid.settings.dataProvider = testDataproviderStatic;
				
				window.tdp = grid.dataProvider;
				
				grid.renderInitial($('.grid_parent'));
				
				grid.fetchData();

		
			})
			
		</script>
		
		<div class="grid_parent">
			
		</div>
		
	</body>
</html>
