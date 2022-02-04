"use strict";

// So we don't have to keep re-finding things on page, find DOM elements once:

const $body = $("body");

const $storiesLoadingMsg = $("#stories-loading-msg");
const $allStoriesList = $("#all-stories-list");

const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");

const $navLogin = $("#nav-login");
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");
$navLogOut.hide();
$navUserProfile.hide();

const $gamescores = $('#gamescores');
const $pastGames = $('#pastGames');
const $futureGames = $('#futureGames');
const $articleList = $('#article-list');
const $newStories = $('#newStories');
$newStories.hide();

const $addMe = $('#add-me');
const $submitMe = $('#submit-me');
const $allowDelete = $('#allow-delete');
const $submitNewStory = $('#submit-new-story');
$addMe.hide();

const currDay = new Date();
const nextDay = new Date(currDay);

nextDay.setDate(nextDay.getDate() + 1);

let day = nextDay.getDate();
let yesterday = currDay.getDate();
let month = nextDay.getMonth();
month += 1;
let year = nextDay.getFullYear();

if(day < 10) { day = `0${day}`;}
if(yesterday < 10) { yesterday = `0${yesterday}`;}
if(month < 10) {month = `0${month}`;}

let format = `${year}-${month}-${day}`;
let pastFormat = `${year}-${month}-${yesterday}`;

/** To make it easier for individual components to show just themselves, this
 * is a useful function that hides pretty much everything on the page. After
 * calling this, individual components can re-show just what they want.
 */

function hidePageComponents() {
  const components = [
    $allStoriesList,
    $loginForm,
    $signupForm,
    $gamescores,
    $articleList,
  ];
  components.forEach(c => c.hide());
}

/** Overall function to kick off the app. */



async function start() {
  console.debug("start");
  // "Remember logged-in user" and log in, if credentials in localStorage
  await checkForRememberedUser();
  await getAndShowStoriesOnStart();
  // await getPastGames();
  // await getFutureGames();
  await getTopStories();
  // if we got a logged-in user
  if (currentUser) {
    updateUIOnUserLogin();
  }
}

// Once the DOM is entirely loaded, begin the app
  $(start);


