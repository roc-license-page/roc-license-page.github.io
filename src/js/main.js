"use strict";
;
;
;
const rootElement = document.documentElement;
const body = document.getElementById("body");
const main = document.getElementById("main");
const footer = document.getElementById("footer");
const loadingScreen = document.getElementById("loadingScreen");
const navBar = document.getElementById("navBar");
const simplifiedNavBar = document.getElementById("simplifiedNavBar");
const viewMorehtmlSegmentButton = document.getElementById("viewMorehtmlSegmentButton");
const viewLesshtmlSegmentButton = document.getElementById("viewLesshtmlSegmentButton");
const dropdowns = document.querySelectorAll(".dropdown");
const scrollIndicatorContainer = document.getElementById("scrollIndicator");
const scrollIndicator = document.querySelector(".scrollIndicator .bar");
const overlay = document.getElementById("overlay");
let settings = {
    darkmode: false,
    scrollIndicator: true,
    reducedMotionMode: false,
    settingDescriptions: true,
    simplifiedPageMode: false,
    accentColor: "blue",
    font: "roboto",
    roundedButtons: true,
    roundedSwitches: true,
    shadowDesign: true,
    keybinds: false,
    dateFormat: "2",
    language: "en",
    darkmodeButtonVisible: true,
    fullscreenButtonVisible: true,
    changelogButtonVisible: true,
    closePageButtonVisible: true,
    licenseUpdatePopupEnabled: true,
    htmlUpdatePopupEnabled: true,
    showErrorAsMessage: false,
    skipAssetLoading: false
};
let fullscreen = false;
let popupOpen = false;
let htmlSegmentsShown = 1;
let licenseSegmentsShown = 1;
let pressedKeys;
let fPressCount = 0;
let escPressCount = 0;
let floppaActive = false;
const currentHtmlVersion = "4.2.1";
const currentLicenseTextVersion = "3.1";
const jsonFormatVersion = "2";
const localStorageFormatVersion = "2";
const htmlSegments = 4;
const licenseSegments = 1;
const languageData = {
    "changelog.major-update": { en: "Major update", de: "Großes Update" },
    "changelog.minor-update": { en: "Minor update", de: "Kleines Update" },
    "changelog.new-features": { en: "New features: ", de: "Neue Funktionen: " },
    "changelog.new-settings": { en: "New settings options: ", de: "Neue Einstellungsmöglichkeiten: " },
    "changelog.changes": { en: "Changes: ", de: "Änderungen: " },
    "changelog.general-info": { en: "General info: ", de: "Allgemeine Info: " },
    "changelog.note": { en: "Note: ", de: "Hinweis: " }
};
function PrintMessage(messageType, text) {
    if (settings.showErrorAsMessage) {
        ShowMessage(messageType, text);
    }
    switch (messageType) {
        case "message":
            console.log(text);
            break;
        case "warning":
            console.warn(text);
            break;
        case "error":
            console.error(text);
            break;
    }
}
function PrintTemplateMessage(template, text1, text2) {
    switch (template) {
        case "invalidParameter":
            const parameterName = text1;
            const functionName = text2 || "undefined";
            PrintMessage("error", `"${parameterName}" is not a valid parameter for ${functionName}`);
            break;
        case "invalidVariable":
            const variableName = text1;
            const text = text2;
            PrintMessage("error", `${text} "${variableName}" is not valid`);
            break;
    }
}
function SaveBooleanToLocalStorage(key, value) {
    localStorage.setItem(key, value ? "enabled" : "disabled");
}
function ShowMessage(messageType, text_en, text_de) {
    const messageContainer = document.getElementById("messageContainer");
    const en_text = text_en;
    const de_text = text_de || text_en;
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", messageType);
    messageElement.innerHTML = settings.language == "de" ? de_text : en_text;
    messageContainer.prepend(messageElement);
    setTimeout(() => {
        messageElement.classList.add("active");
    }, 250);
    setTimeout(() => {
        messageElement.classList.remove("active");
        setTimeout(() => {
            messageElement.remove();
        }, 250);
    }, 10000);
}
function ToggleDarkmode() {
    body.classList.toggle("darkmode");
    ToggleSwitch("dark");
    settings.darkmode = !settings.darkmode;
    SaveBooleanToLocalStorage("darkmode", settings.darkmode);
}
function ToggleFullScreen() {
    if (fullscreen) {
        document.exitFullscreen();
    }
    else {
        rootElement.requestFullscreen();
    }
    fullscreen = !fullscreen;
}
function ClosePage() {
    window.close();
}
function OpenPopup(name) {
    const popup = document.getElementById(`${name}Popup`);
    if (!popup) {
        PrintTemplateMessage("invalidParameter", name, "OpenPopup");
        return;
    }
    popup.classList.add("active");
    body.classList.add("passive");
    overlay.classList.add("active");
    popupOpen = true;
}
function CloseAllPopups() {
    const popups = document.querySelectorAll(".popup");
    Array.from(popups).forEach((popup) => {
        popup.classList.remove("active");
    });
    body.classList.remove("passive");
    overlay.classList.remove("active");
    popupOpen = false;
}
function OpenChangelogFromUpdatePopup(changelogType) {
    CloseAllPopups();
    if (changelogType == "license") {
        ToggleChangelogType();
    }
    setTimeout(() => {
        OpenPopup("changelog");
    }, 250);
}
function ToggleChangelogType() {
    const elements = [
        ...Array.from(document.querySelectorAll(".popup.changelog .content .changes")),
        ...Array.from(document.querySelectorAll(".popup.changelog .content .selector .element"))
    ];
    elements.forEach((element) => {
        element.classList.toggle("active");
    });
}
function UpdateHtmlSegmentButtons() {
    switch (htmlSegmentsShown) {
        case 1:
            viewLesshtmlSegmentButton.classList.remove("active");
            break;
        case htmlSegments:
            viewMorehtmlSegmentButton.classList.remove("active");
            break;
        default:
            viewLesshtmlSegmentButton.classList.add("active");
            viewMorehtmlSegmentButton.classList.add("active");
            break;
    }
}
function ShowhtmlSegment() {
    const nexthtmlSegment = document.querySelector(`[data-html-segment='${String(htmlSegmentsShown + 1)}']`);
    nexthtmlSegment.classList.add("active");
    htmlSegmentsShown++;
    UpdateHtmlSegmentButtons();
}
function HidehtmlSegment() {
    const previoshtmlSegment = document.querySelector(`[data-html-segment='${String(htmlSegmentsShown - 1)}']`);
    const currenthtmlSegment = document.querySelector(`[data-html-segment='${String(htmlSegmentsShown)}']`);
    previoshtmlSegment.scrollIntoView({
        behavior: "smooth"
    });
    setTimeout(() => {
        currenthtmlSegment.classList.remove("active");
    }, 250);
    htmlSegmentsShown--;
    UpdateHtmlSegmentButtons();
}
function ToggleSwitch(switchName) {
    const switchElements = document.querySelectorAll(`.popup.settings .content .setting .switch.${switchName} .element`);
    if (!switchElements) {
        PrintTemplateMessage("invalidParameter", switchName, "ToggleSwitch");
        return;
    }
    Array.from(switchElements).forEach((switchElement) => {
        switchElement.classList.toggle("active");
    });
}
function ToggleBlockedSwitch(switchNames) {
    switchNames.forEach((switchName) => {
        const switchesToBlock = document.querySelectorAll(`.popup.settings .content .setting .switch.${switchName}`);
        if (!switchesToBlock) {
            PrintTemplateMessage("invalidParameter", switchName, "ToggleBlockedSwitch");
        }
        Array.from(switchesToBlock).forEach((switchToBlock) => {
            switchToBlock.classList.toggle("passive");
        });
    });
}
function RemoveFoolsFont() {
    settings.font = localStorage.getItem("font") || "roboto";
    UpdateFont();
    ShowMessage("message", "April fools font disabled.");
}
function ToggleReducedMotionMode() {
    body.classList.toggle("noTransition");
    ToggleSwitch("reducedMotionMode");
    settings.reducedMotionMode = !settings.reducedMotionMode;
    SaveBooleanToLocalStorage("reducedMotionMode", settings.reducedMotionMode);
}
function ToggleSettingDescriptions() {
    const settingDescriptionTexts = document.querySelectorAll(".popup.settings .content .desc");
    Array.from(settingDescriptionTexts).forEach((settingDescriptionText) => {
        settingDescriptionText.classList.toggle("hidden");
    });
    ToggleSwitch("settingDescriptions");
    settings.settingDescriptions = !settings.settingDescriptions;
    SaveBooleanToLocalStorage("settingDescriptions", settings.settingDescriptions);
}
function ToggleSimplifiedPageMode() {
    const bars = [
        navBar,
        simplifiedNavBar
    ];
    bars.forEach((bar) => {
        bar.classList.toggle("active");
    });
    ToggleBlockedSwitch(["navBarButtonVisibility", "scrollIndicator"]);
    scrollIndicatorContainer.classList.toggle("passive");
    footer.classList.toggle("passive");
    ToggleSwitch("simplifiedPageMode");
    settings.simplifiedPageMode = !settings.simplifiedPageMode;
    SaveBooleanToLocalStorage("simplifiedPageMode", settings.simplifiedPageMode);
    UpdateDynamicMargins();
}
function SetAccentColor(color) {
    const accentColorPickerElements = document.querySelectorAll(".popup.settings .content .setting .colorPicker .element");
    const cssColorVariable = `--${color}`;
    const cssShadedColorVariable = `--${color}Shaded`;
    const cssColorValue = getComputedStyle(rootElement).getPropertyValue(cssColorVariable);
    const cssShadedColorValue = getComputedStyle(rootElement).getPropertyValue(cssShadedColorVariable);
    if (!cssColorValue || !cssShadedColorValue) {
        PrintTemplateMessage("invalidParameter", color, "setAccentColor");
        return;
    }
    rootElement.style.setProperty("--accentColor", cssColorValue);
    rootElement.style.setProperty("--accentColorShaded", cssShadedColorValue);
    Array.from(accentColorPickerElements).forEach((accentColorPickerElement) => {
        if (accentColorPickerElement.classList.contains(color)) {
            accentColorPickerElement.classList.add("selected");
        }
        else {
            accentColorPickerElement.classList.remove("selected");
        }
    });
    settings.accentColor = color;
    localStorage.setItem("accentColor", settings.accentColor);
}
function ToggleRoundedButtons() {
    const roundableButtons = document.querySelectorAll(".roundableButton");
    Array.from(roundableButtons).forEach((roundableButton) => {
        roundableButton.classList.toggle("rounded");
    });
    ToggleSwitch("roundedButtons");
    settings.roundedButtons = !settings.roundedButtons;
    SaveBooleanToLocalStorage("roundedButtons", settings.roundedButtons);
}
function ToggleRoundedSwitches() {
    const switches = document.querySelectorAll(".popup.settings .content .setting .switch");
    const colorPicker = document.querySelector(".popup.settings .content .setting .colorPicker");
    const elements = [
        ...Array.from(switches),
        colorPicker
    ];
    elements.forEach((element) => {
        element.classList.toggle("rounded");
    });
    ToggleSwitch("roundedSwitches");
    settings.roundedSwitches = !settings.roundedSwitches;
    SaveBooleanToLocalStorage("roundedSwitches", settings.roundedSwitches);
}
function ToggleShadowDesign() {
    body.classList.toggle("noShadow");
    ToggleSwitch("shadowDesign");
    settings.shadowDesign = !settings.shadowDesign;
    SaveBooleanToLocalStorage("shadowDesign", settings.shadowDesign);
}
function ToggleKeybinds() {
    ToggleSwitch("keybinds");
    settings.keybinds = !settings.keybinds;
    SaveBooleanToLocalStorage("keybinds", settings.keybinds);
}
function ToggleDropdown(name) {
    const dropdown = document.getElementById(`${name}Dropdown`);
    dropdown.classList.toggle("active");
}
function CloseAllDropdowns() {
    Array.from(dropdowns).forEach((dropdown) => {
        dropdown.classList.remove("active");
    });
}
function SetDropdownOption(name, option) {
    const options = {
        dateFormat: {
            options: {
                "0": "None",
                "1": "DD.MM.YYYY",
                "2": "HH.MM - DD.MM.YYYY",
                "3": "HH.MM.SS - DD.MM.YYYY"
            },
            localStorageKey: "dateFormatDropdownOption"
        },
        language: {
            options: {
                "en": '<object data="src/icons/flag-us.svg" type="image/svg+xml"></object>\nEnglish',
                "de": '<object data="src/icons/flag-de.svg" type="image/svg+xml"></object>\nDeutsch'
            },
            localStorageKey: "language"
        },
        font: {
            options: {
                "poppins": '<object data="src/icons/font-warning.svg" type="image/svg+xml"></object>\n<span class="poppins">Poppins</span>',
                "roboto": '<span class="roboto">Roboto</span>',
                "oswald": '<span class="oswald">Oswald</span>',
                "robotoslab": '<span class="robotoslab">Roboto Slab</span>',
                "lora": '<span class="lora">Lora</span>'
            },
            localStorageKey: "font"
        }
    };
    const dropdown = options[name];
    settings[name] = option;
    const dropdownSelect = document.getElementById(`${name}DropdownSelect`);
    const setOption = dropdown.options[option];
    dropdownSelect.innerHTML = setOption;
    CloseAllDropdowns();
    localStorage.setItem(dropdown.localStorageKey, option);
    switch (name) {
        case "language":
            UpdateLanguage();
            break;
        case "font":
            UpdateFont();
            break;
    }
    UpdateDynamicMargins();
}
function CheckDropdownClose(event) {
    Array.from(dropdowns).forEach((dropdown) => {
        const target = event.target;
        if (target && !dropdown.contains(target)) {
            dropdown.classList.remove("active");
        }
    });
}
function ImportSettings(event) {
    function CheckFileValidity(file) {
        const maxFileSize = 1024;
        const validFileTypes = [
            "application/json",
            "text/json"
        ];
        if (!validFileTypes.includes(file.type) || file.size > maxFileSize) {
            ShowMessage("error", "The given file was not valid.", "Die gegebene Datei war ungültig.");
            return false;
        }
        else {
            return true;
        }
    }
    const file = event.target.files[0];
    if (file && CheckFileValidity(file)) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const settings = JSON.parse(e.target.result);
                ApplySettings(settings, true);
            }
            catch (error) {
                ShowMessage("error", `While parsing JSON, the follwing error occured: <br> ${error}`, `Während des Lesens des JSONs ist der folgende Fehler augetreten: <br> ${error}`);
            }
        };
        reader.readAsText(file);
    }
}
function ApplySettings(settingsObject, feedback) {
    function ApplyFormatVersion1() {
        const toggles = [
            ["dark", "darkmode", ToggleDarkmode],
            ["reducedMotion", "reducedMotionMode", ToggleReducedMotionMode],
            ["keybinds", "keybinds", ToggleKeybinds],
            ["simplified", "simplifiedPageMode", ToggleSimplifiedPageMode],
            ["darkModeButtonVisible", "darkmodeButtonVisible", () => { ToggleNavBarButtonVisibility("darkmode"); }],
            ["fullScreenButtonVisible", "fullscreenButtonVisible", () => { ToggleNavBarButtonVisibility("fullscreen"); }],
            ["changelogButtonVisible", "changelogButtonVisible", () => { ToggleNavBarButtonVisibility("changelog"); }],
            ["closeButtonVisible", "closePageButtonVisible", () => { ToggleNavBarButtonVisibility("closePage"); }],
            ["updatePopUpVisible", "licenseUpdatePopupEnabled", () => { ToggleUpdatePopup("license"); }]
        ];
        const strings = [
            ["fileNameFormatType", (option) => { SetDropdownOption("dateFormat", option); }]
        ];
        toggles.forEach((toggle) => {
            if (toggle[0] in settingsObject && settingsObject[toggle[0]] == !settings[toggle[1]]) {
                toggle[2]();
            }
        });
        strings.forEach((string) => {
            if (string[0] in settingsObject) {
                string[1](settingsObject[string[0]]);
            }
        });
        if (feedback) {
            ShowMessage("warning", "The given file is outdated and was imported in compatibility mode. To ensure proper functionality, please generate a new file", "Die gegebene Datei ist veraltet und wurde im Kompatibilitätsmodus importiert. Bitte generieren Sie eine neue Datei, um korrekte Funktionalität zu garantieren");
        }
    }
    function ApplyFormatVersion2() {
        const toggles = [
            ["darkmode", ToggleDarkmode],
            ["scrollIndicator", ToggleScrollIndicator],
            ["reducedMotionMode", ToggleReducedMotionMode],
            ["settingDescriptions", ToggleSettingDescriptions],
            ["simplifiedPageMode", ToggleSimplifiedPageMode],
            ["roundedButtons", ToggleRoundedButtons],
            ["roundedSwitches", ToggleRoundedSwitches],
            ["shadowDesign", ToggleShadowDesign],
            ["keybinds", ToggleKeybinds],
            ["darkmodeButtonVisible", () => { ToggleNavBarButtonVisibility("darkmode"); }],
            ["fullscreenButtonVisible", () => { ToggleNavBarButtonVisibility("fullscreen"); }],
            ["changelogButtonVisible", () => { ToggleNavBarButtonVisibility("changelog"); }],
            ["closePageButtonVisible", () => { ToggleNavBarButtonVisibility("closePage"); }],
            ["licenseUpdatePopupEnabled", () => { ToggleUpdatePopup("license"); }],
            ["htmlUpdatePopupEnabled", () => { ToggleUpdatePopup("html"); }],
            ["showErrorAsMessage", ToggleShowErrorAsMessage],
            ["skipAssetLoading", ToggleSkipAssetLoading]
        ];
        const strings = [
            ["accentColor", (option) => { SetAccentColor(option); }],
            ["font", (option) => { SetDropdownOption("font", option); }],
            ["dateFormatDropdownOption", (option) => { SetDropdownOption("dateFormat", option); }],
            ["language", (option) => { SetDropdownOption("language", option); }]
        ];
        toggles.forEach((toggle) => {
            if (toggle[0] in settingsObject && settingsObject[toggle[0]] == !settings[toggle[0]]) {
                toggle[1]();
            }
        });
        strings.forEach((string) => {
            if (string[0] in settingsObject) {
                string[1](settingsObject[string[0]]);
            }
        });
        if (feedback) {
            ShowMessage("message", "Imported settings file successfully", "Die Einstellungsdatei wurde erfolgreich importiert");
        }
    }
    const functionNumber = (parseInt(settingsObject.formatVersion) || 1) - 1;
    const functions = [
        ApplyFormatVersion1,
        ApplyFormatVersion2
    ];
    functions[functionNumber]();
    CloseAllPopups();
}
function ExportSettings() {
    function GenerateFileName() {
        function ConvertToString(num) {
            return String(num).padStart(2, "0");
        }
        const base = "License settings";
        const fileExtension = ".json";
        const currentDate = new Date();
        let name = "";
        switch (settings.dateFormat) {
            case "0":
                name = base;
                break;
            case "1":
                name = `${base} ${ConvertToString(currentDate.getDate())}.${ConvertToString(currentDate.getMonth() + 1)}.${currentDate.getFullYear()}${fileExtension}`;
                break;
            case "2":
                name = `${base} ${ConvertToString(currentDate.getDate())}.${ConvertToString(currentDate.getMonth() + 1)}.${currentDate.getFullYear()} - ${ConvertToString(currentDate.getHours())}.${ConvertToString(currentDate.getMinutes())}${fileExtension}`;
                break;
            case "3":
                name = `${base} ${ConvertToString(currentDate.getDate())}.${ConvertToString(currentDate.getMonth() + 1)}.${currentDate.getFullYear()} - ${ConvertToString(currentDate.getHours())}.${ConvertToString(currentDate.getMinutes())}.${ConvertToString(currentDate.getSeconds())}${fileExtension}`;
                break;
        }
        return name;
    }
    const settingKeys = [
        ["darkmode"],
        ["scrollIndicator"],
        ["reducedMotionMode"],
        ["settingDescriptions"],
        ["simplifiedPageMode"],
        ["accentColor"],
        ["font"],
        ["roundedButtons"],
        ["roundedSwitches"],
        ["shadowDesign"],
        ["keybinds"],
        ["dateFormat", "dateFormatDropdownOption"],
        ["language"],
        ["darkmodeButtonVisible"],
        ["fullscreenButtonVisible"],
        ["changelogButtonVisible"],
        ["closePageButtonVisible"],
        ["licenseUpdatePopupEnabled"],
        ["htmlUpdatePopupEnabled"],
        ["showErrorAsMessage"],
        ["skipAssetLoading"]
    ];
    let userSettings = {
        formatVersion: jsonFormatVersion
    };
    settingKeys.forEach((settingKey) => {
        userSettings[settingKey[1] || settingKey[0]] = settings[settingKey[0]];
    });
    let userSettingsJSON = JSON.stringify(userSettings, null, 2);
    const blob = new Blob([userSettingsJSON], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = GenerateFileName();
    a.click();
    URL.revokeObjectURL(url);
    CloseAllPopups();
    setTimeout(() => {
        ShowMessage("message", "Exported settings file successfully.", "Einstellungsdatei erfolgreich exportiert.");
    }, 250);
}
function ClearSettings() {
    const defaultSettings = {
        formatVersion: jsonFormatVersion,
        darkmode: false,
        scrollIndicator: true,
        reducedMotionMode: false,
        settingDescriptions: true,
        simplifiedPageMode: false,
        accentColor: "blue",
        font: "roboto",
        roundedButtons: true,
        roundedSwitches: true,
        shadowDesign: true,
        keybinds: false,
        dateFormat: "2",
        language: "en",
        darkmodeButtonVisible: true,
        fullscreenButtonVisible: true,
        changelogButtonVisible: true,
        closePageButtonVisible: true,
        licenseUpdatePopupEnabled: true,
        htmlUpdatePopupEnabled: true,
        showErrorAsMessage: false,
        skipAssetLoading: false
    };
    CloseAllPopups();
    setTimeout(() => {
        ApplySettings(defaultSettings, false);
        ShowMessage("message", "Returned to default settings", "Zu Werkseinstellung zurückgekehrt");
    }, 250);
}
function ToggleNavBarButtonVisibility(name) {
    const buttonName = `${name}Button`;
    const button = document.getElementById(buttonName);
    if (!button) {
        PrintTemplateMessage("invalidParameter", name, "ToggleNavBarButtonVisibility");
        return;
    }
    button.classList.toggle("hidden");
    ToggleSwitch(buttonName);
    settings[`${buttonName}Visible`] = !settings[`${buttonName}Visible`];
    SaveBooleanToLocalStorage(`${buttonName}Visible`, settings[`${buttonName}Visible`]);
    UpdateDynamicMargins();
    setTimeout(() => {
        UpdateDynamicMargins();
    }, 300);
}
function ToggleUpdatePopup(updatePopupType) {
    const popupKey = `${updatePopupType}UpdatePopupEnabled`;
    ToggleSwitch(`${updatePopupType}UpdatePopup`);
    settings[popupKey] = !settings[popupKey];
    SaveBooleanToLocalStorage(popupKey, settings[popupKey]);
}
function ToggleScrollIndicator() {
    scrollIndicatorContainer.classList.toggle("active");
    ToggleSwitch("scrollIndicator");
    settings.scrollIndicator = !settings.scrollIndicator;
    SaveBooleanToLocalStorage("scrollIndicator", settings.scrollIndicator);
}
function ToggleShowErrorAsMessage() {
    const key = "showErrorAsMessage";
    ToggleSwitch(key);
    settings[key] = !settings[key];
    SaveBooleanToLocalStorage(key, settings[key]);
}
function ToggleSkipAssetLoading() {
    const key = "skipAssetLoading";
    ToggleSwitch(key);
    settings[key] = !settings[key];
    SaveBooleanToLocalStorage(key, settings[key]);
}
function UpdateDynamicMargins() {
    const navBarHeight = parseInt(window.getComputedStyle(navBar).height);
    const simplifiedNavBarHeight = parseInt(window.getComputedStyle(simplifiedNavBar).height);
    if (settings.simplifiedPageMode) {
        main.style.paddingTop = `${simplifiedNavBarHeight + 40}px`;
    }
    else {
        main.style.paddingTop = `${navBarHeight + 40}px`;
    }
}
function CheckPressedKeys(event) {
    if (settings.keybinds) {
        switch (event.key.toLowerCase()) {
            case "f":
                ToggleFullScreen();
                break;
            case "escape":
                CloseAllDropdowns();
                if (popupOpen) {
                    CloseAllPopups();
                }
                else {
                    ClosePage();
                }
                break;
        }
    }
    else {
        switch (event.key.toLowerCase()) {
            case "f":
                fPressCount++;
                if (fPressCount >= 6) {
                    fPressCount = 0;
                    ShowMessage("info", "Keybinds are currently disabled.", "Keybinds sind aktuell ausgeschaltet.");
                }
                setTimeout(() => {
                    fPressCount = 0;
                }, 1500);
                break;
            case "escape":
                escPressCount++;
                if (escPressCount >= 6) {
                    escPressCount = 0;
                    ShowMessage("info", "Keybinds are currently disabled.", "Keybinds sind aktuell ausgeschaltet.");
                }
                setTimeout(() => {
                    escPressCount = 0;
                }, 1500);
                break;
        }
    }
    pressedKeys += event.key.toLowerCase();
    if (pressedKeys.length > 6) {
        pressedKeys = pressedKeys.slice(-6);
    }
    if (pressedKeys.includes("floppa")) {
        const imgTag = "<img class='easteregg spinning' src='src/images/floppa.jpg'>";
        const activeFloppa = document.querySelector(".easteregg.spinning");
        if (!activeFloppa) {
            ShowMessage("rainbow", imgTag + imgTag + imgTag);
            floppaActive = true;
            setTimeout(() => {
                floppaActive = false;
            }, 12000);
        }
        else {
            const floppas = document.querySelectorAll(".easteregg.spinning");
            Array.from(floppas).forEach((floppa) => {
                floppa.classList.add("fast");
            });
        }
    }
}
function UpdateScrollIndicator() {
    const scrollText = document.querySelector("#scrollIndicator .text");
    const documentHeight = rootElement.scrollHeight - rootElement.clientHeight;
    const scrollHeight = window.scrollY;
    const scrollPx = (scrollHeight / documentHeight) * 250;
    const scrollPercent = Math.floor((scrollHeight / documentHeight) * 100);
    scrollIndicator.style.width = `${String(scrollPx)}px`;
    scrollText.innerHTML = `${String(scrollPercent)}%`;
}
function GoToPageTop() {
    main.scrollIntoView({ behavior: "smooth" });
}
function LoadLicenseText() {
    const licenseContainer = document.getElementById("licenseContainer");
    licenseContainer.innerHTML = licenseText;
}
function CheckLocalStorageVersion() {
    if (localStorage.getItem("localStorageVersion") != localStorageFormatVersion || !localStorage.getItem("localStorageVersion")) {
        overlay.classList.add("active", "passive");
        body.classList.add("passive");
        overlay.innerHTML = "Please wait...";
        ShowMessage("warning", 'Updating/Initializing localStorage. <br> Any settings will unfortunately be lost.', 'Aktualisieren/Initialisieren des localStorage. <br> Jegliche Einstellungen gehen leider verloren.');
        localStorage.clear();
        localStorage.setItem("localStorageVersion", localStorageFormatVersion);
        setTimeout(() => {
            location.reload();
        }, 5000);
    }
}
function LoadLocalStorageData() {
    ;
    const localStorageData = [
        { key: "darkmode", expectedValue: "enabled", action: ToggleDarkmode },
        { key: "scrollIndicator", expectedValue: "disabled", action: ToggleScrollIndicator },
        { key: "reducedMotionMode", expectedValue: "enabled", action: ToggleReducedMotionMode },
        { key: "settingDescriptions", expectedValue: "disabled", action: ToggleSettingDescriptions },
        { key: "simplifiedPageMode", expectedValue: "enabled", action: ToggleSimplifiedPageMode },
        { key: "accentColor", action: () => { SetAccentColor(localStorage.getItem("accentColor") || "blue"); } },
        { key: "font", action: () => { SetDropdownOption("font", localStorage.getItem("font") || "roboto"); } },
        { key: "roundedButtons", expectedValue: "disabled", action: ToggleRoundedButtons },
        { key: "roundedSwitches", expectedValue: "disabled", action: ToggleRoundedSwitches },
        { key: "shadowDesign", expectedValue: "disabled", action: ToggleShadowDesign },
        { key: "keybinds", expectedValue: "enabled", action: ToggleKeybinds },
        { key: "dateFormatDrodownOption", action: () => { SetDropdownOption("dateFormat", localStorage.getItem("dateFormatDrodownOption") || "2"); } },
        { key: "language", action: () => { SetDropdownOption("language", localStorage.getItem("language") || "de"); } },
        { key: "darkmodeButtonVisible", expectedValue: "disabled", action: () => { ToggleNavBarButtonVisibility('darkmode'); } },
        { key: "fullscreenButtonVisible", expectedValue: "disabled", action: () => { ToggleNavBarButtonVisibility('fullscreen'); } },
        { key: "changelogButtonVisible", expectedValue: "disabled", action: () => { ToggleNavBarButtonVisibility('changelog'); } },
        { key: "closePageButtonVisible", expectedValue: "disabled", action: () => { ToggleNavBarButtonVisibility('closePage'); } },
        { key: "licenseUpdatePopupEnabled", expectedValue: "disabled", action: () => { ToggleUpdatePopup('license'); } },
        { key: "htmlUpdatePopupEnabled", expectedValue: "disabled", action: () => { ToggleUpdatePopup('html'); } },
        { key: "showErrorAsMessage", expectedValue: "enabled", action: ToggleShowErrorAsMessage },
        { key: "skipAssetLoading", expectedValue: "enabled", action: ToggleSkipAssetLoading }
    ];
    localStorageData.forEach(({ key, expectedValue, action }) => {
        const value = localStorage.getItem(key);
        if (expectedValue) {
            if (value == expectedValue) {
                action();
            }
        }
        else if (value) {
            action();
        }
    });
}
function UpdateLanguage() {
    const inlineLangaugeElements = document.querySelectorAll("[data-lang]");
    const objectLanguageElements = document.querySelectorAll("[data-lang-object-id]");
    Array.from(inlineLangaugeElements).forEach((inlineLangaugeElement) => {
        const text = inlineLangaugeElement.getAttribute(`data-${settings.language}`);
        if (!text) {
            PrintTemplateMessage("invalidVariable", settings.language, "Language");
            return;
        }
        inlineLangaugeElement.innerHTML = text;
    });
    Array.from(objectLanguageElements).forEach((objectLanguageElement) => {
        const languageDataId = objectLanguageElement.getAttribute("data-lang-object-id");
        if (!languageDataId) {
            PrintTemplateMessage("invalidVariable", settings.language, "Language");
            return;
        }
        const text = languageData[languageDataId][settings.language];
        if (!text) {
            PrintTemplateMessage("invalidVariable", settings.language, "Language");
            return;
        }
        objectLanguageElement.innerHTML = text;
    });
    rootElement.lang = settings.language;
    UpdateDynamicMargins();
}
function CheckDate() {
    const currentDate = new Date();
    if (currentDate.getMonth() === 3 && currentDate.getDate() === 1) {
        settings.font = "foolsfont";
        UpdateFont();
        ShowMessage("message", 'April fools font enabled! To disable it, click <span onclick="RemoveFoolsFont()" style="cursor: pointer">here</span>.');
    }
}
function UpdateFont() {
    ;
    const fontFamilies = {
        poppins: "Poppins",
        roboto: "Roboto",
        oswald: "Oswald",
        robotoslab: "Roboto Slab",
        lora: "Lora",
        foolsfont: "Fools Font"
    };
    body.style.fontFamily = fontFamilies[settings.font] || "Roboto";
    UpdateDynamicMargins();
    setTimeout(() => {
        UpdateDynamicMargins();
    }, 250);
}
function CheckLastVersionSeen() {
    const currentLicenseTextVersionDisplays = document.querySelectorAll(".versionDisplay .currentLicense, footer .currentLicense");
    const lastLicenseTextVersionDisplays = document.querySelectorAll(".versionDisplay .lastLicense");
    const currentHtmlVersionDisplays = document.querySelectorAll(".versionDisplay .currenthtml, footer .currenthtml");
    const lasthtmlVersionDisplays = document.querySelectorAll(".versionDisplay .lasthtml");
    function UpdateVersionDisplays(elements, value) {
        Array.from(elements).forEach((element) => {
            element.innerHTML = value;
        });
    }
    const lastLicenseTextVersionSeen = localStorage.getItem("lastLicenseTextVersionSeen");
    const lasthtmlVersionSeen = localStorage.getItem("lasthtmlVersionSeen");
    let licenseOutdated = false;
    let htmlOutdated = false;
    if (settings.licenseUpdatePopupEnabled && lastLicenseTextVersionSeen && lastLicenseTextVersionSeen != currentLicenseTextVersion) {
        licenseOutdated = true;
    }
    if (settings.htmlUpdatePopupEnabled && lasthtmlVersionSeen && lasthtmlVersionSeen != currentHtmlVersion) {
        htmlOutdated = true;
    }
    UpdateVersionDisplays(lastLicenseTextVersionDisplays, lastLicenseTextVersionSeen);
    UpdateVersionDisplays(currentLicenseTextVersionDisplays, currentLicenseTextVersion);
    UpdateVersionDisplays(lasthtmlVersionDisplays, lasthtmlVersionSeen);
    UpdateVersionDisplays(currentHtmlVersionDisplays, currentHtmlVersion);
    setTimeout(() => {
        if (licenseOutdated && !htmlOutdated) {
            OpenPopup("licenseUpdate");
        }
        else if (!licenseOutdated && htmlOutdated) {
            OpenPopup("htmlUpdate");
        }
        else if (licenseOutdated && htmlOutdated) {
            OpenPopup("comboUpdate");
        }
    }, 250);
    localStorage.setItem("lastLicenseTextVersionSeen", currentLicenseTextVersion);
    localStorage.setItem("lasthtmlVersionSeen", currentHtmlVersion);
}
function InitializeFooter() {
    footer.classList.add("active");
}
function PrintConsoleWarning() {
    const warningTitle = "WARNING:";
    const warning = "Only execute code here if you fully understand its impact! Incorrect actions may disrupt or damage the site.";
    console.log(`%c ${warningTitle}`, "background-color: rgb(250, 250, 0); color: rgb(250, 0, 0); font-size: 16px; font-weight: bold; text-decoration: underline;");
    console.log(`%c ${warning}`, "color: rgb(250, 0, 0); font-size: 16px;");
}
function InitializeEventListeners() {
    const clickEventListenerElements = [
        ["#darkmodeButton", ToggleDarkmode],
        ["#fullscreenButton", ToggleFullScreen],
        ["#changelogButton", () => { OpenPopup("changelog"); }],
        ["#settingsButton", () => { OpenPopup("settings"); }],
        ["#closePageButton", ClosePage],
        ["#simplifiedNavBar .button", ToggleSimplifiedPageMode],
        [".popup .closeButton", CloseAllPopups],
        [".popup.update.license .buttons .openChangelog", () => { OpenChangelogFromUpdatePopup("license"); }],
        [".popup.update .buttons .closePopup", CloseAllPopups],
        [".popup.update.html .buttons .openChangelog", () => { OpenChangelogFromUpdatePopup("html"); }],
        [".popup.update.combo .buttons .openChangelog", () => { OpenChangelogFromUpdatePopup("html"); }],
        [".popup.changelog .selector .element", ToggleChangelogType],
        [".popup.changelog #viewMorehtmlSegmentButton", ShowhtmlSegment],
        [".popup.changelog #viewLesshtmlSegmentButton", HidehtmlSegment],
        [".popup.settings .switch.reducedMotionMode", ToggleReducedMotionMode],
        [".popup.settings .switch.settingDescriptions", ToggleSettingDescriptions],
        [".popup.settings .switch.simplifiedPageMode", ToggleSimplifiedPageMode],
        [".popup.settings .colorPicker .element.red", () => { SetAccentColor("red"); }],
        [".popup.settings .colorPicker .element.orange", () => { SetAccentColor("orange"); }],
        [".popup.settings .colorPicker .element.green", () => { SetAccentColor("green"); }],
        [".popup.settings .colorPicker .element.blue", () => { SetAccentColor("blue"); }],
        [".popup.settings .colorPicker .element.purple", () => { SetAccentColor("purple"); }],
        [".popup.settings .colorPicker .element.gray", () => { SetAccentColor("gray"); }],
        [".popup.settings .switch.dark", ToggleDarkmode],
        [".popup.settings #fontDropdown .select", () => { ToggleDropdown("font"); }],
        [".popup.settings #fontDropdown .options li:has(.poppins)", () => { SetDropdownOption("font", "poppins"); }],
        [".popup.settings #fontDropdown .options li:has(.roboto)", () => { SetDropdownOption("font", "roboto"); }],
        [".popup.settings #fontDropdown .options li:has(.oswald)", () => { SetDropdownOption("font", "oswald"); }],
        [".popup.settings #fontDropdown .options li:has(.robotoslab)", () => { SetDropdownOption("font", "robotoslab"); }],
        [".popup.settings #fontDropdown .options li:has(.lora)", () => { SetDropdownOption("font", "lora"); }],
        [".popup.settings .switch.roundedButtons", ToggleRoundedButtons],
        [".popup.settings .switch.roundedSwitches", ToggleRoundedSwitches],
        [".popup.settings .switch.shadowDesign", ToggleShadowDesign],
        [".popup.settings .switch.keybinds", ToggleKeybinds],
        [".popup.settings #dateFormatDropdown .select", () => { ToggleDropdown("dateFormat"); }],
        [".popup.settings #dateFormatDropdown .options li.a", () => { SetDropdownOption("dateFormat", "0"); }],
        [".popup.settings #dateFormatDropdown .options li.b", () => { SetDropdownOption("dateFormat", "1"); }],
        [".popup.settings #dateFormatDropdown .options li.c", () => { SetDropdownOption("dateFormat", "2"); }],
        [".popup.settings #dateFormatDropdown .options li.d", () => { SetDropdownOption("dateFormat", "3"); }],
        [".popup.settings .dataManagement .button.export", ExportSettings],
        [".popup.settings .dataManagement .button.reset", ClearSettings],
        [".popup.settings #languageDropdown .select", () => { ToggleDropdown("language"); }],
        [".popup.settings #languageDropdown .options li.en", () => { SetDropdownOption("language", "en"); }],
        [".popup.settings #languageDropdown .options li.de", () => { SetDropdownOption("language", "de"); }],
        [".popup.settings .switch.darkmodeButton", () => { ToggleNavBarButtonVisibility("darkmode"); }],
        [".popup.settings .switch.fullscreenButton", () => { ToggleNavBarButtonVisibility("fullscreen"); }],
        [".popup.settings .switch.changelogButton", () => { ToggleNavBarButtonVisibility("changelog"); }],
        [".popup.settings .switch.closePageButton", () => { ToggleNavBarButtonVisibility("closePage"); }],
        [".popup.settings .switch.scrollIndicator", ToggleScrollIndicator],
        [".popup.settings .switch.licenseUpdatePopup", () => { ToggleUpdatePopup("license"); }],
        [".popup.settings .switch.htmlUpdatePopup", () => { ToggleUpdatePopup("html"); }],
        [".popup.settings .switch.showErrorAsMessage", ToggleShowErrorAsMessage],
        [".popup.settings .switch.skipAssetLoading", ToggleSkipAssetLoading],
        ["#overlay", CloseAllPopups],
        ["#footer .goToTopButton", GoToPageTop]
    ];
    const changeEventListenerElements = [
        [".popup.settings #settingsFileInput", (event) => { ImportSettings(event); }]
    ];
    clickEventListenerElements.forEach((clickEventListenerElement) => {
        const elements = document.querySelectorAll(clickEventListenerElement[0]);
        if (!elements) {
            PrintMessage("error", `Element selector ${clickEventListenerElement[0]} not valid`);
            return;
        }
        Array.from(elements).forEach((element) => {
            element.addEventListener("click", clickEventListenerElement[1]);
        });
    });
    changeEventListenerElements.forEach((changeEventListenerElement) => {
        const elements = document.querySelectorAll(changeEventListenerElement[0]);
        if (!elements) {
            PrintMessage("error", `Element selector ${changeEventListenerElement[0]} not valid`);
            return;
        }
        Array.from(elements).forEach((element) => {
            element.addEventListener("change", changeEventListenerElement[1]);
        });
    });
    window.addEventListener("resize", UpdateDynamicMargins);
    document.addEventListener("keydown", CheckPressedKeys);
    window.addEventListener("scroll", UpdateScrollIndicator);
    document.addEventListener("click", (event) => { CheckDropdownClose(event); });
}
function DisableLoadingScreen() {
    ShowLoadingScreenMessage("DOM loaded. Waiting for assets.");
    setTimeout(() => {
        loadingScreen.classList.remove("active");
        loading = false;
    }, settings.skipAssetLoading ? 0 : 1500);
}
function Initialize() {
    LoadLicenseText();
    CheckLocalStorageVersion();
    LoadLocalStorageData();
    UpdateLanguage();
    CheckDate();
    UpdateFont();
    CheckLastVersionSeen();
    InitializeFooter();
    PrintConsoleWarning();
    InitializeEventListeners();
    UpdateDynamicMargins();
    DisableLoadingScreen();
}
window.onload = Initialize;
