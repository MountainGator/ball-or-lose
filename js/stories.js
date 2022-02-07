"use strict";

let storyList;
let click = 1;

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

function generateStoryMarkup(story, count) {
  if(currentUser){
    return $(
        ` <div class="col-md-6 col-lg-3 mt-2">
          <div class="card text-dark bg-light">
            <div class="card-body" id="${story.storyId}">
              <h5 class="card-title">${story.title}</h5>
              <p class="card-text">By ${story.author}</p>
              <p class="card-text">posted by ${story.username}</p>
              <a href="${story.url}" class="btn btn-primary" target="_blank">Read</a>
              <a type="button" class="btn btn-success select" id="f${count}">Favorite</a>
            </div>
          </div>
        </div>
      `);
  } else return $(
    ` <div class="col-md-6 col-lg-3 mt-2">
      <div class="card text-dark bg-light">
        <div class="card-body" id="${story.storyId}">
          <h5 class="card-title">${story.title}</h5>
          <p class="card-text">By ${story.author}</p>
          <p class="card-text">posted by ${story.username}</p>
          <a href="${story.url}" class="btn btn-dark" target="_blank">Read</a>
        </div>
      </div>
    </div>
  `);
}

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();
  let count = 0;

  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story, count);
    $allStoriesList.append($story);
    count ++;
  }
  $allStoriesList.show();
}

async function getPastGames () {
  const options = {
    method: 'GET',
    url: `https://api-nba-v1.p.rapidapi.com/games/date/${pastFormat}`,
    headers: {
      'x-rapidapi-host': 'api-nba-v1.p.rapidapi.com',
      'x-rapidapi-key': '1de9427720msh6e2bc8a9e101267p1eb3cdjsnfb435a5f3e89'
    }
  };
  const response = await axios.request(options);
  const results = response.data;
  const gamesArr = results.api.games;
  let gameDetail = [];

  for(let game of gamesArr) {

    let { gameId, hTeam, vTeam } = game; 
    gameDetail.push({gameId, hTeam, vTeam})
  }

  makePastBoard(gameDetail);
}

async function makePastBoard(games) {
  const gamesArr = await games;

  for(let game of gamesArr) {
    let $gameRow = $(`
      <tr id="${game.gameId}">  
        <td>
          <img src="${game.hTeam.logo}" alt="home team logo" height="20">
          ${game.hTeam.nickName}
        </td>
        <td>
          ${game.hTeam.score.points}
        </td>
        <td>
          <img src="${game.vTeam.logo}" alt="home team logo" height="20">
          ${game.vTeam.nickName}
        </td>
        <td>
          ${game.vTeam.score.points}
        </td>
      </tr>
    `);

    $pastGames.append($gameRow);
  }
}

async function getFutureGames () {
  const options = {
    method: 'GET',
    url: `https://api-nba-v1.p.rapidapi.com/games/date/${format}`,
    headers: {
      'x-rapidapi-host': 'api-nba-v1.p.rapidapi.com',
      'x-rapidapi-key': '1de9427720msh6e2bc8a9e101267p1eb3cdjsnfb435a5f3e89'
    }
  };
  
  const response = await axios.request(options);
  const results = response.data;
  let gamesArr = results.api.games;
  let gameDetail = [];

  for(let game of gamesArr) {

    let { gameId, hTeam, vTeam, startTimeUTC } = game; 
    gameDetail.push({gameId, hTeam, vTeam, startTimeUTC})
  }

  makeFutureBoard(gameDetail);
}

async function makeFutureBoard(games) {
  const gamesArr = await games;

  for(let game of gamesArr) {
    let gameTime = new Date(game.startTimeUTC);
    let localTime = gameTime.toLocaleTimeString('en-US');

    let $gameRow = $(`
      <tr id="${game.gameId}">  
        <td>
          <img src="${game.hTeam.logo}" alt="home team logo" height="20">
          ${game.hTeam.nickName}
        </td>
        <td>
          VS
        </td>
        <td>
          <img src="${game.vTeam.logo}" alt="home team logo" height="20">
          ${game.vTeam.nickName}
        </td>
        <td>
          ${localTime}
        </td>
      </tr>
    `);
    $futureGames.append($gameRow);
  }
}

async function getTopStories () {
  const response = await axios.get(`https://newsdata.io/api/1/news?apikey=pub_431042f7c286e1760c8f0277b9a0292a398f&category=sports&language=en&country=us&q=nba`); //&from_date=${pastFormat}&to_date${format}
  const data = response.data;
  const { results } = data;

  putNewsOnPage(results);
}

