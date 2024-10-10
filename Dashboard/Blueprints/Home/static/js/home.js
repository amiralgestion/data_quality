$(document).ready(function() {
    // Expose functions globally if needed
    window.handleIntegrationSuccess = handleIntegrationSuccess;
    window.handleReferenceSuccess = handleReferenceSuccess;
    window.handleExpandedIntegrationSuccess = handleExpandedIntegrationSuccess;
    window.handleExpandedReferenceSuccess = handleExpandedReferenceSuccess;
    window.toggleExpand = toggleExpand;
    window.refreshBox = refreshBox;

    // Load all box stats on page load
    loadAllBoxStats();
});

let isAnimating = false;
let initialContents = {};

function loadAllBoxStats() {
    let startDate = $('#startDate').val();
    let endDate = $('#endDate').val();

    // Set default dates if inputs are empty
    if (!startDate) {
        const today = new Date();
        startDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
        $('#startDate').val(startDate);
    }

    if (!endDate) {
        const today = new Date();
        endDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
        $('#endDate').val(endDate);
    }

    const formattedStartDate = formatDate(startDate, true);
    const formattedEndDate = formatDate(endDate, false);

    if (!formattedStartDate || !formattedEndDate) {
        alert('Date de début ou de fin manquante');
        return;
    }

    // Load integration stats
    $.ajax({
        url: '/integration/data',
        method: 'GET',
        data: {
            startDate: formattedStartDate,
            endDate: formattedEndDate
        },
        success: function(data) {
            handleIntegrationSuccess(data);
        },
        error: function() {
            alert('Échec de la mise à jour des données d\'intégration');
        }
    });

    // Load reference stats
    $.ajax({
        url: '/reference/data',
        method: 'GET',
        success: function(data) {
            handleReferenceSuccess(data);
        },
        error: function() {
            alert('Échec de la mise à jour des données de référence');
        }
    });
}

// Utility Functions
function formatDate(dateStr, isStartDate) {
    const [day, month, year] = dateStr.split('/');
    const formattedDate = `${year}-${month}-${day} ${isStartDate ? '00:00:00' : '23:59:59'}`;
    return formattedDate;
}

// Animation Functions
function getExpandProps(index) {
    switch (index) {
        case 0: return {height: "835px", width: "1536px"};
        case 1: return {height: "835px", width: "1536px", left: "-784px"};
        case 2: return {height: "835px", width: "1536px", top: "-435px"};
        case 3: return {height: "835px", width: "1536px", top: "-435px", left: "-784px"};
    }
}

function getCollapseProps(index) {
    switch (index) {
        case 0: return {height: "400px", width: "752px"};
        case 1: return {height: "400px", width: "752px", left: "0"};
        case 2: return {height: "400px", width: "752px", top: "0"};
        case 3: return {height: "400px", width: "752px", top: "0", left: "0"};
    }
}

function animateBox($element, $allBoxes, expand, container_name) {
    const animationProps = expand ? getExpandProps($element.index()) : getCollapseProps($element.index());
    $element.animate(animationProps, 300, 'linear', function() {
        if (expand) {
            const startDate = $('#startDate').val();
            const endDate = $('#endDate').val();
            loadBlueprintContent(container_name, startDate, endDate);
        } else {
            $allBoxes.css('visibility', 'visible');
        }
        isAnimating = false;
    });
}

// Box Content Management Functions
function saveInitialBoxContent(container_name) {
    const $container = $(`#${container_name}`);
    initialContents[container_name] = $container.html();
    return initialContents[container_name];
}

function hideBoxElements(container_name) {
    const $container = $(`#${container_name}`);
    $container.children().not('.keep-visible').hide();
}

function loadBlueprintContent(container_name) {
    const $container = $(`#${container_name}`);
    $.ajax({
        url: `/${container_name}/content`,
        method: 'GET',
        success: function(data) {
            $container.append(data);
        },
        error: function() {
            alert('Échec du chargement du contenu');
        }
    });
}

