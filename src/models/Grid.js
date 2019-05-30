const EventEmitter = require('eventemitter3');

/*

	containerId: string
	type: string (normal|research)
	disabledTiles: array of strings 'xy'
	actionEl: DOM node of some action element

*/

export default class Grid {

	constructor(options) {

		this.grid = [];
		this.options = options || {};
		this.EE = new EventEmitter;

		this.init();

	}

	init() {

		for (let y = 0; y < 3; y++) {
			for (let x = 0; x < 4; x++) {

				this.grid[x + '' + y] = {};
				this.grid[x + '' + y].el = this.createTile(x,y);

			}
		}

	}

	createTile(x, y) {

		let tile = document.createElement('div');
		let hotkey = document.createElement('div');

		tile.classList.add('tile');
		tile.classList.add('xy-' + x + y);
		hotkey.classList.add('hotkey');
		tile.appendChild(hotkey);

		if (this.options.disabledTiles && this.options.disabledTiles.includes(`${x}${y}`) ) {
			tile.classList.add('disabled');
		}

		return tile;

	}

	render() {

		let container = document.body;

		if (this.options.containerId) {
			container = document.getElementById(this.options.containerId);
		}

		for (let y = 0; y < 3; y++) {
			for (let x = 0; x < 4; x++) {
				container.appendChild(this.grid[x + '' + y].el);
				this.grid[x + '' + y].el.addEventListener('click', e => {
					this.EE.emit('tile-clicked', {'x': x, 'y': y});
				});
			}
		}

	}

	awaitClick() {

		return new Promise((resolve, reject) => {

			this.EE.on('tile-clicked', pos => {
				this.EE.removeListener('title-clicked');
				resolve(pos);
			});

		});

	}

	detectClicks() {

		this.EE.once('tile-clicked', pos => {

			this.grid[pos.x + '' + pos.y].el.firstChild.classList.add('active');

			this._awaitHotkeyInput().then(hotkey => {

				hotkey = hotkey.toUpperCase();
				this.grid[pos.x + '' + pos.y].hotkey = hotkey;
				this.grid[pos.x + '' + pos.y].el.firstChild.innerText = hotkey;
				this.grid[pos.x + '' + pos.y].el.firstChild.classList.remove('error');
				this.grid[pos.x + '' + pos.y].error = false;
			}, error => {
				console.log(error.message);
				this.grid[pos.x + '' + pos.y].el.firstChild.innerText = '!';
				this.grid[pos.x + '' + pos.y].el.firstChild.classList.add('error');
				this.grid[pos.x + '' + pos.y].error = true;
			}).then(() => {
				this.grid[pos.x + '' + pos.y].el.firstChild.classList.remove('active');
				this.options.actionEl.disabled = this._errosInGrid() ? true : false;
				this.grid[pos.x + '' + pos.y].el.firstChild.title = this._errosInGrid() ? 'Enter a character between a-z' : '';
				this.detectClicks();
			});

		});

	}

	_awaitHotkeyInput() {

		return new Promise((resolve, reject) => {

			document.addEventListener('keydown', validate);

			function validate(event) {

				// remove event listener till next function call
				document.removeEventListener('keydown', validate);

				// validate user input (a-z)
				if (/^[a-z]$/.test(event.key)) {
					resolve(event.key);
				} else {
					reject({message: 'enter a valid character (a-z)'})
				}

			}

		});

	}

	_errosInGrid() {

		const tilesArr = Object.values(this.grid);

		for (let i = 0; i < tilesArr.length; i++) {
			if (tilesArr[i].error == true)
				return true;
		}

		return false;

	}

	generateCustomKeys($heroes, $units, $spells, $sharedCommands, $checkedBoxes) {

		console.log("generating custom keys ...");

		let customKeysStr = '';
		let sharedCommandsStr = '';
		let miscSpellsStr = '';
		let unitSpellsStr = '';
		let heroSpellsStr = '';

		// Add general unit managment
		sharedCommandsStr = this.addToCustomKeys(customKeysStr, $sharedCommands, 'sharedCommand');

		// Add misc spells
		miscSpellsStr = this.addToCustomKeys(customKeysStr, $spells, 'spell');

		// Add unit spells
		if ($checkedBoxes.includes('units')) {
			let tmp = '';
			$units.forEach(unit => {
				tmp += this.addToCustomKeys(customKeysStr, unit.spells, 'unit');
			});
			unitSpellsStr = tmp;
		}

		// Add hero spells
		if ($checkedBoxes.includes('heroes')) {
			let tmp = '';
			$heroes.forEach(hero => {
				tmp += this.addToCustomKeys(customKeysStr, hero.spells, 'hero');
				hero.summons.forEach(summon => {
					tmp += this.addToCustomKeys(customKeysStr, summon.spells, 'summon');
				});
			});
			heroSpellsStr = tmp;
		}

		customKeysStr = sharedCommandsStr + miscSpellsStr + unitSpellsStr + heroSpellsStr;

		// Create and start CustomKeys.txt download
		var a = window.document.createElement('a');
		a.href = window.URL.createObjectURL(new Blob([customKeysStr], {type: 'text/text'}));
		a.download = 'CustomKeys.txt';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);

	}

	addToCustomKeys($str, $arr, $type) {

		$arr.forEach(val => {

			// create xy string
			let buttonPosXY = val.button_pos[0] + '' + val.button_pos[1];

			// skip further processing if there is no hotkey set for position xy
			if (this.grid[buttonPosXY].hotkey === undefined) {
				return;
			} else {
				val.hotkey = this.grid[buttonPosXY].hotkey;
			}

			// If spell has "unbutton_pos" set
			if ( val.hasOwnProperty('unbutton_pos') ) {
				let unbuttonPosXY = val.unbutton_pos.toString().replace(',','');
				if (this.grid[unbuttonPosXY].hotkey !== undefined) {
					val.unhotkey = this.grid[unbuttonPosXY].hotkey;
				}
			}

			// add everything need to provided string
			$str += `// ${val.name}\r\n`;

			if (typeof val.id == 'object') {

				val.id.forEach(id => {
					$str += `[${id}]\r\n`;
					_generateHotkeyContent(val);
				});

			} else {

				$str += `[${val.id}]\r\n`;
				_generateHotkeyContent(val)

			}

			$str += `\r\n`;

		});

		function _generateHotkeyContent(val) {

			$str += `Hotkey=${val.hotkey}\r\n`;
			$str += `Tip=${val.name} (|cffffcc00${val.hotkey}|r)\r\n`;

			// Researchhotkey = Hotkey for heroes only
			if ($type === 'hero') {
				$str += `Researchhotkey=${val.hotkey}\r\n`
			}

			if (val.type == 'toggle') {
				$str += `Unhotkey=${val.hotkey}\r\n`;
			} else if (val.hasOwnProperty('unhotkey')) {
				$str += `Unhotkey=${val.unhotkey}\r\n`;
				$str += `Untip=${val.unname} (|cffffcc00${val.unhotkey}|r)\r\n`;
			}

		}

		return $str;

	}

}
