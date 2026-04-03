// Beginner-friendly JavaScript for NASA APOD gallery
// Find our date picker inputs and button on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getButton = document.getElementById('getButton');
const gallery = document.getElementById('gallery');
const randomFactEl = document.getElementById('randomFact');

// Modal elements
const modal = document.getElementById('modal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalBody = document.getElementById('modalBody');

// Call the setupDateInputs function from dateRange.js
// (It sets allowed dates and a default 9-day range)
setupDateInputs(startInput, endInput);

// NASA API key: replace 'DEMO_KEY' with your own key for heavier use.
const API_KEY = 'DEMO_KEY';
const APOD_URL = 'https://api.nasa.gov/planetary/apod';

// Extra-credit: random space facts
const SPACE_FACTS = [
	'A day on Venus is longer than a year on Venus.',
	'Neutron stars can spin 600 times per second.',
	'Mars appears red due to iron oxide (rust) on its surface.',
	'There are more stars in the universe than grains of sand on Earth.',
	'Jupiter has a persistent storm called the Great Red Spot.'
];

// Show a random fact on load
function showRandomFact() {
	const fact = SPACE_FACTS[Math.floor(Math.random() * SPACE_FACTS.length)];
	randomFactEl.textContent = `Did you know? ${fact}`;
}
showRandomFact();

// Show a loading message in the gallery
function showLoading() {
	gallery.innerHTML = '';
	const loading = document.createElement('div');
	loading.className = 'placeholder';
	loading.innerHTML = '<div class="placeholder-icon">🔄</div><p>Loading space photos…</p>';
	gallery.appendChild(loading);
}

// Show an error message
function showError(msg) {
	gallery.innerHTML = '';
	const err = document.createElement('div');
	err.className = 'placeholder';
	err.innerHTML = `<p>${msg}</p>`;
	gallery.appendChild(err);
}

// Render gallery items (images and links for videos)
function renderGallery(items) {
	gallery.innerHTML = '';
	if (!items || items.length === 0) {
		gallery.innerHTML = '<div class="placeholder"><p>No images found for that range.</p></div>';
		return;
	}

	items.forEach(item => {
		const card = document.createElement('div');
		card.className = 'gallery-item';

		// Media container -- supports hover zoom
		const mediaWrap = document.createElement('div');
		mediaWrap.className = 'hover-zoom';

		if (item.media_type === 'image') {
			const img = document.createElement('img');
			img.src = item.url;
			img.alt = item.title || 'NASA APOD image';
			mediaWrap.appendChild(img);
			card.appendChild(mediaWrap);

			// Clicking opens modal with larger image and details
			card.addEventListener('click', () => openModal(item));
		} else if (item.media_type === 'video') {
			// For videos, show a thumbnail or a link
			const thumb = document.createElement('div');
			thumb.style.height = '200px';
			thumb.style.display = 'flex';
			thumb.style.alignItems = 'center';
			thumb.style.justifyContent = 'center';
			thumb.style.background = '#000';
			thumb.style.color = '#fff';
			thumb.textContent = '▶️ Video';
			mediaWrap.appendChild(thumb);
			card.appendChild(mediaWrap);

			const link = document.createElement('p');
			link.innerHTML = `<a href="${item.url}" target="_blank" rel="noopener">Open video in new tab</a>`;
			card.appendChild(link);

			// Also open modal that embeds the video when clicked
			card.addEventListener('click', () => openModal(item));
		}

		// Title & date
		const meta = document.createElement('p');
		meta.innerHTML = `<strong>${item.title}</strong><br><em>${item.date}</em>`;
		card.appendChild(meta);

		gallery.appendChild(card);
	});
}

// Open modal to show a larger image or embedded video
function openModal(item) {
	modalBody.innerHTML = '';

	if (item.media_type === 'image') {
		const img = document.createElement('img');
		img.src = item.hdurl || item.url;
		img.alt = item.title || 'NASA APOD image';
		img.className = 'modal-body-img';
		modalBody.appendChild(img);
	} else if (item.media_type === 'video') {
		// Try to embed YouTube videos; otherwise provide link
		const iframe = document.createElement('iframe');
		iframe.src = item.url.replace('watch?v=', 'embed/');
		iframe.width = '100%';
		iframe.height = '480';
		iframe.frameBorder = '0';
		iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
		iframe.allowFullscreen = true;
		modalBody.appendChild(iframe);
	}

	const meta = document.createElement('div');
	meta.className = 'modal-meta';
	meta.innerHTML = `<strong>${item.title}</strong> — <em>${item.date}</em>`;
	modalBody.appendChild(meta);

	const explanation = document.createElement('div');
	explanation.className = 'modal-explanation';
	explanation.textContent = item.explanation || '';
	modalBody.appendChild(explanation);

	// Show modal
	modal.classList.remove('hidden');
	modal.setAttribute('aria-hidden', 'false');
}

// Close modal
function closeModal() {
	modal.classList.add('hidden');
	modal.setAttribute('aria-hidden', 'true');
	modalBody.innerHTML = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// Fetch APOD entries for a date range
async function fetchApodRange(startDate, endDate) {
	const params = new URLSearchParams({
		api_key: API_KEY,
		start_date: startDate,
		end_date: endDate
	});

	try {
		const res = await fetch(`${APOD_URL}?${params.toString()}`);
		if (!res.ok) throw new Error(`NASA API returned ${res.status}`);
		const data = await res.json();
		// The API returns either an object or an array depending on query
		return Array.isArray(data) ? data : [data];
	} catch (err) {
		throw err;
	}
}

// Click handler for the button
getButton.addEventListener('click', async () => {
	const startDate = startInput.value;
	const endDate = endInput.value;

	if (!startDate || !endDate) {
		showError('Please pick a valid start and end date.');
		return;
	}

	showLoading();

	try {
		const items = await fetchApodRange(startDate, endDate);
		// Sort by date descending so latest images show first
		items.sort((a, b) => new Date(b.date) - new Date(a.date));
		renderGallery(items);
	} catch (err) {
		showError('Error loading images. Try again later.');
		console.error(err);
	}
});
