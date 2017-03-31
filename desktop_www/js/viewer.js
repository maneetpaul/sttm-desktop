// eslint-disable-next-line import/no-unresolved
const platform = require('./js/desktop_scripts');
const h = require('hyperscript');

const decks = [];
let currentShabad;
const $message = document.getElementById('message');
const $body = document.body;

$body.classList.add(process.platform);

function hideDecks() {
  Array.from(document.querySelectorAll('.deck')).forEach((el) => {
    el.classList.remove('active');
  });
}

function changeTheme(theme) {
  $body.classList.forEach((bodyClass) => {
    if (bodyClass.indexOf('theme') > -1) {
      // $body.classList.remove(i);
    }
  });
  $body.classList.add(theme);
}

function applyPresenterPrefs(prefs) {
  changeTheme(prefs.theme);
}

const prefs = platform.store.get('userPrefs.presenterWindow');
applyPresenterPrefs(prefs);

// IPC
platform.ipc.on('show-line', (event, data) => {
  const newShabadID = parseInt(data.shabadID, 10);
  if (decks.indexOf(newShabadID) > -1) {
    const $shabadDeck = document.getElementById(`shabad${newShabadID}`);
    if (currentShabad !== newShabadID || !$shabadDeck.classList.contains('active')) {
      hideDecks();
      $shabadDeck.classList.add('active');
      currentShabad = newShabadID;
    }
    Array.from($shabadDeck.querySelectorAll('.slide')).forEach(el => el.classList.remove('active'));
    document.getElementById(`slide${data.lineID}`).classList.add('active');
  } else {
    platform.db.all(`SELECT _id, gurmukhi, english_ssk, transliteration, sggs_darpan FROM shabad WHERE shabad_no = ${newShabadID}`,
      (err, rows) => {
        if (rows.length > 0) {
          const cards = [];
          rows.forEach((row) => {
            cards.push(
              h(
                `div#slide${row._id}.slide${row._id === data.lineID ? '.active' : ''}`,
                [
                  h('h1.gurbani.gurmukhi', row.gurmukhi),
                  h('h2.translation', row.english_ssk),
                  h('h2.transliteration', row.transliteration),
                  h('h2.teeka', row.sggs_darpan),
                ]));
          });
          hideDecks();
          $body.appendChild(h(`div#shabad${newShabadID}.deck.active`, cards));
          currentShabad = parseInt(newShabadID, 10);
          decks.push(newShabadID);
        }
      });
  }
});

platform.ipc.on('show-text', (event, data) => {
  hideDecks();
  $message.classList.add('active');
  while ($message.firstChild) {
    $message.removeChild($message.firstChild);
  }
  $message.appendChild(h('div', { class: 'slide active' }, h('h1', { class: 'gurmukhi gurbani' }, data.text)));
});
