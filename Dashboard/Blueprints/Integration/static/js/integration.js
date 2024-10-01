$(document).ready(function() {
    // Add event listener to the search bar
    $('#searchBar').on('input', function() {
        const query = $(this).val().toLowerCase();
        searchFiles(query);
    });

    // Function to search files
    function searchFiles(query) {
        const fileLists = ['#successFilesList', '#impossibleFilesList', '#errorFilesList'];

        fileLists.forEach(listId => {
            $(listId).children().each(function() {
                const fileName = $(this).text().toLowerCase();
                if (fileName.includes(query)) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        });
    }

    window.handleCaretClick = function(caretIcon) {
        const $caretIcon = $(caretIcon);
        const id = $caretIcon.data('id');

        // Toggle rotation for the clicked icon
        $caretIcon.toggleClass('-rotate-90').toggleClass('rotate-0');

        // Toggle the corresponding details section
        const detailsSection = $(`[data-id="${id}"]`).not($caretIcon);
        detailsSection.toggleClass('hidden');
    };

    // Function to handle click event for hidden sections (Fiches Eval)
    window.handleFichesEvalCaretClick = function(caretIcon) {
        const $caretIcon = $(caretIcon);
        const id = $caretIcon.data('id');

        // Toggle rotation for the clicked icon
        $caretIcon.toggleClass('-rotate-90').toggleClass('rotate-0');

        // Toggle the corresponding details section
        const detailsSection = $(`#${id}`);
        detailsSection.toggleClass('hidden');

        // Check if the clicked icon is for the Fiches Eval section
        if (!detailsSection.hasClass('hidden')) {
            console.log('Fiches Eval section opened');
            fetchAndDisplayFiles();
        }
    };

    // Attach click event to file list items
    $('.custom-scrollbar').on('click', 'tr', function() {
        const fileName = $(this).text();
        openModal(fileName);
    });

    // Event to close the modal
    $('#closeModal').on('click', function() {
        $('#fileDetailsModal').addClass('hidden');
    });
});

function formatDate(dateStr, isStartDate) {
    const [day, month, year] = dateStr.split('/');
    const formattedDate = `${year}-${month}-${day} ${isStartDate ? '00:00:00' : '23:59:59'}`;
    return formattedDate;
}

function fetchAndDisplayFiles() {
    const startDate = formatDate($('#startDate').val(), true);
    const endDate = formatDate($('#endDate').val(), false);

    $.ajax({
        url: '/integration/files',
        method: 'GET',
        data: { startDate: startDate, endDate: endDate },
        success: function(data) {
            displayFiles(data);
        },
        error: function(error) {
            console.error('Erreur lors de la récupération des fichiers:', error);
        }
    });
}

function displayFiles(data) {
    // Clear existing lists
    $('#impossibleFilesList').empty();
    $('#errorFilesList').empty();
    $('#successFilesList').empty();

    // Function to create a file row and attach click event
    function createFileRow(file) {
        const row = $(`<div class="p-2 text-white cursor-pointer hover:underline">${file}</div>`);
        row.on('click', function() {
            openModal(file);
        });
        return row;
    }

    // Append impossible files
    data.impossibleFiles.forEach(file => {
        $('#impossibleFilesList').append(createFileRow(file));
    });

    // Append error files
    data.errorFiles.forEach(file => {
        $('#errorFilesList').append(createFileRow(file));
    });

    // Append success files
    data.successFiles.forEach(file => {
        $('#successFilesList').append(createFileRow(file));
    });
}

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
        
        // Detailed counts for Fiches Eval
        const impossibleFichesEvalElement = $('#impossibleFichesEvalExp');
        const errorFichesEvalElement = $('#errorFichesEvalExp');
        const successFichesEvalElement = $('#successFichesEvalExp');

        if (totalFilesElement.length && successCountElement.length && errorCountElement.length && impossibleCountElement.length) {
            totalFilesElement.text(total);
            successCountElement.text(success);
            errorCountElement.text(error);
            impossibleCountElement.text(impossible);
            
            // Update counts for Fiches Eval
            impossibleFichesEvalElement.text(impossible);
            errorFichesEvalElement.text(error);
            successFichesEvalElement.text(success);
            clearInterval(interval);
        }
    }, 100);
}

function openModal(fileName) {
    $.ajax({
        url: '/integration/file-details',
        method: 'GET',
        data: { fileName: fileName },
        success: function(data) {
            if (data.error) {
                $('#fileDetailsContent').html(`<p class="text-red-500">${data.error}</p>`);
            } else {
                const gerants = data.gerants;
                let gerantsText = '';

                if (gerants.length === 1) {
                    gerantsText = `Gérant/Analyste: ${gerants[0]}`;
                } else if (gerants.length === 2) {
                    gerantsText = `Gérants/Analystes: ${gerants[0]} & ${gerants[1]}`;
                }

                const ticker = `Ticker: ${data.ticker}`;
                const etat = data.etat;
                const commentaire = data.commentaire || 'Pas de commentaire';

                let etatColor, etatIcon;
                switch (etat) {
                    case 'Fichier traité':
                        etatColor = 'bg-green-100 text-green-700';
                        etatIcon = 'fa-check-circle';
                        break;
                    case 'erreur inconnue':
                        etatColor = 'bg-red-100 text-red-700';
                        etatIcon = 'fa-exclamation-circle';
                        break;
                    default:
                        etatColor = 'bg-yellow-100 text-yellow-700';
                        etatIcon = 'fa-exclamation-triangle';
                }

                $('#modalTitle').text(data.fileName);
                $('#fileDetailsContent').html(`
                    <div class="text-left">
                        <p class="mt-4">${gerantsText}</p>
                        <p class="mt-2">${ticker}</p>
                        <div class="mt-4 p-4 ${etatColor} rounded-lg flex items-center">
                            <i class="fas ${etatIcon} mr-2"></i>
                            <span>État: ${etat}</span>
                        </div>
                        <div class="mt-2 p-4 bg-gray-100 text-gray-700 rounded-lg">
                            <i class="fas fa-comment-dots mr-2"></i>
                            <span>${commentaire}</span>
                        </div>
                    </div>
                `);
            }
            $('#fileDetailsModal').removeClass('hidden');
        },
        error: function(error) {
            console.error('Erreur lors de la récupération des détails du fichier:', error);
            $('#fileDetailsContent').html(`<p class="text-red-500">Erreur lors de la récupération des détails du fichier</p>`);
            $('#fileDetailsModal').removeClass('hidden');
        }
    });
}

window.updateExpandedIntegrationStats = updateExpandedIntegrationStats;