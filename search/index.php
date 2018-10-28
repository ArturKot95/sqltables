<?php

$config = include("../db/config.php");
$db = new PDO($config["db"], $config["username"], $config["password"]);
$db->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
$db->setAttribute( PDO::ATTR_EMULATE_PREPARES, FALSE );


ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$result = array();

switch($_SERVER["REQUEST_METHOD"]) {
    case "GET":
      $data = json_decode($_GET['query'], true);

      try {
        // Połącz bazowe zapytanie z klauzulami ORDER BY i LIMIT jeśli są zdefiniowane
        $q_order = empty($data["order"]["by"]) == true ? "" : (" ORDER BY " . $data["order"]["by"] . ($data["order"]["desc"] == true ? " DESC" : ""));
        $q_limit = $data["limit"] == 0 ? "" : (" LIMIT " . $data["limit"]);

        $sql = "SELECT " . $data['query'] . $q_order . $q_limit;
        $q = $db->prepare($sql);

        $result['query'] = $sql;

        if ($q->execute()) {
          $columnsToDelete = array();
          for ($i = 0; $i < $q->columnCount(); $i++) {
            $meta = $q->getColumnMeta($i);
            // Znajdż w kolumnach danych typu binarnego
            if ($meta["native_type"] == "BLOB" || $meta["native_type"] == "GEOMETRY") {
              $columnsToDelete[] = $meta["name"];
            }
          }
          // ... i mniej potrzebną kolumnę last_update
          $columnsToDelete[] = "last_update";

          while ($row = $q->fetch(PDO::FETCH_ASSOC)) {
            foreach ($columnsToDelete as $column) {
              // Usuń wskazane kolumny z wyniku
              unset($row[$column]);
            }
            $result["result"][] = $row;
          }
        }
      }

      catch (Exception $e) {
        $result['error'] = $e->getMessage();
      }

      break;
}


header("Content-Type: application/json");
echo json_encode($result);

?>
