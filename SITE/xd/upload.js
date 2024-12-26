// Get references to DOM elements
const form = document.querySelector("form");
const dropArea = document.querySelector(".drag-area");
const fileInput = document.querySelector(".file-input");
const progressArea = document.querySelector(".progress-area");
const uploadedArea = document.querySelector(".uploaded-area");
const allowed_EXT = /\.(kdbx|pdf|log|txt)$/i;
const files_name_upload = [];
const fileTypes = { kdbx: 0, pdf: 0, log: 0, txt: 0 };
const popup = document.getElementById("popup");
const popupMessage = document.getElementById("popup-message");
const popupOkBtn = document.getElementById("popup-ok-btn");
const resetBtn = document.getElementById("reset-btn");
const sendBtn = document.getElementById("send-btn");
const uploadCard1 = document.getElementById("upload-card-1");
const uploadCard2 = document.getElementById("upload-card-2");
const uploadSection = document.getElementById("upload-section");
let selectedCard = ''; // "matlab" or "klippel"

// Display chosen files
function displayFiles(files) {
  const fileList = Array.from(files).map(file => 
    `<li>
      <strong>${file.name}</strong> (${Math.round(file.size / 1024)} KB)
    </li>`
  ).join('');
  uploadedArea.innerHTML = `<ul>${fileList}</ul>`;
}
function showPopup(message) {
  const popupMessage = document.getElementById("popup-message");
  popupMessage.textContent = message;
  document.getElementById("popup").style.display = "block";
}
// Show popups
function showPopup(popupType, message) {
  const successPopup = document.getElementById("success-popup");
  const removedPopup = document.getElementById("removed-popup");
  const errorPopup = document.getElementById("error-popup");

  popup.style.display = "none";
  successPopup.style.display = "none";
  removedPopup.style.display = "none";
  errorPopup.style.display = "none";

  if (popupType === "info") {
    popup.style.display = "block";
    popupMessage.textContent = message;
  } else if (popupType === "success") {
    successPopup.style.display = "block";
  } else if (popupType === "removed") {
    removedPopup.style.display = "block";
  } else if (popupType === "error") {
    errorPopup.style.display = "block";
    document.getElementById("error-popup-message").textContent = message;
  }
}
function handleSuccessfulUpload() {
  // Assuming you already trigger this function when validation is passed and popup is shown
  const formData = new FormData();

  // Append the validated files to the formData object
  validFiles.forEach(file => {
      formData.append('files', file);
  });

  // Send the files to the Flask backend
  fetch('/upload', {
      method: 'POST',
      body: formData
  })
  .then(response => response.json())
  .then(data => {
      console.log(data);
      if (data.message === 'Files uploaded successfully') {
          // Handle success (optional)
      } else {
          // Handle error (optional)
      }
  })
  .catch(error => {
      console.error('Error:', error);
  });
}

// Replace your existing successful upload handler with this function


// Show toast message
function showToast(message, color) {
  const snackbar = document.getElementById("snackbar");
  snackbar.textContent = message;
  snackbar.style.backgroundColor = color;
  snackbar.className = "show";
  
  // Log to ensure the function is being called
  console.log(`Snackbar shown with message: ${message}, color: ${color}`);
  
  setTimeout(() => {
    snackbar.className = snackbar.className.replace("show", "");
    console.log("Snackbar hidden");
  }, 3000); // Matches CSS transition duration
}
function handleCardClick(cardType) {
  selectedCard = cardType;
  fadeOutTitle();
  setTimeout(() => {
    document.getElementById(`upload-card-${cardType}`).classList.add('show-form');
    document.getElementById(`upload-card-${cardType}`).classList.remove('hide-card');
  }, 500); // Delay to allow title fade out
}

document.getElementById('upload-card-1').addEventListener('click', () => handleCardClick('matlab'));
document.getElementById('upload-card-2').addEventListener('click', () => handleCardClick('klippel'));