// Integration Functions
function handleIntegrationSuccess(data) {
    console.log("handleIntegrationSuccess");
    updateIntegrationStats(data.totalFiles, data.successCount, data.impossibleCount);
}

function handleExpandedIntegrationSuccess(data) {
    console.log("handleExpandedIntegrationSuccess");
    updateExpandedIntegrationStats(data.totalFiles, data.successCount, data.impossibleCount);
}

function handleExpandedReferenceSuccess(data) {
    updateExpandedReferenceStats(data.total_entries, data.conform_data.length, data.missing_data.length, data.non_conform_data.length);
}

function updateIntegrationStats(total, success, impossible) {
    const error = total - success - impossible;
    const totalFilesElement = document.getElementById('totalFiles');
    const successCountElement = document.getElementById('successCount');
    const errorCountElement = document.getElementById('errorCount');
    const impossibleCountElement = document.getElementById('impossibleCount');
    const successBarElement = document.getElementById('successBar');
    const errorBarElement = document.getElementById('errorBar');
    const impossibleBarElement = document.getElementById('impossibleBar');

    if (totalFilesElement && successCountElement && errorCountElement && impossibleCountElement && successBarElement && errorBarElement && impossibleBarElement) {
        totalFilesElement.innerText = total;
        successCountElement.innerText = success;
        errorCountElement.innerText = error;
        impossibleCountElement.innerText = impossible;

        const successPercentage = (success / total) * 100;
        const errorPercentage = (error / total) * 100;
        const impossiblePercentage = (impossible / total) * 100;

        successBarElement.style.width = successPercentage + '%';
        errorBarElement.style.width = errorPercentage + '%';
        impossibleBarElement.style.width = impossiblePercentage + '%';

        Highcharts.chart('integrationChart', {
            chart: {
                type: 'pie',
                backgroundColor: 'transparent',
                height: 250,
                width: 250
            },
            title: {
                text: null
            },
            credits: {
                enabled: false
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            exporting: {
                enabled: false
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: false,
                    innerSize: '50%',
                    borderWidth: 0
                }
            },
            series: [{
                name: 'Files',
                colorByPoint: true,
                data: [{
                    name: 'Success',
                    y: successPercentage,
                    color: '#388E3C'
                }, {
                    name: 'Error',
                    y: errorPercentage,
                    color: '#F57C00'
                }, {
                    name: 'Impossible',
                    y: impossiblePercentage,
                    color: '#D32F2F'
                }]
            }]
        });
    }
}

// Reference Functions

function handleReferenceSuccess(data) {
    updateReferenceStats(data.total_entries, data.conform_data.length, data.missing_data.length, data.non_conform_data.length);
}

function updateReferenceStats(total, conform, missing, nonConform) {
    const totalFilesElement = document.getElementById('totalEntries');
    const conformEl = document.getElementById('conformes');
    const missingEl = document.getElementById('manquantes');
    const nonConformEl = document.getElementById('non-conformes');

    if (totalFilesElement && conformEl && missingEl && nonConformEl) {
        totalFilesElement.innerText = total;
        conformEl.innerText = conform;
        missingEl.innerText = missing;
        nonConformEl.innerText = nonConform;

        const conformPercentage = (conform / total) * 100;
        const missingPercentage = (missing / total) * 100;
        const nonConformPercentage = (nonConform / total) * 100;

        Highcharts.chart('referenceChart', {
            chart: {
                type: 'bar',
                backgroundColor: 'transparent',
                height: 250,
                width: 250,
                style: {
                    fontFamily: 'Arial, sans-serif'
                }
            },
            title: {
                text: null
            },
            credits: {
                enabled: false
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.y:.2f}%</b>'
            },
            exporting: {
                enabled: false
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true,
                        format: '{point.y:.2f}%',
                        style: {
                            color: '#FFFFFF'
                        }
                    }
                },
                series: {
                    borderWidth: 0,
                    shadow: false
                }
            },
            xAxis: {
                categories: ['Non&#8209;conformes', 'Manquantes', 'Conformes'],
                title: {
                    text: null
                },
                labels: {
                    style: {
                        color: '#D3D3D3'
                    }
                },
                lineWidth: 0,
                minorGridLineWidth: 0,
                lineColor: 'transparent',
                minorTickLength: 0,
                tickLength: 0
            },
            yAxis: {
                min: 0,
                max: 100,
                title: {
                    text: null,
                },
                labels: {
                    overflow: 'justify',
                    style: {
                        color: '#D3D3D3'
                    }
                },
                gridLineWidth: 0
            },
            series: [{
                name: 'Files',
                data: [
                    { name: 'Non-conformes', y: nonConformPercentage, color: '#D32F2F' },
                    { name: 'Manquantes', y: missingPercentage, color: '#F57C00' },
                    { name: 'Conformes', y: conformPercentage, color: '#388E3C' }
                ],
                dataLabels: {
                    style: {
                        color: '#FFFFFF'
                    }
                },
                showInLegend: false
            }]
        });
    }
}

