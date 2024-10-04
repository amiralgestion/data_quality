$(document).ready(function () {
  /* Recherche */
  $("#searchBar").on("input", function () {
    const query = $(this).val().toLowerCase();
    searchFiles(query);
  });

  /* Fermer la modal */
  $("#closeModal").on("click", function () {
    $("#fileDetailsModal").addClass("hidden");
  });

  /* Fermer la prévisualisation */
  $("#closePreviewModal").on("click", function () {
    const previewContainer = $("#excelPreviewContainer");
    const modalContainer = $("#excelPreviewModal");
    const highchartContainer = $("#ExpHighchartContainer");

    previewContainer.addClass("hidden");
    modalContainer.addClass("hidden");
    highchartContainer.removeClass("hidden");
    $("#tableContainer").empty();
    $("#errorMessage").addClass("hidden");
    $("#spinner").addClass("hidden");
  });

  /* Afficher le menu contextuel  */
  $(".keep-scrolling").on("contextmenu", "span", function (e) {
    e.preventDefault();
    const fileName = $(this).text();
    showContextMenu(e.pageX, e.pageY, fileName);
  });

  /* Cacher le menu contextuel */
  $(document).on("click", function () {
    hideMenu();
  });

  /* Prévisualiser le fichier */
  $("#previewFile").on("click", function () {
    const fileName = $(this).data("fileName");
    fetchFileDetailsAndPreview(fileName);
    hideMenu();
    $("#excelPreviewModal").removeClass("hidden");
    $("#excelPreviewContainer").removeClass("hidden");
    $("#ExpHighchartContainer").addClass("hidden");
  });

  /* Télécharger le fichier */
  $("#downloadFile").on("click", function () {
    const fileName = $(this).data("fileName");
    fetchFileDetailsAndDownload(fileName);
    hideMenu();
  });
});

/* Récupère les détails du fichier et affiche un aperçu */
function fetchFileDetailsAndPreview(fileName) {
  $.ajax({
    url: "/integration/file-details",
    method: "GET",
    data: { fileName: fileName },
    success: function (data) {
      if (data.error) {
        console.error("Error fetching file details:", data.error);
      } else {
        const filePath = data.chemin;
        previewFile(filePath);
      }
    },
    error: function (error) {
      console.error("Error fetching file details:", error);
    },
  });
}

/* Récupère et affiche un aperçu du fichier Excel */
function displayExcelPreview(arrayBuffer) {
  console.log("Displaying Excel preview...");
  const data = new Uint8Array(arrayBuffer); // Convertir l'ArrayBuffer en Uint8Array
  const workbook = XLSX.read(data, { type: "array" }); // Lire le fichier Excel

  // Trouver le nom de la feuille 'compil'
  const compilSheetName = workbook.SheetNames.find(
    (name) => name.toLowerCase() === "compil"
  );
  if (!compilSheetName) {
    console.error("Sheet 'compil' not found in the workbook.");
    // Hide the spinner and show the error message
    $("#spinner").addClass("hidden");
    $("#errorMessage").removeClass("hidden");
    $("#excelPreviewContainer").addClass("hidden");
    return;
  }

  // Récupérer la feuille 'compil'
  const worksheet = workbook.Sheets[compilSheetName];

  // Convertir la feuille en JSON
  const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  const previewContainer = document.getElementById("excelPreviewContainer");
  const tableContainer = document.getElementById("tableContainer");
  const modalContainer = document.getElementById("excelPreviewModal");
  const highchartContainer = document.getElementById("ExpHighchartContainer");

  if (
    !previewContainer ||
    !tableContainer ||
    !modalContainer ||
    !highchartContainer
  ) {
    console.error(
      "Preview container, table container, or modal container not found."
    );
    // Hide the spinner in case of error
    $("#spinner").addClass("hidden");
    $("#excelPreviewContainer").removeClass("hidden");
    return;
  }

  tableContainer.innerHTML = "";

  // Créer un tableau Handsontable
  const hot = new Handsontable(tableContainer, {
    data: json,
    rowHeaders: true,
    colHeaders: true,
    width: "100%",
    height: "100%",
    licenseKey: "non-commercial-and-evaluation",
    renderAllRows: true, // Ensure all rows are rendered initially
  });

  const max_li = 39; // Par défaut, pour remplir les lignes de ta table
  const max_col = 14; // Par défaut, pour remplir les colonnes de la table

  const actual_col = hot.countCols();

  // Remplir les lignes de ta table
  if (json.length >= max_li) {
    hot.loadData(json);
  } else {
    for (let i = 0; i < max_li - json.length; i++) {
      json.push([]);
    }
  }

  // Remplir les colonnes de ta table
  if (actual_col < max_col) {
    json.forEach((row) => {
      for (let i = row.length; i < max_col; i++) {
        row.push("");
      }
    });
  }

  hot.loadData(json);

  // Afficher le conteneur de prévisualisation et cacher le highchart
  modalContainer.classList.remove("hidden");
  previewContainer.classList.remove("hidden");
  highchartContainer.classList.add("hidden");

  // Hide the spinner once the preview is ready
  $("#spinner").addClass("hidden");
  $("#excelPreviewContainer").removeClass("hidden");
  $("#errorMessage").addClass("hidden");
}

