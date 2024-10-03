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
  });

  /* Télécharger le fichier */
  $("#downloadFile").on("click", function () {
    const fileName = $(this).data("fileName");
    fetchFileDetailsAndDownload(fileName);
    hideMenu();
  });

  /* Cacher le conteneur de prévisualisation */
  $(document).on("click", function (e) {
    const previewContainer = $("#excelPreviewContainer");
    if (
      !previewContainer.hasClass("hidden") &&
      !$(e.target).closest("#excelPreviewContainer").length
    ) {
      previewContainer.addClass("hidden");
      $("#ExpHighchartContainer").removeClass("hidden");
      $("#tableContainer").empty();
    }
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

/* Afiche un aperçu du fichier Excel */
function displayExcelPreview(arrayBuffer) {
  const data = new Uint8Array(arrayBuffer); // Convertir l'ArrayBuffer en Uint8Array
  const workbook = XLSX.read(data, { type: "array" }); // Lire le fichier Excel

  // Trouver le nom de la feuille 'compil'
  const compilSheetName = workbook.SheetNames.find(
    (name) => name.toLowerCase() === "compil"
  );
  if (!compilSheetName) {
    console.error("Sheet 'compil' not found in the workbook.");
    return;
  }

  // Récupérer la feuille 'compil'
  const worksheet = workbook.Sheets[compilSheetName];

  // Convertir la feuille en JSON
  const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  const previewContainer = document.getElementById("excelPreviewContainer");
  const tableContainer = document.getElementById("tableContainer");

  if (!previewContainer || !tableContainer) {
    console.error("Preview container or table container not found.");
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
  });

  const max = 26; // Par défaut, pour remplir la table si vide

  if (json.length >= max) {
    hot.loadData(json);
  } else {
    for (let i = 0; i < max - json.length; i++) {
      json.push([]);
      hot.loadData(json);
    }
  }
  // Afficher le conteneur de prévisualisation
  previewContainer.classList.remove("hidden");
  document.getElementById("ExpHighchartContainer").classList.add("hidden");
}

/* Affiche les détails du fichier */
function previewFile(filePath) {
  const fullPath = encodeURIComponent(filePath);
  $.ajax({
    url: `/integration/download-file?filePath=${fullPath}`,
    method: "GET",
    cache: false,
    xhrFields: {
      responseType: "arraybuffer", // Utiliser un ArrayBuffer pour les fichiers binaires
    },
    success: function (data) {
      displayExcelPreview(data); // Passr l'ArrayBuffer à la fonction d'affichage
    },
    error: function (error) {
      console.error("Error previewing file:", error);
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
  let posY = y - 85;  //Hardcodée (pour s'approcher du curseur)

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

/* Fonction auxiliaire d'update */
function handleExpandedIntegrationSuccess(data) {
  updateExpandedIntegrationStats(
    data.totalFiles,
    data.successCount,
    data.impossibleCount
  );
  handleIntegrationSuccess(data);
}

/* Update de données + highchart */
function updateExpandedIntegrationStats(total, success, impossible) {
  const error = total - success - impossible;
  const errorPercentage = ((error / total) * 100).toFixed(2);
  const impossiblePercentage = ((impossible / total) * 100).toFixed(2);

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
          center: ["75%", "50%"],
          size: "60%",
          dataLabels: {
            allowOverlap: false,
            padding: 5,
            softConnector: true,
          },
        },
      },
      tooltip: {
        valueSuffix: "%",
      },
      series: [
        {
          name: "Sources",
          data: sourcesData,
          size: "45%",
          dataLabels: {
            crop: false,
            overflow: "none",
            color: "#ffffff",
            distance: -40,
            allowOverlap: false,
            padding: 5,
            style: {
              fontSize: "12px",
            },
            format: "{point.name}",
          },
        },
        {
          name: `Intégration`,
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
              fontWeight: "normal",
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
                            <i class="fas fa-user-tie mr-2" style="color: #4A90E2;"></i>
                            <strong>Gérant/Analyste:</strong> ${gerantsText}
                        </p>
                        <p class="mt-2">
                            <i class="fas fa-folder-open mr-2" style="color: #FFD700;"></i>
                            <strong>Chemin:</strong> ${chemin}
                        </p>
                        <p class="mt-2">
                            <i class="fa-light fa-tickets-perforated mr-2"></i>
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