"use strict";
let loading = true;
function AnimateLoadingText() {
    const loadingText = document.getElementById("loadingText");
    const texts = ["Loading", "Loading.", "Loading..", "Loading..."];
    let i = 0;
    function UpdateLoadingText() {
        if (loading) {
            loadingText.innerHTML = texts[i];
            i = (i + 1) % texts.length;
            setTimeout(UpdateLoadingText, 250);
        }
    }
    UpdateLoadingText();
}
function ShowLoadingScreenMessage(message) {
    const messageBox = document.querySelector("#loadingScreen #messageBox");
    messageBox.innerHTML = "<hr>\n" + message;
}
AnimateLoadingText();
