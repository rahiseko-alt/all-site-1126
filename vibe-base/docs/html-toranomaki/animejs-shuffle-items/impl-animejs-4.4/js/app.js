// Modified from verbatim: Externalized from agent-ag/animejs-shuffle-demo/index.html
import { createLayout, utils } from 'https://cdn.jsdelivr.net/npm/animejs@4.4.1/dist/bundles/anime.esm.js';

const [ $button ] = utils.$('.controls button');
const layout = createLayout('.layout-container');

function animateLayout() {
    layout.update(({ root }) => {
        const items = [...root.querySelectorAll('.item')];
        utils.shuffle(items).forEach($el => root.appendChild($el));
    });
}

$button.addEventListener('click', animateLayout);
