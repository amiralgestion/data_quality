$(document).ready(function() {

    $('.fa-caret-down').on('click', function() {
        $(this).toggleClass('rotate-0');
        $(this).toggleClass('-rotate-90');
    });
    
});


function handleExpandedIntegrationSuccess(data) {
    updateExpandedIntegrationStats(data.totalFiles, data.successCount, data.impossibleCount);
    handleIntegrationSuccess(data);
}

function updateExpandedIntegrationStats(total, success, impossible) {
    const error = total - success - impossible;
    const interval = setInterval(() => {
        const totalFilesElement = $('#totalFilesExp');
        const successCountElement = $('#successCountExp');
        const errorCountElement = $('#errorCountExp');
        const impossibleCountElement = $('#impossibleCountExp');

        if (totalFilesElement.length && successCountElement.length && errorCountElement.length && impossibleCountElement.length) {
            totalFilesElement.text(total);
            successCountElement.text(success);
            errorCountElement.text(error);
            impossibleCountElement.text(impossible);
            clearInterval(interval);
        }
    }, 100);
    data = {
        totalFiles: total,
        successCount: success,
        errorCount: error,
        impossibleCount: impossible
    };
    handleIntegrationSuccess(data);
}

window.updateExpandedIntegrationStats = updateExpandedIntegrationStats;
