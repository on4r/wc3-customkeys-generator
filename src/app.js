import heroes from './json/heroes.json';
import shared_commands from './json/shared_commands.json';
import Grid from './models/Grid';

import './styles/styles.scss';

console.log(heroes);

const normalGridOptions = {
	container_id: 'main',
	type: 'normal',
  disabled_tiles: ['11','21']
};

let normalGrid = new Grid(normalGridOptions);

normalGrid.render();
normalGrid.detectClicks();

// allready done :)
//setPosForSpells(normalGrid);

// Start Hotkey Generation Button
const dlButton = document.getElementById('dl-btn');
dlButton.addEventListener('click', () => {
	normalGrid.generateCustomKeys(heroes, shared_commands);
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
