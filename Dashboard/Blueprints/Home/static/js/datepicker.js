$(document).ready(function() {
    // Appliquer le style not-allowed au curseur
    const style = document.createElement('style');
    style.textContent = `
        .cursor-not-allowed {
            cursor: not-allowed;
        }
    `;
    document.head.appendChild(style);

    // Sélection des éléments du DOM
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const calendar = document.getElementById('calendar');
    const monthYear = document.getElementById('monthYear');
    const daysContainer = document.getElementById('days');
    const prevMonth = document.getElementById('prevMonth');
    const nextMonth = document.getElementById('nextMonth');
    const clearDates = document.getElementById('clearDates');
    const saveDates = document.getElementById('saveDates');
    const todayButton = document.getElementById('today');
    const yesterdayButton = document.getElementById('yesterday');
    const thisWeekButton = document.getElementById('thisWeek');
    const thisMonthButton = document.getElementById('thisMonth');
    const thisQuarterButton = document.getElementById('thisQuarter');
    const thisSemesterButton = document.getElementById('thisSemester');
    const thisYearButton = document.getElementById('thisYear');

    // Variables pour stocker les dates sélectionnées et l'état actuel
    let currentDate = new Date();
    let selectedStartDate = new Date();
    let selectedEndDate = new Date();
    let activeInput = null;
    let isSelectingRange = false;
    let selectionForbidden = false;
    let inaccessibleDates = [];

    // Fonction pour rendre le calendrier
    function renderCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        const today = new Date();

        monthYear.textContent = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

        daysContainer.innerHTML = '';
        // Ajouter des divs vides pour les jours avant le début du mois
        for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
            daysContainer.innerHTML += '<div></div>';
        }

        // Ajouter les jours du mois
        for (let day = 1; day <= lastDate; day++) {
            const dayElement = document.createElement('div');
            const currentDay = new Date(year, month, day);
            dayElement.textContent = day;
            dayElement.classList.add('p-2', 'cursor-pointer', 'hover:bg-gray-700', 'rounded');
            if (selectedStartDate && currentDay < selectedStartDate) {
                dayElement.classList.add('opacity-50', 'cursor-not-allowed');
            } else if (selectedEndDate && currentDay > selectedEndDate) {
                dayElement.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                dayElement.addEventListener('click', () => selectDate(currentDay));
            }
            daysContainer.appendChild(dayElement);
        }

        highlightSelectedDates();
    }

    // Fonction pour sélectionner une date
    function selectDate(date) {
        const today = new Date();
        if (selectionForbidden || date > today) return; // Si la sélection est interdite ou si la date est future, ne rien faire
    
        if (isSelectingRange) {
            if (date >= selectedStartDate) {
                selectedEndDate = date;
                isSelectingRange = false;
                forbidSelection();
            }
        } else {
            if (activeInput === startDateInput) {
                selectedStartDate = date;
                selectedEndDate = null;
                isSelectingRange = true;
            } else if (activeInput === endDateInput) {
                selectedEndDate = date;
                isSelectingRange = false;
            }
        }
        updateDatepickerInput();
        highlightSelectedDates();
    
        // Envoyer les dates sélectionnées au backend
        sendSelectedDatesToBackend(selectedStartDate, selectedEndDate);
    }
    
    function formatDateForBackend(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
    
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    

    // Fonction pour mettre à jour les champs de saisie des dates
    function updateDatepickerInput() {
        startDateInput.value = selectedStartDate ? selectedStartDate.toLocaleDateString('fr-FR') : '';
        endDateInput.value = selectedEndDate ? selectedEndDate.toLocaleDateString('fr-FR') : '';
    }

    // Fonction pour mettre en évidence les dates sélectionnées dans le calendrier
    function highlightSelectedDates() {
        const dayElements = daysContainer.querySelectorAll('div');
        const today = new Date();
        dayElements.forEach(dayElement => {
            const day = parseInt(dayElement.textContent);
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            dayElement.classList.remove('bg-[#364056]', 'rounded-l-full', 'rounded-r-full', 'bg-blue-600', 'bg-blue-800', 'text-white', 'opacity-50', 'cursor-not-allowed');
            
            if (selectedStartDate && selectedEndDate && date >= selectedStartDate && date <= selectedEndDate) {
                dayElement.classList.add('bg-blue-800', 'text-white');
                if (date.getTime() === selectedStartDate.getTime()) {
                    dayElement.classList.add('rounded-l-full');
                }
                if (date.getTime() === selectedEndDate.getTime()) {
                    dayElement.classList.add('rounded-r-full');
                }
            } else if (selectedStartDate && date.getTime() === selectedStartDate.getTime()) {
                dayElement.classList.add('bg-blue-800', 'text-white', 'rounded-l-full');
            } else if (selectedEndDate && date.getTime() === selectedEndDate.getTime()) {
                dayElement.classList.add('bg-blue-800', 'text-white', 'rounded-r-full');
            } else if (date.getTime() === today.getTime()) {
                dayElement.classList.add('bg-blue-800', 'text-white', 'rounded-full');
            } else if (date > today) {
                dayElement.classList.add('opacity-50', 'cursor-not-allowed');
            } else if (inaccessibleDates.some(d => d.getTime() === date.getTime())) {
                dayElement.classList.add('opacity-50', 'cursor-not-allowed');
            }
        });
    }

    // Fonction pour effacer la sélection de dates
    function clearSelection() {
        selectedStartDate = null;
        selectedEndDate = null;
        selectionForbidden = false;
        inaccessibleDates = [];
        updateDatepickerInput();
        renderCalendar(currentDate);
    }

    // Fonction pour interdire la sélection de dates
    function forbidSelection() {
        selectionForbidden = true;
        const dayElements = daysContainer.querySelectorAll('div');
        inaccessibleDates = [];

        dayElements.forEach(dayElement => {
            const day = parseInt(dayElement.textContent);
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            if (selectedStartDate && date < selectedStartDate) {
                dayElement.classList.add('opacity-50', 'cursor-not-allowed');
                inaccessibleDates.push(date);
            } else if (selectedEndDate && date > selectedEndDate) {
                dayElement.classList.add('opacity-50', 'cursor-not-allowed');
                inaccessibleDates.push(date);
            }
        });
    }

    // Fonction pour sélectionner une période prédéfinie
    function setPredefinedPeriod(startDate, endDate) {
        startDate.setHours(0, 0, 1, 0);
        
        endDate.setHours(23, 59, 59, 999);
    
        selectedStartDate = startDate;
        selectedEndDate = endDate;
    
        highlightSelectedDates(); 
        updateDatepickerInput();
        sendSelectedDatesToBackend(startDate, endDate);
    }
    
    
    function setTimeToStartOfDay(date) {
        date.setHours(0, 0, 0, 0);
        return date;
    }
    
    function setTimeToEndOfDay(date) {
        date.setHours(23, 59, 59, 999);
        return date;
    }
    
    function sendSelectedDatesToBackend(startDate, endDate) {
    startDate = setTimeToStartOfDay(new Date(startDate));
    endDate = setTimeToEndOfDay(new Date(endDate));

    $.ajax({
        url: '/integration/data',
        method: 'GET',
        data: {
            startDate: formatDateForBackend(startDate),
            endDate: formatDateForBackend(endDate)
        },
        success: function(data) {
            const isExpanded = document.querySelector('.expanded') !== null;

            if (isExpanded && window.handleExpandedIntegrationSuccess) {
                window.handleExpandedIntegrationSuccess(data);
            } else if (window.handleIntegrationSuccess) {
                window.handleIntegrationSuccess(data);
            }
        },
        error: function() {
            alert('Failed to load data');
        }
    });
}
    
    // Événements pour afficher le calendrier lors du clic sur les champs de saisie des dates
    startDateInput.addEventListener('click', () => {
        activeInput = startDateInput;
        calendar.classList.remove('hidden');
        renderCalendar(currentDate);
    });

    endDateInput.addEventListener('click', () => {
        activeInput = endDateInput;
        calendar.classList.remove('hidden');
        renderCalendar(currentDate);
    });

    // Événements pour naviguer entre les mois
    prevMonth.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });

    nextMonth.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });

    // Événement pour effacer les dates sélectionnées
    clearDates.addEventListener('click', clearSelection);

    // Événement pour sauvegarder les dates sélectionnées
    saveDates.addEventListener('click', () => {
        calendar.classList.add('hidden');
        //fetchDataAndUpdateStats();
    });

    // Événements pour les boutons de sélection rapide de dates

   todayButton.addEventListener('click', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    setPredefinedPeriod(today, today);
});