/* Affiche les détails du fichier */
function previewFile(filePath) {
  const fullPath = encodeURIComponent(filePath);
  // Show the spinner and hide the current table and error message
  $("#spinner").removeClass("hidden");
  $("#excelPreviewContainer").addClass("hidden");
  $("#errorMessage").addClass("hidden");
  $.ajax({
    url: `/integration/download-file?filePath=${fullPath}`,
    method: "GET",
    cache: false,
    xhrFields: {
      responseType: "arraybuffer", // Utiliser un ArrayBuffer pour les fichiers binaires
    },
    success: function (data) {
      displayExcelPreview(data); // Passer l'ArrayBuffer à la fonction d'affichage
    },
    error: function (error) {
      console.error("Error previewing file:", error);
      // Hide the spinner in case of error
      $("#spinner").addClass("hidden");
      $("#excelPreviewContainer").removeClass("hidden");
    },
  });
}

/* Récupère les détails du fichier et le télécharge */
function fetchFileDetailsAndDownload(fileName) {
  $.ajax({
    url: "/integration/file-details",
    method: "GET",
    data: { fileName: fileName },
    success: function (data) {
      if (data.error) {
        console.error("Error fetching file details:", data.error);
      } else {
        const filePath = data.chemin;
        downloadFile(filePath, fileName);
      }
    },
    error: function (error) {
      console.error("Error fetching file details:", error);
    },
  });
}

/* Affiche le menu contextuel */
function showContextMenu(x, y, fileName) {
  const contextMenu = $("#contextMenu");
  contextMenu.removeClass("hidden");
  const menuWidth = contextMenu.outerWidth();
  const menuHeight = contextMenu.outerHeight();

  let posX = x - 150; //Hardcodée (pour s'approcher du curseur)
  let posY = y - 85; //Hardcodée (pour s'approcher du curseur)

  if (posX + menuWidth > $(window).width()) {
    posX = $(window).width() - menuWidth;
  }

  if (posY + menuHeight > $(window).height()) {
    posY = $(window).height() - menuHeight;
  }

  contextMenu.css({ top: posY + "px", left: posX + "px" });
  $("#previewFile").data("fileName", fileName);
  $("#downloadFile").data("fileName", fileName);
}

/* Cacher le menu contextuel */
function hideMenu() {
  $("#contextMenu").addClass("hidden");
}

