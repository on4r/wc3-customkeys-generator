'use strict';

const fs = require('fs');
const inquirer = require('inquirer');

const heroesJson = __dirname + '/../src/json/heroes.json';
const unitsJson = __dirname + '/../src/json/units.json';

const selectGeneratorQuestion = [
	{
		name: 'name',
		type: 'list',
		message: 'Select Generator:',
		choices: ['unit', 'hero']
	}
];
const confirmInput = [
	{
		name: 'save',
		type: 'confirm',
		message: 'Input OK?'
	}
];
const createHeroQuestions = [
	{
		name: 'name',
		type: 'input',
		message: 'Name:',
		validate: value => {
			if (value.length) return true;
			else return 'Please enter a hero name.';
		}
	},
	{
		name: 'id',
		type: 'input',
		message: 'ID(s):',
		filter: value => {
			if (value.includes(',')) return value.split(',')
			else return value;
		},
		validate: value => {
			if (value.length) return true;
			else return 'Please enter a hero ID.';
		}
	},
	{
		name: 'race',
		type: 'list',
		message: 'Race:',
		choices: ['human', 'orc', 'nightelf', 'undead', 'neutral']
	},
	{
		name: 'summons',
		type: 'list',
		message: 'Does this hero have summons?',
		choices: ['no', 'yes'],
	}
];
const createUnitQuestions = [
	{
		name: 'name',
		type: 'input',
		message: 'Name:',
		validate: value => {
			if (value.length) return true;
			else return 'Please enter a unit name.';
		}
	},
	{
		name: 'id',
		type: 'input',
		message: 'ID(s):',
		filter: value => {
			if (value.includes(',')) return value.split(',')
			else return value;
		},
		validate: value => {
			if (value.length) return true;
			else return 'Please enter a unit ID.';
		}
	},
	{
		name: 'race',
		type: 'list',
		message: 'Race:',
		choices: ['human', 'orc', 'nightelf', 'undead', 'neutral']
	},
	{
		name: 'spells',
		type: 'list',
		message: 'Does this unit have active spells?',
		choices: ['yes', 'no'],
	}
];
const createSpellQuestions = [
	{
		name: 'name',
		type: 'input',
		message: 'Name:',
		validate: value => {
			if (value.length) return true;
			else return 'Please enter a Spell Name.';
		}
	},
	{
		name: 'id',
		type: 'input',
		message: 'ID(s):',
		filter: value => {
			if (value.includes(',')) return value.split(',')
			else return value;
		},
		validate: value => {
			if (value.length) return true;
			else return 'Please enter a spell ID.';
		}
	},
	{
		name: 'button_pos',
		type: 'input',
		message: 'Button Position (xy):',
		filter: pos => {
			if (pos.lenght > 2 || isNaN(Number(pos)) ) return '';
			return pos.split('').map(val => Number(val));
		},
		validate: pos => {
			if (pos.length) return true;
			else return 'Please enter a button position.';
		}
	},
	{
		name: 'unbutton_pos',
		type: 'input',
		message: 'Unbutton Position (xy):',
		filter: pos => {
			if (pos.lenght > 2 || isNaN(Number(pos)) ) return '';
			return pos.split('').map(val => Number(val));
		}
	},
	{
		name: 'type',
		type: 'list',
		message: 'Type:',
		choices: ['active', 'passive', 'toggle']
	}
];
const createSummonQuestions = [
	{
		name: 'name',
		type: 'input',
		message: 'Summon Name:',
		validate: value => {
			if (value.length) return true;
			else return 'Please enter a summon name.';
		}
	}
];
const countQuestion = [
	{
		name: 'count',
		type: 'input',
		message: 'How many?',
		filter: value => {
			return Number(value);
		},
		validate: value => {
			if (!isNaN(value) && value >= 1) return true;
			else return 'Please enter a positive number';
		}
	}
];

//---
// models
//---

class Hero {

	constructor() {

		this.name;
		this.id;
		this.race;
		this.spells;
		this.summons;

	}

