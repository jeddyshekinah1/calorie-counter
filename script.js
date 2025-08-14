// CONSTANTS
const form = document.getElementById("food-form");
const foodNameInput = document.getElementById("food-name");
const foodCaloriesInput = document.getElementById("food-calories");
const foodList = document.getElementById("food-list");
const totalCaloriesDisplay = document.getElementById("total-calories");
const progressBar = document.getElementById("progress-bar");
const resetBtn = document.getElementById("reset-btn");
const dailyGoal = 2000;

// STATE 
let foods = JSON.parse(localStorage.getItem("foods")) || [];

// FUNCTIONS 
function renderFoods() {
  foodList.innerHTML = "";
  foods.forEach((food, index) => {
    const li = document.createElement("li");
    li.className = "flex justify-between items-center border-b py-2";

    li.innerHTML = `
      <span>${food.name} - ${food.calories} cal</span>
      <div class="flex gap-2">
        <button onclick="editFood(${index})" class="bg-yellow-400 px-2 py-1 rounded">Edit</button>
        <button onclick="removeFood(${index})" class="bg-red-500 text-white px-2 py-1 rounded">X</button>
      </div>
    `;
    foodList.appendChild(li);
  });
  updateTotalCalories();
}

function updateTotalCalories() {
  const total = foods.reduce((sum, food) => sum + food.calories, 0);
  totalCaloriesDisplay.textContent = total;

  // Update progress bar
  const percentage = Math.min((total / dailyGoal) * 100, 100);
  progressBar.style.width = `${percentage}%`;
  progressBar.classList.toggle("bg-red-500", total > dailyGoal);
}

function addFood(name, calories) {
  foods.push({ name, calories });
  saveFoods();
  renderFoods();
}

function removeFood(index) {
  foods.splice(index, 1);
  saveFoods();
  renderFoods();
}

function editFood(index) {
  const food = foods[index];
  const newName = prompt("Edit food name:", food.name);
  const newCalories = parseInt(prompt("Edit calories:", food.calories)) || 0;
  if (newName) {
    foods[index] = { name: newName, calories: newCalories };
    saveFoods();
    renderFoods();
  }
}

function saveFoods() {
  localStorage.setItem("foods", JSON.stringify(foods));
}

function resetFoods() {
  foods = [];
  saveFoods();
  renderFoods();
}

// Fetch calorie data from Nutritionix API
async function fetchCalories(foodName) {
  try {
    const appId = "6230dd10"; 
    const appKey = "79ccf62014ba8d56bcce95312706a254"; 

    const res = await fetch("https://trackapi.nutritionix.com/v2/natural/nutrients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-app-id": appId,
        "x-app-key": appKey,
      },
      body: JSON.stringify({ query: foodName }),
    });

    if (!res.ok) throw new Error("Food not found");
    const data = await res.json();
    return data.foods[0]?.nf_calories || 0;
  } catch (err) {
    alert`(Error fetching calories: ${err.message})`;
    return 0;
  }
}

// EVENT LISTENERS
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = foodNameInput.value.trim();
  let calories = parseInt(foodCaloriesInput.value);

  if (!name) return alert("Please enter a food name");

  if (!calories) {
    calories = await fetchCalories(name);
  }

  addFood(name, calories);
  form.reset();
});

resetBtn.addEventListener("click", resetFoods);

// INIT
renderFoods();