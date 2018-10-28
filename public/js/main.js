(function () {
  let savedQueriesDiv = document.getElementById('saved-queries');
  let queryFormEl = document.getElementById("query-form");

  if (queryFormEl.addEventListener) {
    queryFormEl.addEventListener("submit", function(e) {
      e.preventDefault();
      let q = queryFormEl.querySelector("#query-input").value;
      query(q);
    });
  }

  function query(q) {
    let sqlTable = new SqlTable(q);
    sqlTable.on("loadError", function(data) {
      messageBox.display(data.error);
    });
    sqlTable.on("loadSuccess", function(data) {
      this.tableTitle = data.query;
      queryFormEl.querySelector("#query-input").value = this.query;
      messageBox.flush();
    });
    sqlTable.on("DOMready", function() {
      let captionEl = this.tableEl.querySelector("caption");
      captionEl.addEventListener("click", e => savedQueriesDiv.appendChild(createQueryButton(this.query)));

      // Wstaw tabelę, jeśli nie istnieje w dokumencie
      if (!document.getElementById('container').contains(this.tableEl)) {
        document.getElementById('container').appendChild(this.tableEl);
      }
    });
    sqlTable.on("beforeLoad", function() {
      this.limit = parseInt(document.getElementById("limit-input").value);
    });
    sqlTable.getAndDisplay();
  }

  let messageBox = {
    messageEl: document.getElementById('message'),
    display: function (text) {
      this.messageEl.innerText = text;
    },
    flush: function() {
      this.display("");
    }
  }
  // Tworzy spana mający 2 buttony,
  function createQueryButton(q, title = q) {
    let queryButton = document.createElement('button'),
        deleteButton = document.createElement('button'),
        spanEl = document.createElement('span');

      queryButton.innerText = title;
      queryButton.className = "query-button";
      queryButton.addEventListener('click', e => query(q));

      deleteButton.innerText = "delete";
      deleteButton.className = "delete-button";
      deleteButton.addEventListener('click', e => spanEl.parentNode.removeChild(spanEl));

      spanEl.appendChild(queryButton);
      spanEl.appendChild(deleteButton);
      spanEl.className = "query-button-span";

      return spanEl;
  }

  // Pobierz listę tabel z bazy danych, dodaj buttony pytające o poszczególne tabele
  {
    tableQueriesDiv = document.getElementById('table-queries');
    let xhr = new XMLHttpRequest();
    xhr.open('get', '/search/get_tables.php');
    xhr.send();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        let data = JSON.parse(xhr.responseText);
        if (data.error) {
          messageBox.display(data.error);
        } else {
          data.result.forEach(function (record) {
            //saveQuery(tableQueriesDiv, "* FROM " + record[0], record[0]);
            tableQueriesDiv.appendChild(createQueryButton("* FROM " + record[0], record[0]));
          });
        }
      }
    }
  }

  // Dodaj parę przykładowych zapytań
  savedQueriesDiv.appendChild(createQueryButton('first_name, last_name FROM actor'));
  savedQueriesDiv.appendChild(createQueryButton('actor.first_name, actor.last_name, customer.customer_id FROM actor INNER JOIN customer ON actor.first_name=customer.first_name AND actor.last_name=customer.last_name'));
  savedQueriesDiv.appendChild(createQueryButton('language.name AS "LANGUAGE", film.title as "TITLE" FROM language CROSS JOIN film'));
  savedQueriesDiv.appendChild(createQueryButton('f.title, f.language_id, l.name AS "language" FROM film f LEFT JOIN language l ON f.language_id=l.language_id'));
  savedQueriesDiv.appendChild(createQueryButton('city.city, city.country_id, country.country_id, country.country FROM city RIGHT JOIN country ON city.country_id=country.country_id'));
  savedQueriesDiv.appendChild(createQueryButton('city.city, country.country, country.country_id FROM city CROSS JOIN country'));
  savedQueriesDiv.appendChild(createQueryButton('actor.first_name, actor.last_name, film.title FROM actor INNER JOIN film_actor ON actor.actor_id=film_actor.actor_id INNER JOIN film ON film.film_id=film_actor.film_id'));
})();