// Handle file input change
fileInput.addEventListener('change', ({ target }) => {
  const files = target.files;

  if (files.length > 4) {
    showToast('You can upload up to 4 files only.', 'red');
    fileInput.value = ""; // Clear input
    return;
  }
  function validateFiles(files) {
    const selectedSoftware = document.getElementById("upload-card-1").classList.contains("fade-out") ? "Klippel" : "Matlab";
    const fileTypes = Array.from(files).map(file => file.name.split('.').pop().toLowerCase());
  
    if (selectedSoftware === "Matlab") {
      if (files.length !== 3) {
        showPopup("You can upload exactly 3 files only.");
        return false;
      }
  
      const requiredFiles = { txt: 0, pdf: 0, log: 0 };
      fileTypes.forEach(type => requiredFiles[type]++);
  
      if (requiredFiles.txt !== 1 || requiredFiles.pdf !== 1 || requiredFiles.log !== 1) {
        showPopup("Must be exactly 1 TXT file, 1 PDF file, and 1 LOG file.");
        return false;
      }
    } else if (selectedSoftware === "Klippel") {
      const requiredFiles = { kdbx: 0, pdf: 0, log: 0 };
      fileTypes.forEach(type => requiredFiles[type]++);
  
      if (requiredFiles.kdbx !== 2 || requiredFiles.pdf !== 1 || requiredFiles.log !== 1 || files.length !== 4) {
        showPopup("Must be exactly 2 KDBX files, 1 PDF file, and 1 LOG file.");
        return false;
      }
    }
  
    return true;
  }
  
  
  files_name_upload.length = 0;
  fileTypes.kdbx = 0;
  fileTypes.pdf = 0;
  fileTypes.log = 0;
  fileTypes.txt = 0;

  const validFiles = [];
  
  Array.from(files).forEach(file => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!allowed_EXT.exec(file.name)) {
      showToast('For security reasons, this extension is forbidden. Use kdbx, pdf, log, or txt instead.', 'red');
    } else {
      if (ext === 'kdbx') fileTypes.kdbx++;
      if (ext === 'pdf') fileTypes.pdf++;
      if (ext === 'log') fileTypes.log++;
      if (ext === 'txt') fileTypes.txt++;

      validFiles.push(file);
    }
  });

  if (validFiles.length > 4) {
    showToast('You can upload up to 4 files only.', 'red');
    fileInput.value = ""; // Clear input
    return;
  }

  displayFiles(validFiles);
  validFiles.forEach(file => {
    if (!files_name_upload.includes(file.name)) {
      files_name_upload.push(file.name);
      uploadFile(file);
    }
  });
});

// Drag and drop events
dropArea.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropArea.classList.add('dragging');
});

dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove('dragging');
});

dropArea.addEventListener("drop", (event) => {
  event.preventDefault();
  const files = event.dataTransfer.files;

  // Check if the selected card is Matlab and the files exceed 3
  if (selectedCard === 'matlab' && files.length > 3) {
    showToast('You can upload up to 3 files for Matlab.', 'red');
    return;
  }

  // Existing logic to check for file limits across both cards
  if (files.length > 4) {
    showToast('You can upload up to 4 files only.', 'red');
    return;
  }

  const validFiles = [];

  Array.from(files).forEach(file => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!allowed_EXT.exec(file.name)) {
      showToast('For security reasons, this extension is forbidden. Use kdbx, pdf, log, or txt instead.', 'red');
    } else {
      if (ext === 'kdbx') fileTypes.kdbx++;
      if (ext === 'pdf') fileTypes.pdf++;
      if (ext === 'log') fileTypes.log++;
      if (ext === 'txt') fileTypes.txt++;

      validFiles.push(file);
    }
  });

  if (validFiles.length > 4) {
    showToast('You can upload up to 4 files only.', 'red');
    return;
  }

  displayFiles(validFiles);
  validFiles.forEach(file => {
    if (!files_name_upload.includes(file.name)) {
      files_name_upload.push(file.name);
      drop_Upload(file);
    }
  });

  dropArea.classList.remove('dragging');
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const files = fileInput.files;
  
  if (validateFiles(files)) {
    // Proceed with the file upload
    // Your existing code to handle uploads...
  }
});

// Upload file via drop area
function drop_Upload(file) {
  const form_data = new FormData();
  form_data.append("drop_files[]", file);
  const ajax_request = new XMLHttpRequest();
  ajax_request.open("post", "/upload.php");
  ajax_request.upload.addEventListener("progress", ({ loaded, total }) => {
    const fileLoaded = Math.floor((loaded / total) * 100);
    const fileSize = Math.floor(total / 1024) < 1024 ? `${Math.floor(total / 1024)} KB` : `${(loaded / (1024 * 1024)).toFixed(2)} MB`;
    const progressHTML = `<li class="row">
      <i class="fas fa-file-alt"></i>
      <div class="content">
        <div class="details">
          <span class="name">${file.name} • Uploading</span>
          <span class="percent">${fileLoaded}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress" style="width: ${fileLoaded}%"></div>
        </div>
      </div>
    </li>`;
    progressArea.innerHTML = progressHTML;
    if (loaded === total) {
      progressArea.innerHTML = "";
      const uploadedHTML = `<li class="row">
        <div class="content upload">
          <i class="fas fa-file-alt"></i>
          <div class="details">
            <span class="name">${file.name} • Uploaded</span>
            <span class="size">${fileSize}</span>
          </div>
        </div>
        <i class="fas fa-check"></i>
      </li>`;
      uploadedArea.insertAdjacentHTML("afterbegin", uploadedHTML);
    }
  });
  ajax_request.send(form_data);
}

