let db;

const request = indexedDB.open('bubget', 1);
request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('funds', { autoIncrement: true });
  };
  request.onsuccess = function(event) {
      db = event.target.result;
      if (navigator.onLine) {
        uploadFunds();
      }
    };

    request.onerror = function(event) {
        console.log(event.target.errorCode);

    };
function saveRecord(record) {
    const transaction = db.transaction(['funds'],'readwrite');

    const budgetObjectStore = transaction.objectStore('funds');

    budgetObjectStore.add(record);
};

function uploadFunds() {
    const transaction = db.transaction.object(['funds'],'readwrite');
    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {

        if (getAll.result.length > 0) {
            fetch ('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
                }
        })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }

          const transaction = db.transaction(['funds'],'readwrite');

          const budgetObjectStore = transaction.objectStore('funds');
          budgetObjectStore.clear();
        })
        .catch(err => {
            console.log(err);
        });
    }
};

};

window.addEventListener('online',uploadFunds);