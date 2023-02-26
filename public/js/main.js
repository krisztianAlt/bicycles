var app = app || {};

app.init = function() {
    app.ui.initCrawlingButton();
};

$(document).ready(app.init());