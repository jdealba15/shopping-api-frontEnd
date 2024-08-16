import { 
    removeFromShoppingList, 
    // createSortedCategory,
    handleInvalidEntry,  
    addToShoppingList,
    createItem, 
    deleteItem,  
} from "./utilities.js";

const clearListBtn = document.getElementById('clear');
const itemList = document.getElementById('itemList');
const itemForm = document.getElementById('item-form');
const itemInput = document.getElementById('item-input');
const sortedList = document.getElementById('sorted-list');
const fInputContainer = document.querySelector('.filter');
const categorizeButton = document.querySelector('.categorize');
const shoppingList = localStorage.getItem('shoppingList') ? JSON.parse(localStorage.getItem('shoppingList')) : [];
const hideSortingOptions = () => shoppingList.length < 5 ? categorizeButton.style.display = 'none' : categorizeButton.style.display = 'block';

const filterInput = (input) => {
    if (input.value.length === 0) {
        handleInvalidEntry('Invalid: you need to type something..duh!', itemInput);
        return null;
    }

    if(input.value.length > 20) {
        handleInvalidEntry('Too many characters...you must be a writer!', itemInput);
        return null;
    }

    if(!/^[a-zA-Z]+( [a-zA-Z]+)*$/.test(input.value)){
        handleInvalidEntry("No special characters...just letters!", itemInput);
        return null;
    }
}

const filterAndClearButton = (state) => {
    fInputContainer.style.display = state;
    clearListBtn.style.display = state;
}

const loadItems = () => {
    if(shoppingList.length > 0) {
        shoppingList.forEach(item => createItem(item, itemList));
        filterAndClearButton('block');
    }
    shoppingList.length < 1 && filterAndClearButton('none');
    hideSortingOptions()
}

const addItem = (e) => {
    e.preventDefault(); 
    filterInput(itemInput);

    if(itemInput.value !== '') {
        sortedList.innerHTML = '';
        shoppingList.length < 4 ? categorizeButton.style.display = 'none' : categorizeButton.style.display = 'block';
        addToShoppingList(itemInput.value, shoppingList);
        createItem(itemInput.value, itemList);
        itemInput.value = '';
        filterAndClearButton('block');
    }
};

const removeItem = (e) => {
    e.preventDefault();
    hideSortingOptions();
    if(e.target.classList.contains('fa-xmark')){
        e.target.closest('li').classList.add('fade-out');
        const item = e.target.closest('li').textContent.trim();
        removeFromShoppingList(item, shoppingList);
        deleteItem(e);
    }
    shoppingList.length < 1 && filterAndClearButton('none');
}

const clearItems = (e) => {
    e.preventDefault();
    while(itemList.firstChild) {
        itemList.removeChild(itemList.firstChild);
    }
    while(sortedList.firstChild) {
        sortedList.removeChild(sortedList.firstChild);
    }
    localStorage.removeItem('shoppingList');
    localStorage.removeItem('sortedList');
    
    filterAndClearButton('none');
    console.log('Removing item from localStorage');
}

const sortItems = () => {
    const input = fInputContainer.children[0];
    const value = input.value.toLowerCase();
    
    if(value.length < 1) {
        while(itemList.firstChild) {
            itemList.removeChild(itemList.firstChild);
        }
        loadItems();
    }
    
    if(value.length > 1){
        sortedList.innerHTML = '';
        let filteredItems = shoppingList.filter(item => item.toLowerCase().includes(value));
        // clear existing rendered list
        while(itemList.firstChild) {
            itemList.removeChild(itemList.firstChild);
        }
        filteredItems.forEach(item => createItem(item, itemList));
    }
    if(value.length > 1){
        categorizeButton.style.display = 'block';
    }
}

const categorize = async (e) => {
    e.preventDefault();
    sortedList.innerHTML = '';
    try {
        fetchItems();
    } catch (error) {
        console.error('Error:', error);
    }
}

// Event Listeners
window.onload = loadItems;
itemForm.addEventListener('submit', addItem);
itemList.addEventListener('click', removeItem);
categorizeButton.addEventListener('click', categorize);
fInputContainer.addEventListener('input', sortItems);
clearListBtn.addEventListener('click', clearItems);

async function fetchItems() {
    const url = 'http://localhost:3000/';
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(shoppingList)
    };
    try {
        const response = await fetch(url, requestOptions);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Response data:', data); // Debugging statement
        
        const contentString = data.message.content; // Key components, accessing groceries correctly from response
        const content = JSON.parse(contentString); // Using JSON.parse method correctly
        localStorage.setItem('sortedList', JSON.stringify(content));
        itemList.innerHTML = '';

        renderItems(content);
    } catch (error) {
        console.error('Error fetching items:', error);
    }
}

function renderItems(content) {
    const sortedList = document.getElementById('sorted-list');
    sortedList.innerHTML = ''; // Clear existing content

    content.forEach(categoryObj => {
        for (const category in categoryObj) {
            const items = categoryObj[category];

            // Create a container div for the category
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category';

            // Create and append a header for the category
            const categoryHeader = document.createElement('h2');
            categoryHeader.innerText = category;
            categoryDiv.appendChild(categoryHeader);

            // Create a paragraph to list all items in the category
            const itemsParagraph = document.createElement('p');
            itemsParagraph.innerText = items.join(', '); // Join items with commas
            categoryDiv.appendChild(itemsParagraph);

            // Append the category container to the itemList
            sortedList.appendChild(categoryDiv);
        }
    });
}