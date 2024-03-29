window.onload = function () {
  const yearSwitch = document.getElementById('yearSwitch');
  const request = indexedDB.open('scheduleDatabase', 1);
  var courseYear = 1;

  // Handle database open or upgrade
  request.onupgradeneeded = event => {
    const db = event.target.result;
    const objectStore = db.createObjectStore('yearSelection', { keyPath: 'id' });
  };

  // Handle database opened successfully
  request.onsuccess = event => {
    const db = event.target.result;

    // Read checkbox state from IndexedDB and update the checkbox
    const transaction = db.transaction('yearSelection', 'readonly');
    const objectStore = transaction.objectStore('yearSelection');
    const getRequest = objectStore.get('yearSwitch');

    getRequest.onsuccess = () => {
      if (getRequest.result) {
        yearSwitch.checked = getRequest.result.checked;
        if (getRequest.result.checked == true) {
          courseYear = 2;
        }
      }
    };
  };

  // Handle errors
  request.onerror = event => {
    console.error('Error opening database', event.target.error);
  };

  setTimeout(() => {
    scrapeData(2, courseYear);
  }, 500);

}

async function getDbRecord() {
  let courseYear;

  // Wrap the request.onupgradeneeded in a promise since it's not directly awaitable
  const dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open('scheduleDatabase', 1);

    request.onerror = (event) => {
      console.error("Error opening database", event);
      reject("Error opening database");
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('yearSelection')) {
        db.createObjectStore('yearSelection', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
  });

  // Wait for the database to open and the object store to be ready
  const db = await dbPromise;

  // Wrap the transaction and get request in a promise
  const getRequestPromise = new Promise((resolve, reject) => {
    const transaction = db.transaction('yearSelection', 'readonly');
    const objectStore = transaction.objectStore('yearSelection');
    const getRequest = objectStore.get('yearSwitch');

    getRequest.onerror = (event) => {
      console.error("Error getting data from object store", event);
      reject("Error getting data from object store");
    };

    getRequest.onsuccess = () => {
      resolve(getRequest.result);
    };
  });

  // Wait for the get request to complete and process the result
  const result = await getRequestPromise;
  if (result) {
    yearSwitch.checked = result.checked;
    if (yearSwitch.checked) {
      courseYear = 2;
    } else {
      courseYear = 1;
    }
  }

  return courseYear;
}


