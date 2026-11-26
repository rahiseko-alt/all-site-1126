import { createLayout, utils } from 'https://esm.sh/animejs';

const [ $button ] = utils.$('.controls button');
const $containerA = document.querySelector('.container-a');
const $containerB = document.querySelector('.container-b');

const layout = createLayout('.layout');

let swapped = false;

function swapItems() {
  layout.update(() => {
    const itemsA = [...$containerA.querySelectorAll('.item')];
    const itemsB = [...$containerB.querySelectorAll('.item')];
    // DOM上で子要素を入れ替える
    itemsA.forEach(el => $containerB.appendChild(el));
    itemsB.forEach(el => $containerA.appendChild(el));
    swapped = !swapped;
  });
}

$button.addEventListener('click', swapItems);
