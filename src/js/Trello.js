import addContent from './addContent';
import errorForm from './errorForm';

export default class Trello {
  constructor(el) {
    this.container = el;
    this.data = {
      todo: [],
      progress: [],
      done: [],
    };
    this.colHeader = this.container.querySelector('.col__header');
    this.colContent = this.container.querySelector('.col__content');
    this.footers = Array.from(this.container.querySelectorAll('.col__footer'));
    this.actualElement = undefined;
    this.colContentEl = null;
    this.x = null;
    this.y = null;
    this.count = 0;

    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
  }

  init() {
    this.footers.forEach((el) => {
      el.addEventListener('click', (e) => this.openMessageBox(e));
    });
    this.redraw();
  }

  onMouseUp(e) {
    this.cloneActualElement.classList.remove('ghost');
    this.actualElement.remove();
    this.actualElement = this.cloneActualElement;
    this.cloneActualElement = null;
    this.actualElement.classList.remove('dragged');
    const dataCardId = this.actualElement.getAttribute('data-cardId');// СardId
    this.hoverCard(dataCardId);
    const trelloColOld = this.colOld.closest('.trello__col');
    const columOldAttribut = trelloColOld.getAttribute('data-name');

    if (e.target.closest('.trello__col')) {
      this.columNewAttribute = e.target.closest('.trello__col').getAttribute('data-name');
    } else {
      this.columNewAttribute = trelloColOld.getAttribute('data-name');
    }

    const colls = Array.from(this.actualElement.closest('.trello__col').querySelectorAll('.col__card'));
    // старая позиция
    const deleteItemIndex = this.data[columOldAttribut].findIndex((item) => item.id == dataCardId);
    this.data[columOldAttribut].splice(deleteItemIndex, 1);
    // новая позиция

    const addItemIndex = colls.findIndex((item) => item.getAttribute('data-cardId') == dataCardId);
    const text = this.actualElement.querySelector('.card__text').textContent.trim();

    this.data[this.columNewAttribute].splice(addItemIndex, 0, { id: dataCardId, text });

    this.actualElement = undefined;

    if (!this.actualElement || this.cloneActualElement === null) {
      document.body.style.cursor = 'auto';
    }

    this.saveData();
    document.documentElement.removeEventListener('mouseup', this.onMouseUp);
    document.documentElement.removeEventListener('mousemove', this.onMouseMove);
  }

  onMouseMove(e) {
    if (this.actualElement) {
      this.actualElement.style.top = `${e.pageY - this.y}px`;
      this.actualElement.style.left = `${e.pageX - this.x}px`;
    }
    if (!this.actualElement) {
      return;
    }
    const newCol = e.target;
    const colContent = e.target.closest('.col__content');

    if (e.target.closest('.col__content')) {
      if (e.target.closest('.col__content').children.length == 0) {
        colContent.append(this.cloneActualElement);
      }
      if (e.target.closest('.col__card')) {
        if (e.target.closest('.col__card').getAttribute('data-cardId') !== this.actualElement.getAttribute('data-cardId')) {
          colContent.insertBefore(this.cloneActualElement, e.target.closest('.col__card'));
        }
      }

      const lastElement = e.target.closest('.col__content').lastElementChild;
      const { bottom } = lastElement.getBoundingClientRect();
      if (e.pageY > bottom) {
        colContent.append(this.cloneActualElement);
      }
    }

    if (newCol.closest('.col__header')) {
      this.colContentEl = newCol.closest('.trello__col').querySelector('.col__content');
      this.colContentEl.insertBefore(this.cloneActualElement, this.colContentEl.firstElementChild);
    }

    if (newCol.closest('.col__footer')) {
      this.colContentEl = newCol.closest('.trello__col').querySelector('.col__content');
      this.colContentEl.append(this.cloneActualElement);
    }

    if (!newCol.closest('.trello__content') || newCol.classList.contains('trello__content')) {
      this.colOld.append(this.cloneActualElement);
    }
  }

  onMouseDown(e) {
    e.preventDefault();

    if (e.target.classList.contains('card__delete') || e.target.classList.contains('card__subBtn')) {
      this.clickButtomForm(e);
      return;
    }

    if (e.target.classList.contains('card__text')) {
      return;
    }

    if (e.target.closest('.col__card')) {
      this.actualElement = e.target.closest('.col__card');
      this.colOld = this.actualElement.closest('.col__content');// ...........контейнер старый

      this.cloneActualElement = this.actualElement.cloneNode(true);
      const positionActualElement = this.actualElement.getBoundingClientRect();
      this.x = e.clientX - positionActualElement.left;
      this.y = e.clientY - positionActualElement.top;
      this.cloneActualElement.classList.add('ghost');
      this.actualElement.classList.add('drag');
      this.actualElement.style.width = `${positionActualElement.width - 20}px`;
      document.body.style.cursor = 'grabbing';

      document.documentElement.addEventListener('mouseup', this.onMouseUp);
      document.documentElement.addEventListener('mousemove', this.onMouseMove);
    }
  }