async function putNewsOnPage (articles) {
  const newsArr = await articles;
  
  for(let article of newsArr) {
    let time = new Date(article.pubDate);
    let localTime = time.toString().slice(0,21);
    let description = `${article.description}`;
    if(description.length > 200) {
      description = description.slice(0, 200) + '...';
    }

    if(description == 'null') {
      description = 'no short description available';
    }

    let $item = $(
        `<div class="col-md-6 col-lg-3 mt-3">
          <div class="card text-white bg-dark">
            <div class="card-body">
              <h5 class="card-title">${article.title}</h5>
              <p class="card-text">On ${localTime}</p>
              <p class="card-text">${description}</p>
              <a href="${article.link}" class="btn btn-warning" target="_blank">Read More</a>
            </div>
          </div>
        </div>`);
      
      $articleList.append($item); 
  }
}

$('#all-stories-list').on('click', '.select', favoriteStory);

async function favoriteStory (e) {
  e.preventDefault();
  const $favBtn = $(e.target);
  const $storyDiv = $favBtn.closest('div');
  const storyId = $storyDiv.attr('id');
  const story = storyList.stories.find(s => s.storyId === storyId);


  if ($storyDiv.hasClass("fav")) {
    await currentUser.removeFavorite(story);
    $storyDiv.removeClass("fav");
    $storyDiv.parent().attr("class", "card text-dark bg-light");
    $favBtn.attr("class", "btn btn-success select");
    $favBtn.text('Favorite');
  } else {
    await currentUser.addFavorite(story);
    $storyDiv.addClass("fav");
    $storyDiv.parent().attr("class", "card text-dark bg-warning");
    $favBtn.attr("class", "btn btn-danger select");
    $favBtn.text('Unfavorite');
  }
}

function checkForFavorites (array) {
  for(let story of array) {
    let allBtns = $('.select');
    let $div = $(`#${story.storyId}`);
    $div.parent().attr("class", "card text-dark bg-warning");
    $div.attr("class", "card-body fav");
    $div.find(allBtns).attr("class", "btn btn-danger select").text('Unfavorite');
  }
}

$submitMe.on('click', e => {
  e.preventDefault();
  hidePageComponents();
  $addMe.show();
})

$('#new-story-form').on('submit', submitStory);

async function submitStory (evt) {
  evt.preventDefault();
  console.debug(submitStory);
  const $title = $('#title').val();
  const $author = $('#author-input').val();
  const $url = $('#url-input').val();

  if(!$title || !$author || !$url) {
    alert('Please enter a title, author name, and url');
  }

  await storyList.addStory(currentUser, { "title": $title, "author": $author, "url": $url });

  updateUIOnUserLogin();
}

$allowDelete.on('click', addDeleteBtn);

async function addDeleteBtn () {
  
  if (click === 2) {
    for(let story of await storyList.stories) {
      if (story.username === currentUser.username) {
        $(`#${story.storyId}`).find('.delete-me').remove();
        $(`#${story.storyId}`).find('.select').show();
      }
    }
    $allowDelete.text('Turn On Delete');
  } else if (click === 1){
    for(let story of await storyList.stories) {
      if (story.username === currentUser.username) {
        $(`#${story.storyId}`).find('.select').hide();
        let $delBtn = $('<a type="button" class="btn btn-danger delete-me">Delete!</a>');
        $(`#${story.storyId}`).append($delBtn);
      }
    }
    $allowDelete.text('Turn Off Delete');
  } 

  click = click === 1 ? 2 : 1;
}

$allStoriesList.on('click', '.delete-me', deleteStory);

async function deleteStory(e) {
  e.preventDefault();
  const $tgtBtn = $(e.target);
  const $div = $tgtBtn.closest('div');
  const $storyId = $div.attr('id');

  await storyList.removeStory(currentUser, $storyId); 
  
  $div.parent().remove();
  updateUIOnUserLogin();
  addDeleteBtn();
}

$('#newStories').on('click', '#faves', showFavorites);

function showFavorites (evt) {
  evt.preventDefault();
  
  $allStoriesList.empty();
  let count = 0;

  for (let story of storyList.stories) {
    if(currentUser.isFavorite(story)) {
      const $story = generateStoryMarkup(story, count);
      $allStoriesList.append($story);
      count ++;
    }
  }
  $allStoriesList.show();
  $('#faves').text('All Stories');
  $('#faves').attr('id', 'all-stories');
  checkForFavorites(currentUser.favorites);
}

$('#newStories').on('click', '#all-stories', showAllStories);

async function showAllStories (ev) {
  ev.preventDefault();

  await getAndShowStoriesOnStart();

  $('#all-stories').text('My Favorites');
  $('#all-stories').attr('id', 'faves');
  updateUIOnUserLogin();
}

