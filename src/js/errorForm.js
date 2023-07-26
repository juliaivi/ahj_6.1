export default function errorForm(el) {
//   const col = document.querySelector(`[data-name="${column}"]`);
//   console.log(col);
  const form = el;
  const errorTextarea = `
        <div class="errorForm">
            <p class="text">Введите пожалуйста текст!<p>
        </div>
        `;
  form.insertAdjacentHTML('beforeend', errorTextarea);
}
