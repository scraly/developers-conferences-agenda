(() => {
	let selectedYear = 2022;
	let [prev, next] = $('a');
	prev.addEventListener('click', () => {
		selectedYear--;
		$('#yearLabel').innerText = String(selectedYear);
		renderer.render(selectedYear);
	});
	next.addEventListener('click', () => {
		selectedYear++;
		$('#yearLabel').innerText = String(selectedYear);
		renderer.render(selectedYear);
	});

	renderer.onready = renderer.render.bind(renderer, selectedYear);
})();
