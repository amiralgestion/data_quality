$(document).ready(function () {
  const totalHeight = $(window).height() - 500; // Calcul de la hauteur totale (le 500 = padding hardcodé --)
  let openSections = []; // Listes des sections ouvertes

  function adjustHeights() {
    const openCount = openSections.length;
    const padding = 20; // Padding hardcodé (à modif)
    const additionalSpace = 32;
    const availableHeight = totalHeight - padding - (openCount * additionalSpace);

    const newHeight =
      openCount === 1 ? availableHeight : availableHeight / openCount;

    openSections.forEach((sectionId) => {
      $(`#${sectionId}`).css("height", newHeight + "px");
    });
  }

  function toggleSection(sectionId) {
    const index = openSections.indexOf(sectionId);
    if (index === -1) {
      openSections.push(sectionId);
    } else {
      openSections.splice(index, 1);
    }
    adjustHeights();
  }

  /* Recherche */
  $("#searchBar").on("input", function () {
    const query = $(this).val().toLowerCase();
    searchFiles(query);
  });

  /* Gérer le clic sur le caret */
  $(".datadetail-caret").on("click", function () {
    const sectionId = $(this).data("id");
    toggleSection(sectionId);
  });

  $("#closeForm").on("click", function () {
    $("#formContainer").addClass("hidden");
  });
});


function handleCaretClick(caretIcon) {
  const $caretIcon = $(caretIcon);
  const id = $caretIcon.data("id");

  $caretIcon.toggleClass("-rotate-90 rotate-0");
  const detailsSection = $(`[data-id="${id}"]`).not($caretIcon);
  detailsSection.toggleClass("hidden");
}

function handleRefGA(caretIcon) {
  const $caretIcon = $(caretIcon);
  const id = $caretIcon.data("id");

  $caretIcon.toggleClass("-rotate-90 rotate-0");
  const detailsSection = $(`#${id}`);
  detailsSection.toggleClass("hidden");

  if (!detailsSection.hasClass("hidden")) {
    filterAndTransformData();
  }
}

function deleteReferentiel() {
  const id = $("#id").val();

  $.ajax({
    url: "/reference/delete",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({ id }),
    success: function (data) {
      if (data.success) {
        fetchDataAndUpdateLists();
        $("#formContainer").addClass("hidden");
        showAlert("Référentiel supprimé avec succès", "success");
      } else {
        console.log("Error deleting entry");
      }
    },
    error: function (error) {
      console.log(error);
    },
  });
}

function filterAndTransformData() {
  $.ajax({
    url: "/reference/data",
    method: "GET",
    success: function (data) {
      const { conform_data, missing_data, non_conform_data } = data;

      const transformEntry = (entry) => {
        const { prenom, nom, nom_court_fiche_eval } = entry;
        if (prenom && nom) {
          return nom_court_fiche_eval
            ? `${prenom}_${nom} (${nom_court_fiche_eval})`
            : `${prenom}_${nom}`;
        } else if (prenom) {
          return prenom;
        } else if (nom) {
          return nom;
        } else {
          return nom_court_fiche_eval;
        }
      };

      const conformList = conform_data.map(transformEntry);
      const missingList = missing_data.map(transformEntry);
      const nonConformList = non_conform_data.map(transformEntry);

      displayData({ conformList, missingList, nonConformList });
    },
    error: function (error) {
      console.log(error);
    },
  });
}

