window.toggleExpand = function(element) {
  const $element = $(element).parent();
  const isExpanded = $element.hasClass('expanded');
  const $allBoxes = $('.grid > div');

  if (isExpanded) {
      $element.removeClass('expanded');
      // Déterminer l'animation de réinitialisation en fonction de la position de la boîte
      if ($element.index() === 0) { // En haut à gauche
          $element.animate({height: "400px", width: "752px"}, 300, function() {
              $allBoxes.css('visibility', 'visible'); // Afficher toutes les boîtes après l'animation
          });
      } else if ($element.index() === 1) { // En haut à droite
          $element.animate({height: "400px", width: "752px", left: "0"}, 300, function() {
              $allBoxes.css('visibility', 'visible'); // Afficher toutes les boîtes après l'animation
          });
      } else if ($element.index() === 2) { // En bas à gauche
          $element.animate({height: "400px", width: "752px", top: "0"}, 300, function() {
              $allBoxes.css('visibility', 'visible'); // Afficher toutes les boîtes après l'animation
          });
      } else if ($element.index() === 3) { // En bas à droite
          $element.animate({height: "400px", width: "752px", top: "0", left: "0"}, 300, function() {
              $allBoxes.css('visibility', 'visible'); // Afficher toutes les boîtes après l'animation
          });
      }
  } else {
      $allBoxes.css('visibility', 'hidden'); // Cacher toutes les boîtes
      $element.css('visibility', 'visible'); // Afficher uniquement la boîte cliquée

      // Déterminer l'animation d'expansion en fonction de la position de la boîte
      if ($element.index() === 0) { // En haut à gauche
          $element.animate({height: "816px", width: "1536px"}, 300, 'linear');
      } else if ($element.index() === 1) { // En haut à droite
          $element.animate({height: "816px", width: "1536px", left: "-784px", }, 300, 'linear');
      } else if ($element.index() === 2) { // En bas à gauche
          $element.animate({height: "816px", width: "1536px", top: "-416px"}, 300, 'linear');
      } else if ($element.index() === 3) { // En bas à droite
          $element.animate({height: "816px", width: "1536px", left: "-784px", top: "-430px"}, 300, 'linear');
      }

      $element.addClass('expanded');
  }
}