$(document).ready(function() {
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
    let selectedStartDate = null;
    let selectedEndDate = null;
    let activeInput = null;
    let isSelectingRange = false;

    // Fonction pour afficher le calendrier
    function renderCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();

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
            } else {
                dayElement.addEventListener('click', () => selectDate(currentDay));
            }
            daysContainer.appendChild(dayElement);
        }

        highlightSelectedDates();
    }

    // Fonction pour sélectionner une date
    function selectDate(date) {
        if (isSelectingRange) {
            if (date >= selectedStartDate) {
                selectedEndDate = date;
                isSelectingRange = false;
            }
        } else {
            if (activeInput === startDateInput) {
                selectedStartDate = date;
                selectedEndDate = null;
                isSelectingRange = true;
            } else if (activeInput === endDateInput) {
                if (date >= selectedStartDate) {
                    selectedEndDate = date;
                }
            } else {
                if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
                    selectedStartDate = date;
                    selectedEndDate = null;
                } else {
                    selectedEndDate = date;
                }
            }
        }
        updateDatepickerInput();
        highlightSelectedDates();
    }

    // Fonction pour mettre à jour les champs de saisie des dates
    function updateDatepickerInput() {
        if (selectedStartDate) {
            startDateInput.value = selectedStartDate.toLocaleDateString('fr-FR');
        } else {
            startDateInput.value = '';
        }
        if (selectedEndDate) {
            endDateInput.value = selectedEndDate.toLocaleDateString('fr-FR');
        } else {
            endDateInput.value = '';
        }
    }

    // Fonction pour mettre en évidence les dates sélectionnées dans le calendrier
    function highlightSelectedDates() {
        const dayElements = daysContainer.querySelectorAll('div');
        dayElements.forEach(dayElement => {
            const day = parseInt(dayElement.textContent);
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            dayElement.classList.remove('bg-[#364056]', 'rounded-l-full', 'rounded-r-full', 'bg-blue-600', 'bg-blue-600', 'text-white');
            if (selectedStartDate && date.getTime() === selectedStartDate.getTime()) {
                dayElement.classList.add('bg-blue-800', 'text-white', 'rounded-l-full');
            } else if (selectedEndDate && date.getTime() === selectedEndDate.getTime()) {
                dayElement.classList.add('bg-blue-800', 'text-white', 'rounded-r-full');
            } else if (selectedStartDate && selectedEndDate && date >= selectedStartDate && date <= selectedEndDate) {
                dayElement.classList.add('bg-blue-600', 'text-white');
            }
        });
    }

    // Fonction pour effacer la sélection de dates
    function clearSelection() {
        selectedStartDate = null;
        selectedEndDate = null;
        updateDatepickerInput();
        highlightSelectedDates();
    }

    // Fonction pour sélectionner la date d'aujourd'hui
    function setToday() {
        clearSelection();
        const now = new Date();
        selectedStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        selectedEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        updateDatepickerInput();
        highlightSelectedDates();
        highlightButton(todayButton);
    }

    // Fonction pour sélectionner la date d'hier
    function setYesterday() {
        clearSelection();
        const now = new Date();
        selectedStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        selectedEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        updateDatepickerInput();
        highlightSelectedDates();
        highlightButton(yesterdayButton);
    }

    // Fonction pour sélectionner la semaine glissante
    function setSlidingWeek() {
        clearSelection();
        const now = new Date();
        selectedStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        selectedEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        updateDatepickerInput();
        highlightSelectedDates();
        highlightButton(thisWeekButton);
    }

    // Fonction pour sélectionner le mois glissant
    function setSlidingMonth() {
        clearSelection();
        const now = new Date();
        selectedStartDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        selectedEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        updateDatepickerInput();
        highlightSelectedDates();
        highlightButton(thisMonthButton);
    }

    // Fonction pour sélectionner le trimestre glissant
    function setSlidingQuarter() {
        clearSelection();
        const now = new Date();
        selectedStartDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        selectedEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        updateDatepickerInput();
        highlightSelectedDates();
        highlightButton(thisQuarterButton);
    }

    // Fonction pour sélectionner le semestre glissant
    function setSlidingSemester() {
        clearSelection();
        const now = new Date();
        selectedStartDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        selectedEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        updateDatepickerInput();
        highlightSelectedDates();
        highlightButton(thisSemesterButton);
    }

    // Fonction pour sélectionner l'année glissante
    function setSlidingYear() {
        clearSelection();
        const now = new Date();
        selectedStartDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        selectedEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        updateDatepickerInput();
        highlightSelectedDates();
        highlightButton(thisYearButton);
    }

    // Fonction pour mettre en évidence le bouton sélectionné
    function highlightButton(button) {
        const buttons = [yesterdayButton, todayButton, thisWeekButton, thisMonthButton, thisQuarterButton, thisSemesterButton, thisYearButton];
        buttons.forEach(btn => btn.classList.remove('bg-blue-600', 'text-white'));
        if (button) {
            button.classList.add('bg-blue-600', 'text-white');
        }
    }

    // Événements pour afficher le calendrier lors du clic sur les champs de saisie des dates
    startDateInput.addEventListener('click', () => {
        activeInput = startDateInput;
        calendar.style.top = `${startDateInput.offsetTop + startDateInput.offsetHeight}px`;
        calendar.style.left = `${startDateInput.offsetLeft}px`;
        calendar.classList.remove('hidden');
        renderCalendar(currentDate);
    });

    endDateInput.addEventListener('click', () => {
        activeInput = endDateInput;
        calendar.style.top = `${endDateInput.offsetTop + endDateInput.offsetHeight}px`;
        calendar.style.left = `${endDateInput.offsetLeft}px`;
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
    clearDates.addEventListener('click', () => {
        clearSelection();
        highlightButton(null);
        renderCalendar(currentDate);
    });

    // Événement pour sauvegarder les dates sélectionnées
    saveDates.addEventListener('click', () => {
        calendar.classList.add('hidden');
    });

    // Événements pour les boutons de sélection rapide de dates
    todayButton.addEventListener('click', setToday);
    yesterdayButton.addEventListener('click', setYesterday);
    thisWeekButton.addEventListener('click', setSlidingWeek);
    thisMonthButton.addEventListener('click', setSlidingMonth);
    thisQuarterButton.addEventListener('click', setSlidingQuarter);
    thisSemesterButton.addEventListener('click', setSlidingSemester);
    thisYearButton.addEventListener('click', setSlidingYear);

    // Événement pour masquer le calendrier lorsque l'utilisateur clique en dehors
    document.addEventListener('click', (event) => {
        if (!calendar.contains(event.target) && event.target !== startDateInput && event.target !== endDateInput) {
            calendar.classList.add('hidden');
        }
    });

    // Rendre le calendrier initialement
    renderCalendar(currentDate);
});