async function scrapeData(searchOrToday, courseYear) {
  const yearSwitch = document.getElementById('yearSwitch');
  const request = indexedDB.open('scheduleDatabase', 1);
  courseYear = await getDbRecord();
  const loadingPopup = document.getElementById('loadingPopup');
  let selectedDate
  if (searchOrToday == 0) { // -8 days
    selectedDate = new Date(document.getElementById('datepicker').value);
    selectedDate.setDate(selectedDate.getDate() - 8);
    selectedDate = selectedDate.toISOString().split('T')[0];
    document.getElementById('datepicker').value = selectedDate;
  } else if (searchOrToday == 1) { //value from datepicker
    selectedDate = document.getElementById('datepicker').value;
  } else if (searchOrToday == 2) { // today
    selectedDate = new Date().toISOString().slice(0, 10);
    document.getElementById('datepicker').value = selectedDate;
  } else if (searchOrToday == 3) { // +8 days
    selectedDate = new Date(document.getElementById('datepicker').value);
    selectedDate.setDate(selectedDate.getDate() + 8);
    selectedDate = selectedDate.toISOString().split('T')[0];
    document.getElementById('datepicker').value = selectedDate;
  }

  let data = null;
  if (selectedDate === '') {
    selectedDate = new Date().toISOString().slice(0, 10);
    document.getElementById('datepicker').value = selectedDate;
  }

  selectedDate = new Date(selectedDate);
  let d = selectedDate.getDate();
  let m = selectedDate.getMonth() + 1;
  let y = selectedDate.getFullYear();

  selectedDate = y + "-" + m + "-" + d;

  loadingPopup.style.display = 'flex';
  fetch(`/scrape?date=${selectedDate}&year=${courseYear}`)
    .then(response => response.text())
    .then(result => {
      data = JSON.parse(result); // Parse the result as JSON
      const container = document.getElementById("container");
      container.innerHTML = ''; // Clear the container
      loadingPopup.style.display = 'none';

      selectedDate = new Date(selectedDate)

      let daysOfTheWeek = getWeekDates(selectedDate)

      const happyMan = `
          <svg fill="#000000" height="60px" width="60px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	 viewBox="0 0 254.3 256" xml:space="preserve">
<path d="M140.4,18.6c-12.2,0-22.1,9.9-22.1,22.1s9.9,22.1,22.1,22.1s22.1-9.9,22.1-22.1S152.6,18.6,140.4,18.6z M225.4,56.3
	l-69.2,42.3L147.3,206c-0.5,7.1-6.5,12.6-13.6,12.6c-0.3,0-0.6,0-0.9,0l-43-2.7c-2.7-0.2-5.2-1.1-7.3-2.7l23.5-23.6l15.1,0.9
	l1.5-21.4h-7.4l-38.4,38.6c-2.7,2.6-6.1,4-9.6,4c-3.4,0-6.8-1.3-9.5-3.8l-30.4-29.4c-5.4-5.2-5.5-13.8-0.3-19.2
	c5.2-5.4,13.8-5.5,19.2-0.3L67.1,179l25.7-25.8l6.7-70L53,20.8c-3.9-5.2-2.8-12.6,2.4-16.4c5.2-3.9,12.6-2.8,16.4,2.4l42.7,57.2
	l36.9,10l61.7-37.7c5.5-3.4,12.8-1.6,16.2,3.9C232.7,45.7,230.9,52.9,225.4,56.3z M92.2,226.4h7.9v19.7h-7.9V226.4z M76.5,226.4h7.9
	V254h-7.9V226.4z M60.7,226.4h7.9v19.7h-7.9V226.4z"/>
</svg>
          `

      // #####################
      //      Group One
      // #####################

      let mainRow = document.createElement("div");
      mainRow.classList.add("mainRow");
      container.appendChild(mainRow);

      let groupName = document.createElement("div");
      groupName.classList.add("groupName");
      mainRow.appendChild(groupName);
      groupName.innerHTML = "SKUPINA I";

      if (courseYear == 2) {
        groupName.innerHTML = "SKUPINA I & II"
      }

      let groupRow = document.createElement("div");
      groupRow.classList.add("groupOne");
      mainRow.appendChild(groupRow);

      if (data.groupOne.monday.length == 0 && data.groupOne.tuesday.length == 0 && data.groupOne.wednesday.length == 0 && data.groupOne.thursday.length == 0 && data.groupOne.friday.length == 0) {
        let freeDay = document.createElement("div");
        freeDay.classList.add("freeDay");
        groupRow.appendChild(freeDay);
        freeDay.innerHTML = "Ta teden ni pouka." + happyMan;
      } else {
        let dayCol = document.createElement("div");
        dayCol.classList.add("dayCol");
        groupRow.appendChild(dayCol);

        let dayDate = document.createElement("div");
        dayDate.classList.add("dayDate");
        dayCol.appendChild(dayDate);
        dayDate.innerHTML = daysOfTheWeek[0]

        for (let i = 0; i < data.groupOne.monday.length; i++) {
          data.groupOne.monday[i] = data.groupOne.monday[i].split("|");
          createGroupRow(data.groupOne.monday[i], dayCol, 1);
        }

        let dayCol2 = document.createElement("div");
        dayCol2.classList.add("dayCol");
        groupRow.appendChild(dayCol2);

        dayDate = document.createElement("div");
        dayDate.classList.add("dayDate");
        dayCol2.appendChild(dayDate);
        dayDate.innerHTML = daysOfTheWeek[1]

        for (let i = 0; i < data.groupOne.tuesday.length; i++) {
          data.groupOne.tuesday[i] = data.groupOne.tuesday[i].split("|");
          createGroupRow(data.groupOne.tuesday[i], dayCol2, 1);
        }

        let dayCol3 = document.createElement("div");
        dayCol3.classList.add("dayCol");
        groupRow.appendChild(dayCol3);

        dayDate = document.createElement("div");
        dayDate.classList.add("dayDate");
        dayCol3.appendChild(dayDate);
        dayDate.innerHTML = daysOfTheWeek[2]

        for (let i = 0; i < data.groupOne.wednesday.length; i++) {
          data.groupOne.wednesday[i] = data.groupOne.wednesday[i].split("|");
          createGroupRow(data.groupOne.wednesday[i], dayCol3, 1);
        }

        let dayCol4 = document.createElement("div");
        dayCol4.classList.add("dayCol");
        groupRow.appendChild(dayCol4);

        dayDate = document.createElement("div");
        dayDate.classList.add("dayDate");
        dayCol4.appendChild(dayDate);
        dayDate.innerHTML = daysOfTheWeek[3]

        for (let i = 0; i < data.groupOne.thursday.length; i++) {
          data.groupOne.thursday[i] = data.groupOne.thursday[i].split("|");
          createGroupRow(data.groupOne.thursday[i], dayCol4, 1);
        }

        let dayCol5 = document.createElement("div");
        dayCol5.classList.add("dayCol");
        groupRow.appendChild(dayCol5);

        dayDate = document.createElement("div");
        dayDate.classList.add("dayDate");
        dayCol5.appendChild(dayDate);
        dayDate.innerHTML = daysOfTheWeek[4]

        for (let i = 0; i < data.groupOne.friday.length; i++) {
          data.groupOne.friday[i] = data.groupOne.friday[i].split("|");
          createGroupRow(data.groupOne.friday[i], dayCol5, 1);
        }
      }

      // #####################
      //      Group Two
      // #####################

      if (courseYear == 1) {
        groupRow = document.createElement("div");
        groupRow.classList.add("groupTwo");
        container.appendChild(groupRow);

        groupName = document.createElement("div");
        groupName.classList.add("groupName");
        groupRow.appendChild(groupName);
        groupName.innerHTML = "SKUPINA II";

        if (data.groupOne.monday.length == 0 && data.groupOne.tuesday.length == 0 && data.groupOne.wednesday.length == 0 && data.groupOne.thursday.length == 0 && data.groupOne.friday.length == 0) {
          let freeDay = document.createElement("div");
          freeDay.classList.add("freeDay");
          groupRow.appendChild(freeDay);
          freeDay.innerHTML = "Ta teden ni pouka." + happyMan;
        } else {
          dayCol = document.createElement("div");
          dayCol.classList.add("dayCol");
          groupRow.appendChild(dayCol);

          for (let i = 0; i < data.groupTwo.monday.length; i++) {
            data.groupTwo.monday[i] = data.groupTwo.monday[i].split("|");
            createGroupRow(data.groupTwo.monday[i], dayCol);
          }

          dayCol2 = document.createElement("div");
          dayCol2.classList.add("dayCol");
          groupRow.appendChild(dayCol2);

          for (let i = 0; i < data.groupTwo.tuesday.length; i++) {
            data.groupTwo.tuesday[i] = data.groupTwo.tuesday[i].split("|");
            createGroupRow(data.groupTwo.tuesday[i], dayCol2);
          }

          dayCol3 = document.createElement("div");
          dayCol3.id = "dayCol3";
          dayCol3.classList.add("dayCol");
          groupRow.appendChild(dayCol3);

          for (let i = 0; i < data.groupTwo.wednesday.length; i++) {
            data.groupTwo.wednesday[i] = data.groupTwo.wednesday[i].split("|");
            createGroupRow(data.groupTwo.wednesday[i], dayCol3);
          }

          dayCol4 = document.createElement("div");
          dayCol4.classList.add("dayCol");
          groupRow.appendChild(dayCol4);

          for (let i = 0; i < data.groupTwo.thursday.length; i++) {
            data.groupTwo.thursday[i] = data.groupTwo.thursday[i].split("|");
            createGroupRow(data.groupTwo.thursday[i], dayCol4);
          }

          dayCol5 = document.createElement("div");
          dayCol5.classList.add("dayCol");
          groupRow.appendChild(dayCol5);

          for (let i = 0; i < data.groupTwo.friday.length; i++) {
            data.groupTwo.friday[i] = data.groupTwo.friday[i].split("|");
            createGroupRow(data.groupTwo.friday[i], dayCol5);
          }
        }
      }

    })
    .catch(err => {
      console.log(err);
    });
  // });

  function createGroupRow(data, dayCol, groupNo) {
    let courseTime = "";
    let courseType = "";
    let courseName = "";
    let courseLocation = "";
    let courseLecturer = "";
    let badgeClassName = "";

    const courseCard = document.createElement("div");
    if (groupNo == 1) {
      courseCard.classList.add("courseCard");
      badgeClassName = "badge";
    } else {
      courseCard.classList.add("courseCardTwo");
      badgeClassName = "badge1";
    }
    dayCol.appendChild(courseCard);

    courseTime = data[0];
    courseType = data[1];
    courseName = data[2];
    courseLocation = data[3];
    courseLecturer = data[4];

    const timePill = document.createElement("div");
    if (courseTime != undefined) {
      timePill.classList.add("pill");
      timePill.classList.add("time-pill");
      courseCard.appendChild(timePill);
      timePill.textContent = courseTime;
    }

    const namePill = document.createElement("div");
    if (courseName != undefined) {
      namePill.classList.add("pill");
      courseCard.appendChild(namePill);
      namePill.textContent = courseName;
    }

    const typeLocationPill = document.createElement("div");
    if (courseLocation != undefined || courseType != undefined) {
      typeLocationPill.classList.add("pill-container");
      courseCard.appendChild(typeLocationPill);
    }

    const locationPill = document.createElement("div");
    if (courseLocation != undefined) {
      locationPill.classList.add("pill");
      typeLocationPill.appendChild(locationPill);
      locationPill.textContent = courseLocation;
    }

    const typePill = document.createElement("div");
    if (courseType != undefined) {
      typePill.classList.add("pill");
      typeLocationPill.appendChild(typePill);
      typePill.textContent = courseType;
    }

    const lecturerPill = document.createElement("div");
    if (courseLecturer != undefined) {
      lecturerPill.classList.add("pill");
      courseCard.appendChild(lecturerPill);
      lecturerPill.textContent = courseLecturer;
    }

  }

  function getWeekDates(referenceDate) {
    const dayOfWeek = referenceDate.getDay();
    const daysToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(referenceDate);
    monday.setDate(referenceDate.getDate() - daysToMonday);

    const weekDates = [];
    for (let i = 0; i < 5; i++) {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + i);
      weekDates.push(toSloveneDate(currentDate));
    }

    return weekDates;
  }

  function toSloveneDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are zero-indexed
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  }

}
const yearSwitch = document.getElementById("yearSwitch")
const request = indexedDB.open('scheduleDatabase', 1);
request.onupgradeneeded = event => {
  const db = event.target.result;
  const objectStore = db.createObjectStore('yearSelection', { keyPath: 'id' });
};

