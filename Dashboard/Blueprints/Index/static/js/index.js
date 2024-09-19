$(document).ready(function() {
console.log('Hello from index.js');
});

function toggleExpand(element) {
  const isExpanded = element.classList.contains('expanded');
  const allElements = document.querySelectorAll('.grid > div');

  // Reset all elements
  allElements.forEach(el => {
      el.classList.remove('expanded');
      el.style.position = '';
      el.style.zIndex = '';
      el.style.width = '';
      el.style.height = '';
      el.style.top = '';
      el.style.left = '';
  });

  if (!isExpanded) {
      // Expand the clicked element
      element.classList.add('expanded');
      element.style.position = 'absolute';
      element.style.zIndex = '10';
      element.style.width = '100%';
      element.style.height = '100%';
      element.style.top = '0';
      element.style.left = '0';
  }
}