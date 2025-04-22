import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarkView from './views/bookmarkView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODEL_CLOSE_SEC } from './config.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

const recipeContainer = document.querySelector('.recipe');

// NEW API URL (instead of the one shown in the video)
// https://forkify-api.jonas.io

// if (module.hot) module.hot.accept();

///////////////////////////////////////

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    // 0) Update Results View To Mark Selected Search Result
    resultsView.update(model.getSearchResultsPage());

    // 1) Updating Bookmarks View
    bookmarkView.update(model.state.bookmarks);

    // 2) Loading Recipe
    await model.loadRecipe(id);

    // 3) Renering Recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    // 1) Get Search Query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Load Search Results
    await model.loadSearchResults(query);

    // 3) Render Results
    resultsView.render(model.getSearchResultsPage());

    // 4) Render Initial Pagination Buttons
    paginationView.render(model.state.search);
  } catch (error) {
    console.error(error);
  }
};

const controlPagination = function (goToPage) {
  // 1) Render NEW Results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2) Render NEW Pagination Buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update The Recipe Servings (in state)
  model.updateServings(newServings);

  // Update The Recipe View
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1) Add/Remove Bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2) Update Recipe View
  recipeView.update(model.state.recipe);

  // 3) Render Bookmarks
  bookmarkView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarkView.render(model.state.bookmarks);
};

const controllAddRecipe = async function (newRecipe) {
  try {
    // Render Loading Spinner
    addRecipeView.renderSpinner();

    // Upload New Recipe
    await model.uploadRecipe(newRecipe);

    // Render Recipe
    recipeView.render(model.state.recipe);

    // Succsess Message
    addRecipeView.renderMessage();

    // Render Bookmark View
    bookmarkView.render(model.state.bookmarks);

    // Change ID In URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close Form Window
    setTimeout(() => {
      addRecipeView.toggleWindow();
    }, MODEL_CLOSE_SEC * 1000);
  } catch (err) {
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarkView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controllAddRecipe);
};
init();