request.onsuccess = event => {
  const db = event.target.result;

  // Read checkbox state from IndexedDB and update the checkbox
  const transaction = db.transaction('yearSelection', 'readonly');
  const objectStore = transaction.objectStore('yearSelection');
  const getRequest = objectStore.get('scheduleDatabase');

  getRequest.onsuccess = () => {
    if (getRequest.result) {
      yearSwitch.checked = getRequest.result.checked;
    }
  };
};

request.onerror = event => {
  console.error('Error opening database', event.target.error);
};

yearSwitch.addEventListener('change', event => {
  const db = request.result;
  const transaction = db.transaction('yearSelection', 'readwrite');
  const objectStore = transaction.objectStore('yearSelection');

  const checkboxState = {
    id: 'yearSwitch',
    checked: event.target.checked
  };

  const putRequest = objectStore.put(checkboxState);

  let courseYear = 1;
  if (event.target.checked) {
    courseYear = 2;
  }

  scrapeData(2, courseYear);
});

const openPopupButton = document.getElementById('openPopupButton');
const closePopupButton = document.getElementById('closePopupButton');
const popupContainer = document.getElementById('popupContainer');

openPopupButton.addEventListener('click', () => {
  popupContainer.style.display = 'flex';
});

closePopupButton.addEventListener('click', () => {
  popupContainer.style.display = 'none';
});