/* Télécharger le fichier */
function downloadFile(fileName) {
  const fullPath = encodeURIComponent(fileName);
  $.ajax({
    url: `/integration/download-file?filePath=${fullPath}`,
    method: "GET",
    xhrFields: {
      responseType: "blob", // Utiliser un Blob pour les fichiers binaires
    },
    success: function (data, status, xhr) {
      const a = document.createElement("a"); // Créer un élément <a> pour le téléchargement
      const url = window.URL.createObjectURL(data); // Créer une URL pour le fichier

      const disposition = xhr.getResponseHeader("Content-Disposition"); // Récupérer le nom du fichier
      let downloadFileName = fileName;

      // Extraire le nom du fichier de l'en-tête Content-Disposition
      if (disposition && disposition.indexOf("attachment") !== -1) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
          disposition
        );
        if (matches && matches[1]) {
          downloadFileName = matches[1].replace(/['"]/g, "");
        }
      }
      a.href = url;
      a.download = downloadFileName;
      document.body.appendChild(a);
      a.click(); // Simuler pour déclencher le download
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url); // Free l'url
    },
    error: function (error) {
      console.error("Error downloading file:", error);
    },
  });
}

/* Recheche des fichiers */
function searchFiles(query) {
  const fileLists = [
    "#successFilesList",
    "#impossibleFilesList",
    "#errorFilesList",
  ];
  fileLists.forEach((listId) => {
    $(listId)
      .children()
      .each(function () {
        const fileName = $(this).text().toLowerCase();
        if (fileName.includes(query)) {
          $(this).show();
        } else {
          $(this).hide();
        }
      });
  });
}

/* Gérer le clic sur le caret */
function handleCaretClick(caretIcon) {
  const $caretIcon = $(caretIcon);
  const id = $caretIcon.data("id");

  $caretIcon.toggleClass("-rotate-90 rotate-0");
  const detailsSection = $(`[data-id="${id}"]`).not($caretIcon);
  detailsSection.toggleClass("hidden");
}

function handleFichesEvalCaretClick(caretIcon) {
  const $caretIcon = $(caretIcon);
  const id = $caretIcon.data("id");

  $caretIcon.toggleClass("-rotate-90 rotate-0");
  const detailsSection = $(`#${id}`);
  detailsSection.toggleClass("hidden");

  if (!detailsSection.hasClass("hidden")) {
    console.log("Fiches Eval section opened");
    fetchAndDisplayFiles();
  }
}

/* Formatter la date pour la requête */
function formatDate(dateStr, isStartDate) {
  const [day, month, year] = dateStr.split("/");
  const formattedDate = `${year}-${month}-${day} ${
    isStartDate ? "00:00:00" : "23:59:59"
  }`;
  return formattedDate;
}

/* Récupérer et afficher les fichiers dans la liste */
function fetchAndDisplayFiles() {
  const startDate = formatDate($("#startDate").val(), true);
  const endDate = formatDate($("#endDate").val(), false);

  $.ajax({
    url: "/integration/files",
    method: "GET",
    data: { startDate: startDate, endDate: endDate },
    success: function (data) {
      displayFiles(data);
    },
    error: function (error) {
      console.error("Erreur lors de la récupération des fichiers:", error);
    },
  });
}

/* Afficher les fichiers dans la liste */
function displayFiles(data) {
  $("#impossibleFilesList").empty();
  $("#errorFilesList").empty();
  $("#successFilesList").empty();

  function createFileRow(file) {
    const row = $(
      `<div class="p-2 text-white"><span class="cursor-pointer hover:underline">${file}</span></div>`
    );
    row.find("span").on("click", function () {
      openModal(file);
    });
    return row;
  }
  if (data.errorFiles.length == 0) {
    $("#errorFilesList").addClass("hidden");
  }
  if (data.impossibleFiles.length == 0) {
    $("#impossibleFilesList").addClass("hidden");
  }
  if (data.successFiles.length == 0) {
    $("#successFilesList").addClass("hidden");
  }
  data.impossibleFiles.forEach((file) => {
    $("#impossibleFilesList").append(createFileRow(file));
  });

  data.errorFiles.forEach((file) => {
    $("#errorFilesList").append(createFileRow(file));
  });

  data.successFiles.forEach((file) => {
    $("#successFilesList").append(createFileRow(file));
  });
}