	init() {

		return inquirer.prompt(createHeroQuestions).then(hero => {

			this.name = hero.name;
			this.id = hero.id;
			this.race = hero.race;

			return hero;

		}).then(hero => {

			if (hero.summons == 'yes') {

				return inquirer.prompt(countQuestion).then(summons => {
					this.summonsCount = summons.count;
				});

			}

		});

	}

	addSpells(count) {

		return createSpells(count).then(spells => {
			this.spells = spells;
		});

	}

	addSummons(count) {

		return createSummons(count).then(summons => {
			this.summons = summons;
		});

	}

	save() {

		inquirer.prompt(confirmInput).then(confirm => {

			if (confirm.save) {
				writeToJsonFile(heroesJson, this);
				console.log('Saved Hero to', heroesJson);
			} else {
				console.log('Aborted');
			}

		});

	}

}

class Unit {

	constructor() {

		this.name;
		this.id;
		this.race;
		this.spells;

	}

	init() {

		return inquirer.prompt(createUnitQuestions).then(unit => {

			this.name = unit.name;
			this.id = unit.id;
			this.race = unit.race;

			return unit;

		}).then(unit => {

			if (unit.spells == 'yes') {

				return inquirer.prompt(countQuestion).then(spells => {
					this.spellsCount = spells.count;
				});

			}

		});

	}

	addSpells(count) {

		return createSpells(count).then(spells => {
			this.spells = spells;
		});

	}

	save() {

		inquirer.prompt(confirmInput).then(confirm => {

			if (confirm.save) {
				writeToJsonFile(unitsJson, this);
				console.log('Saved unit to', unitsJson);
			} else {
				console.log('Aborted');
			}

		});

	}

}

class Spell {

	constructor() {

		this.name;
		this.id;
		this.type;
		this.button_pos;

	}

	init() {

		return inquirer.prompt(createSpellQuestions).then(spell => {

			this.name = spell.name;
			this.id  = spell.id;
			this.type = spell.type;
			this.button_pos = spell.button_pos;
			if (spell.unbutton_pos.length)
				this.unbutton_pos = spell.unbutton_pos;

		});

	}

}

class Summon {

	constructor() {

		this.name;
		this.spells;

	}

	init() {

		return inquirer.prompt(createSummonQuestions).then(summon => {

			this.name = summon.name;

			return summon;

		}).then(summon => {

			console.log('How many spells does the summon have?');

			return inquirer.prompt(countQuestion).then(spells => {
				this.spellsCount = spells.count;
			});

		});

	}

	addSpells(count) {

		return createSpells(count).then(spells => {
			this.spells = spells;
		});

	}

}

//---
// init
//---

selectGenerator();

//---
// functions
//---

function selectGenerator() {

	inquirer.prompt(selectGeneratorQuestion).then(generator => {
		if (generator.name == 'hero') {
			createHero();
		} else if (generator.name == 'unit') {
			createUnit();
		}
	});

}

async function createHero() {

	console.log('-~= Create Hero =~-');

	let hero = new Hero;
	await hero.init();
	await hero.addSpells(4);
	await hero.addSummons(hero.summonsCount);
	hero.save();

}

async function createUnit() {

	console.log('-~= Create Unit =~-');

	let unit = new Unit;
	await unit.init();
	await unit.addSpells(unit.spellsCount);
	unit.save();

}

async function createSpells(count) {

	let spells = [];

	for (let i = 0; i < count; i++) {

		console.log(`-~= Create Spell ${i+1} =~-`);

		let spell = new Spell;
		await spell.init();
		spells.push(spell);

	}

	return spells;

}

async function createSummons(count) {

	let summons = [];

	for (let i = 0; i < count; i++) {

		console.log(`-~= Create Summon ${i+1} =~-`);

		let summon = new Summon;
		await summon.init();
		await summon.addSpells(summon.spellsCount);
		summons.push(summon);

	}

	return summons;

}

function writeToJsonFile(file, value) {

	fs.stat(file, (err, stats) => {

		let values;

		if (!err)
			values = JSON.parse(fs.readFileSync(file));
		else
			values = [];

		values.push(value);
		fs.writeFileSync(file, JSON.stringify(values, null, 2));

	});

}

