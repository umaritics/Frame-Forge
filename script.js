// Grab all the things we need
const fileInput = document.querySelector("#file-input");
const uploadBtn = document.querySelector("#upload");
const previewImg = document.querySelector("#preview-img");
const filterOptions = document.querySelectorAll(".filter-btn");
const filterName = document.querySelector("#filter-name");
const filterValue = document.querySelector("#filter-value");
const filterSlider = document.querySelector("#filter-slider");
const resetBtn = document.querySelector("#reset");
const saveBtn = document.querySelector("#save");

// Rotate & Flip buttons
const rotateBtns = document.querySelectorAll(".rotate-btn");
const rotateSlider = document.querySelector("#rotate-slider");
const rotateInfo = document.querySelector(".rotate-info");

// History panel stuff
const historyPanel = document.querySelector("#history-panel");
const undoBtn = document.querySelector("#undo-btn");
const redoBtn = document.querySelector("#redo-btn");

// Initial state object to keep track of everytihng
let state = {
  brightness: 100,
  saturation: 100,
  inversion: 0,
  grayscale: 0,
  sepia: 0,
  blur: 0,
  rotate: 0,
  flipHorizontal: 1,
  flipVertical: 1,
};

let currentFilter = "brightness";

// History arrays for undo/redo
let history = [];
let historyIndex = -1;

// Helper to save current state to history
function saveStateToHistory(actionName) {
  //  delete future history
  if (historyIndex < history.length - 1) {
    history.splice(historyIndex + 1);
  }

  const stateCopy = JSON.parse(JSON.stringify(state));
  history.push({ name: actionName, state: stateCopy });
  historyIndex = history.length - 1;
  updateHistoryUI();
}

// apply filters to the image preview
function applyFilters() {
  previewImg.style.transform = `rotate(${state.rotate}deg) scale(${state.flipHorizontal}, ${state.flipVertical})`;
  previewImg.style.filter = `brightness(${state.brightness}%) saturate(${state.saturation}%) invert(${state.inversion}%) grayscale(${state.grayscale}%) sepia(${state.sepia}%) blur(${state.blur}px)`;
}

// setup initial history state when img loads
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;
  previewImg.src = URL.createObjectURL(file);
  previewImg.addEventListener("load", () => {
    resetFilters(false);
    history = [];
    saveStateToHistory("Original Image");
  });
});

uploadBtn.addEventListener("click", () => fileInput.click());

// handle filter buttons
filterOptions.forEach((option) => {
  option.addEventListener("click", () => {
    filterOptions.forEach((opt) => opt.classList.remove("active"));
    option.classList.add("active");
    filterName.innerText = option.innerText;
    currentFilter = option.id;

    // update slider to match saved state
    if (currentFilter === "blur") {
      filterSlider.max = "10";
      filterValue.innerText = `${state[currentFilter]}px`;
    } else {
      filterSlider.max =
        currentFilter === "brightness" || currentFilter === "saturation"
          ? "200"
          : "100";
      filterValue.innerText = `${state[currentFilter]}%`;
    }
    filterSlider.value = state[currentFilter];
  });
});

// handle slider changes
// using 'change' instead of 'input' so history only saves when u let go of slider
filterSlider.addEventListener("change", () => {
  state[currentFilter] = filterSlider.value;
  applyFilters();

  let displayVal =
    currentFilter === "blur"
      ? `${filterSlider.value}px`
      : `${filterSlider.value}%`;
  filterValue.innerText = displayVal;

  saveStateToHistory(`${filterName.innerText} to ${displayVal}`);
});

// for live preview while dragging (dosent save to history)
filterSlider.addEventListener("input", () => {
  state[currentFilter] = filterSlider.value;
  applyFilters();
  filterValue.innerText =
    currentFilter === "blur"
      ? `${filterSlider.value}px`
      : `${filterSlider.value}%`;
});

// handle rotate and flip buttons
rotateBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.id === "left") state.rotate -= 90;
    else if (btn.id === "right") state.rotate += 90;
    else if (btn.id === "horizontal")
      state.flipHorizontal = state.flipHorizontal === 1 ? -1 : 1;
    else if (btn.id === "vertical")
      state.flipVertical = state.flipVertical === 1 ? -1 : 1;

    applyFilters();
    let action = btn.id.charAt(0).toUpperCase() + btn.id.slice(1);
    saveStateToHistory(`Rotate/Flip: ${action}`);
  });
});

