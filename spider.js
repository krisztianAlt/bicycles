const request = require('request');
const cheerio = require('cheerio');
const { response } = require('express');

const MAIN_PAGE_URL = "https://bikepro.hu";

const crawlingProcesses = [];

const getHTMLCode = (url) => {
    return new Promise((resolve, reject) => {
        request(url, function (err, res, body) {
            if (err) {
                return reject (err);
            }
            resolve(body);
        })
    })
}

const getBicycleData = (nextURL, processId, bicycleDatas, categoryPageIsNeeded) => 
    getHTMLCode(nextURL).then((pageBody) => {
        let nextPageURL;
        if (processId === undefined && categoryPageIsNeeded) {
            let newProcessId = createNewCrawlingProcess(bicycleDatas);
            try {
                nextPageURL = extractBicycleCategoryURL(pageBody);  
                console.log("Category page is found: ", nextPageURL);
                getBicycleData(nextPageURL, newProcessId, bicycleDatas, false);
                return ({"id": newProcessId, "message": "Bicycle category page is found, crawling started."});
            } catch (err) {
                throw new Error(err.message);
            }
        } else {
            let process = getCrawlingProcessById(processId);            
            console.log("Crawling: ", nextURL);
            nextPageURL = extractBicycleDataFromHTMLCode(pageBody, bicycleDatas);
            console.log("In getBicycleData(), nextPageURL: " + nextPageURL);
            process.finished_pages = process.finished_pages + 1;
            process.bicycleDatas = bicycleDatas;
            if (nextPageURL === undefined){
                process.status = "finished";
                console.log("Crawling is over.");
            } else {
                if (process.status === "started") {
                    process.status = "in progress";
                }
                return getBicycleData(nextPageURL, processId, bicycleDatas, false);
            }
        }
    });

function extractBicycleCategoryURL(mainPageBody) {
    let $ = cheerio.load(mainPageBody);
    let bicycleCategoryURL = $('a').filter(function() {
        return $(this).text().trim() === 'City kerékpár';
      }).attr("href");
    if (bicycleCategoryURL === undefined) {
        throw new Error("Category URL is not found.");
    }
    return (bicycleCategoryURL);
}

function extractBicycleDataFromHTMLCode(pageBody, bicycleDatas) {
    let $ = cheerio.load(pageBody);
    // let nextPageURL = $("div[class='pagination'] div[class='links']").find("b").next().attr("href");
    let nextPageURL = $(".pagination-wrapper li[class='page-item active']").next().children("a").attr("href");
    $("div[class='snapshot-list-container'] div[class='product-snapshot list_div_item']").each(function(){
        // let productName = $(this).find("div[class='snapshot-list-item list_prouctname'] a").text();
        let productName = $(this).find(".product-card-title a").text();
        // let productPrice = $(this).find("div[class='snapshot-list-item list_prouctprice'] span[class='list_price']").text().trim();
        let productPrice = $(this).find(".product-card-price span[class='product-price']").text().trim();
        productPrice = productPrice.replace(/[.]/g, '');
        productPrice = productPrice.replace(' Ft', '');
        // let productURL = $(this).find("div[class='snapshot-list-item list_prouctname'] a").attr("href");
        let productURL = $(this).find(".product-card-title a").attr("href");

        if (productName.length > 1){
            let bicycle = {
                name: productName,
                price: productPrice,
                url: productURL
            }
            bicycleDatas.push(bicycle);
        }
    });
    return (nextPageURL);
}

function createNewCrawlingProcess(bicycleDatas){
    let id = uuidv4();
    let newProcess = {
        "id": id,
        "status": "started",
        "finished_pages": 0,
        "bicycleDatas": bicycleDatas
    }
    crawlingProcesses.push(newProcess);
    return id;
}

function getCrawlingProcessById(id){;
    return crawlingProcesses.find(process => process.id === id);
}

function checkCrawlingProcess(processId){
    let process = getCrawlingProcessById(processId);
    if (process.status === "failed") {
        throw new Error("Crawling process failed.");
    } else {
        let response = {
            "processId": process.id,
            "status": process.status,
        }
        if (process.status === "finished"){
            response.message = "Crawling is over.";
            response.laptopDataPackage = process.bicycleDatas;
            deleteCrawlingProcessById(processId);
        } else {
            response.message = "The examination of " + process.finished_pages + " pages has been completed.";
        }
        return response;
    }
}

function deleteCrawlingProcessById(processId){
    let indexOfItemToBeDeleted;
    for (let index = 0; index < crawlingProcesses.length; index++){
        if (crawlingProcesses[index].id === processId){
            indexOfItemToBeDeleted = index;
            break;
        }
    }

    if (indexOfItemToBeDeleted === undefined){
        return "Process is not found.";
    }
    
    return crawlingProcesses.splice(indexOfItemToBeDeleted, 1);
}

/*
function testDeleteCrawlingProcessById(){
    let process0 = {"id": "1234qwe", "status": "in progress"};
    let process1 = {"id": "1254qwe", "status": "started"};;
    let process2 = {"id": "1274qwe", "status": "finished"};;
    let process3 = {"id": "1294qwe", "status": "in progress"};;
    crawlingProcesses.push(process0);
    crawlingProcesses.push(process1);
    crawlingProcesses.push(process2);
    crawlingProcesses.push(process3);
    console.log(deleteCrawlingProcessById("6274qwe"));
    console.log(deleteCrawlingProcessById("174qwe"));
    console.log(crawlingProcesses);
}

testDeleteCrawlingProcessById()
*/

function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

module.exports = {
    getBicycleData,
    checkCrawlingProcess,
    MAIN_PAGE_URL
};
