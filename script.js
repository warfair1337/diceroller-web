let dice = [];
let sides = 6;
let allowReroll = false;
let badGambler = false;

document.getElementById('rollBtn').addEventListener('click', rollDice);
document.getElementById('rerollAllBtn').addEventListener('click', rerollAll);

async function rollDice() {
  const num = parseInt(document.getElementById('numDice').value, 10);
  sides = parseInt(document.getElementById('sides').value, 10);
  allowReroll = document.getElementById('rerollToggle').checked;
  badGambler = document.getElementById('gamblerToggle').checked;

  dice = [];
  const container = document.getElementById('diceContainer');
  container.innerHTML = '';
  document.getElementById('notification').textContent = '';
  document.getElementById('total').textContent = '';
  document.getElementById('rerollControls').classList.toggle('hidden', !allowReroll);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').reverse();
  const promises = [];
  for (let i = 0; i < num; i++) {
    const name = alphabet[i];
    const dieElem = document.createElement('div');
    dieElem.className = 'die';
    const nameElem = document.createElement('div');
    nameElem.className = 'name';
    nameElem.textContent = name;
    const valueElem = document.createElement('div');
    valueElem.className = 'value';
    valueElem.textContent = '-';
    const btn = document.createElement('button');
    btn.textContent = 'Re-roll';
    btn.addEventListener('click', () => rerollDie(i));
    dieElem.appendChild(nameElem);
    dieElem.appendChild(valueElem);
    dieElem.appendChild(btn);
    container.appendChild(dieElem);
    dice.push({ name, value: 0, valueElem, dieElem });

    btn.style.display = allowReroll ? 'block' : 'none';

    promises.push(
      new Promise((resolve) => {
        setTimeout(async () => {
          const val = await animateDie(dice[i]);
          dice[i].value = val;
          resolve();
        }, i * 500);
      })
    );
  }
  await Promise.all(promises);
  updateTotalsAndCombos();
}

function weightedRoll(sides) {
  const total = (sides * (sides + 1)) / 2;
  let rand = Math.random() * total;
  for (let i = sides; i >= 1; i--) {
    rand -= i;
    if (rand <= 0) return i;
  }
  return 1;
}

function animateDie(die) {
  die.dieElem.classList.add('rolling');
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      die.valueElem.textContent = Math.ceil(Math.random() * sides);
    }, 100);
    setTimeout(() => {
      clearInterval(interval);
      const finalVal = badGambler
        ? weightedRoll(sides)
        : Math.ceil(Math.random() * sides);
      die.valueElem.textContent = finalVal;
      die.dieElem.classList.remove('rolling');
      resolve(finalVal);
    }, 1000);
  });
}

async function rerollDie(index) {
  const die = dice[index];
  const val = await animateDie(die);
  die.value = val;
  updateTotalsAndCombos();
}

async function rerollAll() {
  const promises = dice.map((die, i) =>
    new Promise((resolve) => {
      setTimeout(async () => {
        const val = await animateDie(die);
        die.value = val;
        resolve();
      }, i * 500);
    })
  );
  await Promise.all(promises);
  updateTotalsAndCombos();
}

function updateTotalsAndCombos() {
  const total = dice.reduce((sum, d) => sum + d.value, 0);
  document.getElementById('total').textContent = `Total: ${total}`;

  const values = dice.map((d) => d.value);
  const notifications = [];
  let count = 1;
  for (let i = 1; i < values.length; i++) {
    if (values[i] === values[i - 1]) {
      count++;
    } else {
      addNotif(count);
      count = 1;
    }
  }
  addNotif(count);

  const noteElem = document.getElementById('notification');
  if (notifications.length > 0) {
    noteElem.textContent = notifications.join(' & ');
    noteElem.classList.add('flash');
    setTimeout(() => noteElem.classList.remove('flash'), 3000);
  } else {
    noteElem.textContent = '';
  }

  function addNotif(c) {
    if (c >= 2 && c <= 4) {
      const type = c === 2 ? 'Doubles' : c === 3 ? 'Trips' : 'Quads';
      notifications.push(type);
    }
  }
}
