//File Input functionality
const fileInput = document.querySelector("#file-input");
const uploadBtn = document.querySelector("#upload");
const previewImg = document.querySelector("#preview-img");
uploadBtn.addEventListener("click", () => {
  //alert("Please select a picture to upload.");
  fileInput.click();
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];

  if (!file) return;
  previewImg.src = URL.createObjectURL(file);
  previewImg.addEventListener("load", () => {});
});

//Filter Functinality
const filterOptions = document.querySelectorAll(".filter-btn");
const filterName = document.querySelector("#filter-name");
const filterValue = document.querySelector("#filter-value");
let filterSlider = document.querySelector("#filter-slider");
let currentFilter = "brightness";
filterOptions.forEach((option) => {
  option.addEventListener("click", () => {
    filterOptions.forEach((opt) => opt.classList.remove("active"));
    option.classList.add("active");
    filterName.innerText = option.innerText;
    currentFilter = option.id;
  });
});
filterSlider.addEventListener("input", () => {
  const value = filterSlider.value;
  filterValue.innerText = `${value}%`;
});
