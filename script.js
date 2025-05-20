import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";

const firebaseConfig = {
    apiKey: "AIzaSyCowmKg-VP3HIzoghbj-suz7pQDAs8nBng",
    authDomain: "floraco-e7158.firebaseapp.com",
    databaseURL: "https://floraco-e7158-default-rtdb.firebaseio.com",
    projectId: "floraco-e7158",
    storageBucket: "floraco-e7158.firebasestorage.app",
    messagingSenderId: "672300394740",
    appId: "1:672300394740:web:a2e9e110c9c2c2116616a1"
};

import {getDatabase, ref, child, get, set, update, remove} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";

const app = initializeApp(firebaseConfig);

let id = 0;

var productList = [];

const db = getDatabase();


document.addEventListener('DOMContentLoaded', function () {
  const categories = {
    "floral-supply": ["flowers", "fecorations", "buds"],
    "plant": ["air", "aquatic", "bamboo", "bonsai", "cactus", "carnivorus", "climber", "conifer", "creeper", "cycad", "ferns", "ficus", "fig", "fruit", "grafted-fruit", "ground-cover", "herb", "kokedama", "palm", "perennial", "shrubs", "spice", "succulent"],
    "tree": ["fruit-tree", "shade-tree", "evergreen"],
    "seed": ["vegetable", "flower", "herb"],
    "bulb": ["flowering", "fruit"],
    "soil": ["potting-mix", "compost", "topsoil", "cocopeat"],
    "fertilizer": ["organic", "chemical", "liquid"],
    "pot-and-vase": ["ceramic", "plastic", "glass"],
    "gardening-tool": ["outdoor", "indoor"]
  };

  const parentCategory = document.getElementById('parent-category');
  const subCategory = document.getElementById('sub-category');
  // const imageUrlInput = document.getElementById('product-image-url');
  const imagePreview = document.getElementById('product-image');
  const description = document.getElementById('description');
  const wordCount = document.getElementById('word-count');
  const descError = document.getElementById('desc-error');
  const tagsInput = document.getElementById('tags-input');
  const tagInputContainer = document.getElementById('tag-input-container');
  const variationContainer = document.getElementById('variation-container');
  const addVariationBtn = document.getElementById('add-variation');
  const form = document.getElementById('product-form');
  const productsList = document.createElement('div');
  productsList.id = 'products-list';
  document.body.appendChild(productsList);

  let products = [];

  Object.keys(categories).forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    parentCategory.appendChild(option);
  });

  parentCategory.addEventListener('change', () => {
    const selected = parentCategory.value;
    subCategory.innerHTML = '';
    if (!selected) {
      subCategory.disabled = true;
      subCategory.innerHTML = '<option value="">-- Select a parent category first --</option>';
      return;
    }
    subCategory.disabled = false;
    const subs = categories[selected];
    subCategory.innerHTML = '<option value="">-- Select --</option>';
    subs.forEach(sub => {
      const option = document.createElement('option');
      option.value = sub;
      option.textContent = sub;
      subCategory.appendChild(option);
    });
  });

/*  imageUrlInput.addEventListener('input', () => {
    const url = imageUrlInput.value.trim();
    imagePreview.src = url || '';
  });
*/
  description.addEventListener('input', () => {
    const text = description.value.trim();
    const words = text.length ? text.split(/\s+/) : [];
    const wordLen = words.length;
    descError.style.display = wordLen > 100 ? 'block' : 'none';
    wordCount.textContent = `${wordLen} / 100 words`;
  });

  tagsInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = tagsInput.value.trim();
      if (value) {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = value;
        tagInputContainer.insertBefore(tag, tagsInput);
        tagsInput.value = '';
      }
    }
  });

  addVariationBtn.addEventListener('click', () => {
    const div = document.createElement('div');
    div.className = 'variation-group';
    div.innerHTML = `
      <input type="text" name="variation-id" placeholder="e.g. PLT-SML-BL" required />
      <input type="text" name="variation-name" placeholder="e.g. S (Small), L (Large) etc.," required />
      <input type="number" name="variation-price" placeholder="e.g. 499" required />
      <input type="url" name="variation-image" placeholder="Image URL" />
      <img class="variation-image-preview" src="" alt="Preview" />
    `;
    variationContainer.appendChild(div);

    const imageInput = div.querySelector('[name="variation-image"]');
    const imgPreview = div.querySelector('img');
    imageInput.addEventListener('input', () => {
      imgPreview.src = imageInput.value.trim();
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const product = {
      id: '',
      name: document.getElementById('product-name').value,
      parentCategory: parentCategory.value,
      subCategory: subCategory.value,
      description: description.value,
      tags: Array.from(tagInputContainer.querySelectorAll('.tag')).map(t => t.textContent),
      stockStatus: document.getElementById('stock-status').checked,
      variations: Array.from(variationContainer.querySelectorAll('.variation-group')).map(v => ({
        id: v.querySelector('[name="variation-id"]').value,
        name: v.querySelector('[name="variation-name"]').value,
        price: v.querySelector('[name="variation-price"]').value,
        image: v.querySelector('[name="variation-image"]').value
      }))
    };

    if ((product.variations.length)>0 && product.name.trim() !== '') {

      get(child(ref(db), 'products/id')).then((snapshot)=>{
          
          var id = snapshot.val();

          let pid = 'FCPS'+id.toString().padStart(5, "0");
          product.id = pid;

          set(ref(db, 'products/all/'+product.parentCategory+'/'+product.subCategory+"/"+pid), product)
              .then(()=>{
                  alert("Data Added Successfully");
                  id = id+1;
                  set(ref(db, 'products/id'), id);
              })
              .catch((e)=>{
                  alert("Data Unsuccessful");
                  console.log(e);
              });
          

      });

      form.reset();
      variationContainer.innerHTML = '';
      tagInputContainer.querySelectorAll('.tag').forEach(tag => tag.remove());
      wordCount.textContent = '0 / 100 words';
      // imagePreview.src = '';
    } else {
      alert('Add atleast one variation and Name must not be empty');
    }

  });

  function displayProducts() {

    products = [];
    let content = document.getElementById('content');
    content.innerHTML = "";

    get(child(ref(db), 'products/all/')).then((snapshot)=>{
        var getClassOf = Function.prototype.call.bind(Object.prototype.toString);
        if (snapshot.exists()) { 
          let prods=Object.values(snapshot.val());
          for(var p in prods){

              Object.values(prods[p]).forEach(prd =>{
                let a = Object.values(prd);
                products = products.concat(a);
                console.log(products);
              });
          }
        }



      products.forEach(prod => {
      const div = document.createElement('div');
      div.className = 'product-item';
      div.innerHTML = `
        <p><strong>ID:</strong> ${prod.id}</p>
        <p><strong>Name:</strong> ${prod.name}</p>
        <p><strong>Description:</strong> ${prod.description}</p>
        <p><strong>Category:</strong> ${prod.parentCategory} > ${prod.subCategory}</p>
        <p><strong>Tags:</strong> ${prod.tags}</p>
        <p><strong>Stock Status:</strong> ${prod.stockStatus ? 'Active' : 'Inactive'}</p>
        <p><strong>Variations:</strong></p>
        <ul>
          ${prod.variations.map(v => `<li>${v.id} - ${v.name} - <a href="${v.image}" target="_blank">Image</a></li>`).join('')}
        </ul>
      `;
      content.appendChild(div);
      });
    });

  }

  document.getElementById('show').addEventListener('click', ()=>{
    displayProducts();
  });

});
