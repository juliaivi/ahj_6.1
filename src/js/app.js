import Trello from './Trello';

const container = document.querySelector('.container');
const popover = new Trello(container);
popover.init();
