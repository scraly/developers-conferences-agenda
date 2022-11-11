(() => {
	let selectedYear = 2022;
	let [prev, next] = $('a');
	prev.addEventListener('click', () => {
		selectedYear--;
		$('#yearLabel').innerText = String(selectedYear);
		renderYear(selectedYear);
	});
	next.addEventListener('click', () => {
		selectedYear++;
		$('#yearLabel').innerText = String(selectedYear);
		renderYear(selectedYear);
	});

	document.addEventListener('DOMContentLoaded', renderYear.bind(window, selectedYear));
})();
