$(document).ready(function() {
    let isAnimating = false; // Flag pour vérifier si une animation est en cours

    // Expand la boîte cliquée
    window.toggleExpand = function(element) {
        if (isAnimating) return;

        const $element = $(element).parent();
        const isExpanded = $element.hasClass('expanded');
        const $allBoxes = $('.grid > div');

        isAnimating = true;

        if (isExpanded) {
            $element.removeClass('expanded');
            if ($element.index() === 0) { // En haut à gauche
                $element.animate({height: "400px", width: "752px"}, 300, 'linear', function() {
                    $allBoxes.css('visibility', 'visible');
                    isAnimating = false;
                });
            } else if ($element.index() === 1) { // En haut à droite
                $element.animate({height: "400px", width: "752px", left: "0"}, 300, 'linear', function() {
                    $allBoxes.css('visibility', 'visible');
                    isAnimating = false;
                });
            } else if ($element.index() === 2) { // En bas à gauche
                $element.animate({height: "400px", width: "752px", top: "0"}, 300, 'linear', function() {
                    $allBoxes.css('visibility', 'visible');
                    isAnimating = false;
                });
            } else if ($element.index() === 3) { // En bas à droite
                $element.animate({height: "400px", width: "752px", top: "0", left: "0"}, 300, 'linear', function() {
                    $allBoxes.css('visibility', 'visible');
                    isAnimating = false;
                });
            }
        } else {
            $allBoxes.css('visibility', 'hidden');
            $element.css('visibility', 'visible');

            // Déterminer l'animation d'expansion en fonction de la position de la boîte
            if ($element.index() === 0) { // En haut à gauche
                $element.animate({height: "835px", width: "1536px"}, 300, 'linear', function() {
                    isAnimating = false;
                });
            } else if ($element.index() === 1) { // En haut à droite
                $element.animate({height: "835px", width: "1536px", left: "-784px"}, 300, 'linear', function() {
                    isAnimating = false;
                });
            } else if ($element.index() === 2) { // En bas à gauche
                $element.animate({height: "835px", width: "1536px", top: "-432px"}, 300, 'linear', function() {
                    isAnimating = false;
                });
            } else if ($element.index() === 3) { // En bas à droite
                $element.animate({height: "835px", width: "1536px", left: "-784px", top: "-430px"}, 300, 'linear', function() {
                    isAnimating = false;
                });
            }

            $element.addClass('expanded');
        }
    }

    // Fonction pour refresh le contenu d'une boîte
    window.refreshBox = function(element) {
        const $icon = $(element);
        const $box = $icon.closest('div');
        $icon.removeClass('fa-sharp fa-solid fa-arrows-rotate').addClass('spin fa-solid fa-spinner-third');
        
        setTimeout(function() {
            $icon.removeClass('spin fa-solid fa-spinner-third').addClass('fa-sharp fa-solid fa-arrows-rotate');
            
            if ($box.find('.integration').length) {
                // Informations de test
                const newSuccess = Math.floor(Math.random() * 5000);
                const newError = Math.floor(Math.random() * 3000);
                const newImpossible = Math.floor(Math.random() * 1000);
                updateIntegrationStats(newSuccess, newError, newImpossible);
            } else if ($box.find('.presence').length) {
                // Informations de test
            } else if ($box.find('.reference').length) {
                // Informations de test
            } else if ($box.find('.analysis').length) {
                // Informations de test
            }
        }, 1000);
    }

    // Fonction pour mettre à jour les statistiques d'intégration
    function updateIntegrationStats(success, error, impossible) {
        const total = success + error + impossible;
        const totalFilesElement = document.getElementById('totalFiles');
        const successCountElement = document.getElementById('successCount');
        const errorCountElement = document.getElementById('errorCount');
        const impossibleCountElement = document.getElementById('impossibleCount');
        const successBarElement = document.getElementById('successBar');
        const errorBarElement = document.getElementById('errorBar');
        const impossibleBarElement = document.getElementById('impossibleBar');

        if (totalFilesElement && successCountElement && errorCountElement && impossibleCountElement && successBarElement && errorBarElement && impossibleBarElement) {
            totalFilesElement.innerText = total;

            const successPercentage = (success / total) * 100;
            const errorPercentage = (error / total) * 100;
            const impossiblePercentage = (impossible / total) * 100;

            successCountElement.innerText = success;
            errorCountElement.innerText = error;
            impossibleCountElement.innerText = impossible;

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

    // Exemple avant d'implémenter le backend
    updateIntegrationStats(3775, 2013, 503);
});