// handle rotate bar
rotateSlider.addEventListener("change", () => {
  state.rotate = rotateSlider.value;
  applyFilters();
  rotateInfo.innerText = `${rotateSlider.value}°`;
  saveStateToHistory(`Rotate to ${rotateSlider.value}°`);
});
rotateSlider.addEventListener("input", () => {
  state.rotate = rotateSlider.value;
  applyFilters();
  rotateInfo.innerText = `${rotateSlider.value}°`;
});

// Reset funtion
function resetFilters(saveHistory = true) {
  state = {
    brightness: 100,
    saturation: 100,
    inversion: 0,
    grayscale: 0,
    sepia: 0,
    blur: 0,
    rotate: 0,
    flipHorizontal: 1,
    flipVertical: 1,
  };
  filterOptions[0].click(); // click brightness to reset UI
  rotateSlider.value = 0;
  rotateInfo.innerText = "0°";
  applyFilters();
  if (saveHistory) saveStateToHistory("Reset Filters");
}

resetBtn.addEventListener("click", resetFilters);

// --- HISTORY & UNDO/REDO STUFF ---
function updateHistoryUI() {
  undoBtn.disabled = historyIndex <= 0;
  redoBtn.disabled = historyIndex >= history.length - 1;

  historyPanel.innerHTML = ""; // clear panel
  history.forEach((item, index) => {
    let div = document.createElement("div");
    div.className = `history-item ${index === historyIndex ? "active-history" : ""}`;
    div.innerText = item.name;

    // click history item to jump to it
    div.addEventListener("click", () => {
      historyIndex = index;
      state = JSON.parse(JSON.stringify(history[historyIndex].state));
      applyUIFromState();
      applyFilters();
      updateHistoryUI();
    });
    historyPanel.appendChild(div);
  });
  // scroll to bottom of hisotry
  historyPanel.scrollTop = historyPanel.scrollHeight;
}

function applyUIFromState() {
  // updates sliders visually when jumping through history
  filterSlider.value = state[currentFilter];
  filterValue.innerText =
    currentFilter === "blur"
      ? `${state[currentFilter]}px`
      : `${state[currentFilter]}%`;
  rotateSlider.value = state.rotate;
  rotateInfo.innerText = `${state.rotate}°`;
}

undoBtn.addEventListener("click", () => {
  if (historyIndex > 0) {
    historyIndex--;
    state = JSON.parse(JSON.stringify(history[historyIndex].state));
    applyUIFromState();
    applyFilters();
    updateHistoryUI();
  }
});

redoBtn.addEventListener("click", () => {
  if (historyIndex < history.length - 1) {
    historyIndex++;
    state = JSON.parse(JSON.stringify(history[historyIndex].state));
    applyUIFromState();
    applyFilters();
    updateHistoryUI();
  }
});

// --- SAVING THE IMAGE VIA CANVAS ---
saveBtn.addEventListener("click", () => {
  // Need a canvas to bake the filters in
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = previewImg.naturalWidth;
  canvas.height = previewImg.naturalHeight;

  // Apply filters to canvas context
  ctx.filter = `brightness(${state.brightness}%) saturate(${state.saturation}%) invert(${state.inversion}%) grayscale(${state.grayscale}%) sepia(${state.sepia}%) blur(${state.blur}px)`;

  // Handle translate for flip/rotate
  ctx.translate(canvas.width / 2, canvas.height / 2);
  if (state.rotate !== 0) ctx.rotate((state.rotate * Math.PI) / 180);
  ctx.scale(state.flipHorizontal, state.flipVertical);

  // Draw the image onto canvas
  ctx.drawImage(
    previewImg,
    -canvas.width / 2,
    -canvas.height / 2,
    canvas.width,
    canvas.height,
  );

  // create download link
  const link = document.createElement("a");
  link.download = "FrameForge_Edited.jpg";
  link.href = canvas.toDataURL("image/jpeg");
  link.click();
});