// Upload file via file input
function uploadFile(file) {
  const form_data = new FormData();
  form_data.append("file", file);
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/upload.php");
  xhr.upload.addEventListener("progress", ({ loaded, total }) => {
    const fileLoaded = Math.floor((loaded / total) * 100);
    const fileSize = Math.floor(total / 1024) < 1024 ? `${Math.floor(total / 1024)} KB` : `${(loaded / (1024 * 1024)).toFixed(2)} MB`;
    const progressHTML = `<li class="row">
      <i class="fas fa-file-alt"></i>
      <div class="content">
        <div class="details">
          <span class="name">${file.name} • Uploading</span>
          <span class="percent">${fileLoaded}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress" style="width: ${fileLoaded}%"></div>
        </div>
      </div>
    </li>`;
    progressArea.innerHTML = progressHTML;
    if (loaded === total) {
      progressArea.innerHTML = "";
      const uploadedHTML = `<li class="row">
        <div class="content upload">
          <i class="fas fa-file-alt"></i>
          <div class="details">
            <span class="name">${file.name} • Uploaded</span>
            <span class="size">${fileSize}</span>
          </div>
        </div>
        <i class="fas fa-check"></i>
      </li>`;
      uploadedArea.insertAdjacentHTML("afterbegin", uploadedHTML);
    }
  });
  xhr.send(form_data);
}

// Reset button
resetBtn.addEventListener("click", () => {
  fileInput.value = "";
  uploadedArea.innerHTML = "";
  files_name_upload.length = 0;
  fileTypes.kdbx = 0;
  fileTypes.pdf = 0;
  fileTypes.log = 0;
  showToast('All files removed.', 'blue'); // Adjust color as needed
});

// Send button event listener
sendBtn.addEventListener("click", () => {
  const totalFiles = fileTypes.kdbx + fileTypes.pdf + fileTypes.log + fileTypes.txt;
  let isCorrectFileCount;

  if (selectedCard === 'matlab') {
    isCorrectFileCount = fileTypes.log === 1 && fileTypes.pdf === 1 && fileTypes.txt === 1;
  } else if (selectedCard === 'klippel') {
    isCorrectFileCount = fileTypes.kdbx === 2 && fileTypes.pdf === 1 && fileTypes.log === 1;
  } else {
    isCorrectFileCount = false; // No card selected
  }

  if (isCorrectFileCount) {
    showToast('Files successfully uploaded.', 'green'); // Adjust color as needed
  } else {
    showToast('Incorrect file types or count. Please upload the correct files.', 'red');
  }
});

// Function to fade out the title
function fadeOutTitle() {
  const title = document.querySelector('.upload-title');
  if (title) {
    console.log("Fading out title..."); // Debug statement
    title.style.transition = 'opacity 0.5s';
    title.style.opacity = '0';
  } else {
    console.log("Title element not found."); // Debug statement
  }
}
function fadeOutCardsAndShowUploadSection() {
  uploadCard1.classList.add('fade-out');
  uploadCard2.classList.add('fade-out');

  setTimeout(() => {
    uploadCard1.style.display = 'none';
    uploadCard2.style.display = 'none';
    uploadSection.classList.add('fade-in');
    uploadSection.style.display = 'block';
  }, 500); // Match this delay with the CSS transition duration
}
// Modify the click event for upload cards
document.querySelectorAll('.upload-card').forEach(card => {
  card.addEventListener('click', () => {
    fadeOutTitle(); // Fade out title
    setTimeout(() => {
      fadeOutCardsAndShowUploadSection(); // Fade out cards and show upload section
    }, 500); // Delay to allow title fade out
  });
});

// Function to fade out cards and show upload section


// Popup OK button
popupOkBtn.addEventListener("click", () => {
  popup.style.display = 'none';
});

// Ensure the upload section fades in with smooth transition
uploadSection.style.transition = 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out';
uploadSection.addEventListener('transitionend', () => {
  if (uploadSection.classList.contains('fade-in')) {
    uploadSection.style.opacity = 1;
    uploadSection.style.transform = 'scale(1)';
  }
});
uploadCard1.addEventListener('click', fadeOutCardsAndShowUploadSection);
uploadCard2.addEventListener('click', fadeOutCardsAndShowUploadSection);