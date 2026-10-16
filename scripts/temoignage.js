// Questionnaire de témoignage : validation champ par champ, envoi via Web3Forms,
// et lien WhatsApp pré-rempli avec le nom du client pour l'envoi de sa photo.
const form = document.querySelector('#testimonialForm');
const success = document.querySelector('#testimonialSuccess');
const nameInput = document.querySelector('#t-name');
const whatsappLinks = [document.querySelector('#t-whatsapp'), document.querySelector('[data-whatsapp-copy]')].filter(Boolean);

const messages = {
  nom: { valueMissing: 'Indiquez votre prénom et votre nom.' },
  entreprise: { valueMissing: 'Indiquez votre entreprise ou organisation.' },
  contact: { valueMissing: 'Indiquez un email ou un numéro WhatsApp.' },
  projet: { valueMissing: 'Indiquez le projet réalisé ensemble.' },
  note: { valueMissing: 'Choisissez une note de 1 à 5.' },
  temoignage: { valueMissing: 'Écrivez votre témoignage en quelques phrases.', tooShort: 'Ajoutez quelques mots de plus (20 caractères minimum).' },
  autorisation_publication: { valueMissing: 'Cochez cette case pour que votre témoignage puisse être publié.' },
};

const errorIds = {
  nom: 't-name-error',
  entreprise: 't-company-error',
  contact: 't-contact-error',
  projet: 't-project-error',
  note: 't-rating-error',
  temoignage: 't-quote-error',
  autorisation_publication: 't-consent-error',
};

function validate(name) {
  const fields = [...form.querySelectorAll(`[name="${name}"]`)];
  const field = fields[0];
  const failure = Object.keys(messages[name]).find((key) => field.validity[key]);
  fields.forEach((item) => item.setAttribute('aria-invalid', String(Boolean(failure))));
  document.getElementById(errorIds[name]).textContent = failure ? messages[name][failure] : '';
  return failure ? field : null;
}

function updateWhatsappLinks() {
  const name = nameInput.value.trim();
  const text = `Bonjour David, voici ma photo pour mon témoignage${name ? ` (${name})` : ''}.`;
  whatsappLinks.forEach((link) => { link.href = `https://wa.me/243816684426?text=${encodeURIComponent(text)}`; });
}

nameInput.addEventListener('input', updateWhatsappLinks);

Object.keys(messages).forEach((name) => {
  form.querySelectorAll(`[name="${name}"]`).forEach((field) => {
    field.addEventListener('change', () => { if (field.getAttribute('aria-invalid') === 'true') validate(name); });
    field.addEventListener('input', () => { if (field.getAttribute('aria-invalid') === 'true') validate(name); });
  });
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const firstInvalid = Object.keys(messages).map(validate).find(Boolean);
  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  const submit = form.querySelector('button[type="submit"]');
  const status = form.querySelector('.form-status');
  const label = submit.innerHTML;
  submit.disabled = true;
  submit.textContent = 'Envoi en cours…';
  status.textContent = '';

  try {
    const data = new FormData(form);
    data.append('access_key', 'db97ebd6-8125-4d33-b78a-507f224beb4f');
    const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data });
    const result = await response.json();
    if (!result.success) throw new Error(result.message || 'Envoi impossible');
    updateWhatsappLinks();
    form.hidden = true;
    success.hidden = false;
    success.focus();
  } catch (error) {
    status.textContent = 'Une erreur est survenue. Réessayez, ou envoyez vos réponses à contact@davidwawina.site.';
    submit.disabled = false;
    submit.innerHTML = label;
  }
});
