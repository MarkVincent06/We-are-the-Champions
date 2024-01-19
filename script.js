import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
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
    const completeEndorsementMsg = {
      fromPerson: fromPersonValue,
      toPerson: toPersonValue,
      endorsementMsg: endorsementMsgValue,
      heartCount: 0,
    };

    push(getEndorsementLists, completeEndorsementMsg);
    displaySweetAlert("success", "Endorsement published successfully!");

    clearInputs();
  }
});

onValue(getEndorsementLists, (snapshot) => {
  if (snapshot.exists()) {
    const endorsementListsArray = Object.values(snapshot.val());
    endorsementListsUlEl.innerHTML = "";

    let endorsementListsString = "";
    for (let endorsementList of endorsementListsArray) {
      endorsementListsString += `
         <li class="endorsement-list">
            <p class="endorsement-list-to">To ${endorsementList.toPerson}</p>
            <p class="endorsement-list-msg">${endorsementList.endorsementMsg}</p>
            <div>
               <p class="endorsement-list-from">From ${endorsementList.fromPerson}</p>
               <div>
                  <i class="bi bi-heart endorsement-list-heart-icon"></i>
                  <!-- <i class="bi bi-suit-heart-fill endorsement-list-heart-icon"></i> -->
                  <p class="endorsement-list-heart-count">${endorsementList.heartCount}</p>
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
    timer: 2000,
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
