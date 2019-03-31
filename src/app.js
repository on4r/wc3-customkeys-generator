import heroes from './json/heroes.json';
import units from './json/units.json';
import spells from './json/spells.json';
import shared_commands from './json/shared_commands.json';
import Grid from './models/Grid';

console.log("heroes:", heroes);
console.log("units:", units);
console.log("spells:", spells);
console.log("shared commands:", shared_commands);

const dlButton = document.getElementById('dl-btn');
const normalGridOptions = {
	containerId: 'main',
	type: 'normal',
	// disabledTiles: ['11','21'],
	actionEl: dlButton
};
const normalGrid = new Grid(normalGridOptions);

normalGrid.render();
normalGrid.detectClicks();

// Start Hotkey Generation Button
dlButton.addEventListener('click', () => {
	let checkedBoxes = [...document.querySelectorAll('input[type=checkbox]:checked')].map(checkbox => checkbox.value);
	normalGrid.generateCustomKeys(heroes, units, spells, shared_commands, checkedBoxes);
});

// Define reasearch-/button position for spells
// and write to local storage
async function setPosForSpells($grid) {

	const buttonPosProperty = $grid.options.type == 'normal' ? 'button_pos' : 'research_button_pos';
	console.warn(`Defining ${buttonPosProperty}-grid positions`);

	for (let j = 0; j < heroes.length; j++) {

		for (let i = 0; i < heroes[j].spells.length; i++) {

			if (heroes[j].spells[i].hasOwnProperty(buttonPosProperty))
				continue;

			console.warn(heroes[j].name, heroes[j].spells[i].name);
			let pos = await $grid.awaitClick();
			console.log(pos);
			heroes[j].spells[i][buttonPosProperty] = [pos.x, pos.y];

		}

		if (heroes[j].summons.length) {

			for (let n = 0; n < heroes[j].summons.length; n++) {

				for (let m = 0; m < heroes[j].summons[n].spells.length; m++) {

					if (heroes[j].summons[n].spells[m].hasOwnProperty(buttonPosProperty))
						continue;

					console.warn(heroes[j].summons[n].name, heroes[j].summons[n].spells[m].name);
					let pos = await $grid.awaitClick();
					console.log(pos);
					heroes[j].summons[n].spells[m][buttonPosProperty] = [pos.x, pos.y];

				}

			}

		}

	}

	localStorage.setItem('heroes', JSON.stringify(heroes));

}
