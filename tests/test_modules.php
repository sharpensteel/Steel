<?php



$native_es6 = true;
$script_type = $native_es6 ? "text/javascript" : "text/babel";
?>

<html>
<body>
<script src="../../../libs/jquery-1.11.1.min.js"></script>

<?php if(!$native_es6){?><script src="../../../libs/babel/browser.min.js"></script><?php } ?>
<script src="../../../libs/es6-module-loader/es6-module-loader.js"></script>



<script type="<?=$script_type?>">
	"use strict";

	System.import('al.js').then(function(module) {
		console.log("yeah");
	}).catch(function (e) {
		console.error(e);
	});



	$(function(){


	})

</script>

<div class="grid_parent">

</div>

</body>
</html>
