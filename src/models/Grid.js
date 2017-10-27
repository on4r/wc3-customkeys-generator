const EventEmitter = require('eventemitter3');

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
		hotkey.classList.add('hotkey');
		tile.appendChild(hotkey);

		if (this.options.disabled_tiles && this.options.disabled_tiles.includes(`${x},${y}`) ) {
			tile.classList.add('disabled');
		}

		return tile;

	}

	render() {
		
		let container = document.body;

		if (this.options.container_id) {
			container = document.getElementById(this.options.container_id);	
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
			}, error => {
				console.log(error.message);
				this.grid[pos.x + '' + pos.y].el.firstChild.innerText = '!';
			}).then(() => {
				this.grid[pos.x + '' + pos.y].el.firstChild.classList.remove('active');
				this.detectClicks();
			});

		});

	}

	_awaitHotkeyInput() {

		return new Promise((resolve, reject) => {

			const detectKeyInput = event => {
				
				event.preventDefault();
				document.removeEventListener('keydown', detectKeyInput);

				// add alphanumeric char validation
				if (true) {
					resolve(event.key);
				} else {
					reject({message: 'enter an alphanumberic character'})
				}

			}

			document.addEventListener('keydown', detectKeyInput);

		});

	}

	updateTile(tile, text) {

		// <div class="hotkey-el"><div></div></div>
		// children[0] is the empty <div>
		tile.el.children[0].innerText = text;

	}

	fill(spells) {

		spells.forEach(spell => {
			let tile =
				(this.options.type == 'normal') ?
				this.grid[spell.button_pos[0] + '' + spell.button_pos[1]] :
				this.grid[spell.research_button_pos[0] + '' + spell.research_button_pos[1]];
			this.updateTile(tile, spell.name);
		});

	}

	setHotkeys(spells) {

		return new Promise((resolve, reject) => {

		});

	}

	assignHotkeys(heroes) {

		heroes.forEach(hero => {
			hero.spells.forEach(spell => {

				let xy = spell.button_pos[0] + '' + spell.button_pos[1];

				if (this.grid.hasOwnProperty(xy)) {
					spell.hotkey = this.grid[xy].hotkey;
				}

			});
		});

		console.log(heroes);
		this.generateCustomKeysTxt(heroes);

	}

	generateCustomKeysTxt(heroes) {
		console.log("generating custom keys ...");
		let customKeysStr = '';
		heroes.forEach(hero => {
			hero.spells.forEach(spell => {
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

		var a = window.document.createElement('a');
		a.href = window.URL.createObjectURL(new Blob([customKeysStr], {type: 'text/text'}));
		a.download = 'CustomKeys.txt';

		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);

		console.log(customKeysStr);

	}

}
