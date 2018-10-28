class SqlTable {
  constructor(query) {
    this._callbacks = {};

    this.limit = 0;
    this.order = {by: "", desc: false};
    this.query = query.trim();

    this.tableEl = document.createElement("table");
    this.tableEl.className = "display-table";
  }

  on(event, callback) {
    if (typeof callback === "function") {
      this._callbacks[event] = callback;
    }
  }

  _callback(event) {
    return this._callbacks[event] ? this._callbacks[event] : new Function();
  }

  _buildTable(result) {
    // Oczyść tabelę, jeśli to nie pierwsze zapytanie
    while (this.tableEl.firstChild) {
      this.tableEl.removeChild(this.tableEl.firstChild);
    }

    /* --- CAPTION & HEAD --- */
    // Nagłówki zwrócone przez sql będą nagłówkami tabeli
    let headers = Object.keys(result[0]);

    let captionEl = document.createElement("caption");
    this.tableEl.appendChild(captionEl);

    let theadEl = document.createElement('thead');
    for (let i in headers) {
      let thEl = document.createElement('th');
      thEl.innerText = headers[i];
      thEl.addEventListener('click', e => {
        if (this.order.by === e.target.innerText) {
          this.order.desc = !this.order.desc;
        }
        this.order.by = e.target.innerText;
        this.getAndDisplay();
      });
      theadEl.appendChild(thEl);
    }
    this.tableEl.appendChild(theadEl);

    /* --- BODY --- */
    let tbodyEl = document.createElement('tbody');
    for (let row in result) {
      let trEl = document.createElement('tr');
      for (let cell in headers) {
        let tdEl = document.createElement('td');
        tdEl.innerText = result[row][headers[cell]];
        trEl.appendChild(tdEl);
      }
      tbodyEl.appendChild(trEl);
    }
    let trEl = document.createElement('tr');

    this.tableEl.appendChild(tbodyEl);

    /* --- CLOSE TABLE BUTTON --- */
    let closeButton = document.createElement("button");
    closeButton.className = "close-button";
    closeButton.innerText = "close";
    closeButton.addEventListener("click", e => this.delete());
    this.tableEl.appendChild(closeButton);

    // Wyślij callback, że tabela została pomyślnie utworzona
    this._callback("DOMready").apply(this);
  }

  set tableTitle(newTitle) {
    let captionEl = this.tableEl.querySelector("caption");
    captionEl.innerText = newTitle;
  }

  getAndDisplay(query = this.query) {
    this.query = query;

    this._callback("beforeLoad").apply(this);

    let xhr = new XMLHttpRequest();
    let queryJson = JSON.stringify({
      query: query,
      limit: this.limit > 0 ? this.limit : 0,
      order: this.order
    });

    xhr.open('GET', '/search?query=' + queryJson);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send();

    let self = this;
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        let data = JSON.parse(xhr.responseText);
        if (data.error) {
          self._callback("loadError").apply(self, [data]);
        } else {
          self._buildTable(data.result);
          self._callback("loadSuccess").apply(self, [data]);
        }
      }
    }
  }

  delete() {
    this.tableEl.parentNode.removeChild(this.tableEl);
  }
}
