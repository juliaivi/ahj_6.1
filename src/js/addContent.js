export default function addContent(text, id, column) {
  const col = document.querySelector(`[data-name="${column}"]`);
  const colContent = col.querySelector('.col__content');
  const boxText = `
        <div class="col__card card" data-cardId ="${id}">
            <button class="card__delete d_none">X</button>
            <div class="card__text"> ${text}</div>
            <button class="card__subBtn"></button>
            <span class="card__subMenu d_none">
                <label class="subMenu__item">
                    <button class="like"></button>
                    <span class="quantity">1</span>
                </label>
                <label class="subMenu__item">
                    <button class="unlike"></button>
                    <span class="quantity">2</span>
                </label>
                <label class="subMenu__item">
                    <button class="message"></button>
                    <span class="quantity">3</span>
                </label>
            </span>
        </div>
        `;
  colContent.insertAdjacentHTML('beforeend', boxText);
}