// Box Toggle Functions
function toggleExpand(element) {
    if (isAnimating) return;

    const $element = $(element).parent();
    const container_name = $element.attr('id');
    const isExpanded = $element.hasClass('expanded');
    const $allBoxes = $('.grid > div');

    isAnimating = true;

    if (isExpanded) {
        // Collapse the box
        $element.removeClass('expanded');
        $element.html(initialContents[container_name]);
        animateBox($element, $allBoxes, false);
        refreshBox($element);
    } else {
        saveInitialBoxContent(container_name);
        hideBoxElements(container_name);

        $allBoxes.css('visibility', 'hidden');
        $element.css('visibility', 'visible');

        animateBox($element, $allBoxes, true, container_name);
        updateExpandedBoxData(container_name);

        $element.addClass('expanded');
    }
}

// AJAX Calls
function updateExpandedBoxData(container_name) {
    const startDate = formatDate($('#startDate').val(), true);
    const endDate = formatDate($('#endDate').val(), false);

    if (!startDate || !endDate) {
        alert('Date de début ou de fin manquante');
        return;
    }
    if (container_name === 'integration') {
        $.ajax({
            url: '/integration/data',
            method: 'GET',
            data: {
                startDate: startDate,
                endDate: endDate
            },
            success: function(data) {
                handleExpandedIntegrationSuccess(data);
            },
            error: function() {
                alert('Échec de la mise à jour des données');
            }
        });
    } else if (container_name === 'reference') {
        $.ajax({
            url: '/reference/data',
            method: 'GET',
            success: function(data) {
                handleExpandedReferenceSuccess(data);
            },
            error: function() {
                alert('Échec de la mise à jour des données');
            }
        });
    }
}

function refreshBox(element) {
    const $icon = $(element);
    const $box = $icon.closest('div');
    $icon.addClass('spin');
    setTimeout(function() {
        $icon.removeClass('spin');

        const startDate = formatDate($('#startDate').val(), true);
        const endDate = formatDate($('#endDate').val(), false);

        if (!startDate || !endDate) {
            alert('Date de début ou de fin manquante');
            return;
        }

        if ($box.find('.integration').length) {
            $.ajax({
                url: '/integration/data',
                method: 'GET',
                data: {
                    startDate: startDate,
                    endDate: endDate
                },
                success: function(data) {
                    handleIntegrationSuccess(data);
                    handleExpandedIntegrationSuccess(data);
                },
                error: function() {
                    alert('Échec de la mise à jour des données');
                }
            });
        } else if ($box.find('.reference').length) {
            $.ajax({
                url: '/reference/data',
                method: 'GET',
                success: function(data) {
                    handleReferenceSuccess(data);
                    handleExpandedReferenceSuccess(data);
                },
                error: function() {
                    alert('Échec de la mise à jour des données');
                }
            });
        }
    }, 600);
}