yesterdayButton.addEventListener('click', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    setPredefinedPeriod(yesterday, yesterday);
});

    
    thisWeekButton.addEventListener('click', () => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - 7);
        setPredefinedPeriod(startOfWeek, new Date());
    });
    thisMonthButton.addEventListener('click', () => {
        const today = new Date();
        const startOfMonth = new Date(today);
        startOfMonth.setMonth(today.getMonth() - 1);
        setPredefinedPeriod(startOfMonth, new Date());
    });
    thisQuarterButton.addEventListener('click', () => {
        const today = new Date();
        const startOfQuarter = new Date(today);
        startOfQuarter.setMonth(today.getMonth() - 3);
        setPredefinedPeriod(startOfQuarter, new Date());
    });
    thisSemesterButton.addEventListener('click', () => {
        const today = new Date();
        const startOfSemester = new Date(today);
        startOfSemester.setMonth(today.getMonth() - 6);
        setPredefinedPeriod(startOfSemester, new Date());
    });
    thisYearButton.addEventListener('click', () => {
        const today = new Date();
        const startOfYear = new Date(today);
        startOfYear.setFullYear(today.getFullYear() - 1);
        setPredefinedPeriod(startOfYear, new Date());
    });

    // Événement pour masquer le calendrier lorsque l'utilisateur clique en dehors
    document.addEventListener('click', (event) => {
        if (!calendar.contains(event.target) && event.target !== startDateInput && event.target !== endDateInput) {
            calendar.classList.add('hidden');
        }
    });

    // Rendre le calendrier initialement
    renderCalendar(currentDate);
    updateDatepickerInput();
    forbidSelection();
    highlightSelectedDates();

    const today = new Date();
    // Envoyer les dates par défaut (aujourd'hui) au backend
    sendSelectedDatesToBackend(today, today);
});