function searchFiles(query) {
  const fileLists = [
    "#conformFilesList",
    "#nonConformFilesList",
    "#missingFilesList",
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

function showAlert(message, type) {
  const alertHtml = `
        <div class="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white p-4 rounded shadow-lg flex items-center space-x-2 z-50">
            <i class="fa ${
              type === "success"
                ? "fa-check-circle text-green-500"
                : "fa-exclamation-circle text-red-500"
            }"></i>
            <span>${message}</span>
        </div>
    `;
  const $alert = $(alertHtml);
  $("body").append($alert);
  setTimeout(() => {
    $alert.fadeOut(500, function () {
      $(this).remove();
    });
  }, 3000);
}

function openForm(file) {
  $("#spinner").removeClass("hidden");
  $("#formContainer").addClass("hidden");

  $.ajax({
    url: "/reference/data",
    method: "GET",
    success: function (data) {
      const { conform_data, missing_data, non_conform_data } = data;
      const allData = [...conform_data, ...missing_data, ...non_conform_data];

      const entry = allData.find((entry) => {
        const { prenom, nom, nom_court_fiche_eval } = entry;
        const transformedEntry =
          prenom && nom
            ? nom_court_fiche_eval
              ? `${prenom}_${nom} (${nom_court_fiche_eval})`
              : `${prenom}_${nom}`
            : prenom
            ? prenom
            : nom
            ? nom
            : nom_court_fiche_eval;
        return transformedEntry === file;
      });

      if (entry) {
        const isMissingOrNonConform =
          missing_data.includes(entry) || non_conform_data.includes(entry);
        const warningMessage = isMissingOrNonConform
          ? `
                    <div class="text-orange-500 flex items-center">
                        <i class="fa-solid fa-exclamation-triangle mr-2"></i>
                        <p>Veuillez remplir tous les champs.</p>
                    </div>
                `
          : "";

        const formHtml = `
                <div class="bg-gray-900 rounded p-8 mb-6 flex-grow h-full relative w-full">
                  <div id="formSpinner" class="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-30">
                    <i class="fa-sharp fa-solid fa-spinner-third text-[#25C8A8] text-6xl animate-spin"></i>
                  </div>
                  <span id="closeForm" class="absolute top-0 right-8 text-white hover:text-[#AAAAAA] cursor-pointer text-2xl z-20">&times;</span>
                  <div id="formContent" class="grid grid-cols-1 lg:grid-cols-2 h-full hidden">
                    <div class="text-gray-300">
                      <p class="font-medium text-lg">Modifier le référentiel</p>
                      ${warningMessage}
                    </div>
                    <div class="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-5 h-full">
                      <div class="md:col-span-5">
                        <label for="id" class="block text-gray-400 font-medium">ID</label>
                        <input type="text" id="id" name="id" value="${entry.id}" class="h-8 border mt-0.5 rounded px-4 w-full bg-gray-700 text-gray-300 cursor-not-allowed opacity-50" readonly>
                      </div>
                      <div class="md:col-span-5">
                        <label for="prenom" class="block text-gray-400 font-medium">Prénom</label>
                        <input type="text" id="prenom" name="prenom" value="${entry.prenom}" class="h-8 mt-0.5 rounded px-4 w-full bg-gray-700 text-gray-300">
                      </div>
                      <div class="md:col-span-5">
                        <label for="nom" class="block text-gray-400 font-medium">Nom</label>
                        <input type="text" id="nom" name="nom" value="${entry.nom}" class="h-8 mt-0.5 rounded px-4 w-full bg-gray-700 text-gray-300">
                      </div>
                      <div class="md:col-span-5">
                        <label for="nom_court_fiche_eval" class="block text-gray-400 font-medium">Initiales</label>
                        <input type="text" id="nom_court_fiche_eval" name="nom_court_fiche_eval" value="${entry.nom_court_fiche_eval}" class="h-8 mt-0.5 rounded px-4 w-full bg-gray-700 text-gray-300">
                      </div>
                      <div class="md:col-span-5">
                        <label for="email" class="block text-gray-400 font-medium">Email</label>
                        <input type="email" id="email" name="email" value="${entry.email}" class="h-8 mt-0.5 rounded px-4 w-full bg-gray-700 text-gray-300">
                      </div>
                      <div class="md:col-span-5 text-right flex justify-end items-end">
                        <button id="deleteButton" class="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded ml-2">Supprimer</button>
                      </div>
                    </div>
                  </div>
                </div>
            `;
        $("#formContainer").html(formHtml).removeClass("hidden");
        setTimeout(() => {
          $("#formSpinner").addClass("hidden");
          $("#formContent").removeClass("hidden");
          $("#spinner").addClass("hidden");

          if (conform_data.includes(entry)) {
            $("#formContent input").css("border", "1px solid green");
          } else if (non_conform_data.includes(entry)) {
            $("#formContent input").each(function () {
              if ($(this).val() === "null" || $(this).val() === "") {
                $(this).css("border", "1px solid red");
              }
            });
          } else if (missing_data.includes(entry)) {
            $("#formContent input").each(function () {
              if ($(this).val() === "null" || $(this).val() === "") {
                $(this).css("border", "1px solid orange");
              } else if (
                $(this).attr("id") === "nom_court_fiche_eval" &&
                !isNaN($(this).val())
              ) {
                $(this).css("border", "1px solid orange");
              }
            });
          }

          const nomCourtFicheEvalInput = $("#nom_court_fiche_eval");
          if (nomCourtFicheEvalInput.val().length >= 4) {
            nomCourtFicheEvalInput.css("border", "1px solid red");
          }
        }, 820);

        $("#closeForm").on("click", function () {
          $("#formContainer").addClass("hidden");
        });

        $("#deleteButton").on("click", function () {
          deleteReferentiel();
        });

        $("#formContent input").on("blur", function () {
          updateReferentiel();
        });
      } else {
        console.log("Entry not found");
        $("#spinner").addClass("hidden");
      }
    },
    error: function (error) {
      console.log(error);
      $("#spinner").addClass("hidden");
    },
  });
}

function fetchData() {
  $.ajax({
    url: "/reference/data",
    method: "GET",
    success: function (data) {
      updateExpandedReferenceStats(
        data.total_entries,
        data.conform_data.length,
        data.missing_data.length,
        data.non_conform_data.length
      );
    },
    error: function (error) {
      console.log(error);
    },
  });
}

function updateExpandedReferenceStats(
  total_entries,
  conformes,
  missing,
  non_conformes
) {
  const interval = setInterval(() => {
    const totalEntriesElement = $("#totalEntriesExp");
    const conformCountElement = $("#conformCountExp");
    const manquantesCountElement = $("#manquantesCountExp");
    const nonconformCountElement = $("#nonconformCountExp");

    if (
      totalEntriesElement.length &&
      conformCountElement.length &&
      manquantesCountElement.length &&
      nonconformCountElement.length
    ) {
      totalEntriesElement.text(total_entries);
      conformCountElement.text(conformes);
      manquantesCountElement.text(missing);
      nonconformCountElement.text(non_conformes);
      clearInterval(interval);
    }
  }, 100);
}

/* Display data in the lists */
function displayData(data) {
  $("#conformFilesList").empty();
  $("#missingFilesList").empty();
  $("#nonConformFilesList").empty();

  function createFileRow(file) {
    const row = $(
      `<div class="p-2 text-white"><span class="cursor-pointer hover:underline">${file}</span></div>`
    );
    row.find("span").on("click", function () {
      openForm(file);
    });
    return row;
  }

  if (data.conformList.length == 0) {
    $("#conformFilesList").addClass("hidden");
  }

  if (data.missingList.length == 0) {
    $("#missingFilesList").addClass("hidden");
  }

  if (data.nonConformList.length == 0) {
    $("#nonConformFilesList").addClass("hidden");
  }

  data.conformList.forEach((file) => {
    $("#conformFilesList").append(createFileRow(file));
  });

  data.missingList.forEach((file) => {
    $("#missingFilesList").append(createFileRow(file));
  });

  data.nonConformList.forEach((file) => {
    $("#nonConformFilesList").append(createFileRow(file));
  });
}

function updateReferentiel() {
  const id = $("#id").val();
  let prenom = $("#prenom").val();
  let nom = $("#nom").val();
  let nom_court_fiche_eval = $("#nom_court_fiche_eval").val();
  let email = $("#email").val();

  prenom = prenom === "null" ? "" : prenom;
  nom = nom === "null" ? "" : nom;
  email = email === "null" ? "" : email;
  nom_court_fiche_eval =
    nom_court_fiche_eval === "null" ? "" : nom_court_fiche_eval;

  $.ajax({
    url: "/reference/update",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      id,
      prenom,
      nom,
      nom_court_fiche_eval,
      email,
    }),
    success: function (data) {
      fetchDataAndUpdateLists();
      showAlert("Référentiel mis à jour avec succès", "success");
    },
    error: function (error) {
      console.log(error);
    },
  });
}

function fetchDataAndUpdateLists() {
  $.ajax({
    url: "/reference/data",
    method: "GET",
    success: function (data) {
      const { conform_data, missing_data, non_conform_data } = data;

      const transformEntry = (entry) => {
        const { prenom, nom, nom_court_fiche_eval } = entry;
        if (prenom && nom) {
          return nom_court_fiche_eval
            ? `${prenom}_${nom} (${nom_court_fiche_eval})`
            : `${prenom}_${nom}`;
        } else if (prenom) {
          return prenom;
        } else if (nom) {
          return nom;
        } else {
          return nom_court_fiche_eval;
        }
      };

      const conformList = conform_data.map(transformEntry);
      const missingList = missing_data.map(transformEntry);
      const nonConformList = non_conform_data.map(transformEntry);

      displayData({ conformList, missingList, nonConformList });

      updateExpandedReferenceStats(
        data.total_entries,
        conform_data.length,
        missing_data.length,
        non_conform_data.length
      );
    },
    error: function (error) {
      console.log(error);
    },
  });
}
window.updateExpandedReferenceStats = updateExpandedReferenceStats;