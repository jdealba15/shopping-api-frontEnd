const downloadList = document.getElementById('download');

const listEl = document.getElementById('itemList');
const sortedEl = document.getElementById('sorted-list');

const printList = (shoppingList, doc) => {
  
  // this is responsible for generating the regular list
  let y = 10;
  shoppingList.forEach((item) => {
    doc.text(item, 10, y);
    y += 10;
  });
  doc.save("shopping-list.pdf");
};
  
const printSorted = (sortedList, doc) => {
  // this is responsible for generating the sorted list
  let y = 10;  
  sortedList.forEach((category) => {
    const categoryName = Object.keys(category);
    const items = categoryName[0];
    
    doc.setFontSize(14);
    doc.text(items, 10, y);
    y += 10;
    
    doc.setFontSize(12);
    category[items].forEach((item) => {
      doc.text(item, 20, y);
      y += 10;
    });
    y += 5;
  });
  doc.save("sorted-list.pdf");
}

const generatePDF = (e) => {
  e.preventDefault();

  const doc = new jsPDF();
  const shoppingList = localStorage.getItem('shoppingList') ? JSON.parse(localStorage.getItem('shoppingList')) : [];
  const sortedList = localStorage.getItem('sortedList') ? JSON.parse(localStorage.getItem('sortedList')) : [];

  if (listEl.hasChildNodes()) {
    printList(shoppingList, doc);
  } if (sortedEl.hasChildNodes()) {
    printSorted(sortedList, doc);
  };
}

downloadList.addEventListener('click', generatePDF);