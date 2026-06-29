const form = document.getElementById('rsvpForm');
const statusEl = document.getElementById('formStatus');
const companionship = document.getElementById('companionship');
const partnerNameWrap = document.getElementById('partnerNameWrap');
const partnerName = document.getElementById('partnerName');
const alcoholOtherCheck = document.getElementById('alcoholOtherCheck');
const alcoholOtherWrap = document.getElementById('alcoholOtherWrap');
const alcoholOther = document.getElementById('alcoholOther');

function togglePartnerField() {
  const show = companionship.value === 'С парой';
  partnerNameWrap.classList.toggle('visible', show);
  partnerName.required = show;
  if (!show) partnerName.value = '';
}

function toggleAlcoholOtherField() {
  const show = alcoholOtherCheck.checked;
  alcoholOtherWrap.classList.toggle('visible', show);
  alcoholOther.required = show;
  if (!show) alcoholOther.value = '';
}

companionship.addEventListener('change', togglePartnerField);
alcoholOtherCheck.addEventListener('change', toggleAlcoholOtherField);

togglePartnerField();
toggleAlcoholOtherField();

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  statusEl.textContent = 'Отправляем ответ...';

  const formData = new FormData(form);
  const payload = {
    name: formData.get('name')?.trim() || '',
    attendance: formData.get('attendance') || '',
    companionship: formData.get('companionship') || '',
    partner_name: formData.get('partner_name')?.trim() || '',
    alcohol: formData.getAll('alcohol'),
    alcohol_other: formData.get('alcohol_other')?.trim() || '',
    comment: formData.get('comment')?.trim() || '',
  };

  try {
    const response = await fetch('/api/send-rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.error || 'Ошибка отправки');
    }

    form.reset();
    togglePartnerField();
    toggleAlcoholOtherField();
    statusEl.textContent = 'Спасибо! Ваш ответ отправлен.';
  } catch (error) {
    statusEl.textContent = `Не получилось отправить: ${error.message}`;
  }
});