  hoverCard(id) {
    const element = document.querySelector(`[data-cardId='${id}']`);
    element.addEventListener('mouseover', (e) => this.onhoverCard(e));
    element.addEventListener('mouseout', (e) => this.outhoverCard(e));
    element.addEventListener('mousedown', (e) => this.onMouseDown(e));
  }

  openMessageBox(e) {
    e.preventDefault();
    const activeElem = e.target;
    if (e.target.closest('.col__add')) {
      this.colAdd = e.target.closest('.col__add');
    }

    this.footer = e.currentTarget.closest('.col__footer');
    this.form = this.footer.querySelector('form');
    this.addTextarea = this.form.querySelector('.add__textarea');

    this.addTextarea.addEventListener('focus', this.removeErrorForm);

    if (e.target.closest('.col__add')) {
      this.dNone(this.colAdd, this.form);
    }

    if (activeElem === this.footer.querySelector('.add__btn')) {
      this.removeErrorForm();
      this.dNone(this.form, this.colAdd);
    }

    if (activeElem === this.footer.querySelector('.add__button')) {
      const textarea = this.addTextarea.value.trim();

      if (textarea.length > 0) {
        this.column = e.currentTarget.closest('.trello__col').getAttribute('data-name');
        addContent(textarea, this.count, this.column);
        this.hoverCard(this.count);

        this.data[this.column].push({ id: this.count, text: textarea });
        this.count += 1;
        this.dNone(this.form, this.colAdd);
        this.saveData();
      } else {
        errorForm(this.form);
      }
    }
  }

  dNone(el1, el2) {
    el1.classList.add('d_none');
    el2.classList.remove('d_none');
    if (!el2.classList.contains('d_none')) {
      this.addTextarea.value = '';
    }
  }

  onhoverCard(e) {
    const element = e.currentTarget;
    const buttonDnone = element.querySelector('button.d_none');
    if (buttonDnone !== null) {
      buttonDnone.classList.remove('d_none');
    }
  }

  outhoverCard(e) {
    const allCardDelete = document.querySelectorAll('.card__delete');
    allCardDelete.forEach((el) => {
      el.classList.add('d_none');
    });
    const element = e.currentTarget;
    const cardDelete = element.querySelector('.card__delete');
    const buttonDnone = element.classList.contains('d_none');
    if (!buttonDnone || buttonDnone === null) {
      cardDelete.classList.add('d_none');
    }
  }

  clickButtomForm(e) {
    const element = e.target;
    const buttonDnone = element.classList.contains('card__delete');
    const cardSubBtn = element.classList.contains('card__subBtn');
    const el = e.currentTarget;
    if (buttonDnone) {
      const colCard = el.classList.contains('col__card');
      const column = e.currentTarget.closest('.trello__col').getAttribute('data-name');
      const colCardId = e.currentTarget.closest('.col__card').getAttribute('data-cardId');
      if (colCard) {
        const deleteItemIndex = this.data[column].findIndex((item) => item.id == colCardId);
        this.data[column].splice(deleteItemIndex, 1);
        el.remove();
        this.saveData();
        return;
      }
    }

    if (cardSubBtn) {
      const cardSubMenu = el.querySelector('.card__subMenu');
      const dNone = cardSubMenu.classList.contains('d_none');
      if (dNone) {
        cardSubMenu.classList.remove('d_none');
      } else {
        cardSubMenu.classList.add('d_none');
      }
    }
  }

  removeErrorForm() {
    if (this.form.querySelector('.errorForm')) {
      this.form.querySelector('.errorForm').remove();
    }
  }

  saveData() {
    localStorage.setItem('data', JSON.stringify(this.data));
  }

  loadData() {
    this.dataElem = JSON.parse(localStorage.getItem('data'));
  }

  redraw() {
    this.loadData();
    const collName = ['todo', 'progress', 'done'];
    if (this.dataElem === null) {
      return;
    }

    collName.forEach((el) => {
      let id = document.querySelectorAll('[data-cardId]').length;
      this.dataElem[el].forEach((elem) => {
        id = document.querySelectorAll('[data-cardId]').length;
        addContent(elem.text, id, el);
        this.hoverCard(id);
        this.data[el].push({ id, text: elem.text });
        this.count += 1;
      });
    });
  }
}
