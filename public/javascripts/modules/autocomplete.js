function autocomplete(input, latInput, lngInput) {
	if(!input) return; //skip function from running if there is no input
	const dropdown = new google.maps.places.Autocomplete(input);

	dropdown.addListener('place_changed', ()=> {
		const place = dropdown.getPlace();
		if (!place.geometry) return;
		latInput.value = place.geometry.location.lat();
		lngInput.value = place.geometry.location.lng();
	});
	// if someone hits enter on the address field, don't submit the form
	input.on('keydown', (e) => {
		if (e.keyCode === 13) {e.preventDefault()};
	});
}

export default autocomplete;

// need to find a way to drop an error message if someone fails to enter a real place and presses the enter button
