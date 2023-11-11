export function closePopup (e) {
    const currentPopup = document.getElementById("popup");
    const popupContent = currentPopup.querySelector(".popup__content");
    const popupCloseIcon = document.getElementById("close-popup");
    [...popupContent.children].forEach(child => child !== popupCloseIcon ? popupContent.removeChild(child) : null);
    currentPopup.classList.remove("open");
}
export function openPopup () {
    const currentPopup = document.getElementById("popup");
    currentPopup.classList.add("open");
    return currentPopup.querySelector(".popup__content");
}