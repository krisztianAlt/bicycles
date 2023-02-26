var app = app || {};

const UPARROW = "&#x25B2;";
const DOWNARROW = "&#x25BC;";
var sortingStatus;

app.ui = {
    createAnyDOMElement: function(name, attributes){
        let newElement = document.createElement(name);
        for (let key in attributes){
            newElement.setAttribute(key, attributes[key]);
        }
        return newElement;
    },
    
    showErrorMessage: function(err){
        let errorMessageContainer = document.querySelector(".error-message-container");
        errorMessageContainer.innerHTML = "";
        let alertDiv = app.ui.createAnyDOMElement("div", {
            "class": "alert alert-danger alert-dismissible fade show",
            "role": "alert"
        });
        alertDiv.innerText = err;
        let closeButton = app.ui.createAnyDOMElement("button", {
            "type": "button",
            "class": "btn-close",
            "data-bs-dismiss": "alert",
            "aria-label": "Close"
        });
        alertDiv.appendChild(closeButton);
        errorMessageContainer.appendChild(alertDiv);
    },
    
    showCrawingStatusMessage: function(message){
        let crawlingInfoArea = document.querySelector(".info-message-container");
        crawlingInfoArea.innerText = message;
    },

    prepareShowingTable: function(bicycleDataPackage) {
        app.ui.showTableInfoText();
        app.ui.initSortingStatus();
        bicycleDataPackage.sort(app.ui.compareByName);
        app.ui.showDataInTable(bicycleDataPackage);
        app.ui.initSortingButtons(bicycleDataPackage);
    },
    
    showDataInTable: function(bicycleDataPackage){
        let tableBody = document.querySelector(".table-container tbody");
        tableBody.innerHTML = "";
    
        for (let i=0; i<bicycleDataPackage.length; i++){
            let row = app.ui.createAnyDOMElement("tr");
            let nameCell = app.ui.createAnyDOMElement("td");
            nameCell.innerText = bicycleDataPackage[i].name;
            let priceCell = app.ui.createAnyDOMElement("td", {
                "align": "right"
            });
            priceCell.classList.add("price-cell");
            priceCell.innerText = app.ui.formatPrice(bicycleDataPackage[i].price) + " Ft";
            row.appendChild(nameCell);
            row.appendChild(priceCell);
            row.addEventListener("click", function(){
                window.open(bicycleDataPackage[i].url);
            });
            tableBody.appendChild(row);
        }
    
    },
    
    showTableInfoText: function() {
        let tableInfo = document.querySelectorAll(".table-container p");
        for (let i=0; i<tableInfo.length; i++) {
            tableInfo[i].classList.remove("visually-hidden");
        }
    },
    
    compareByName: function(a, b) {
        let nameA = a.name.toUpperCase();
        let nameB = b.name.toUpperCase();
        if (sortingStatus.direction === "asc") {
            if ( nameA < nameB ){
                return -1;
            }
            if ( nameA > nameB ){
                return 1;
            }
        }
        if (sortingStatus.direction === "desc") {
            if ( nameA < nameB ){
                return 1;
            }
            if ( nameA > nameB ){
                return -1;
            }
        }
        return 0;
    },
    
    compareByPrice: function(a, b) {
        if (sortingStatus.direction === "asc") {
            if ( parseInt(a.price) < parseInt(b.price) ){
                return -1;
            }
            if ( parseInt(a.price) > parseInt(b.price) ){
                return 1;
            }
        }
        if (sortingStatus.direction === "desc") {
            if ( parseInt(a.price) < parseInt(b.price) ){
                return 1;
            }
            if ( parseInt(a.price) > parseInt(b.price) ){
                return -1;
            }
        }
        return 0;
    },
    
    initSortingStatus: function() {
        sortingStatus = {
            "sortingBy": "name",
            "direction": "asc"
        }
    },
    
    initSortingButtons: function(bicycleDataPackage) {
        let nameArrow = document.querySelector("#name-header-arrow");
        let priceArrow = document.querySelector("#price-header-arrow");
        let eventListenersNeeded = false;
        if (nameArrow.innerHTML.length < 1 && priceArrow.innerHTML.length < 1){
            eventListenersNeeded = true;
        }
        nameArrow.classList.remove("inactive");
        priceArrow.classList.add("inactive");
        nameArrow.innerHTML = DOWNARROW;
        priceArrow.innerHTML = DOWNARROW;

        if (eventListenersNeeded) {
            console.log("Adding event listeners.");
            nameArrow.addEventListener("click", function(){
                if (sortingStatus.sortingBy === "name" && sortingStatus.direction === "asc"){
                    nameArrow.innerHTML = UPARROW;
                    sortingStatus.direction = "desc";
                } else if (sortingStatus.sortingBy === "name" && sortingStatus.direction === "desc") {
                    nameArrow.innerHTML = DOWNARROW;
                    sortingStatus.direction = "asc";
                } else if (sortingStatus.sortingBy === "price") {
                    priceArrow.innerHTML = DOWNARROW;
                    priceArrow.classList.add("inactive");
                    nameArrow.classList.remove("inactive");
                    sortingStatus.sortingBy = "name"
                    sortingStatus.direction = "asc";
                }
                bicycleDataPackage.sort(app.ui.compareByName);
                app.ui.showDataInTable(bicycleDataPackage);
            });

            priceArrow.addEventListener("click", function(){
                if (sortingStatus.sortingBy === "price" && sortingStatus.direction === "asc"){
                    priceArrow.innerHTML = UPARROW;
                    sortingStatus.direction = "desc";
                } else if (sortingStatus.sortingBy === "price" && sortingStatus.direction === "desc") {
                    priceArrow.innerHTML = DOWNARROW;
                    sortingStatus.direction = "asc";
                } else if (sortingStatus.sortingBy === "name") {
                    nameArrow.innerHTML = DOWNARROW;
                    nameArrow.classList.add("inactive");
                    priceArrow.classList.remove("inactive");
                    sortingStatus.sortingBy = "price"
                    sortingStatus.direction = "asc";
                }
                bicycleDataPackage.sort(app.ui.compareByPrice);
                app.ui.showDataInTable(bicycleDataPackage);
            });
        }
    },
    
    formatPrice: function(price){
        let formattedPrice = "";
        let digitsInABlockOfThree = 1;
        for (let i = price.length - 1; i>-1; i--) {
            if (digitsInABlockOfThree > 3) {
                formattedPrice = price.charAt(i) + " " + formattedPrice;
                digitsInABlockOfThree = 1;
            } else {
                formattedPrice = price.charAt(i) + formattedPrice;
            }
            digitsInABlockOfThree = digitsInABlockOfThree + 1;
        }
        return formattedPrice;
    },
    
    activateStartButton: function(){
        let startScrappingButton = document.querySelector(".button-div button");
        startScrappingButton.removeAttribute("disabled");
    },

    deactivateStartButton: function(){
        let startScrappingButton = document.querySelector(".button-div button");
        startScrappingButton.setAttribute("disabled", "disabled");
    },

    showSpinner: function() {
        let spinner = document.querySelector(".spinner-div");
        spinner.classList.remove("visually-hidden");
    },

    hideSpinner: function() {
        let spinner = document.querySelector(".spinner-div");
        spinner.classList.add("visually-hidden");
    },

    showCrawlingInfoArea: function() {
        let crawlingInfoArea = document.querySelector(".info-message-container");
        crawlingInfoArea.classList.remove("visually-hidden");
    },

    hideCrawlingInfoArea: function() {
        let crawlingInfoArea = document.querySelector(".info-message-container");
        crawlingInfoArea.innerText = "";
        crawlingInfoArea.classList.add("visually-hidden");
    },

    resetInfoArea(){
        app.ui.activateStartButton();
        app.ui.hideSpinner();
        app.ui.hideCrawlingInfoArea();
    },

    initCrawlingButton: function(){
        let startScrappingButton = document.querySelector(".button-div button");
        startScrappingButton.addEventListener("click", function(ev){
            app.ui.deactivateStartButton();
            app.ui.showSpinner();
            app.ui.showCrawlingInfoArea();
            app.data_handler.startCrawling();
        })
    }

}