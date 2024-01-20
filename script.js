import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const appSettings = {
  databaseURL:
    "https://we-are-the-champions-72a66-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const getEndorsementLists = ref(database, "endorsementLists");

const publishBtnEl = document.querySelector("#publish-btn");
const endorsementMsgTxtAreaEl = document.querySelector("#endorsement-msg");
const fromPersonInputEl = document.querySelector("#from-person");
const toPersonInputEl = document.querySelector("#to-person");
const endorsementListsUlEl = document.querySelector("#endorsement-lists");

publishBtnEl.addEventListener("click", () => {
  let endorsementMsgValue = endorsementMsgTxtAreaEl.value;
  let fromPersonValue = fromPersonInputEl.value;
  let toPersonValue = toPersonInputEl.value;

  if (
    !validateInput(endorsementMsgValue) ||
    !validateInput(fromPersonValue) ||
    !validateInput(toPersonInputEl)
  ) {
    displaySweetAlert("warning", "Please fill in the empty fields.");
  } else {
    const endorsementData = {
      fromPerson: fromPersonValue,
      toPerson: toPersonValue,
      endorsementMsg: endorsementMsgValue,
      heartCount: 0,
    };

    push(getEndorsementLists, endorsementData);
    displaySweetAlert("success", "Endorsement published successfully!");

    clearInputs();
  }
});

endorsementListsUlEl.addEventListener("click", (e) => {
  const heartIconBtn = e.target.closest(".endorsement-list-heart-icon");

  if (heartIconBtn) {
    const heartIconBtnID = heartIconBtn.dataset.id;
    const heartCountEl = heartIconBtn.nextElementSibling;
    const heartCountRef = ref(
      database,
      `endorsementLists/${heartIconBtnID}/heartCount`
    );

    let currentHeartCount = parseInt(heartCountEl.textContent);
    currentHeartCount++;

    set(heartCountRef, currentHeartCount);
  }
});

onValue(getEndorsementLists, (snapshot) => {
  if (snapshot.exists()) {
    let endorsementListsArray = Object.entries(snapshot.val());
    endorsementListsUlEl.innerHTML = "";

    let endorsementListsString = "";
    for (let i = 0; i < endorsementListsArray.length; i++) {
      let currentItemID = endorsementListsArray[i][0];
      let currentItemValue = endorsementListsArray[i][1];
      endorsementListsString += `
         <li class="endorsement-list">
            <p class="endorsement-list-to">To ${currentItemValue.toPerson}</p>
            <p class="endorsement-list-msg">${currentItemValue.endorsementMsg}</p>
            <div>
               <p class="endorsement-list-from">From ${currentItemValue.fromPerson}</p>
               <div>
                  <i class="bi-heart endorsement-list-heart-icon" data-id="${currentItemID}"></i>
                  <p class="endorsement-list-heart-count">${currentItemValue.heartCount}</p>
               </div>
            </div>
         </li> 
      `;
    }

    endorsementListsUlEl.innerHTML = endorsementListsString;
  } else {
    endorsementListsUlEl.innerHTML = `<p class="empty-lists">Oops! Something must have happened in the server. Try again later.</p>`;
  }
});

function validateInput(inputValue) {
  if (!inputValue) {
    return false;
  }
  return true;
}

function clearInputs() {
  endorsementMsgTxtAreaEl.value = "";
  fromPersonInputEl.value = "";
  toPersonInputEl.value = "";
}

function displaySweetAlert(iconType, titleMsg) {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });
  Toast.fire({
    icon: iconType,
    title: titleMsg,
  });
}
