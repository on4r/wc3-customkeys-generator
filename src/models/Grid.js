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

		console.log("the grid:", this.grid);

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
				console.log(hotkey, pos);
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

	generateCustomKeys($heroes, $sharedCommands) {

		console.log("generating custom keys ...");
		let customKeysStr = '';

		// Add General Unit Managment keys to customKeysStr
		$sharedCommands.forEach(sharedCommand => {
				
				let xy = sharedCommand.button_pos[0] + '' + sharedCommand.button_pos[1];
				if (this.grid[xy].hasOwnProperty('hotkey')) {
					
					sharedCommand.hotkey = this.grid[xy].hotkey;

					customKeysStr += `// ${sharedCommand.name}\n`;
					customKeysStr += `[${sharedCommand.id}]\n`;
					customKeysStr += `Hotkey=${sharedCommand.hotkey}\n`;
					customKeysStr += `\n`;
				
				}

		});

		// Add hero spells to customKeysStr
		$heroes.forEach(hero => {
			hero.spells.forEach(spell => {
				
				// Assign the hotkey from the grid hotkey map
				// to the spell
				let xy = spell.button_pos[0] + '' + spell.button_pos[1];
				if (this.grid[xy].hasOwnProperty('hotkey')) {
					spell.hotkey = this.grid[xy].hotkey;
				}

				if (typeof spell.id == 'object') {
					customKeysStr += `// ${spell.name}\n`;
					spell.id.forEach(id => {
						customKeysStr += `[${id}]\n`;
						customKeysStr += `Hotkey=${spell.hotkey}\n`;
						customKeysStr += `Researchhotkey=${spell.hotkey}\n`
						if (spell.type == 'toggle')
							customKeysStr += `Unhotkey=${spell.hotkey}\n`;
						customKeysStr += `\n`;
					});
				} else {
					customKeysStr += `// ${spell.name}\n`;
					customKeysStr += `[${spell.id}]\n`;
					customKeysStr += `Hotkey=${spell.hotkey}\n`;
					customKeysStr += `Researchhotkey=${spell.hotkey}\n`
					if (spell.type == 'toggle')
						customKeysStr += `Unhotkey=${spell.hotkey}\n`;
					customKeysStr += `\n`;
				}

			});
		});

		// Create and start CustomKeys.txt download
		var a = window.document.createElement('a');
		a.href = window.URL.createObjectURL(new Blob([customKeysStr], {type: 'text/text'}));
		a.download = 'CustomKeys.txt';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		console.log(customKeysStr);

	}

}
