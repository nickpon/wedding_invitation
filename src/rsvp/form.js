import { RSVP_SCRIPT_URL } from '../config/rsvp.js';

const DRINK_OPTIONS = [
  { id: 'champagne', label: 'Шампанское' },
  { id: 'white-wine', label: 'Белое вино' },
  { id: 'red-wine', label: 'Красное вино' },
  { id: 'cocktail', label: 'Коктейль' },
  { id: 'whiskey', label: 'Виски' },
  { id: 'vodka', label: 'Водка' },
  { id: 'gin', label: 'Джин-тоник' },
  { id: 'soft', label: 'Безалкогольные' },
];

const MEAL_OPTIONS = [
  { id: 'meat', label: 'Мясо' },
  { id: 'fish', label: 'Рыба' },
  { id: 'veggie', label: 'Вегетарианское' },
];

function renderDrinkCheckboxes(container) {
  container.innerHTML = DRINK_OPTIONS.map(
    (d) => `
    <label class="rsvp__chip">
      <input type="checkbox" name="drinks" value="${d.label}" />
      <span>${d.label}</span>
    </label>`
  ).join('');
}

function renderMealRadios(container) {
  container.innerHTML = MEAL_OPTIONS.map(
    (m, i) => `
    <label class="rsvp__chip rsvp__chip--radio">
      <input type="radio" name="meal" value="${m.label}" ${i === 0 ? 'required' : ''} />
      <span>${m.label}</span>
    </label>`
  ).join('');
}

function setAttendingState(form, attending) {
  const details = form.querySelector('.rsvp__details');
  const isYes = attending === 'yes';
  details.classList.toggle('rsvp__details--hidden', !isYes);
  details.querySelectorAll('input, textarea, select').forEach((el) => {
    if (el.name === 'meal' || el.name === 'drinks') {
      el.required = isYes && el.type === 'radio';
    } else if (el.id === 'rsvp-name') {
      el.required = true;
    } else {
      el.required = false;
    }
  });
  const mealRadios = details.querySelectorAll('input[name="meal"]');
  mealRadios.forEach((r) => {
    r.required = isYes;
  });
}

function collectPayload(form) {
  const fd = new FormData(form);
  const attending = fd.get('attending');
  const drinks = fd.getAll('drinks');

  return {
    attending: attending === 'yes' ? 'Придёт' : 'Не сможет',
    name: (fd.get('name') || '').trim(),
    drinks: attending === 'yes' ? drinks : [],
    meal: attending === 'yes' ? fd.get('meal') || '' : '',
    allergies: (fd.get('allergies') || '').trim(),
    comment: (fd.get('comment') || '').trim(),
    submittedAt: new Date().toISOString(),
  };
}

function validate(form, attending) {
  const name = form.querySelector('#rsvp-name').value.trim();
  if (!name) {
    return 'Пожалуйста, укажите ваше имя.';
  }
  if (attending !== 'yes') return null;

  const meal = form.querySelector('input[name="meal"]:checked');
  if (!meal) return 'Выберите, пожалуйста, основное блюдо.';

  const drinks = form.querySelectorAll('input[name="drinks"]:checked');
  if (drinks.length === 0) return 'Отметьте хотя бы один напиток (или «Безалкогольные»).';

  return null;
}

async function submitToSheet(payload) {
  if (!RSVP_SCRIPT_URL) {
    throw new Error(
      'Форма ещё не подключена к таблице. Добавьте VITE_RSVP_SCRIPT_URL в файл .env (см. scripts/google-apps-script).'
    );
  }

  const res = await fetch(RSVP_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { ok: res.ok };
  }
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || 'Не удалось отправить ответ. Попробуйте позже.');
  }
}

export function initRsvpForm() {
  const form = document.querySelector('#rsvp-form');
  if (!form) return;

  renderDrinkCheckboxes(form.querySelector('#rsvp-drinks'));
  renderMealRadios(form.querySelector('#rsvp-meals'));

  const status = form.querySelector('#rsvp-status');
  const submitBtn = form.querySelector('#rsvp-submit');
  const attendingRadios = form.querySelectorAll('input[name="attending"]');

  attendingRadios.forEach((radio) => {
    radio.addEventListener('change', () => setAttendingState(form, radio.value));
  });

  setAttendingState(form, form.querySelector('input[name="attending"]:checked')?.value || 'yes');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';
    status.className = 'rsvp__status';

    const attending = form.querySelector('input[name="attending"]:checked')?.value;
    const err = validate(form, attending);
    if (err) {
      status.textContent = err;
      status.classList.add('rsvp__status--error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправляем…';

    try {
      await submitToSheet(collectPayload(form));
      form.reset();
      setAttendingState(form, 'yes');
      form.querySelector('input[name="attending"][value="yes"]').checked = true;
      status.textContent = 'Спасибо! Ваш ответ сохранён. Ждём вас на празднике!';
      status.classList.add('rsvp__status--success');
    } catch (error) {
      status.textContent = error.message;
      status.classList.add('rsvp__status--error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Отправить ответ';
    }
  });
}
