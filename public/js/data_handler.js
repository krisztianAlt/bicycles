var app = app || {};

app.data_handler = {
    startCrawling: function(){
        $.ajax({
            url: '/bicycles',
            type: 'GET',
            success: function(response) {
                let resp = JSON.parse(response);
                let crawlingProcessId = resp.processId;
                let message = resp.message;
                app.ui.showCrawingStatusMessage(message);
                app.data_handler.checkCrawlingProcess(crawlingProcessId);
            },
            error: function(err) {
                let errorMessage = JSON.parse(err.responseText);
                app.ui.showErrorMessage(errorMessage.error);
                app.ui.resetInfoArea();
            }
        })
    },

    checkCrawlingProcess: function(crawlingProcessId){
        let dataPackage = {"process_id": crawlingProcessId};
        setTimeout(function(){
            $.ajax({
                url: '/checking',
                type: 'POST',
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(dataPackage),
                dataType: 'json',
                success: function(response) {
                    let crawlingProcessId = response.processId;
                    let status = response.status;
                    if (status === "finished"){
                        app.ui.prepareShowingTable(response.laptopDataPackage);
                        app.ui.resetInfoArea();
                    } else {
                        app.ui.showCrawingStatusMessage(response.message);
                        app.data_handler.checkCrawlingProcess(crawlingProcessId);
                    }
                },
                error: function(err) {
                    app.ui.showErrorMessage(JSON.parse(err.responseText).error);
                    app.ui.resetInfoArea();
                }
            })
        }, 800);
    }
}