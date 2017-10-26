import heroes from './json/heroes.json';
import Grid from './models/Grid';

import './styles/styles.scss';

console.log(heroes);

const normalGridOptions = {
	id: 'normal-grid',
	parent_id: 'grids',
	type: 'normal'
};

const researchGridOptions = {
	id: 'research-grid',
	parent_id: 'grids',
	type: 'research',
	disabled_tiles: ['3,2']
};

let normalGrid = new Grid(normalGridOptions);
let researchGrid = new Grid(researchGridOptions);

normalGrid.render();
researchGrid.render();

//normalGrid.fill(heroes[0].spells);
normalGrid.detectClicks();

// allready done :)
//setPosForSpells(normalGrid);

// Start Hotkey Generation Button
const generateBtn = document.getElementById('generate-btn');
generateBtn.addEventListener('click', () => {
	normalGrid.assignHotkeys(heroes);
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
