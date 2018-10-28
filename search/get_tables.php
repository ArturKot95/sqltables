<?php

$config = include("../db/config.php");
$db = new PDO($config["db"], $config["username"], $config["password"]);

$result = array();

switch($_SERVER["REQUEST_METHOD"]) {
    case "GET":
      try {
        $sql = "SHOW TABLES";

        $q = $db->prepare($sql);
        $q->execute();
        $result['result'] = $q->fetchAll();
      }

      catch (PDOException $e) {
        $result['error'] = $e->getMessage();
      }

      break;
}

header("Content-Type: application/json");
echo json_encode($result);

?>
