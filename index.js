/*
1. Schema:

    Bicycle {
        name: string,
        price: number,
        url: string
    }

2. Tipps & infos:
    - Starting program in dev environment (see in package.json): npm run dev
    - Sample for using Promise: https://www.geeksforgeeks.org/node-js-promise-chaining/
    - Promises (recursion): https://newbedev.com/while-loop-with-promises
*/

const express = require("express");
const app = express();
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const spiderModule = require("./spider.js");
const getBicycleData = spiderModule.getBicycleData;
const checkCrawlingProcess = spiderModule.checkCrawlingProcess;
const MAIN_PAGE_URL = spiderModule.MAIN_PAGE_URL;

const port = process.env.PORT || 8080;

app.use(express.static("public"));
app.use(favicon(__dirname + '/public/fav/favicon.ico'));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/templates/main.html");
});

app.get("/bicycles", (req, res) => {
    let bicycleDatas = [];
    let categoryPageIsNeeded = true;
    getBicycleData(MAIN_PAGE_URL, undefined, bicycleDatas, categoryPageIsNeeded).then((response) => {
        console.log(response.message + " Process ID: " + response.id);
        res.status(200);
        res.send(JSON.stringify({"processId" : response.id, "message": response.message}));
    }).catch((err) => {
        console.log("Problem occured.");
        console.error(err.message);
        res.status(404);
        res.send(JSON.stringify({"error": "Sorry, problem occured. Please, try later!"}));
    });

    /*
    // Old version:
    getBicycleData(MAIN_PAGE_URL, bicycleDatas, categoryPageIsNeeded).then((bicycleDatas) => {
        console.log('Size of laptop data package: ', bicycleDatas.length);
        res.status(200);
        res.send(JSON.stringify(bicycleDatas));
    }).catch((err) => {
        console.log("Problem occured.");
        console.error(err.message);
        res.status(404);
        res.send({"error": "Sorry, problem occured. Please, try later!"});
    })
    */
});

app.post("/checking", jsonParser, (req, res) => {
    let crawlingProcessId = req.body.process_id;
    try {
        let responsePackage = checkCrawlingProcess(crawlingProcessId);
        res.send(JSON.stringify(responsePackage));
    } catch (err) {
        console.error(err.message);
        res.status(404);
        res.send(JSON.stringify({"error": "Sorry, problem occured. Please, try later!"}));
    }
});

app.get('*', function(req, res){
    res.status(404);
    res.sendFile(__dirname + "/templates/404.html");
});

app.listen(port);