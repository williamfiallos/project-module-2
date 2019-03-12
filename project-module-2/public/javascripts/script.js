document.addEventListener('DOMContentLoaded', () => {

  console.log('IronGenerator JS imported successfully!');

  const button = document.getElementById('toggle-button');
    // console.log('button clicked', button);
  button.addEventListener('click', function(e) {
    // console.log('button was clicked');
    const editForm = document.getElementById('edit-form');
    editForm.style.display="block";
  
  });
  
}, false);

function toggleElement(elementId) {
  // console.log('toggleElement');
  const editElement = document.getElementById(elementId);
  // console.log('editForm', editElement.style.display);
  editElement.style.display="block";
}
