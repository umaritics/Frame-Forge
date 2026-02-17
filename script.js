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
