const logos = [
    'chornomorka.png',
    'dominos.png',
    'gogi.png',
    'ilmolino.png',
    'kfc.png',
    'lviv.png',
    'mac.png',
    'musashi.png',
    'myastoria.png',
    'puzata.png',
    'salateria.png',
    'shashlik.png'
];

const container = document.getElementById('slot');

const ITEM_HEIGHT = 100;

function createItems() {
  container.innerHTML = '';

  // дублюємо багато разів для довгого скролу
  for (let i = 0; i < 50; i++) {
    const img = document.createElement('img');
    img.src = 'assets/' + logos[i % logos.length];
    container.appendChild(img);
  }
}

// function spin() {
//  const totalItems = container.children.length;

//  const randomIndex = Math.floor(Math.random() * logos.length);

//  // додаємо кілька повних прокруток
//  const loops = 2;
//  const finalIndex = loops * logos.length + randomIndex;

//  const offset = finalIndex * 110;

//  // кастомний easing як у слотів
//  container.style.transition = 'transform 3s cubic-bezier(0.15, 0.85, 0.35, 1)';
//  container.style.transform = `translateY(-${offset}px)`;

//  setTimeout(() => {
//    const result = logos[randomIndex];
//    sendResult(result);
//  }, 3000);
// }

// function spin() {

//   container.innerHTML = '';

//   // дублюємо багато разів для довгого скролу
//   for (let i = 0; i < 50; i++) {
//     const img = document.createElement('img');
//     img.src = 'assets/' + logos[i % logos.length];
//     container.appendChild(img);
//   }
  
//   container.classList.add('spinning');

//   const randomIndex = Math.floor(Math.random() * logos.length);
//   const loops = 2;
//   const finalIndex = loops * logos.length + randomIndex;

//   const offset = finalIndex * 110;

//   container.style.transition = 'transform 3s cubic-bezier(0.15, 0.85, 0.35, 1)';
//   container.style.transform = `translateY(-${offset}px)`;

//   setTimeout(() => {
//    

//     const result = logos[randomIndex];

//     sendResult(result);
//   }, 3000);
// }

function spin() {

  container.classList.add('spinning');

  const randomIndex = Math.floor(Math.random() * logos.length);
  const loops = 2;
  const finalIndex = loops * logos.length + randomIndex;
  const offset = finalIndex * 110;

  // крок 1: скидаємо transition і ставимо початкове положення
  container.style.transition = 'none';
  container.style.transform = 'translateY(0)';

  // крок 2: даємо браузеру відміряти стилі
  requestAnimationFrame(() => {
    // крок 3: запускаємо швидку анімацію
    container.style.transition = 'transform 3s cubic-bezier(0.15, 0.85, 0.35, 1)';
    container.style.transform = `translateY(-${offset}px)`;

    // крок 4: після закінчення швидкої анімації, центруємо картинку
    setTimeout(() => {
      container.classList.remove('spinning');
      container.style.transition = 'none';
      const wrapperHeight = container.parentElement.clientHeight;
      const centerOffset = (wrapperHeight - 110) / 2;
      const preciseOffset = offset - centerOffset;
      container.style.transform = `translateY(-${preciseOffset}px)`;

      // плавне під’їзджання
      requestAnimationFrame(() => {
        container.style.transition = 'transform 0.5s ease-out';
        container.style.transform = `translateY(-${preciseOffset}px)`;
      });

      sendResult(logos[randomIndex]);
    }, 3000);
  });
}

function sendResult(result) {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.sendData(JSON.stringify({ result }));
  }
}

createItems();
