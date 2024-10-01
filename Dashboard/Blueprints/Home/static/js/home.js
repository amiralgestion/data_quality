$(document).ready(function() {

    
    // Fonction pour gérer la réponse de succès et mettre à jour les statistiques d'intégration
    function handleIntegrationSuccess(data) {
        updateIntegrationStats(data.totalFiles, data.successCount, data.impossibleCount);
    }

    // Fonction pour gérer la réponse de succès et mettre à jour les statistiques d'intégration étendues
    function handleExpandedIntegrationSuccess(data) {
        updateExpandedIntegrationStats(data.totalFiles, data.successCount, data.impossibleCount);
    }

    // Exposer les fonctions globalement
    window.handleIntegrationSuccess = handleIntegrationSuccess;
    window.handleExpandedIntegrationSuccess = handleExpandedIntegrationSuccess;

    let isAnimating = false;
    let initialContents = {}

    // Fonction pour sauvegarder le contenu initial de la boîte
    function saveInitialBoxContent(container_name) {
        const $container = $(`#${container_name}`);
        initialContents[container_name] = $container.html();
        return initialContents[container_name];
    }

    // Fonction pour masquer tous les éléments de la boîte sauf ceux avec la classe 'keep-visible'
    function hideBoxElements(container_name) {
        const $container = $(`#${container_name}`);
        $container.children().not('.keep-visible').hide();
    }

    // Fonction pour charger le contenu du blueprint
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

    // Fonction pour mettre à jour les statistiques d'intégration
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

    // Fonction pour basculer l'expansion de la boîte cliquée
    window.toggleExpand = function(element) {
        if (isAnimating) return;
    
        const $element = $(element).parent();
        console.log($element);
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
    

    // Fonction pour mettre à jour les données de la boîte étendue
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
        }
    }

    // Fonction pour animer la boîte
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

    // Fonction pour obtenir les propriétés d'animation d'expansion
    function getExpandProps(index) {
        switch (index) {
            case 0: return {height: "835px", width: "1536px"};
            case 1: return {height: "835px", width: "1536px", left: "-784px"};
            case 2: return {height: "835px", width: "1536px", top: "-435px"};
            case 3: return {height: "835px", width: "1536px", top: "-435px", left: "-784px"};
        }
    }

    // Fonction pour obtenir les propriétés d'animation de réduction
    function getCollapseProps(index) {
        switch (index) {
            case 0: return {height: "400px", width: "752px"};
            case 1: return {height: "400px", width: "752px", left: "0"};
            case 2: return {height: "400px", width: "752px", top: "0"};
            case 3: return {height: "400px", width: "752px", top: "0", left: "0"};
        }
    }

    // Fonction pour formater la date
    function formatDate(dateStr, isStartDate) {
        const [day, month, year] = dateStr.split('/');
        const formattedDate = `${year}-${month}-${day} ${isStartDate ? '00:00:00' : '23:59:59'}`;
        return formattedDate;
    }

    // Fonction pour rafraîchir le contenu d'une boîte
    window.refreshBox = function(element) {
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
            }
        }, 600);
    }
    

    window.handleIntegrationSuccess = handleIntegrationSuccess;

});