/* Update de données + highchart */
function updateExpandedIntegrationStats(total, success, impossible) {
  const total_without_success = total - success;
  const error = total_without_success - impossible;
  const errorPercentage = ((error / total_without_success) * 100).toFixed(2);
  const impossiblePercentage = (
    (impossible / total_without_success) *
    100
  ).toFixed(2);

  const colors = Highcharts.getOptions().colors;
  const categories = ["Fiches Eval"];
  const data = [
    {
      y: parseFloat(100 / categories.length), // Get le pourcentage
      color: colors[0],
      drilldown: {
        name: "Fiches Eval",
        categories: ["Error", "Impossible"],
        data: [parseFloat(errorPercentage), parseFloat(impossiblePercentage)],
      },
    },
  ];

  const sourcesData = [];
  const logData = [];
  const dataLen = data.length;

  let i, j, drillDataLen, brightness;

  for (i = 0; i < dataLen; i += 1) {
    sourcesData.push({
      name: `${categories[i]} (${data[i].y.toFixed(2)}%)`,
      y: data[i].y,
      color: data[i].color,
    });
    // Les effets de luminosité/drilldown
    drillDataLen = data[i].drilldown.data.length;
    for (j = 0; j < drillDataLen; j += 1) {
      const name = data[i].drilldown.categories[j];
      brightness = 0.2 - j / drillDataLen / 5;
      logData.push({
        name: `${name}: ${data[i].drilldown.data[j].toFixed(2)}%`,
        y: data[i].drilldown.data[j],
        color: Highcharts.color(data[i].color).brighten(brightness).get(),
        custom: {
          version: name,
        },
      });
    }
  }

  const interval = setInterval(() => {
    const totalFilesElement = $("#totalFilesExp");
    const successCountElement = $("#successCountExp");
    const errorCountElement = $("#errorCountExp");
    const impossibleCountElement = $("#impossibleCountExp");

    const impossibleFichesEvalElement = $("#impossibleFichesEvalExp");
    const errorFichesEvalElement = $("#errorFichesEvalExp");
    const successFichesEvalElement = $("#successFichesEvalExp");

    if (
      totalFilesElement.length &&
      successCountElement.length &&
      errorCountElement.length &&
      impossibleCountElement.length
    ) {
      totalFilesElement.text(total);
      successCountElement.text(success);
      errorCountElement.text(error);
      impossibleCountElement.text(impossible);

      impossibleFichesEvalElement.text(impossible);
      errorFichesEvalElement.text(error);
      successFichesEvalElement.text(success);
      clearInterval(interval);
    }

    Highcharts.chart("ExpHighchartContainer", {
      chart: {
        type: "pie",
        backgroundColor: "transparent",
        animation: {
          duration: 1000,
        },
      },
      title: {
        text: null,
      },
      exporting: {
        enabled: false,
      },
      credits: {
        enabled: false,
      },
      plotOptions: {
        pie: {
          shadow: false,
          center: ["65%", "50%"],
          size: "60%",
          dataLabels: {
            allowOverlap: false,
            padding: 5,
            softConnector: true,
            style: {
              fontFamily: "'Roboto', sans-serif",
              fontSize: "14px",
              fontWeight: "bold",
              color: "#FFFFFF",
              textOutline: "#000000",
            },
          },
        },
      },
      tooltip: {
        valueSuffix: "%",
        style: {
          fontFamily: "'Roboto', sans-serif",
        },
      },
      series: [
        {
          name: "Sources",
          data: sourcesData,
          size: "45%",
          dataLabels: {
            crop: false,
            overflow: "none",
            distance: -40,
            allowOverlap: false,
            padding: 5,
            style: {
              fontFamily: "'Roboto', sans-serif",
              fontWeight: "bold",
              fontSize: "12px",
              color: "#FFFFFF",
              textOutline: "#000000",
            },
            format: "{point.name}",
          },
        },
        {
          name: "Intégration",
          data: logData,
          size: "80%",
          innerSize: "60%",
          dataLabels: {
            crop: false,
            overflow: "none",
            format: "{point.name}",
            filter: {
              property: "y",
              operator: ">",
              value: 1,
            },
            style: {
              fontFamily: "'Roboto', sans-serif",
              fontWeight: "normal",
              color: "#FFFFFF",
              textOutline: "none",
            },
            allowOverlap: false,
            padding: 5,
            distance: 20,
          },
          id: "logMessages",
        },
      ],
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 400,
            },
            chartOptions: {
              series: [
                {},
                {
                  id: "logMessages",
                  dataLabels: {
                    crop: false,
                    overflow: "none",
                    distance: 10,
                    format: "{point.custom.version}",
                    filter: {
                      property: "percentage",
                      operator: ">",
                      value: 2,
                    },
                    style: {
                      fontFamily: "'Roboto', sans-serif",
                      fontWeight: "normal",
                      color: "#FFFFFF",
                      textOutline: "none",
                    },
                    allowOverlap: false,
                    padding: 5,
                  },
                },
              ],
            },
          },
        ],
      },
    });
  }, 100);
}

