// Modified from verbatim: Externalized from agent-ag/animejs-add-demo/index.html
import { createLayout, utils } from 'https://cdn.jsdelivr.net/npm/animejs@4.4.1/dist/bundles/anime.esm.js';

const [ $addBtn ] = utils.$('.controls button');

const layout = createLayout('.layout-container', {
    duration: 250,
    ease: 'outQuad',
    enterFrom: {
        transform: 'translateY(100px) scale(.25)',
        opacity: 0,
        duration: 350,
        ease: 'out(3)'
    }
});

let count = 0;

function addItem() {
    layout.update(({ root }) => {
        const $item = document.createElement('div');
        $item.classList.add('item');
        $item.innerHTML = ++count;
        if (count > 15) return $addBtn.disabled = true;
        root.appendChild($item);
    });
}

$addBtn.addEventListener('click', addItem);