/* Ouvrir le modal */
function openModal(fileName) {
  $.ajax({
    url: "/integration/file-details",
    method: "GET",
    data: { fileName: fileName },
    success: function (data) {
      if (data.error) {
        $("#fileDetailsContent").html(
          `<p class="text-red-500">${data.error}</p>`
        );
      } else {
        const gerants = data.gerants;
        let gerantsText = "";

        if (gerants.length === 1) {
          gerantsText = `${gerants[0]}`;
        } else if (gerants.length === 2) {
          gerantsText = `${gerants[0]} & ${gerants[1]}`;
        }
        const chemin = `${data.chemin}`;
        const ticker = `${data.ticker}`;
        const etat = data.etat;
        const commentaire = data.commentaire || "Pas de commentaire";

        let etatColor, etatIcon;
        switch (etat) {
          case "Fichier traité":
            etatColor = "bg-green-100 text-green-700";
            etatIcon = "fa-check-circle";
            break;
          case "Erreur inconnue":
            etatColor = "bg-red-100 text-red-700";
            etatIcon = "fa-exclamation-circle";
            break;
          default:
            etatColor = "bg-yellow-100 text-yellow-700";
            etatIcon = "fa-exclamation-triangle";
        }

        $("#modalTitle").text(data.societe);
        $("#fileDetailsContent").html(`
                    <div class="text-left">
                        <p class="mt-4">
                            <i class="fas fa-user-tie mr-2 text-[#4A90E2]"></i>
                            <strong>Gérant/Analyste:</strong> ${gerantsText}
                        </p>
                        <p class="mt-2">
                            <i class="fas fa-folder-open mr-2 text-[#FFD700]"></i>
                            <strong>Chemin:</strong> ${chemin}
                        </p>
                        <p class="mt-2">
                            <i class="fa-light fa-tickets-perforated mr-2 text-[#28a745]"></i>
                            <strong>Ticker:</strong> ${ticker}
                        </p>
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
      $("#fileDetailsModal").removeClass("hidden");
    },
    error: function (error) {
      console.error(
        "Erreur lors de la récupération des détails du fichier:",
        error
      );
      $("#fileDetailsContent").html(
        `<p class="text-red-500">Erreur lors de la récupération des détails du fichier</p>`
      );
      $("#fileDetailsModal").removeClass("hidden");
    },
  });
}

window.updateExpandedIntegrationStats = updateExpandedIntegrationStats; // Exposer la fonction en global