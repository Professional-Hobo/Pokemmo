$estr = function() { return js.Boot.__string_rec(this,''); }
if(typeof pokemmo_s=='undefined') pokemmo_s = {}
pokemmo_s.Client = function(socket) {
	if( socket === $_ ) return;
	this.socket = socket;
	this.disconnected = false;
	socket.on("login",$closure(this,"msg_login"));
}
pokemmo_s.Client.__name__ = ["pokemmo_s","Client"];
pokemmo_s.Client.prototype.socket = null;
pokemmo_s.Client.prototype.disconnected = null;
pokemmo_s.Client.prototype.username = null;
pokemmo_s.Client.prototype.accountLevel = null;
pokemmo_s.Client.prototype.newAccount = null;
pokemmo_s.Client.prototype.character = null;
pokemmo_s.Client.prototype.initCharacter = function(save) {
	this.character = new pokemmo_s.ClientCharacter(this,save);
}
pokemmo_s.Client.prototype.msg_login = function(data) {
	var me = this;
	if(!(Std["is"](data.username,String) && Std["is"](data.password,String))) {
		this.socket.emit("loginFail","invalidData");
		return;
	}
	if(pokemmo_s.GameServer.clients.length > 200) {
		console.log("Refusing client, server is full");
		this.socket.emit("loginFail","serverFull");
		return;
	}
	pokemmo_s.MasterConnector.loginUser(data.username,data.password,function(result,username) {
		if(result != "success") {
			me.socket.emit("loginFail",result);
			return;
		}
		me.username = username;
		me.accountLevel = pokemmo_s.GameData.adminsData[username] == null?0:pokemmo_s.GameData.adminsData[username].level;
		me.socket.on("disconnect",$closure(me,"onDisconnect"));
		pokemmo_s.MasterConnector.loadCharacter(username,function(success,save) {
			if(!success) {
				me.socket.emit("loginFail","internalError");
				return;
			}
			if(save == null) {
				me.newAccount = true;
				me.socket.emit("newGame",{ username : username, starters : pokemmo_s.ServerConst.pokemonStarters, characters : pokemmo_s.ServerConst.characterSprites});
				me.socket.on("newGame",$closure(me,"e_newGame"));
			} else {
				me.socket.emit("startGame",{ username : username});
				me.socket.on("startGame",function(data1) {
					me.initCharacter(save);
				});
			}
		});
	});
}
pokemmo_s.Client.prototype.kick = function() {
	if(this.character != null) this.character.disconnect(); else {
		this.socket.disconnect();
		this.onDisconnect();
	}
}
pokemmo_s.Client.prototype.onDisconnect = function(data) {
	if(this.disconnected) return;
	this.disconnected = true;
	pokemmo_s.MasterConnector.disconnectUser(this.username);
}
pokemmo_s.Client.prototype.e_newGame = function(data) {
	if(!this.newAccount) return;
	if(!(Std["is"](data.starter,String) && Std["is"](data.character,String))) return;
	if(pokemmo_s.ServerConst.pokemonStarters.indexOf(data.starter) == -1 || pokemmo_s.ServerConst.characterSprites.indexOf(data.character) == -1) return;
	this.newAccount = false;
	this.initCharacter({ map : "pallet_hero_home_2f", x : 1, y : 3, direction : 0, charType : data.character, money : 0, playerVars : { }, respawnLocation : { mapName : "pallet_hero_home_2f", x : 1, y : 3, direction : 0}, pokemon : [new pokemmo_s.Pokemon().createWild(data.starter,5).generateSave()]});
}
pokemmo_s.Client.prototype.__class__ = pokemmo_s.Client;
pokemmo_s.GameConst = function() { }
pokemmo_s.GameConst.__name__ = ["pokemmo_s","GameConst"];
pokemmo_s.GameConst.prototype.__class__ = pokemmo_s.GameConst;
if(typeof js=='undefined') js = {}
js.NodeC = function() { }
js.NodeC.__name__ = ["js","NodeC"];
js.NodeC.prototype.__class__ = js.NodeC;
js.Node = function() { }
js.Node.__name__ = ["js","Node"];
js.Node.require = null;
js.Node.querystring = null;
js.Node.util = null;
js.Node.fs = null;
js.Node.dgram = null;
js.Node.net = null;
js.Node.os = null;
js.Node.http = null;
js.Node.https = null;
js.Node.path = null;
js.Node.url = null;
js.Node.dns = null;
js.Node.vm = null;
js.Node.process = null;
js.Node.tty = null;
js.Node.assert = null;
js.Node.crypto = null;
js.Node.tls = null;
js.Node.repl = null;
js.Node.childProcess = null;
js.Node.console = null;
js.Node.cluster = null;
js.Node.setTimeout = null;
js.Node.clearTimeout = null;
js.Node.setInterval = null;
js.Node.clearInterval = null;
js.Node.global = null;
js.Node.__filename = null;
js.Node.__dirname = null;
js.Node.module = null;
js.Node.stringify = null;
js.Node.parse = null;
js.Node.queryString = null;
js.Node.newSocket = function(options) {
	return new js.Node.net.Socket(options);
}
js.Node.prototype.__class__ = js.Node;
pokemmo_s.GameData = function() { }
pokemmo_s.GameData.__name__ = ["pokemmo_s","GameData"];
pokemmo_s.GameData.pokemonData = null;
pokemmo_s.GameData.movesData = null;
pokemmo_s.GameData.typeData = null;
pokemmo_s.GameData.adminsData = null;
pokemmo_s.GameData.experienceRequired = null;
pokemmo_s.GameData.maps = null;
pokemmo_s.GameData.mapsInstaces = null;
pokemmo_s.GameData.init = function() {
	var sStart;
	sStart = Date.now().getTime();
	pokemmo_s.GameData.pokemonData = pokemmo_s.Utils.recursiveFreeze(js.Node.parse(new EReg("//[^\n\r]*","gm").replace(js.Node.fs.readFileSync("data/pokemon.json","utf8"),"")));
	console.log("Loaded pokemon in " + (Date.now().getTime() - sStart) + " ms");
	pokemmo_s.GameData.movesData = pokemmo_s.Utils.recursiveFreeze(js.Node.parse(new EReg("//[^\n\r]*","gm").replace(js.Node.fs.readFileSync("data/moves.json","utf8"),"")));
	pokemmo_s.GameData.typeData = pokemmo_s.Utils.recursiveFreeze(js.Node.parse(js.Node.fs.readFileSync("data/types.json","utf8")));
	pokemmo_s.GameData.adminsData = pokemmo_s.Utils.recursiveFreeze(js.Node.parse(js.Node.fs.readFileSync("data/admins.json","utf8")));
	pokemmo_s.GameData.experienceRequired = pokemmo_s.Utils.recursiveFreeze(js.Node.parse(js.Node.fs.readFileSync("data/experienceRequired.json","utf8")).experienceRequired);
	pokemmo_s.GameData.maps = { };
	pokemmo_s.GameData.mapsInstaces = [];
	var _g = 0, _g1 = pokemmo_s.GameConst.LOAD_MAPS;
	while(_g < _g1.length) {
		var id = _g1[_g];
		++_g;
		pokemmo_s.GameData.maps[id] = new pokemmo_s.Map(id);
	}
}
pokemmo_s.GameData.getAdminLevel = function(username) {
	return pokemmo_s.GameData.adminsData[username] == null?0:pokemmo_s.GameData.adminsData[username].level;
}
pokemmo_s.GameData.getPokemonData = function(id) {
	return pokemmo_s.GameData.pokemonData[id];
}
pokemmo_s.GameData.getMoveData = function(move) {
	return pokemmo_s.GameData.movesData[move];
}
pokemmo_s.GameData.getExperienceRequired = function(curve,level) {
	return pokemmo_s.GameData.experienceRequired[level][pokemmo_s.GameData.curveIdToInt(curve)];
}
pokemmo_s.GameData.curveIdToInt = function(curve) {
	switch(curve) {
	case "erratic":
		return 0;
	case "fast":
		return 1;
	case "mediumFast":
		return 2;
	case "mediumSlow":
		return 3;
	case "slow":
		return 4;
	case "fluctuating":
		return 5;
	}
	throw "Invalid curve id: " + curve;
}
pokemmo_s.GameData.getMap = function(id) {
	return pokemmo_s.GameData.maps[id];
}
pokemmo_s.GameData.getTypeEffectiveness = function(type,other) {
	if(type == null || other == null) return 1.0;
	if(pokemmo_s.GameData.typeData[type][other] == null) return 1.0;
	return pokemmo_s.GameData.typeData[type][other];
}
pokemmo_s.GameData.prototype.__class__ = pokemmo_s.GameData;
StringTools = function() { }
StringTools.__name__ = ["StringTools"];
StringTools.urlEncode = function(s) {
	return encodeURIComponent(s);
}
StringTools.urlDecode = function(s) {
	return decodeURIComponent(s.split("+").join(" "));
}
StringTools.htmlEscape = function(s) {
	return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
}
StringTools.htmlUnescape = function(s) {
	return s.split("&gt;").join(">").split("&lt;").join("<").split("&amp;").join("&");
}
StringTools.startsWith = function(s,start) {
	return s.length >= start.length && s.substr(0,start.length) == start;
}
StringTools.endsWith = function(s,end) {
	var elen = end.length;
	var slen = s.length;
	return slen >= elen && s.substr(slen - elen,elen) == end;
}
StringTools.isSpace = function(s,pos) {
	var c = s.charCodeAt(pos);
	return c >= 9 && c <= 13 || c == 32;
}
StringTools.ltrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,r)) r++;
	if(r > 0) return s.substr(r,l - r); else return s;
}
StringTools.rtrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,l - r - 1)) r++;
	if(r > 0) return s.substr(0,l - r); else return s;
}
StringTools.trim = function(s) {
	return StringTools.ltrim(StringTools.rtrim(s));
}
StringTools.rpad = function(s,c,l) {
	var sl = s.length;
	var cl = c.length;
	while(sl < l) if(l - sl < cl) {
		s += c.substr(0,l - sl);
		sl = l;
	} else {
		s += c;
		sl += cl;
	}
	return s;
}
StringTools.lpad = function(s,c,l) {
	var ns = "";
	var sl = s.length;
	if(sl >= l) return s;
	var cl = c.length;
	while(sl < l) if(l - sl < cl) {
		ns += c.substr(0,l - sl);
		sl = l;
	} else {
		ns += c;
		sl += cl;
	}
	return ns + s;
}
StringTools.replace = function(s,sub,by) {
	return s.split(sub).join(by);
}
StringTools.hex = function(n,digits) {
	var s = "";
	var hexChars = "0123456789ABCDEF";
	do {
		s = hexChars.charAt(n & 15) + s;
		n >>>= 4;
	} while(n > 0);
	if(digits != null) while(s.length < digits) s = "0" + s;
	return s;
}
StringTools.fastCodeAt = function(s,index) {
	return s.cca(index);
}
StringTools.isEOF = function(c) {
	return c != c;
}
StringTools.prototype.__class__ = StringTools;
Reflect = function() { }
Reflect.__name__ = ["Reflect"];
Reflect.hasField = function(o,field) {
	if(o.hasOwnProperty != null) return o.hasOwnProperty(field);
	var arr = Reflect.fields(o);
	var $it0 = arr.iterator();
	while( $it0.hasNext() ) {
		var t = $it0.next();
		if(t == field) return true;
	}
	return false;
}
Reflect.field = function(o,field) {
	var v = null;
	try {
		v = o[field];
	} catch( e ) {
	}
	return v;
}
Reflect.setField = function(o,field,value) {
	o[field] = value;
}
Reflect.callMethod = function(o,func,args) {
	return func.apply(o,args);
}
Reflect.fields = function(o) {
	if(o == null) return new Array();
	var a = new Array();
	if(o.hasOwnProperty) {
		for(var i in o) if( o.hasOwnProperty(i) ) a.push(i);
	} else {
		var t;
		try {
			t = o.__proto__;
		} catch( e ) {
			t = null;
		}
		if(t != null) o.__proto__ = null;
		for(var i in o) if( i != "__proto__" ) a.push(i);
		if(t != null) o.__proto__ = t;
	}
	return a;
}
Reflect.isFunction = function(f) {
	return typeof(f) == "function" && f.__name__ == null;
}
Reflect.compare = function(a,b) {
	return a == b?0:a > b?1:-1;
}
Reflect.compareMethods = function(f1,f2) {
	if(f1 == f2) return true;
	if(!Reflect.isFunction(f1) || !Reflect.isFunction(f2)) return false;
	return f1.scope == f2.scope && f1.method == f2.method && f1.method != null;
}
Reflect.isObject = function(v) {
	if(v == null) return false;
	var t = typeof(v);
	return t == "string" || t == "object" && !v.__enum__ || t == "function" && v.__name__ != null;
}
Reflect.deleteField = function(o,f) {
	if(!Reflect.hasField(o,f)) return false;
	delete(o[f]);
	return true;
}
Reflect.copy = function(o) {
	var o2 = { };
	var _g = 0, _g1 = Reflect.fields(o);
	while(_g < _g1.length) {
		var f = _g1[_g];
		++_g;
		o2[f] = Reflect.field(o,f);
	}
	return o2;
}
Reflect.makeVarArgs = function(f) {
	return function() {
		var a = new Array();
		var _g1 = 0, _g = arguments.length;
		while(_g1 < _g) {
			var i = _g1++;
			a.push(arguments[i]);
		}
		return f(a);
	};
}
Reflect.prototype.__class__ = Reflect;
pokemmo_s.Pokemon = function(p) {
	if( p === $_ ) return;
	this.resetBattleStats();
}
pokemmo_s.Pokemon.__name__ = ["pokemmo_s","Pokemon"];
pokemmo_s.Pokemon.prototype.id = null;
pokemmo_s.Pokemon.prototype.level = null;
pokemmo_s.Pokemon.prototype.unique = null;
pokemmo_s.Pokemon.prototype.nickname = null;
pokemmo_s.Pokemon.prototype.gender = null;
pokemmo_s.Pokemon.prototype.shiny = null;
pokemmo_s.Pokemon.prototype.hp = null;
pokemmo_s.Pokemon.prototype.maxHp = null;
pokemmo_s.Pokemon.prototype.atk = null;
pokemmo_s.Pokemon.prototype.def = null;
pokemmo_s.Pokemon.prototype.spAtk = null;
pokemmo_s.Pokemon.prototype.spDef = null;
pokemmo_s.Pokemon.prototype.speed = null;
pokemmo_s.Pokemon.prototype.ability = null;
pokemmo_s.Pokemon.prototype.nature = null;
pokemmo_s.Pokemon.prototype.experience = null;
pokemmo_s.Pokemon.prototype.experienceNeeded = null;
pokemmo_s.Pokemon.prototype.ivHp = null;
pokemmo_s.Pokemon.prototype.ivMaxHp = null;
pokemmo_s.Pokemon.prototype.ivAtk = null;
pokemmo_s.Pokemon.prototype.ivDef = null;
pokemmo_s.Pokemon.prototype.ivSpAtk = null;
pokemmo_s.Pokemon.prototype.ivSpDef = null;
pokemmo_s.Pokemon.prototype.ivSpeed = null;
pokemmo_s.Pokemon.prototype.evHp = null;
pokemmo_s.Pokemon.prototype.evMaxHp = null;
pokemmo_s.Pokemon.prototype.evAtk = null;
pokemmo_s.Pokemon.prototype.evDef = null;
pokemmo_s.Pokemon.prototype.evSpAtk = null;
pokemmo_s.Pokemon.prototype.evSpDef = null;
pokemmo_s.Pokemon.prototype.evSpeed = null;
pokemmo_s.Pokemon.prototype.status = null;
pokemmo_s.Pokemon.prototype.virus = null;
pokemmo_s.Pokemon.prototype.moves = null;
pokemmo_s.Pokemon.prototype.movesPP = null;
pokemmo_s.Pokemon.prototype.movesMaxPP = null;
pokemmo_s.Pokemon.prototype.battleStats = null;
pokemmo_s.Pokemon.prototype.resetBattleStats = function() {
	this.battleStats = { learnableMoves : [], atkPower : 0, defPower : 0, spAtkPower : 0, spDefPower : 0, speedPower : 0, accuracy : 0, evasion : 0};
}
pokemmo_s.Pokemon.prototype.loadFromSave = function(sav) {
	var _g = 0, _g1 = pokemmo_s.Pokemon.pokemonSaveFields;
	while(_g < _g1.length) {
		var field = _g1[_g];
		++_g;
		this[field] = sav[field];
	}
	this.calculateStats();
	return this;
}
pokemmo_s.Pokemon.prototype.createWild = function(id_,level_) {
	this.id = id_;
	this.level = level_;
	this.unique = pokemmo_s.Utils.createRandomString(16);
	if(pokemmo_s.GameData.pokemonData[this.id].genderRatio != -1) this.gender = Math.random() < pokemmo_s.GameData.pokemonData[this.id].genderRatio?1:2; else this.gender = 0;
	this.nature = 1 + Math.floor(25 * Math.random());
	if(pokemmo_s.GameData.pokemonData[this.id].ability2 != null) this.ability = 1 + Math.floor(2 * Math.random()); else if(pokemmo_s.GameData.pokemonData[this.id].ability1 != null) this.ability = 1; else this.ability = 0;
	this.experience = 0;
	this.hp = this.atk = this.def = this.spAtk = this.spDef = this.speed = 0;
	this.evHp = this.evAtk = this.evDef = this.evSpAtk = this.evSpDef = this.evSpeed = 0;
	this.ivHp = Math.floor(32 * Math.random());
	this.ivAtk = Math.floor(32 * Math.random());
	this.ivDef = Math.floor(32 * Math.random());
	this.ivSpAtk = Math.floor(32 * Math.random());
	this.ivSpDef = Math.floor(32 * Math.random());
	this.ivSpeed = Math.floor(32 * Math.random());
	this.status = 0;
	this.virus = 0;
	this.shiny = 1 / 8192 > Math.random();
	this.moves = [null,null,null,null];
	this.movesPP = [0,0,0,0];
	this.movesMaxPP = [0,0,0,0];
	var j = 0;
	var _g = 0, _g1 = pokemmo_s.GameData.pokemonData[this.id].learnset;
	while(_g < _g1.length) {
		var i = _g1[_g];
		++_g;
		if(pokemmo_s.GameData.movesData[i.move] == null) {
			console.warn("Move \"" + i.move + "\" doesn't exist for \"" + pokemmo_s.GameData.pokemonData[this.id].name + "\"");
			continue;
		}
		if(i.level > this.level) continue;
		this.learnMove(j,i.move);
		j = (j + 1) % 4;
	}
	this.calculateStats();
	this.hp = this.maxHp;
	if(this.moves[0] == null) this.learnMove(0,"tackle");
	return this;
}
pokemmo_s.Pokemon.prototype.generateSave = function() {
	var sav = { };
	var _g = 0, _g1 = pokemmo_s.Pokemon.pokemonSaveFields;
	while(_g < _g1.length) {
		var field = _g1[_g];
		++_g;
		sav[field] = this[field];
	}
	return sav;
}
pokemmo_s.Pokemon.prototype.calculateCatch = function(ballType,ballValue) {
	var chance = (3 * this.maxHp - 2 * this.hp) * pokemmo_s.GameData.pokemonData[this.id].catchRate;
	switch(ballType) {
	case 0:
		chance *= ballValue;
		break;
	case 1:
		chance += ballValue;
		break;
	}
	chance /= 3 * this.maxHp;
	switch(this.status) {
	case 1:case 2:
		chance *= 2;
		break;
	case 3:case 4:case 5:
		chance *= 1.5;
		break;
	}
	return chance;
}
pokemmo_s.Pokemon.prototype.getAbility = function() {
	return this.ability == 0?"":pokemmo_s.GameData.pokemonData[this.id]["ability" + this.ability];
}
pokemmo_s.Pokemon.prototype.learnMove = function(slot,move) {
	if(slot < 0 || slot >= 4) return;
	this.moves[slot] = move;
	this.movesMaxPP[slot] = this.movesPP[slot] = pokemmo_s.GameData.movesData[move].pp;
}
pokemmo_s.Pokemon.prototype.calculateStats = function() {
	var me = this;
	var calculateSingleStat = function(base,iv,ev) {
		return (iv + 2 * base + ev / 4) * me.level / 100 + 5;
	};
	this.maxHp = Math.floor((this.ivHp + 2 * pokemmo_s.GameData.pokemonData[this.id].baseStats.hp + this.evHp / 4 + 100) * this.level / 100 + 10);
	var tatk = calculateSingleStat(pokemmo_s.GameData.pokemonData[this.id].baseStats.atk,this.ivAtk,this.evAtk);
	var tdef = calculateSingleStat(pokemmo_s.GameData.pokemonData[this.id].baseStats.def,this.ivDef,this.evDef);
	var tspAtk = calculateSingleStat(pokemmo_s.GameData.pokemonData[this.id].baseStats.spAtk,this.ivSpAtk,this.evSpAtk);
	var tspDef = calculateSingleStat(pokemmo_s.GameData.pokemonData[this.id].baseStats.spDef,this.ivSpDef,this.evSpDef);
	var tspeed = calculateSingleStat(pokemmo_s.GameData.pokemonData[this.id].baseStats.speed,this.ivSpeed,this.evSpeed);
	switch(this.nature) {
	case 1:
		tatk *= 1.1;
		tdef *= 0.9;
		break;
	case 2:
		tatk *= 1.1;
		tspAtk *= 0.9;
		break;
	case 3:
		tatk *= 1.1;
		tspDef *= 0.9;
		break;
	case 4:
		tatk *= 1.1;
		tspeed *= 0.9;
		break;
	case 5:
		tdef *= 1.1;
		tatk *= 0.9;
		break;
	case 6:
		tdef *= 1.1;
		tspAtk *= 0.9;
		break;
	case 7:
		tdef *= 1.1;
		tspDef *= 0.9;
		break;
	case 8:
		tdef *= 1.1;
		tspeed *= 0.9;
		break;
	case 9:
		tspAtk *= 1.1;
		tatk *= 0.9;
		break;
	case 10:
		tspAtk *= 1.1;
		tdef *= 0.9;
		break;
	case 11:
		tspAtk *= 1.1;
		tspDef *= 0.9;
		break;
	case 12:
		tspAtk *= 1.1;
		tspeed *= 0.9;
		break;
	case 13:
		tspDef *= 1.1;
		tatk *= 0.9;
		break;
	case 14:
		tspDef *= 1.1;
		tdef *= 0.9;
		break;
	case 15:
		tspDef *= 1.1;
		tspAtk *= 0.9;
		break;
	case 16:
		tspDef *= 1.1;
		tspeed *= 0.9;
		break;
	case 17:
		tspeed *= 1.1;
		tatk *= 0.9;
		break;
	case 18:
		tspeed *= 1.1;
		tdef *= 0.9;
		break;
	case 19:
		tspeed *= 1.1;
		tspAtk *= 0.9;
		break;
	case 20:
		tspeed *= 1.1;
		tspDef *= 0.9;
		break;
	}
	this.atk = Math.floor(tatk);
	this.def = Math.floor(tdef);
	this.spAtk = Math.floor(tspAtk);
	this.spDef = Math.floor(tspDef);
	this.speed = Math.floor(tspeed);
	if(this.level >= 100) this.experienceNeeded = 0; else this.experienceNeeded = pokemmo_s.GameData.experienceRequired[this.level][pokemmo_s.GameData.curveIdToInt(pokemmo_s.GameData.pokemonData[this.id].experienceCurve)];
}
pokemmo_s.Pokemon.prototype.restore = function() {
	this.hp = this.maxHp;
	var _g = 0;
	while(_g < 4) {
		var i = _g++;
		this.movesPP[i] = this.movesMaxPP[i];
	}
}
pokemmo_s.Pokemon.prototype.getUsableMoves = function() {
	var arr = [];
	var _g = 0;
	while(_g < 4) {
		var i = _g++;
		if(this.moves[i] == null) continue;
		if(this.movesPP[i] <= 0) continue;
		arr.push(this.moves[i]);
	}
	return arr;
}
pokemmo_s.Pokemon.prototype.generateNetworkObject = function(isOwner) {
	if(isOwner) return { id : this.id, level : this.level, hp : this.hp, maxHp : this.maxHp, unique : this.unique, shiny : this.shiny, gender : this.gender, nickname : this.nickname, status : this.status, experience : this.experience, experienceNeeded : this.experienceNeeded, atk : this.atk, def : this.def, spAtk : this.spAtk, spDef : this.spDef, speed : this.speed, ability : this.ability, nature : this.nature, moves : this.moves, movesPP : this.movesPP, movesMaxPP : this.movesMaxPP, training : Math.floor((this.evHp + this.evAtk + this.evDef + this.evSpAtk + this.evSpDef + this.evSpeed) / 510 * 100) / 100, virus : this.virus}; else return { id : this.id, level : this.level, hp : this.hp, maxHp : this.maxHp, unique : this.unique, shiny : this.shiny, gender : this.gender, nickname : this.nickname, status : this.status};
}
pokemmo_s.Pokemon.prototype.calculateExpGain = function(isTrainer) {
	return Math.ceil((isTrainer?1.5:1) * pokemmo_s.GameData.pokemonData[this.id].baseExp * this.level / 7);
}
pokemmo_s.Pokemon.prototype.buffBattleStat = function(stat,value) {
	switch(stat) {
	case "atk":
		this.battleStats.atkPower = pokemmo_s.Utils.clamp(this.battleStats.atkPower + value,-6,6);
		break;
	case "def":
		this.battleStats.defPower = pokemmo_s.Utils.clamp(this.battleStats.defPower + value,-6,6);
		break;
	case "spAtk":
		this.battleStats.spAtkPower = pokemmo_s.Utils.clamp(this.battleStats.spAtkPower + value,-6,6);
		break;
	case "spDef":
		this.battleStats.spDefPower = pokemmo_s.Utils.clamp(this.battleStats.spDefPower + value,-6,6);
		break;
	case "speed":
		this.battleStats.speedPower = pokemmo_s.Utils.clamp(this.battleStats.speedPower + value,-6,6);
		break;
	case "accuracy":
		this.battleStats.accuracy = pokemmo_s.Utils.clamp(this.battleStats.accuracy + value,-6,6);
		break;
	case "evasion":
		this.battleStats.evasion = pokemmo_s.Utils.clamp(this.battleStats.evasion + value,-6,6);
		break;
	}
}
pokemmo_s.Pokemon.prototype.addEV = function(data) {
	var total = this.evHp + this.evAtk + this.evDef + this.evSpAtk + this.evSpDef + this.evSpeed;
	var tmp;
	if(total >= 510) return;
	var _g = 0, _g1 = [["hp","evHp"],["atk","evAtk"],["def","evDef"],["spAtk","evSpAtk"],["spDef","evSpDef"],["speed","evSpeed"]];
	while(_g < _g1.length) {
		var i = _g1[_g];
		++_g;
		if(data[i[0]] != null && data[i[0]] > 0) {
			tmp = data[i[0]];
			if(total + tmp > 510) tmp = 510 - total;
			this[data[i[1]]] += data[i[0]];
			total += tmp;
			if(total >= 510) return;
		}
	}
}
pokemmo_s.Pokemon.prototype.levelUp = function() {
	var oldMaxHp = this.maxHp;
	this.level += 1;
	this.calculateStats();
	if(this.hp > 0) this.hp += this.maxHp - oldMaxHp;
	var data = pokemmo_s.GameData.pokemonData[this.id];
	if(data.evolveLevel != null && this.level >= data.evolveLevel) {
		this.id = data.evolveTo;
		data = pokemmo_s.GameData.pokemonData[this.id];
	}
	var learnset = data.learnset;
	var movesLearned = [];
	var _g = 0;
	while(_g < learnset.length) {
		var m = learnset[_g];
		++_g;
		if(pokemmo_s.GameData.movesData[m.move] == null) {
			console.warn("Move \"" + m.move + "\" doesn't exist for " + pokemmo_s.GameData.pokemonData[this.id].name);
			continue;
		}
		if(m.level == -1 && this.moves.indexOf(m.move) == -1) {
		} else if(m.level != this.level) continue;
		var learnedMove = false;
		var _g1 = 0;
		while(_g1 < 4) {
			var i = _g1++;
			if(this.moves[i] == null) {
				this.learnMove(i,m.move);
				movesLearned.push(m.move);
				learnedMove = true;
				break;
			}
		}
		if(!learnedMove) this.battleStats.learnableMoves.push(m.move);
	}
	return { movesLearned : movesLearned};
}
pokemmo_s.Pokemon.prototype.__class__ = pokemmo_s.Pokemon;
if(typeof haxe=='undefined') haxe = {}
if(!haxe.macro) haxe.macro = {}
haxe.macro.Type = { __ename__ : ["haxe","macro","Type"], __constructs__ : ["TMono","TEnum","TInst","TType","TFun","TAnonymous","TDynamic"] }
haxe.macro.Type.TMono = function(t) { var $x = ["TMono",0,t]; $x.__enum__ = haxe.macro.Type; $x.toString = $estr; return $x; }
haxe.macro.Type.TEnum = function(t,params) { var $x = ["TEnum",1,t,params]; $x.__enum__ = haxe.macro.Type; $x.toString = $estr; return $x; }
haxe.macro.Type.TInst = function(t,params) { var $x = ["TInst",2,t,params]; $x.__enum__ = haxe.macro.Type; $x.toString = $estr; return $x; }
haxe.macro.Type.TType = function(t,params) { var $x = ["TType",3,t,params]; $x.__enum__ = haxe.macro.Type; $x.toString = $estr; return $x; }
haxe.macro.Type.TFun = function(args,ret) { var $x = ["TFun",4,args,ret]; $x.__enum__ = haxe.macro.Type; $x.toString = $estr; return $x; }
haxe.macro.Type.TAnonymous = function(a) { var $x = ["TAnonymous",5,a]; $x.__enum__ = haxe.macro.Type; $x.toString = $estr; return $x; }
haxe.macro.Type.TDynamic = function(t) { var $x = ["TDynamic",6,t]; $x.__enum__ = haxe.macro.Type; $x.toString = $estr; return $x; }
haxe.macro.FieldKind = { __ename__ : ["haxe","macro","FieldKind"], __constructs__ : ["FVar","FMethod"] }
haxe.macro.FieldKind.FVar = function(read,write) { var $x = ["FVar",0,read,write]; $x.__enum__ = haxe.macro.FieldKind; $x.toString = $estr; return $x; }
haxe.macro.FieldKind.FMethod = function(k) { var $x = ["FMethod",1,k]; $x.__enum__ = haxe.macro.FieldKind; $x.toString = $estr; return $x; }
haxe.macro.VarAccess = { __ename__ : ["haxe","macro","VarAccess"], __constructs__ : ["AccNormal","AccNo","AccNever","AccResolve","AccCall","AccInline","AccRequire"] }
haxe.macro.VarAccess.AccNormal = ["AccNormal",0];
haxe.macro.VarAccess.AccNormal.toString = $estr;
haxe.macro.VarAccess.AccNormal.__enum__ = haxe.macro.VarAccess;
haxe.macro.VarAccess.AccNo = ["AccNo",1];
haxe.macro.VarAccess.AccNo.toString = $estr;
haxe.macro.VarAccess.AccNo.__enum__ = haxe.macro.VarAccess;
haxe.macro.VarAccess.AccNever = ["AccNever",2];
haxe.macro.VarAccess.AccNever.toString = $estr;
haxe.macro.VarAccess.AccNever.__enum__ = haxe.macro.VarAccess;
haxe.macro.VarAccess.AccResolve = ["AccResolve",3];
haxe.macro.VarAccess.AccResolve.toString = $estr;
haxe.macro.VarAccess.AccResolve.__enum__ = haxe.macro.VarAccess;
haxe.macro.VarAccess.AccCall = function(m) { var $x = ["AccCall",4,m]; $x.__enum__ = haxe.macro.VarAccess; $x.toString = $estr; return $x; }
haxe.macro.VarAccess.AccInline = ["AccInline",5];
haxe.macro.VarAccess.AccInline.toString = $estr;
haxe.macro.VarAccess.AccInline.__enum__ = haxe.macro.VarAccess;
haxe.macro.VarAccess.AccRequire = function(r) { var $x = ["AccRequire",6,r]; $x.__enum__ = haxe.macro.VarAccess; $x.toString = $estr; return $x; }
haxe.macro.MethodKind = { __ename__ : ["haxe","macro","MethodKind"], __constructs__ : ["MethNormal","MethInline","MethDynamic","MethMacro"] }
haxe.macro.MethodKind.MethNormal = ["MethNormal",0];
haxe.macro.MethodKind.MethNormal.toString = $estr;
haxe.macro.MethodKind.MethNormal.__enum__ = haxe.macro.MethodKind;
haxe.macro.MethodKind.MethInline = ["MethInline",1];
haxe.macro.MethodKind.MethInline.toString = $estr;
haxe.macro.MethodKind.MethInline.__enum__ = haxe.macro.MethodKind;
haxe.macro.MethodKind.MethDynamic = ["MethDynamic",2];
haxe.macro.MethodKind.MethDynamic.toString = $estr;
haxe.macro.MethodKind.MethDynamic.__enum__ = haxe.macro.MethodKind;
haxe.macro.MethodKind.MethMacro = ["MethMacro",3];
haxe.macro.MethodKind.MethMacro.toString = $estr;
haxe.macro.MethodKind.MethMacro.__enum__ = haxe.macro.MethodKind;
pokemmo_s.Utils = function() { }
pokemmo_s.Utils.__name__ = ["pokemmo_s","Utils"];
pokemmo_s.Utils.createRandomString = function(len) {
	var i = len;
	var str = "";
	while(i-- > 0) str += pokemmo_s.exts.StringExt.getRandomChar("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
	return str;
}
pokemmo_s.Utils.randInt = function(min,max) {
	return min + Math.floor((max - min + 1) * Math.random());
}
pokemmo_s.Utils.recursiveFreeze = function(obj) {
	var rec = pokemmo_s.Utils.recursiveFreeze;
	for(var i in obj)if(typeof obj[i] == 'object')rec(obj[i]);Object.freeze(obj);;
	return obj;
}
pokemmo_s.Utils.sha512 = function(pass,salt) {
	var hasher = js.Node.crypto.createHash("sha512");
	if(salt == null) hasher.update(pass,"ascii"); else hasher.update(pass + "#" + salt,"ascii");
	return hasher.digest("base64");
}
pokemmo_s.Utils.clamp = function(n,min,max) {
	return n < min?min:n > max?max:n;
}
pokemmo_s.Utils.prototype.__class__ = pokemmo_s.Utils;
pokemmo_s.Main = function() { }
pokemmo_s.Main.__name__ = ["pokemmo_s","Main"];
pokemmo_s.Main.main = function() {
	pokemmo_s.GameData.init();
	pokemmo_s.MasterConnector.connect(pokemmo_s.GameServer.start);
}
pokemmo_s.Main.log = function(obj) {
	console.log(obj);
}
pokemmo_s.Main.warn = function(obj) {
	console.warn(obj);
}
pokemmo_s.Main.error = function(obj) {
	console.error(obj);
}
pokemmo_s.Main.prototype.__class__ = pokemmo_s.Main;
pokemmo_s.Battle = function(p) {
	if( p === $_ ) return;
	this.players = [];
	this.runAttempts = 0;
	this.results = [];
	this.ended = false;
	this.actionQueue = [];
	this.isTrainerBattle = true;
}
pokemmo_s.Battle.__name__ = ["pokemmo_s","Battle"];
pokemmo_s.Battle.prototype.players = null;
pokemmo_s.Battle.prototype.curPlayerTurn = null;
pokemmo_s.Battle.prototype.actionQueue = null;
pokemmo_s.Battle.prototype.runAttempts = null;
pokemmo_s.Battle.prototype.winnerTeam = null;
pokemmo_s.Battle.prototype.ended = null;
pokemmo_s.Battle.prototype.isTrainerBattle = null;
pokemmo_s.Battle.prototype.results = null;
pokemmo_s.Battle.prototype.init = function() {
	var me = this;
	var _g = 0, _g1 = this.players;
	while(_g < _g1.length) {
		var p = [_g1[_g]];
		++_g;
		p[0].team = p[0].id < Math.floor(this.players.length / 2)?0:1;
		if(p[0].client == null) continue;
		p[0].client.socket.emit("battleInit",{ type : pokemmo_s.Battle.BATTLE_WILD, x : p[0].client.character.x, y : p[0].client.character.y, id : p[0].id, team : p[0].team, info : { players : Lambda.array(Lambda.map(this.players,(function(p) {
			return function(otherPlayer) {
				return { pokemon : otherPlayer.pokemon.generateNetworkObject(otherPlayer == p[0])};
			};
		})(p)))}});
		p[0].client.socket.on("battleAction",p[0].fOnBattleAction = (function(p) {
			return function(data) {
				me.onBattleAction(p[0],data);
			};
		})(p));
		p[0].client.socket.on("battleLearnMove",p[0].fOnBattleLearnMove = (function(p) {
			return function(data) {
				me.onBattleLearnMove(p[0],data);
			};
		})(p));
	}
	this.initTurn();
}
pokemmo_s.Battle.prototype.destroy = function() {
	this.ended = true;
	var _g = 0, _g1 = this.players;
	while(_g < _g1.length) {
		var p = _g1[_g];
		++_g;
		if(p.client == null) continue;
		p.client.socket.removeListener("battleAction",p.fOnBattleAction);
		p.client.socket.removeListener("battleLearnMove",p.fOnBattleLearnMove);
	}
}
pokemmo_s.Battle.prototype.win = function(team,transmit) {
	if(transmit == null) transmit = true;
	this.winnerTeam = team;
	this.ended = true;
	if(transmit) {
		this.pushResult(new pokemmo_s.BattleActionResult(null,"win",this.winnerTeam));
		var _g = 0, _g1 = this.players;
		while(_g < _g1.length) {
			var p = _g1[_g];
			++_g;
			this.finishBattleFor(p);
		}
	}
}
pokemmo_s.Battle.prototype.pushResult = function(res) {
	if(res == null) return;
	if(Std["is"](res,Array)) {
		var _g = 0, _g1 = (function($this) {
			var $r;
			var $t = res;
			if(Std["is"]($t,Array)) $t; else throw "Class cast error";
			$r = $t;
			return $r;
		}(this));
		while(_g < _g1.length) {
			var e = _g1[_g];
			++_g;
			this.pushResult(e);
		}
		return;
	}
	this.results.push(res);
}
pokemmo_s.Battle.prototype.flushResults = function() {
	if(this.results.length == 0) return;
	var _g = 0, _g1 = this.players;
	while(_g < _g1.length) {
		var p = _g1[_g];
		++_g;
		if(p.client == null) continue;
		var res = [];
		var _g2 = 0, _g3 = this.results;
		while(_g2 < _g3.length) {
			var r = _g3[_g2];
			++_g2;
			var obj = r.generateNetworkObject(p);
			if(obj != null) res.push(obj);
		}
		p.client.socket.emit("battleTurn",{ results : res});
	}
	this.results.length = 0;
}
pokemmo_s.Battle.prototype.initTurn = function() {
	if(this.ended) return;
	if(this.actionQueue.length > 0) {
		this.runQueue();
		this.flushResults();
	}
	var _g = 0, _g1 = this.players;
	while(_g < _g1.length) {
		var p = _g1[_g];
		++_g;
		if(p.client != null) p.pendingAction = true; else {
			p.pendingAction = false;
			this.calculateAIAction(p);
		}
	}
}
pokemmo_s.Battle.prototype.isTurnReady = function() {
	if(this.ended) return false;
	var _g = 0, _g1 = this.players;
	while(_g < _g1.length) {
		var p = _g1[_g];
		++_g;
		if(p.pendingAction) return false;
	}
	return true;
}
pokemmo_s.Battle.prototype.calculateAIAction = function(player) {
	var moves = player.pokemon.getUsableMoves();
	if(moves.length == 0) player.action = pokemmo_s.BattleAction.TStruggle; else player.action = pokemmo_s.BattleAction.TMove(pokemmo_s.exts.ArrayExt.random(moves),[this.players[Math.floor((player.team == 0?1:0) * Math.floor(this.players.length / 2) + Math.floor(this.players.length / 2) * Math.random())]]);
}
pokemmo_s.Battle.prototype.onBattleAction = function(player,data) {
	if(!player.pendingAction) return;
	if(player.pokemon == null || player.pokemon.hp <= 0) {
		if(data.type != "switchPokemon") return;
		return;
	}
	if(player.pokemon == null) return;
	switch(data.type) {
	case "move":
		if(!Std["is"](data.move,Int)) return;
		var move = Math.floor(Math.abs(data.move) % 4);
		if(player.pokemon.movesPP[move] > 0) player.action = pokemmo_s.BattleAction.TMove(player.pokemon.moves[move],[this.players[Math.floor((player.team == 0?1:0) * Math.floor(this.players.length / 2) + Math.floor(this.players.length / 2) * Math.random())]]); else player.action = pokemmo_s.BattleAction.TStruggle;
		break;
	case "run":
		player.action = pokemmo_s.BattleAction.TRun;
		break;
	default:
		return;
	}
	player.pendingAction = false;
	this.processTurn();
}
pokemmo_s.Battle.prototype.onBattleLearnMove = function(player,data) {
	if(player.pokemon == null) return;
	if(!Std["is"](data.slot,Int)) return;
	if(!Std["is"](data.move,String)) return;
	var move = data.move;
	var slot = data.slot;
	if(slot < 0 || slot >= 4) return;
	if(!Lambda.has(player.pokemon.battleStats.learnableMoves,move)) return;
	player.pokemon.battleStats.learnableMoves.remove(move);
	player.pokemon.learnMove(slot,move);
}
pokemmo_s.Battle.prototype.playerSurrendered = function(player) {
	this.win(player.team == 0?1:0,true);
}
pokemmo_s.Battle.prototype.finishBattleFor = function(player) {
	var me = this;
	if(player.client == null) return;
	var client = player.client;
	var $char = client.character;
	var socket = client.socket;
	var func = function(data) {
		$char.battle = null;
		$char.retransmit = true;
		if(player.team != me.winnerTeam) {
			$char.moveToSpawn();
			$char.restorePokemon();
		}
		socket.emit("battleFinish",{ pokemon : $char.generatePokemonNetworkObject()});
	};
	if(client.disconnected) func(); else socket.once("battleFinished",func);
}
pokemmo_s.Battle.prototype.processTurn = function() {
	if(this.actionQueue.length > 0) {
		this.runQueue();
		this.flushResults();
		this.initTurn();
	}
	if(!this.isTurnReady()) return;
	var turnOrder = this.players.copy();
	turnOrder.sort($closure(this,"sortActions"));
	var _g = 0;
	while(_g < turnOrder.length) {
		var p = turnOrder[_g];
		++_g;
		this.actionQueue.push(p);
	}
	this.runQueue();
	this.flushResults();
	this.initTurn();
}
pokemmo_s.Battle.prototype.runQueue = function() {
	if(this.ended) return;
	var p;
	while(this.actionQueue.length > 0) {
		p = this.actionQueue.shift();
		this.processPlayerTurn(p);
		this.checkFainted();
		this.checkWin();
		if(this.ended) {
			this.flushResults();
			return;
		}
	}
}
pokemmo_s.Battle.prototype.checkFainted = function() {
	var _g = 0, _g1 = this.players;
	while(_g < _g1.length) {
		var p = _g1[_g];
		++_g;
		if(p.pokemon == null) continue;
		if(p.pokemon.hp > 0) continue;
		var exp = p.pokemon.calculateExpGain(this.isTrainerBattle);
		var killers = this.getPlayersFromTeam(p.team == 0?1:0);
		exp = Math.ceil(exp / killers.length);
		this.pushResult(new pokemmo_s.BattleActionResult(p,"pokemonDefeated",exp));
		var _g2 = 0;
		while(_g2 < killers.length) {
			var killer = killers[_g2];
			++_g2;
			killer.pokemon.experience += exp;
			while(killer.pokemon.level < 100 && killer.pokemon.experience >= killer.pokemon.experienceNeeded) {
				killer.pokemon.experience -= killer.pokemon.experienceNeeded;
				var lvlup = killer.pokemon.levelUp();
				this.pushResult(new pokemmo_s.BattleActionResult(killer,"pokemonLevelup",killer.pokemon.generateNetworkObject(true),true));
				if(lvlup.movesLearned.length > 0) this.pushResult(new pokemmo_s.BattleActionResult(killer,"pokemonLearnedMove",lvlup.movesLearned));
			}
			if(killer.pokemon.battleStats.learnableMoves.length > 0) this.pushResult(new pokemmo_s.BattleActionResult(killer,"pokemonLearnMoves",killer.pokemon.battleStats.learnableMoves,true));
		}
	}
}
pokemmo_s.Battle.prototype.getPlayersFromTeam = function(t) {
	return this.players.slice(Math.floor(t * (this.players.length / 2)),Math.floor(this.players.length / 2));
}
pokemmo_s.Battle.prototype.checkWin = function() {
	if(this.ended) return;
	var deadTeams = [true,true];
	var _g = 0, _g1 = this.players;
	while(_g < _g1.length) {
		var p = _g1[_g];
		++_g;
		if(!deadTeams[p.team]) continue;
		var _g2 = 0, _g3 = p.pokemonList;
		while(_g2 < _g3.length) {
			var pok = _g3[_g2];
			++_g2;
			if(pok.hp > 0) {
				deadTeams[p.team] = false;
				break;
			}
		}
	}
	if(deadTeams[0]) {
		if(deadTeams[1]) this.win(-1); else this.win(1);
	} else if(deadTeams[1]) this.win(0); else {
	}
}
pokemmo_s.Battle.prototype.getPlayerEnemyTeam = function(p) {
	return p.team == 0?1:0;
}
pokemmo_s.Battle.prototype.getRandomPlayerFromTeam = function(t) {
	return this.players[Math.floor(t * Math.floor(this.players.length / 2) + Math.floor(this.players.length / 2) * Math.random())];
}
pokemmo_s.Battle.prototype.processPlayerTurn = function(p) {
	var $e = (p.action);
	switch( $e[1] ) {
	case 0:
		var chance = p.pokemon.speed * 32 / (this.players[1].pokemon.speed / 4) + 30 * ++this.runAttempts;
		var success = Math.floor(Math.random() * 256) < chance;
		if(success) {
			this.win(p.team,false);
			this.finishBattleFor(p);
			this.destroy();
			this.pushResult(new pokemmo_s.BattleActionResult(p,"flee"));
			this.flushResults();
		} else this.pushResult(new pokemmo_s.BattleActionResult(p,"fleeFail"));
		break;
	case 1:
		var targets = $e[3], move = $e[2];
		var _g = 0;
		while(_g < targets.length) {
			var i = targets[_g];
			++_g;
			this.processMove(p,i,move);
		}
		break;
	case 2:
		this.processMove(p,this.players[Math.floor((p.id + this.players.length / 2) % this.players.length)],"struggle");
		break;
	}
}
pokemmo_s.Battle.prototype.processMove = function(player,enemy,move) {
	var moveData = pokemmo_s.GameData.movesData[move];
	if(moveData.moveType == "buff") moveData = pokemmo_s.GameData.movesData["tackle"];
	if(moveData.accuracy != -1) {
		if(Math.random() >= moveData.accuracy * (pokemmo_s.Battle.accuracyMultipler[player.pokemon.battleStats.accuracy] / pokemmo_s.Battle.accuracyMultipler[enemy.pokemon.battleStats.evasion])) {
			this.pushResult(new pokemmo_s.BattleActionResult(player,"moveMiss",move));
			return;
		}
	}
	switch(moveData.moveType) {
	case "simple":
		var obj = this.calculateDamage(player.pokemon,enemy.pokemon,moveData);
		enemy.pokemon.hp -= obj.damage;
		if(enemy.pokemon.hp < 0) enemy.pokemon.hp = 0;
		this.pushResult(new pokemmo_s.BattleActionResult(player,"moveAttack",{ move : move, resultHp : enemy.pokemon.hp, isCritical : obj.isCritical, effec : obj.effect}));
		if(enemy.pokemon.hp > 0) {
			if(moveData.applyStatus != null) {
				if(Math.random() < (moveData.applyStatusChance == null?1.0:moveData.applyStatusChance)) {
					enemy.pokemon.status = moveData.applyStatus;
					this.pushResult(new pokemmo_s.BattleActionResult(player,"applyStatus",moveData.applyStatus));
				}
			}
			if(moveData.debuffStat != null) {
				if(Math.random() < (moveData.debuffChance == null?1.0:moveData.debuffChance)) {
					var _g = 0, _g1 = moveData.debuffStat.split(",");
					while(_g < _g1.length) {
						var s = _g1[_g];
						++_g;
						enemy.pokemon.buffBattleStat(s,-moveData.debuffAmount);
						this.pushResult(new pokemmo_s.BattleActionResult(player,"debuff",{ stat : s}));
					}
				}
			}
		}
		return;
	case "debuff":
		var _g = 0, _g1 = moveData.debuffStat.split(",");
		while(_g < _g1.length) {
			var s = _g1[_g];
			++_g;
			enemy.pokemon.buffBattleStat(s,-moveData.debuffAmount);
		}
		this.pushResult(new pokemmo_s.BattleActionResult(player,"moveDebuff",{ stat : moveData.debuffStat, move : move}));
		break;
	case "applyStatus":
		enemy.pokemon.status = moveData.applyStatus;
		this.pushResult(new pokemmo_s.BattleActionResult(player,"moveAttack",{ move : moveData.name, resultHp : enemy.pokemon.hp, isCritical : false, effec : 1}));
		this.pushResult(new pokemmo_s.BattleActionResult(player,"applyStatus",moveData.applyStatus));
		return;
	}
}
pokemmo_s.Battle.prototype.calculateDamage = function(pokemon,enemyPokemon,data) {
	var isMoveSpecial = !!data.special;
	var attackerAtk;
	var defenderDef;
	if(isMoveSpecial) {
		attackerAtk = pokemon.spAtk * pokemmo_s.Battle.powerMultipler[pokemon.battleStats.spAtkPower];
		defenderDef = enemyPokemon.spDef * pokemmo_s.Battle.powerMultipler[enemyPokemon.battleStats.spDefPower];
	} else {
		attackerAtk = pokemon.atk * pokemmo_s.Battle.powerMultipler[pokemon.battleStats.atkPower];
		defenderDef = enemyPokemon.def * pokemmo_s.Battle.powerMultipler[enemyPokemon.battleStats.defPower];
	}
	if(pokemon.status == 5) attackerAtk /= 2;
	var damage = (2 * pokemon.level + 10) / 250 * (attackerAtk / defenderDef) * data.power + 2;
	var modifier = 1.0;
	if(data.type == pokemmo_s.GameData.pokemonData[pokemon.id].type1 || data.type == pokemmo_s.GameData.pokemonData[pokemon.id].type2) modifier *= 1.5;
	var typeEffectiveness = 1.0;
	typeEffectiveness *= pokemmo_s.GameData.getTypeEffectiveness(data.type,pokemmo_s.GameData.pokemonData[enemyPokemon.id].type1);
	typeEffectiveness *= pokemmo_s.GameData.getTypeEffectiveness(data.type,pokemmo_s.GameData.pokemonData[enemyPokemon.id].type2);
	modifier *= typeEffectiveness;
	var criticalChance = [0,0.065,0.125,0.25,0.333,0.5];
	var criticalStage = 1;
	if(data.highCritical) criticalStage += 2;
	if(criticalStage > 5) criticalStage = 5;
	var isCritical = Math.random() < criticalChance[criticalStage];
	if(isCritical) modifier *= 2;
	modifier *= 1.0 - Math.random() * 0.15;
	return { damage : Math.ceil(damage * modifier), isCritical : isCritical, effect : typeEffectiveness};
}
pokemmo_s.Battle.prototype.addPlayer = function(client,pokemonList) {
	var pok = pokemonList[0];
	var _g = 0;
	while(_g < pokemonList.length) {
		var p = pokemonList[_g];
		++_g;
		if(p.hp <= 0) continue;
		pok = p;
		break;
	}
	var _g = 0;
	while(_g < pokemonList.length) {
		var p = pokemonList[_g];
		++_g;
		p.resetBattleStats();
	}
	if(client != null) {
		client.character.battle = this;
		client.character.retransmit = true;
	}
	var bp = { id : this.players.length, team : -1, client : client, pokemon : pok, pokemonList : pokemonList, pendingAction : true, action : null, fOnBattleAction : null, fOnBattleLearnMove : null};
	this.players.push(bp);
	return bp;
}
pokemmo_s.Battle.prototype.sortActions = function(a,b) {
	var ap = this.getActionPriority(a.action);
	var bp = this.getActionPriority(b.action);
	if(ap > bp) return -1; else if(bp > ap) return 1;
	if(a.pokemon.speed * pokemmo_s.Battle.powerMultipler[a.pokemon.battleStats.speedPower] >= b.pokemon.speed * pokemmo_s.Battle.powerMultipler[b.pokemon.battleStats.speedPower]) return -1; else return 1;
}
pokemmo_s.Battle.prototype.getActionPriority = function(action) {
	if(action == null) return 0;
	var $e = (action);
	switch( $e[1] ) {
	case 0:
		return 6;
	case 1:
		var target = $e[3], move = $e[2];
		var p = pokemmo_s.GameData.movesData[move].priority;
		if(p == null) return 0;
		return p;
	default:
		return 0;
	}
}
pokemmo_s.Battle.prototype.getPlayerOfClient = function(client) {
	var _g = 0, _g1 = this.players;
	while(_g < _g1.length) {
		var p = _g1[_g];
		++_g;
		if(p.client == client) return p;
	}
	return null;
}
pokemmo_s.Battle.prototype.isOpponent = function(p1,p2) {
	return true;
}
pokemmo_s.Battle.prototype.__class__ = pokemmo_s.Battle;
pokemmo_s.BattleWild = function(client,wildPokemon) {
	if( client === $_ ) return;
	pokemmo_s.Battle.call(this);
	this.isTrainerBattle = false;
	this.addPlayer(client,client.character.pokemon);
	this.addPlayer(null,[wildPokemon]);
}
pokemmo_s.BattleWild.__name__ = ["pokemmo_s","BattleWild"];
pokemmo_s.BattleWild.__super__ = pokemmo_s.Battle;
for(var k in pokemmo_s.Battle.prototype ) pokemmo_s.BattleWild.prototype[k] = pokemmo_s.Battle.prototype[k];
pokemmo_s.BattleWild.prototype.destroy = function() {
	pokemmo_s.Battle.prototype.destroy.call(this);
}
pokemmo_s.BattleWild.prototype.initTurn = function() {
	pokemmo_s.Battle.prototype.initTurn.call(this);
}
pokemmo_s.BattleWild.prototype.__class__ = pokemmo_s.BattleWild;
haxe.macro.Context = function() { }
haxe.macro.Context.__name__ = ["haxe","macro","Context"];
haxe.macro.Context.prototype.__class__ = haxe.macro.Context;
pokemmo_s.MasterConnector = function() { }
pokemmo_s.MasterConnector.__name__ = ["pokemmo_s","MasterConnector"];
pokemmo_s.MasterConnector.mongodb = null;
pokemmo_s.MasterConnector.loggedInUsers = null;
pokemmo_s.MasterConnector.savingUsers = null;
pokemmo_s.MasterConnector.dbserver = null;
pokemmo_s.MasterConnector.dbclient = null;
pokemmo_s.MasterConnector.dbaccounts = null;
pokemmo_s.MasterConnector.dbchars = null;
pokemmo_s.MasterConnector.connect = function(func) {
	pokemmo_s.MasterConnector.loggedInUsers = [];
	pokemmo_s.MasterConnector.savingUsers = [];
	pokemmo_s.MasterConnector.mongodb = js.Node.require("mongodb");
	var tmongodb = pokemmo_s.MasterConnector.mongodb;
	pokemmo_s.MasterConnector.dbserver = new tmongodb.Server('127.0.0.1', 27017, { } );
	var tdbserver = pokemmo_s.MasterConnector.dbserver;
	new tmongodb.Db('pokemmo', tdbserver, {}).open(function(error,client) {
		if(error) throw error;
		var tdbclient = pokemmo_s.MasterConnector.dbclient = client;
		pokemmo_s.MasterConnector.dbclient.createCollection("accounts",function() {
			pokemmo_s.MasterConnector.dbaccounts = new tmongodb.Collection(tdbclient, 'accounts');
			pokemmo_s.MasterConnector.dbaccounts.ensureIndex({ username : 1},{ unique : true},function() {
			});
			pokemmo_s.MasterConnector.dbaccounts.ensureIndex({ lcusername : 1},{ unique : true},function() {
			});
			pokemmo_s.MasterConnector.dbclient.createCollection("characters",function() {
				pokemmo_s.MasterConnector.dbchars = new tmongodb.Collection(tdbclient, 'characters');
				pokemmo_s.MasterConnector.dbchars.ensureIndex({ username : 1},{ unique : true},function() {
				});
				func();
			});
		});
	},{ strict : true});
}
pokemmo_s.MasterConnector.isUser = function(username,func) {
	func(pokemmo_s.MasterConnector.savingUsers.indexOf(username) != -1);
}
pokemmo_s.MasterConnector.loginUser = function(username,password,func) {
	if(pokemmo_s.MasterConnector.savingUsers.indexOf(username) != -1 || pokemmo_s.MasterConnector.loggedInUsers.indexOf(username) != -1) {
		func("loggedInAlready",null);
		return;
	}
	pokemmo_s.MasterConnector.dbaccounts.find({ lcusername : username.toLowerCase()},{ limit : 1}).toArray(function(err,docs) {
		if(err || docs.length == 0) {
			func("wrongUsername",null);
			return;
		}
		var username1 = docs[0].username;
		var hashedpass = docs[0].password;
		var salt = docs[0].salt;
		pokemmo_s.MasterConnector.loggedInUsers.push(username1);
		func(pokemmo_s.Utils.sha512(password,salt) == hashedpass?"success":"wrong_password",docs[0].username);
	});
}
pokemmo_s.MasterConnector.disconnectUser = function(username) {
	pokemmo_s.MasterConnector.loggedInUsers.remove(username);
}
pokemmo_s.MasterConnector.loadCharacter = function(username,func) {
	pokemmo_s.MasterConnector.dbchars.find({ username : username},{ limit : 1}).toArray(function(err,docs) {
		if(err) {
			js.Node.console.warn("Error while trying to load client char: " + err.message);
			func(false,null);
			return;
		}
		if(docs.length > 0) func(true,docs[0]); else func(true,null);
	});
}
pokemmo_s.MasterConnector.saveCharacter = function(username,data) {
	if(pokemmo_s.MasterConnector.savingUsers.indexOf(username) != -1) return;
	pokemmo_s.MasterConnector.savingUsers.push(username);
	pokemmo_s.MasterConnector.dbchars.update({ username : username},{$set:data},{ safe : true, upsert : true},function(err) {
		pokemmo_s.MasterConnector.savingUsers.remove(username);
		if(err != null) console.warn("Error while saving client character: " + err.message);
	});
}
pokemmo_s.MasterConnector.prototype.__class__ = pokemmo_s.MasterConnector;
StringBuf = function(p) {
	if( p === $_ ) return;
	this.b = new Array();
}
StringBuf.__name__ = ["StringBuf"];
StringBuf.prototype.add = function(x) {
	this.b[this.b.length] = x == null?"null":x;
}
StringBuf.prototype.addSub = function(s,pos,len) {
	this.b[this.b.length] = s.substr(pos,len);
}
StringBuf.prototype.addChar = function(c) {
	this.b[this.b.length] = String.fromCharCode(c);
}
StringBuf.prototype.toString = function() {
	return this.b.join("");
}
StringBuf.prototype.b = null;
StringBuf.prototype.__class__ = StringBuf;
pokemmo_s.ClientCharacter = function(client,save) {
	if( client === $_ ) return;
	var me = this;
	this.client = client;
	this.speedHackChecks = [];
	this.lastMessage = 0;
	this.surfing = false;
	this.usingBike = false;
	this.retransmit = true;
	this.money = save.money;
	this.pokemon = [];
	var _g = 0, _g1 = save.pokemon;
	while(_g < _g1.length) {
		var psave = _g1[_g];
		++_g;
		this.pokemon.push(new pokemmo_s.Pokemon().loadFromSave(psave));
	}
	this.playerVars = save.playerVars;
	this.type = save.charType;
	this.respawnLocation = save.respawnLocation;
	client.socket.emit("setInfo",{ pokemon : this.generatePokemonNetworkObject(), accountLevel : client.accountLevel});
	this.warp(save.map,save.x,save.y,save.direction);
	client.socket.on("disconnect",$closure(this,"e_disconnect"));
	client.socket.on("walk",$closure(this,"e_walk"));
	client.socket.on("useLedge",$closure(this,"e_useLedge"));
	client.socket.on("turn",$closure(this,"e_turn"));
	client.socket.on("sendMessage",$closure(this,"e_sendMessage"));
	client.socket.on("useWarp",$closure(this,"e_useWarp"));
	if(client.accountLevel >= 30) client.socket.on("kickPlayer",function(data) {
		pokemmo_s.GameServer.kickPlayer(data.username);
	});
	if(client.accountLevel >= 70) {
		client.socket.on("adminSetPokemon",function(data) {
			if(pokemmo_s.GameData.pokemonData[data.id] == null) return;
			me.pokemon[0].id = data.id;
			me.retransmit = true;
		});
		client.socket.on("adminSetLevel",function(data) {
			if(!Std["is"](data.level,Int)) return;
			var n = data.level;
			if(n != n) return;
			if(n < 2) return;
			if(n > n) return;
			me.pokemon[0].level = n;
			me.pokemon[0].calculateStats();
			me.retransmit = true;
		});
		client.socket.on("adminTestLevelup",function(data) {
			me.pokemon[0].experience = me.pokemon[0].experienceNeeded - 1;
		});
		client.socket.on("adminTeleport",function(data) {
			me.warp(data.map,data.x,data.y,data.dir || 0);
		});
	}
}
pokemmo_s.ClientCharacter.__name__ = ["pokemmo_s","ClientCharacter"];
pokemmo_s.ClientCharacter.chatFilterRegex = null;
pokemmo_s.ClientCharacter.filterChatText = function(str) {
	if(pokemmo_s.ClientCharacter.chatFilterRegex == null) pokemmo_s.ClientCharacter.chatFilterRegex = new EReg("[^\\u0020-\\u007F\\u0080-\\u00FF]","");
	return pokemmo_s.ClientCharacter.chatFilterRegex.replace(str,"");
}
pokemmo_s.ClientCharacter.prototype.client = null;
pokemmo_s.ClientCharacter.prototype.disconnected = null;
pokemmo_s.ClientCharacter.prototype.money = null;
pokemmo_s.ClientCharacter.prototype.pokemon = null;
pokemmo_s.ClientCharacter.prototype.mapInstance = null;
pokemmo_s.ClientCharacter.prototype.retransmit = null;
pokemmo_s.ClientCharacter.prototype.x = null;
pokemmo_s.ClientCharacter.prototype.y = null;
pokemmo_s.ClientCharacter.prototype.direction = null;
pokemmo_s.ClientCharacter.prototype.lastX = null;
pokemmo_s.ClientCharacter.prototype.lastY = null;
pokemmo_s.ClientCharacter.prototype.type = null;
pokemmo_s.ClientCharacter.prototype.surfing = null;
pokemmo_s.ClientCharacter.prototype.usingBike = null;
pokemmo_s.ClientCharacter.prototype.respawnLocation = null;
pokemmo_s.ClientCharacter.prototype.playerVars = null;
pokemmo_s.ClientCharacter.prototype.battle = null;
pokemmo_s.ClientCharacter.prototype.lastAckMove = null;
pokemmo_s.ClientCharacter.prototype.speedHackChecks = null;
pokemmo_s.ClientCharacter.prototype.lastMessage = null;
pokemmo_s.ClientCharacter.prototype.disconnect = function() {
	this.onDisconnect();
	this.client.socket.disconnect();
}
pokemmo_s.ClientCharacter.prototype.onDisconnect = function() {
	if(this.disconnected) return;
	this.disconnected = true;
	if(this.battle != null) this.battle.playerSurrendered(this.battle.getPlayerOfClient(this.client));
	pokemmo_s.MasterConnector.saveCharacter(this.client.username,this.generateCharacterSave());
	this.mapInstance.removeChar(this);
	this.client.onDisconnect();
}
pokemmo_s.ClientCharacter.prototype.e_disconnect = function(data) {
	this.onDisconnect();
}
pokemmo_s.ClientCharacter.prototype.generateCharacterSave = function() {
	return { map : this.mapInstance.map.id, x : this.x, y : this.y, direction : this.direction, charType : this.type, pokemon : Lambda.array(Lambda.map(this.pokemon,function(p) {
		return p.generateSave();
	})), respawnLocation : this.respawnLocation, money : this.money, playerVars : this.playerVars};
}
pokemmo_s.ClientCharacter.prototype.generateNetworkObject = function() {
	return { username : this.client.username, inBattle : this.battle != null, x : this.x, y : this.y, lastX : this.lastX, lastY : this.lastY, type : this.type, direction : this.direction, follower : this.pokemon[0].id, folShiny : this.pokemon[0].shiny};
}
pokemmo_s.ClientCharacter.prototype.generatePokemonNetworkObject = function() {
	var arr = [];
	var _g = 0, _g1 = this.pokemon;
	while(_g < _g1.length) {
		var i = _g1[_g];
		++_g;
		arr.push(i.generateNetworkObject(true));
	}
	return arr;
}
pokemmo_s.ClientCharacter.prototype.putInMap = function(str) {
	var map = pokemmo_s.GameData.maps[str];
	if(map == null) return;
	if(this.mapInstance != null) this.mapInstance.removeChar(this);
	var $it0 = map.instances.iterator();
	while( $it0.hasNext() ) {
		var i = $it0.next();
		if(map.playersPerInstance > 0 && i.chars.length >= map.playersPerInstance) continue;
		i.addChar(this);
		this.mapInstance = i;
		return;
	}
	this.mapInstance = map.createInstance();
	this.mapInstance.addChar(this);
}
pokemmo_s.ClientCharacter.prototype.warp = function(map,x,y,dir) {
	if(dir == null) dir = 0;
	this.x = x;
	this.y = y;
	this.direction = dir;
	this.putInMap(map);
	this.lastX = x;
	this.lastY = y;
	this.retransmit = true;
	this.client.socket.emit("loadMap",{ mapid : map, chars : this.mapInstance.generateFullCharNetworkObject()});
}
pokemmo_s.ClientCharacter.prototype.warpToLocation = function(loc) {
	this.warp(loc.mapName,loc.x,loc.y,loc.direction);
}
pokemmo_s.ClientCharacter.prototype.restorePokemon = function() {
	var _g = 0, _g1 = this.pokemon;
	while(_g < _g1.length) {
		var p = _g1[_g];
		++_g;
		p.restore();
	}
}
pokemmo_s.ClientCharacter.prototype.moveToSpawn = function() {
	this.warpToLocation(this.respawnLocation);
}
pokemmo_s.ClientCharacter.prototype.sendInvalidMove = function() {
	this.lastAckMove = Math.floor(Date.now().getTime() * 1000 + Math.random() * 1000);
	this.client.socket.emit("invalidMove",{ ack : this.lastAckMove, x : this.x, y : this.y});
}
pokemmo_s.ClientCharacter.prototype.onWalk = function() {
	if(this.battle != null) return;
	var destSolid = this.mapInstance.map.solidData[this.x][this.y];
	this.retransmit = true;
	if(this.speedHackChecks.length >= 12) this.speedHackChecks.shift();
	this.speedHackChecks.push(Date.now().getTime());
	if(this.speedHackChecks.length >= 12) {
		var avgWalkTime = 0.0;
		var _g = 1;
		while(_g < 12) {
			var i = _g++;
			avgWalkTime += this.speedHackChecks[i] - this.speedHackChecks[i - 1];
		}
		avgWalkTime /= 11;
		if(avgWalkTime < 200) {
			console.log("Speed hack detected, kicking client " + this.client.username);
			this.disconnect();
			return;
		}
	}
	var encounterAreas = this.mapInstance.map.getEncounterAreasAt(this.x,this.y);
	var _g = 0;
	while(_g < encounterAreas.length) {
		var area = encounterAreas[_g];
		++_g;
		if(this.checkEncounters(area.encounters)) return;
	}
	if(destSolid == 7 && this.mapInstance.map.grassEncounters != null) {
		if(this.checkEncounters(this.mapInstance.map.grassEncounters)) return;
	}
}
pokemmo_s.ClientCharacter.prototype.checkEncounters = function(encounters) {
	if(Math.random() > 1 / 18.5) return false;
	var chance = 0.0;
	var n = Math.random();
	var _g = 0;
	while(_g < encounters.length) {
		var encounter = encounters[_g];
		++_g;
		if(n >= (chance += encounter.chance)) continue;
		var level = pokemmo_s.Utils.randInt(encounter.min_level,encounter.max_level);
		var enemy = encounter.id;
		this.battle = new pokemmo_s.BattleWild(this.client,new pokemmo_s.Pokemon().createWild(enemy,level));
		this.battle.init();
		return true;
	}
	return false;
}
pokemmo_s.ClientCharacter.prototype.canWalkOnTileType = function(type) {
	return this.surfing?type == 2:type == 0 || type == 7;
}
pokemmo_s.ClientCharacter.prototype.e_walk = function(data) {
	if(this.battle != null) return;
	if(!(Std["is"](data.x,Int) && Std["is"](data.y,Int) && Std["is"](data.dir,Int))) return;
	if(data.x < 0 || data.x >= this.mapInstance.map.width) return;
	if(data.y < 0 || data.y >= this.mapInstance.map.height) return;
	var destSolid = this.mapInstance.map.solidData[data.x][data.y];
	if(destSolid == null) return;
	var invalidMove = false;
	this.direction = Math.floor(Math.abs(data.dir) % 4);
	if(!(this.surfing?destSolid == 2:destSolid == 0 || destSolid == 7)) invalidMove = true; else if(this.x - 1 == data.x && this.y == data.y) {
		this.lastX = this.x;
		this.lastY = this.y;
		this.x -= 1;
		this.direction = 1;
		this.onWalk();
	} else if(this.x + 1 == data.x && this.y == data.y) {
		this.lastX = this.x;
		this.lastY = this.y;
		this.x += 1;
		this.direction = 3;
		this.onWalk();
	} else if(this.x == data.x && this.y - 1 == data.y) {
		this.lastX = this.x;
		this.lastY = this.y;
		this.y -= 1;
		this.direction = 2;
		this.onWalk();
	} else if(this.x == data.x && this.y + 1 == data.y) {
		this.lastX = this.x;
		this.lastY = this.y;
		this.y += 1;
		this.direction = 0;
		this.onWalk();
	} else invalidMove = true;
	if(invalidMove) this.sendInvalidMove();
}
pokemmo_s.ClientCharacter.prototype.e_useLedge = function(data) {
	if(this.battle != null) return;
	if(!(Std["is"](data.x,Int) && Std["is"](data.y,Int))) return;
	if(data.x < 0 || data.x >= this.mapInstance.map.width) return;
	if(data.y < 0 || data.y >= this.mapInstance.map.height) return;
	var destSolid = this.mapInstance.map.solidData[data.x][data.y];
	if(destSolid == null) return;
	switch(destSolid) {
	case 3:
		if(this.x != data.x || this.y + 1 != data.y) {
			this.sendInvalidMove();
			return;
		}
		this.direction = 0;
		this.y += 2;
		this.lastY = this.y;
		this.retransmit = true;
		break;
	case 4:
		if(this.x - 1 != data.x || this.y != data.y) {
			this.sendInvalidMove();
			return;
		}
		this.direction = 1;
		this.x -= 2;
		this.lastX = this.x;
		this.retransmit = true;
		break;
	case 5:
		if(this.x != data.x || this.y - 1 != data.y) {
			this.sendInvalidMove();
			return;
		}
		this.direction = 2;
		this.y -= 2;
		this.lastY = this.y;
		this.retransmit = true;
		break;
	case 6:
		if(this.x + 1 != data.x || this.y != data.y) {
			this.sendInvalidMove();
			return;
		}
		this.direction = 3;
		this.x += 2;
		this.lastX = this.x;
		this.retransmit = true;
		break;
	}
}
pokemmo_s.ClientCharacter.prototype.e_turn = function(data) {
	if(this.battle != null) return;
	if(!Std["is"](data.dir,Int)) return;
	this.direction = Math.floor(Math.abs(data.dir) % 4);
	this.retransmit = true;
}
pokemmo_s.ClientCharacter.prototype.e_sendMessage = function(data) {
	if(!Std["is"](data.str,String)) return;
	var t = Date.now().getTime();
	if(t - this.lastMessage < 100) return;
	var str = (function($this) {
		var $r;
		if(pokemmo_s.ClientCharacter.chatFilterRegex == null) pokemmo_s.ClientCharacter.chatFilterRegex = new EReg("[^\\u0020-\\u007F\\u0080-\\u00FF]","");
		$r = pokemmo_s.ClientCharacter.chatFilterRegex.replace(data.str.substr(0,128),"");
		return $r;
	}(this));
	if(str.length == 0) return;
	this.mapInstance.messages.push({ username : this.client.username, str : str, x : this.x, y : this.y});
	this.lastMessage = t;
}
pokemmo_s.ClientCharacter.prototype.e_useWarp = function(data) {
	var warp = this.mapInstance.map.warps.get(data.name);
	if(warp == null) return;
	if(Math.abs(warp.x - this.x) + Math.abs(warp.y - this.y) > 1) return;
	this.mapInstance.warpsUsed.push({ username : this.client.username, warpName : data.name, x : this.x, y : this.y, direction : this.direction});
	this.warpToLocation(warp.destination);
}
pokemmo_s.ClientCharacter.prototype.__class__ = pokemmo_s.ClientCharacter;
pokemmo_s.MapInstance = function(map,id) {
	if( map === $_ ) return;
	this.map = map;
	this.chars = [];
	this.messages = [];
	this.cremoved = [];
	this.warpsUsed = [];
	++map.numInstances;
	pokemmo_s.GameData.mapsInstaces.push(this);
}
pokemmo_s.MapInstance.__name__ = ["pokemmo_s","MapInstance"];
pokemmo_s.MapInstance.prototype.map = null;
pokemmo_s.MapInstance.prototype.id = null;
pokemmo_s.MapInstance.prototype.chars = null;
pokemmo_s.MapInstance.prototype.networkObjectData = null;
pokemmo_s.MapInstance.prototype.messages = null;
pokemmo_s.MapInstance.prototype.cremoved = null;
pokemmo_s.MapInstance.prototype.warpsUsed = null;
pokemmo_s.MapInstance.prototype.destroy = function() {
	this.map.instances.remove(this.id);
	--this.map.numInstances;
	pokemmo_s.GameData.mapsInstaces.remove(this);
}
pokemmo_s.MapInstance.prototype.addChar = function($char) {
	this.chars.push($char);
	this.cremoved.remove($char.client.username);
}
pokemmo_s.MapInstance.prototype.removeChar = function($char) {
	this.chars.remove($char);
	if(this.chars.length == 0 && this.map.numInstances > 1) this.destroy();
	this.cremoved.push($char.client.username);
}
pokemmo_s.MapInstance.prototype.getCharCount = function() {
	return this.chars.length;
}
pokemmo_s.MapInstance.prototype.generateFullCharNetworkObject = function() {
	var arr = [];
	var _g = 0, _g1 = this.chars;
	while(_g < _g1.length) {
		var c = _g1[_g];
		++_g;
		arr.push(c.generateNetworkObject());
	}
	return arr;
}
pokemmo_s.MapInstance.prototype.generateNetworkObjectData = function() {
	var obj = { map : this.map.id};
	var charArr = [];
	var _g = 0, _g1 = this.chars;
	while(_g < _g1.length) {
		var c = _g1[_g];
		++_g;
		if(c.retransmit) {
			c.retransmit = false;
			charArr.push(c.generateNetworkObject());
		}
	}
	if(charArr.length > 0) obj.chars = charArr;
	if(this.messages.length > 0) obj.messages = this.messages;
	if(this.warpsUsed.length > 0) obj.warpsUsed = this.warpsUsed;
	if(this.cremoved.length > 0) obj.cremoved = this.cremoved;
	var data = js.Node.stringify(obj);
	this.messages.length = 0;
	this.warpsUsed.length = 0;
	this.cremoved.length = 0;
	this.networkObjectData = data;
	return data;
}
pokemmo_s.MapInstance.prototype.__class__ = pokemmo_s.MapInstance;
haxe.macro.Constant = { __ename__ : ["haxe","macro","Constant"], __constructs__ : ["CInt","CFloat","CString","CIdent","CType","CRegexp"] }
haxe.macro.Constant.CInt = function(v) { var $x = ["CInt",0,v]; $x.__enum__ = haxe.macro.Constant; $x.toString = $estr; return $x; }
haxe.macro.Constant.CFloat = function(f) { var $x = ["CFloat",1,f]; $x.__enum__ = haxe.macro.Constant; $x.toString = $estr; return $x; }
haxe.macro.Constant.CString = function(s) { var $x = ["CString",2,s]; $x.__enum__ = haxe.macro.Constant; $x.toString = $estr; return $x; }
haxe.macro.Constant.CIdent = function(s) { var $x = ["CIdent",3,s]; $x.__enum__ = haxe.macro.Constant; $x.toString = $estr; return $x; }
haxe.macro.Constant.CType = function(s) { var $x = ["CType",4,s]; $x.__enum__ = haxe.macro.Constant; $x.toString = $estr; return $x; }
haxe.macro.Constant.CRegexp = function(r,opt) { var $x = ["CRegexp",5,r,opt]; $x.__enum__ = haxe.macro.Constant; $x.toString = $estr; return $x; }
haxe.macro.Binop = { __ename__ : ["haxe","macro","Binop"], __constructs__ : ["OpAdd","OpMult","OpDiv","OpSub","OpAssign","OpEq","OpNotEq","OpGt","OpGte","OpLt","OpLte","OpAnd","OpOr","OpXor","OpBoolAnd","OpBoolOr","OpShl","OpShr","OpUShr","OpMod","OpAssignOp","OpInterval"] }
haxe.macro.Binop.OpAdd = ["OpAdd",0];
haxe.macro.Binop.OpAdd.toString = $estr;
haxe.macro.Binop.OpAdd.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpMult = ["OpMult",1];
haxe.macro.Binop.OpMult.toString = $estr;
haxe.macro.Binop.OpMult.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpDiv = ["OpDiv",2];
haxe.macro.Binop.OpDiv.toString = $estr;
haxe.macro.Binop.OpDiv.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpSub = ["OpSub",3];
haxe.macro.Binop.OpSub.toString = $estr;
haxe.macro.Binop.OpSub.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpAssign = ["OpAssign",4];
haxe.macro.Binop.OpAssign.toString = $estr;
haxe.macro.Binop.OpAssign.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpEq = ["OpEq",5];
haxe.macro.Binop.OpEq.toString = $estr;
haxe.macro.Binop.OpEq.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpNotEq = ["OpNotEq",6];
haxe.macro.Binop.OpNotEq.toString = $estr;
haxe.macro.Binop.OpNotEq.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpGt = ["OpGt",7];
haxe.macro.Binop.OpGt.toString = $estr;
haxe.macro.Binop.OpGt.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpGte = ["OpGte",8];
haxe.macro.Binop.OpGte.toString = $estr;
haxe.macro.Binop.OpGte.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpLt = ["OpLt",9];
haxe.macro.Binop.OpLt.toString = $estr;
haxe.macro.Binop.OpLt.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpLte = ["OpLte",10];
haxe.macro.Binop.OpLte.toString = $estr;
haxe.macro.Binop.OpLte.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpAnd = ["OpAnd",11];
haxe.macro.Binop.OpAnd.toString = $estr;
haxe.macro.Binop.OpAnd.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpOr = ["OpOr",12];
haxe.macro.Binop.OpOr.toString = $estr;
haxe.macro.Binop.OpOr.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpXor = ["OpXor",13];
haxe.macro.Binop.OpXor.toString = $estr;
haxe.macro.Binop.OpXor.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpBoolAnd = ["OpBoolAnd",14];
haxe.macro.Binop.OpBoolAnd.toString = $estr;
haxe.macro.Binop.OpBoolAnd.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpBoolOr = ["OpBoolOr",15];
haxe.macro.Binop.OpBoolOr.toString = $estr;
haxe.macro.Binop.OpBoolOr.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpShl = ["OpShl",16];
haxe.macro.Binop.OpShl.toString = $estr;
haxe.macro.Binop.OpShl.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpShr = ["OpShr",17];
haxe.macro.Binop.OpShr.toString = $estr;
haxe.macro.Binop.OpShr.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpUShr = ["OpUShr",18];
haxe.macro.Binop.OpUShr.toString = $estr;
haxe.macro.Binop.OpUShr.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpMod = ["OpMod",19];
haxe.macro.Binop.OpMod.toString = $estr;
haxe.macro.Binop.OpMod.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpAssignOp = function(op) { var $x = ["OpAssignOp",20,op]; $x.__enum__ = haxe.macro.Binop; $x.toString = $estr; return $x; }
haxe.macro.Binop.OpInterval = ["OpInterval",21];
haxe.macro.Binop.OpInterval.toString = $estr;
haxe.macro.Binop.OpInterval.__enum__ = haxe.macro.Binop;
haxe.macro.Unop = { __ename__ : ["haxe","macro","Unop"], __constructs__ : ["OpIncrement","OpDecrement","OpNot","OpNeg","OpNegBits"] }
haxe.macro.Unop.OpIncrement = ["OpIncrement",0];
haxe.macro.Unop.OpIncrement.toString = $estr;
haxe.macro.Unop.OpIncrement.__enum__ = haxe.macro.Unop;
haxe.macro.Unop.OpDecrement = ["OpDecrement",1];
haxe.macro.Unop.OpDecrement.toString = $estr;
haxe.macro.Unop.OpDecrement.__enum__ = haxe.macro.Unop;
haxe.macro.Unop.OpNot = ["OpNot",2];
haxe.macro.Unop.OpNot.toString = $estr;
haxe.macro.Unop.OpNot.__enum__ = haxe.macro.Unop;
haxe.macro.Unop.OpNeg = ["OpNeg",3];
haxe.macro.Unop.OpNeg.toString = $estr;
haxe.macro.Unop.OpNeg.__enum__ = haxe.macro.Unop;
haxe.macro.Unop.OpNegBits = ["OpNegBits",4];
haxe.macro.Unop.OpNegBits.toString = $estr;
haxe.macro.Unop.OpNegBits.__enum__ = haxe.macro.Unop;
haxe.macro.ExprDef = { __ename__ : ["haxe","macro","ExprDef"], __constructs__ : ["EConst","EArray","EBinop","EField","EType","EParenthesis","EObjectDecl","EArrayDecl","ECall","ENew","EUnop","EVars","EFunction","EBlock","EFor","EIn","EIf","EWhile","ESwitch","ETry","EReturn","EBreak","EContinue","EUntyped","EThrow","ECast","EDisplay","EDisplayNew","ETernary"] }
haxe.macro.ExprDef.EConst = function(c) { var $x = ["EConst",0,c]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EArray = function(e1,e2) { var $x = ["EArray",1,e1,e2]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EBinop = function(op,e1,e2) { var $x = ["EBinop",2,op,e1,e2]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EField = function(e,field) { var $x = ["EField",3,e,field]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EType = function(e,field) { var $x = ["EType",4,e,field]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EParenthesis = function(e) { var $x = ["EParenthesis",5,e]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EObjectDecl = function(fields) { var $x = ["EObjectDecl",6,fields]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EArrayDecl = function(values) { var $x = ["EArrayDecl",7,values]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.ECall = function(e,params) { var $x = ["ECall",8,e,params]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.ENew = function(t,params) { var $x = ["ENew",9,t,params]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EUnop = function(op,postFix,e) { var $x = ["EUnop",10,op,postFix,e]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EVars = function(vars) { var $x = ["EVars",11,vars]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EFunction = function(name,f) { var $x = ["EFunction",12,name,f]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EBlock = function(exprs) { var $x = ["EBlock",13,exprs]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EFor = function(it,expr) { var $x = ["EFor",14,it,expr]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EIn = function(e1,e2) { var $x = ["EIn",15,e1,e2]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EIf = function(econd,eif,eelse) { var $x = ["EIf",16,econd,eif,eelse]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EWhile = function(econd,e,normalWhile) { var $x = ["EWhile",17,econd,e,normalWhile]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.ESwitch = function(e,cases,edef) { var $x = ["ESwitch",18,e,cases,edef]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.ETry = function(e,catches) { var $x = ["ETry",19,e,catches]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EReturn = function(e) { var $x = ["EReturn",20,e]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EBreak = ["EBreak",21];
haxe.macro.ExprDef.EBreak.toString = $estr;
haxe.macro.ExprDef.EBreak.__enum__ = haxe.macro.ExprDef;
haxe.macro.ExprDef.EContinue = ["EContinue",22];
haxe.macro.ExprDef.EContinue.toString = $estr;
haxe.macro.ExprDef.EContinue.__enum__ = haxe.macro.ExprDef;
haxe.macro.ExprDef.EUntyped = function(e) { var $x = ["EUntyped",23,e]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EThrow = function(e) { var $x = ["EThrow",24,e]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.ECast = function(e,t) { var $x = ["ECast",25,e,t]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EDisplay = function(e,isCall) { var $x = ["EDisplay",26,e,isCall]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EDisplayNew = function(t) { var $x = ["EDisplayNew",27,t]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.ETernary = function(econd,eif,eelse) { var $x = ["ETernary",28,econd,eif,eelse]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ComplexType = { __ename__ : ["haxe","macro","ComplexType"], __constructs__ : ["TPath","TFunction","TAnonymous","TParent","TExtend"] }
haxe.macro.ComplexType.TPath = function(p) { var $x = ["TPath",0,p]; $x.__enum__ = haxe.macro.ComplexType; $x.toString = $estr; return $x; }
haxe.macro.ComplexType.TFunction = function(args,ret) { var $x = ["TFunction",1,args,ret]; $x.__enum__ = haxe.macro.ComplexType; $x.toString = $estr; return $x; }
haxe.macro.ComplexType.TAnonymous = function(fields) { var $x = ["TAnonymous",2,fields]; $x.__enum__ = haxe.macro.ComplexType; $x.toString = $estr; return $x; }
haxe.macro.ComplexType.TParent = function(t) { var $x = ["TParent",3,t]; $x.__enum__ = haxe.macro.ComplexType; $x.toString = $estr; return $x; }
haxe.macro.ComplexType.TExtend = function(p,fields) { var $x = ["TExtend",4,p,fields]; $x.__enum__ = haxe.macro.ComplexType; $x.toString = $estr; return $x; }
haxe.macro.TypeParam = { __ename__ : ["haxe","macro","TypeParam"], __constructs__ : ["TPType","TPExpr"] }
haxe.macro.TypeParam.TPType = function(t) { var $x = ["TPType",0,t]; $x.__enum__ = haxe.macro.TypeParam; $x.toString = $estr; return $x; }
haxe.macro.TypeParam.TPExpr = function(e) { var $x = ["TPExpr",1,e]; $x.__enum__ = haxe.macro.TypeParam; $x.toString = $estr; return $x; }
haxe.macro.Access = { __ename__ : ["haxe","macro","Access"], __constructs__ : ["APublic","APrivate","AStatic","AOverride","ADynamic","AInline"] }
haxe.macro.Access.APublic = ["APublic",0];
haxe.macro.Access.APublic.toString = $estr;
haxe.macro.Access.APublic.__enum__ = haxe.macro.Access;
haxe.macro.Access.APrivate = ["APrivate",1];
haxe.macro.Access.APrivate.toString = $estr;
haxe.macro.Access.APrivate.__enum__ = haxe.macro.Access;
haxe.macro.Access.AStatic = ["AStatic",2];
haxe.macro.Access.AStatic.toString = $estr;
haxe.macro.Access.AStatic.__enum__ = haxe.macro.Access;
haxe.macro.Access.AOverride = ["AOverride",3];
haxe.macro.Access.AOverride.toString = $estr;
haxe.macro.Access.AOverride.__enum__ = haxe.macro.Access;
haxe.macro.Access.ADynamic = ["ADynamic",4];
haxe.macro.Access.ADynamic.toString = $estr;
haxe.macro.Access.ADynamic.__enum__ = haxe.macro.Access;
haxe.macro.Access.AInline = ["AInline",5];
haxe.macro.Access.AInline.toString = $estr;
haxe.macro.Access.AInline.__enum__ = haxe.macro.Access;
haxe.macro.FieldType = { __ename__ : ["haxe","macro","FieldType"], __constructs__ : ["FVar","FFun","FProp"] }
haxe.macro.FieldType.FVar = function(t,e) { var $x = ["FVar",0,t,e]; $x.__enum__ = haxe.macro.FieldType; $x.toString = $estr; return $x; }
haxe.macro.FieldType.FFun = function(f) { var $x = ["FFun",1,f]; $x.__enum__ = haxe.macro.FieldType; $x.toString = $estr; return $x; }
haxe.macro.FieldType.FProp = function(get,set,t,e) { var $x = ["FProp",2,get,set,t,e]; $x.__enum__ = haxe.macro.FieldType; $x.toString = $estr; return $x; }
haxe.macro.TypeDefKind = { __ename__ : ["haxe","macro","TypeDefKind"], __constructs__ : ["TDEnum","TDStructure","TDClass"] }
haxe.macro.TypeDefKind.TDEnum = ["TDEnum",0];
haxe.macro.TypeDefKind.TDEnum.toString = $estr;
haxe.macro.TypeDefKind.TDEnum.__enum__ = haxe.macro.TypeDefKind;
haxe.macro.TypeDefKind.TDStructure = ["TDStructure",1];
haxe.macro.TypeDefKind.TDStructure.toString = $estr;
haxe.macro.TypeDefKind.TDStructure.__enum__ = haxe.macro.TypeDefKind;
haxe.macro.TypeDefKind.TDClass = function(extend,implement,isInterface) { var $x = ["TDClass",2,extend,implement,isInterface]; $x.__enum__ = haxe.macro.TypeDefKind; $x.toString = $estr; return $x; }
haxe.macro.Error = function(m,p) {
	if( m === $_ ) return;
	this.message = m;
	this.pos = p;
}
haxe.macro.Error.__name__ = ["haxe","macro","Error"];
haxe.macro.Error.prototype.message = null;
haxe.macro.Error.prototype.pos = null;
haxe.macro.Error.prototype.__class__ = haxe.macro.Error;
pokemmo_s.BattleAction = { __ename__ : ["pokemmo_s","BattleAction"], __constructs__ : ["TRun","TMove","TStruggle"] }
pokemmo_s.BattleAction.TRun = ["TRun",0];
pokemmo_s.BattleAction.TRun.toString = $estr;
pokemmo_s.BattleAction.TRun.__enum__ = pokemmo_s.BattleAction;
pokemmo_s.BattleAction.TMove = function(move,targets) { var $x = ["TMove",1,move,targets]; $x.__enum__ = pokemmo_s.BattleAction; $x.toString = $estr; return $x; }
pokemmo_s.BattleAction.TStruggle = ["TStruggle",2];
pokemmo_s.BattleAction.TStruggle.toString = $estr;
pokemmo_s.BattleAction.TStruggle.__enum__ = pokemmo_s.BattleAction;
pokemmo_s.BattleActionResult = function(player,type,value,broadcastOnlyToPlayer) {
	if( player === $_ ) return;
	if(broadcastOnlyToPlayer == null) broadcastOnlyToPlayer = false;
	this.player = player;
	this.type = type;
	this.value = value;
	this.broadcastOnlyToPlayer = broadcastOnlyToPlayer;
}
pokemmo_s.BattleActionResult.__name__ = ["pokemmo_s","BattleActionResult"];
pokemmo_s.BattleActionResult.prototype.player = null;
pokemmo_s.BattleActionResult.prototype.type = null;
pokemmo_s.BattleActionResult.prototype.value = null;
pokemmo_s.BattleActionResult.prototype.broadcastOnlyToPlayer = null;
pokemmo_s.BattleActionResult.prototype.generateNetworkObject = function(p) {
	if(this.broadcastOnlyToPlayer && this.player != p) return null;
	return { player : this.player != null?this.player.id:null, type : this.type, value : Reflect.isFunction(this.value)?this.value(this,p):this.value};
}
pokemmo_s.BattleActionResult.prototype.__class__ = pokemmo_s.BattleActionResult;
pokemmo_s.GameServer = function() { }
pokemmo_s.GameServer.__name__ = ["pokemmo_s","GameServer"];
pokemmo_s.GameServer.clients = null;
pokemmo_s.GameServer.start = function() {
	pokemmo_s.GameServer.clients = [];
	var io = js.Node.require("socket.io").listen(2828).set("close timeout",0).set("log level",3);
	io.sockets.on("connection",function(socket) {
		pokemmo_s.GameServer.clients.push(new pokemmo_s.Client(socket));
	});
	js.Node.setInterval(pokemmo_s.GameServer.sendUpdates,250);
}
pokemmo_s.GameServer.kickPlayer = function(username) {
	var _g = 0, _g1 = pokemmo_s.GameServer.clients;
	while(_g < _g1.length) {
		var c = _g1[_g];
		++_g;
		if(c.username == username) c.kick();
	}
}
pokemmo_s.GameServer.sendUpdates = function() {
	var _g = 0, _g1 = pokemmo_s.GameData.mapsInstaces;
	while(_g < _g1.length) {
		var ins = _g1[_g];
		++_g;
		if(ins.chars.length == 0) continue;
		var d = ins.generateNetworkObjectData();
		var _g2 = 0, _g3 = ins.chars;
		while(_g2 < _g3.length) {
			var c = _g3[_g2];
			++_g2;
			c.client.socket["volatile"].emit("update",d);
		}
	}
}
pokemmo_s.GameServer.getClientCount = function() {
	return pokemmo_s.GameServer.clients.length;
}
pokemmo_s.GameServer.prototype.__class__ = pokemmo_s.GameServer;
if(!pokemmo_s.exts) pokemmo_s.exts = {}
pokemmo_s.exts.StringExt = function() { }
pokemmo_s.exts.StringExt.__name__ = ["pokemmo_s","exts","StringExt"];
pokemmo_s.exts.StringExt.getRandomChar = function(str) {
	return str.charAt(Math.floor(str.length * Math.random()));
}
pokemmo_s.exts.StringExt.prototype.__class__ = pokemmo_s.exts.StringExt;
if(!haxe.io) haxe.io = {}
haxe.io.Bytes = function(length,b) {
	if( length === $_ ) return;
	this.length = length;
	this.b = b;
}
haxe.io.Bytes.__name__ = ["haxe","io","Bytes"];
haxe.io.Bytes.alloc = function(length) {
	var a = new Array();
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		a.push(0);
	}
	return new haxe.io.Bytes(length,a);
}
haxe.io.Bytes.ofString = function(s) {
	var a = new Array();
	var _g1 = 0, _g = s.length;
	while(_g1 < _g) {
		var i = _g1++;
		var c = s.cca(i);
		if(c <= 127) a.push(c); else if(c <= 2047) {
			a.push(192 | c >> 6);
			a.push(128 | c & 63);
		} else if(c <= 65535) {
			a.push(224 | c >> 12);
			a.push(128 | c >> 6 & 63);
			a.push(128 | c & 63);
		} else {
			a.push(240 | c >> 18);
			a.push(128 | c >> 12 & 63);
			a.push(128 | c >> 6 & 63);
			a.push(128 | c & 63);
		}
	}
	return new haxe.io.Bytes(a.length,a);
}
haxe.io.Bytes.ofData = function(b) {
	return new haxe.io.Bytes(b.length,b);
}
haxe.io.Bytes.prototype.length = null;
haxe.io.Bytes.prototype.b = null;
haxe.io.Bytes.prototype.get = function(pos) {
	return this.b[pos];
}
haxe.io.Bytes.prototype.set = function(pos,v) {
	this.b[pos] = v & 255;
}
haxe.io.Bytes.prototype.blit = function(pos,src,srcpos,len) {
	if(pos < 0 || srcpos < 0 || len < 0 || pos + len > this.length || srcpos + len > src.length) throw haxe.io.Error.OutsideBounds;
	var b1 = this.b;
	var b2 = src.b;
	if(b1 == b2 && pos > srcpos) {
		var i = len;
		while(i > 0) {
			i--;
			b1[i + pos] = b2[i + srcpos];
		}
		return;
	}
	var _g = 0;
	while(_g < len) {
		var i = _g++;
		b1[i + pos] = b2[i + srcpos];
	}
}
haxe.io.Bytes.prototype.sub = function(pos,len) {
	if(pos < 0 || len < 0 || pos + len > this.length) throw haxe.io.Error.OutsideBounds;
	return new haxe.io.Bytes(len,this.b.slice(pos,pos + len));
}
haxe.io.Bytes.prototype.compare = function(other) {
	var b1 = this.b;
	var b2 = other.b;
	var len = this.length < other.length?this.length:other.length;
	var _g = 0;
	while(_g < len) {
		var i = _g++;
		if(b1[i] != b2[i]) return b1[i] - b2[i];
	}
	return this.length - other.length;
}
haxe.io.Bytes.prototype.readString = function(pos,len) {
	if(pos < 0 || len < 0 || pos + len > this.length) throw haxe.io.Error.OutsideBounds;
	var s = "";
	var b = this.b;
	var fcc = String.fromCharCode;
	var i = pos;
	var max = pos + len;
	while(i < max) {
		var c = b[i++];
		if(c < 128) {
			if(c == 0) break;
			s += fcc(c);
		} else if(c < 224) s += fcc((c & 63) << 6 | b[i++] & 127); else if(c < 240) {
			var c2 = b[i++];
			s += fcc((c & 31) << 12 | (c2 & 127) << 6 | b[i++] & 127);
		} else {
			var c2 = b[i++];
			var c3 = b[i++];
			s += fcc((c & 15) << 18 | (c2 & 127) << 12 | c3 << 6 & 127 | b[i++] & 127);
		}
	}
	return s;
}
haxe.io.Bytes.prototype.toString = function() {
	return this.readString(0,this.length);
}
haxe.io.Bytes.prototype.toHex = function() {
	var s = new StringBuf();
	var chars = [];
	var str = "0123456789abcdef";
	var _g1 = 0, _g = str.length;
	while(_g1 < _g) {
		var i = _g1++;
		chars.push(str.charCodeAt(i));
	}
	var _g1 = 0, _g = this.length;
	while(_g1 < _g) {
		var i = _g1++;
		var c = this.b[i];
		s.b[s.b.length] = String.fromCharCode(chars[c >> 4]);
		s.b[s.b.length] = String.fromCharCode(chars[c & 15]);
	}
	return s.b.join("");
}
haxe.io.Bytes.prototype.getData = function() {
	return this.b;
}
haxe.io.Bytes.prototype.__class__ = haxe.io.Bytes;
IntIter = function(min,max) {
	if( min === $_ ) return;
	this.min = min;
	this.max = max;
}
IntIter.__name__ = ["IntIter"];
IntIter.prototype.min = null;
IntIter.prototype.max = null;
IntIter.prototype.hasNext = function() {
	return this.min < this.max;
}
IntIter.prototype.next = function() {
	return this.min++;
}
IntIter.prototype.__class__ = IntIter;
haxe.io.Error = { __ename__ : ["haxe","io","Error"], __constructs__ : ["Blocked","Overflow","OutsideBounds","Custom"] }
haxe.io.Error.Blocked = ["Blocked",0];
haxe.io.Error.Blocked.toString = $estr;
haxe.io.Error.Blocked.__enum__ = haxe.io.Error;
haxe.io.Error.Overflow = ["Overflow",1];
haxe.io.Error.Overflow.toString = $estr;
haxe.io.Error.Overflow.__enum__ = haxe.io.Error;
haxe.io.Error.OutsideBounds = ["OutsideBounds",2];
haxe.io.Error.OutsideBounds.toString = $estr;
haxe.io.Error.OutsideBounds.__enum__ = haxe.io.Error;
haxe.io.Error.Custom = function(e) { var $x = ["Custom",3,e]; $x.__enum__ = haxe.io.Error; $x.toString = $estr; return $x; }
pokemmo_s.MacroUtils = function() { }
pokemmo_s.MacroUtils.__name__ = ["pokemmo_s","MacroUtils"];
pokemmo_s.MacroUtils.prototype.__class__ = pokemmo_s.MacroUtils;
Std = function() { }
Std.__name__ = ["Std"];
Std["is"] = function(v,t) {
	return js.Boot.__instanceof(v,t);
}
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
}
Std["int"] = function(x) {
	if(x < 0) return Math.ceil(x);
	return Math.floor(x);
}
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && x.charCodeAt(1) == 120) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
}
Std.parseFloat = function(x) {
	return parseFloat(x);
}
Std.random = function(x) {
	return Math.floor(Math.random() * x);
}
Std.prototype.__class__ = Std;
Lambda = function() { }
Lambda.__name__ = ["Lambda"];
Lambda.array = function(it) {
	var a = new Array();
	var $it0 = it.iterator();
	while( $it0.hasNext() ) {
		var i = $it0.next();
		a.push(i);
	}
	return a;
}
Lambda.list = function(it) {
	var l = new List();
	var $it0 = it.iterator();
	while( $it0.hasNext() ) {
		var i = $it0.next();
		l.add(i);
	}
	return l;
}
Lambda.map = function(it,f) {
	var l = new List();
	var $it0 = it.iterator();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		l.add(f(x));
	}
	return l;
}
Lambda.mapi = function(it,f) {
	var l = new List();
	var i = 0;
	var $it0 = it.iterator();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		l.add(f(i++,x));
	}
	return l;
}
Lambda.has = function(it,elt,cmp) {
	if(cmp == null) {
		var $it0 = it.iterator();
		while( $it0.hasNext() ) {
			var x = $it0.next();
			if(x == elt) return true;
		}
	} else {
		var $it1 = it.iterator();
		while( $it1.hasNext() ) {
			var x = $it1.next();
			if(cmp(x,elt)) return true;
		}
	}
	return false;
}
Lambda.exists = function(it,f) {
	var $it0 = it.iterator();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		if(f(x)) return true;
	}
	return false;
}
Lambda.foreach = function(it,f) {
	var $it0 = it.iterator();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		if(!f(x)) return false;
	}
	return true;
}
Lambda.iter = function(it,f) {
	var $it0 = it.iterator();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		f(x);
	}
}
Lambda.filter = function(it,f) {
	var l = new List();
	var $it0 = it.iterator();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		if(f(x)) l.add(x);
	}
	return l;
}
Lambda.fold = function(it,f,first) {
	var $it0 = it.iterator();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		first = f(x,first);
	}
	return first;
}
Lambda.count = function(it,pred) {
	var n = 0;
	if(pred == null) {
		var $it0 = it.iterator();
		while( $it0.hasNext() ) {
			var _ = $it0.next();
			n++;
		}
	} else {
		var $it1 = it.iterator();
		while( $it1.hasNext() ) {
			var x = $it1.next();
			if(pred(x)) n++;
		}
	}
	return n;
}
Lambda.empty = function(it) {
	return !it.iterator().hasNext();
}
Lambda.indexOf = function(it,v) {
	var i = 0;
	var $it0 = it.iterator();
	while( $it0.hasNext() ) {
		var v2 = $it0.next();
		if(v == v2) return i;
		i++;
	}
	return -1;
}
Lambda.concat = function(a,b) {
	var l = new List();
	var $it0 = a.iterator();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		l.add(x);
	}
	var $it1 = b.iterator();
	while( $it1.hasNext() ) {
		var x = $it1.next();
		l.add(x);
	}
	return l;
}
Lambda.prototype.__class__ = Lambda;
List = function(p) {
	if( p === $_ ) return;
	this.length = 0;
}
List.__name__ = ["List"];
List.prototype.h = null;
List.prototype.q = null;
List.prototype.length = null;
List.prototype.add = function(item) {
	var x = [item];
	if(this.h == null) this.h = x; else this.q[1] = x;
	this.q = x;
	this.length++;
}
List.prototype.push = function(item) {
	var x = [item,this.h];
	this.h = x;
	if(this.q == null) this.q = x;
	this.length++;
}
List.prototype.first = function() {
	return this.h == null?null:this.h[0];
}
List.prototype.last = function() {
	return this.q == null?null:this.q[0];
}
List.prototype.pop = function() {
	if(this.h == null) return null;
	var x = this.h[0];
	this.h = this.h[1];
	if(this.h == null) this.q = null;
	this.length--;
	return x;
}
List.prototype.isEmpty = function() {
	return this.h == null;
}
List.prototype.clear = function() {
	this.h = null;
	this.q = null;
	this.length = 0;
}
List.prototype.remove = function(v) {
	var prev = null;
	var l = this.h;
	while(l != null) {
		if(l[0] == v) {
			if(prev == null) this.h = l[1]; else prev[1] = l[1];
			if(this.q == l) this.q = prev;
			this.length--;
			return true;
		}
		prev = l;
		l = l[1];
	}
	return false;
}
List.prototype.iterator = function() {
	return { h : this.h, hasNext : function() {
		return this.h != null;
	}, next : function() {
		if(this.h == null) return null;
		var x = this.h[0];
		this.h = this.h[1];
		return x;
	}};
}
List.prototype.toString = function() {
	var s = new StringBuf();
	var first = true;
	var l = this.h;
	s.b[s.b.length] = "{" == null?"null":"{";
	while(l != null) {
		if(first) first = false; else s.b[s.b.length] = ", " == null?"null":", ";
		s.add(Std.string(l[0]));
		l = l[1];
	}
	s.b[s.b.length] = "}" == null?"null":"}";
	return s.b.join("");
}
List.prototype.join = function(sep) {
	var s = new StringBuf();
	var first = true;
	var l = this.h;
	while(l != null) {
		if(first) first = false; else s.b[s.b.length] = sep == null?"null":sep;
		s.add(l[0]);
		l = l[1];
	}
	return s.b.join("");
}
List.prototype.filter = function(f) {
	var l2 = new List();
	var l = this.h;
	while(l != null) {
		var v = l[0];
		l = l[1];
		if(f(v)) l2.add(v);
	}
	return l2;
}
List.prototype.map = function(f) {
	var b = new List();
	var l = this.h;
	while(l != null) {
		var v = l[0];
		l = l[1];
		b.add(f(v));
	}
	return b;
}
List.prototype.__class__ = List;
pokemmo_s.ServerConst = function() { }
pokemmo_s.ServerConst.__name__ = ["pokemmo_s","ServerConst"];
pokemmo_s.ServerConst.prototype.__class__ = pokemmo_s.ServerConst;
js.Lib = function() { }
js.Lib.__name__ = ["js","Lib"];
js.Lib.alert = function(v) {
	js.Node.console.log(js.Boot.__string_rec(v,""));
}
js.Lib.print = function(v) {
	console.log(v);
}
js.Lib.eval = function(code) {
	return eval(code);
}
js.Lib.setErrorHandler = function(f) {
	js.Lib.onerror = f;
}
js.Lib.prototype.__class__ = js.Lib;
js.Boot = function() { }
js.Boot.__name__ = ["js","Boot"];
js.Boot.__unhtml = function(s) {
	return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
}
js.Boot.__trace = function(v,i) {
	var msg = i != null?i.fileName + ":" + i.lineNumber + ": ":"";
	msg += js.Boot.__string_rec(v,"");
	js.Node.console.log(msg);
}
js.Boot.__clear_trace = function() {
	var d = document.getElementById("haxe:trace");
	if(d != null) d.innerHTML = "";
}
js.Boot.__closure = function(o,f) {
	var m = o[f];
	if(m == null) return null;
	var f1 = function() {
		return m.apply(o,arguments);
	};
	f1.scope = o;
	f1.method = m;
	return f1;
}
js.Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ != null || o.__ename__ != null)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__ != null) {
				if(o.length == 2) return o[0];
				var str = o[0] + "(";
				s += "\t";
				var _g1 = 2, _g = o.length;
				while(_g1 < _g) {
					var i = _g1++;
					if(i != 2) str += "," + js.Boot.__string_rec(o[i],s); else str += js.Boot.__string_rec(o[i],s);
				}
				return str + ")";
			}
			var l = o.length;
			var i;
			var str = "[";
			s += "\t";
			var _g = 0;
			while(_g < l) {
				var i1 = _g++;
				str += (i1 > 0?",":"") + js.Boot.__string_rec(o[i1],s);
			}
			str += "]";
			return str;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString) {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) { ;
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__") {
			continue;
		}
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js.Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
}
js.Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0, _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js.Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js.Boot.__interfLoop(cc.__super__,cl);
}
js.Boot.__instanceof = function(o,cl) {
	try {
		if(o instanceof cl) {
			if(cl == Array) return o.__enum__ == null;
			return true;
		}
		if(js.Boot.__interfLoop(o.__class__,cl)) return true;
	} catch( e ) {
		if(cl == null) return false;
	}
	switch(cl) {
	case Int:
		return Math.ceil(o%2147483648.0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return o === true || o === false;
	case String:
		return typeof(o) == "string";
	case Dynamic:
		return true;
	default:
		if(o == null) return false;
		return o.__enum__ == cl || cl == Class && o.__name__ != null || cl == Enum && o.__ename__ != null;
	}
}
js.Boot.__init = function() {
	Array.prototype.copy = Array.prototype.slice;
	Array.prototype.insert = function(i,x) {
		this.splice(i,0,x);
	};
	Array.prototype.remove = Array.prototype.indexOf?function(obj) {
		var idx = this.indexOf(obj);
		if(idx == -1) return false;
		this.splice(idx,1);
		return true;
	}:function(obj) {
		var i = 0;
		var l = this.length;
		while(i < l) {
			if(this[i] == obj) {
				this.splice(i,1);
				return true;
			}
			i++;
		}
		return false;
	};
	Array.prototype.iterator = function() {
		return { cur : 0, arr : this, hasNext : function() {
			return this.cur < this.arr.length;
		}, next : function() {
			return this.arr[this.cur++];
		}};
	};
	if(String.prototype.cca == null) String.prototype.cca = String.prototype.charCodeAt;
	String.prototype.charCodeAt = function(i) {
		var x = this.cca(i);
		if(x != x) return null;
		return x;
	};
	var oldsub = String.prototype.substr;
	String.prototype.substr = function(pos,len) {
		if(pos != null && pos != 0 && len != null && len < 0) return "";
		if(len == null) len = this.length;
		if(pos < 0) {
			pos = this.length + pos;
			if(pos < 0) pos = 0;
		} else if(len < 0) len = this.length + len - pos;
		return oldsub.apply(this,[pos,len]);
	};
	Function.prototype["$bind"] = function(o) {
		var f = function() {
			return f.method.apply(f.scope,arguments);
		};
		f.scope = o;
		f.method = this;
		return f;
	};
	$closure = js.Boot.__closure;
}
js.Boot.prototype.__class__ = js.Boot;
EReg = function(r,opt) {
	if( r === $_ ) return;
	opt = opt.split("u").join("");
	this.r = new RegExp(r,opt);
}
EReg.__name__ = ["EReg"];
EReg.prototype.r = null;
EReg.prototype.match = function(s) {
	this.r.m = this.r.exec(s);
	this.r.s = s;
	this.r.l = RegExp.leftContext;
	this.r.r = RegExp.rightContext;
	return this.r.m != null;
}
EReg.prototype.matched = function(n) {
	return this.r.m != null && n >= 0 && n < this.r.m.length?this.r.m[n]:(function($this) {
		var $r;
		throw "EReg::matched";
		return $r;
	}(this));
}
EReg.prototype.matchedLeft = function() {
	if(this.r.m == null) throw "No string matched";
	if(this.r.l == null) return this.r.s.substr(0,this.r.m.index);
	return this.r.l;
}
EReg.prototype.matchedRight = function() {
	if(this.r.m == null) throw "No string matched";
	if(this.r.r == null) {
		var sz = this.r.m.index + this.r.m[0].length;
		return this.r.s.substr(sz,this.r.s.length - sz);
	}
	return this.r.r;
}
EReg.prototype.matchedPos = function() {
	if(this.r.m == null) throw "No string matched";
	return { pos : this.r.m.index, len : this.r.m[0].length};
}
EReg.prototype.split = function(s) {
	var d = "#__delim__#";
	return s.replace(this.r,d).split(d);
}
EReg.prototype.replace = function(s,by) {
	return s.replace(this.r,by);
}
EReg.prototype.customReplace = function(s,f) {
	var buf = new StringBuf();
	while(true) {
		if(!this.match(s)) break;
		buf.add(this.matchedLeft());
		buf.add(f(this));
		s = this.matchedRight();
	}
	buf.b[buf.b.length] = s == null?"null":s;
	return buf.b.join("");
}
EReg.prototype.__class__ = EReg;
pokemmo_s.exts.ArrayExt = function() { }
pokemmo_s.exts.ArrayExt.__name__ = ["pokemmo_s","exts","ArrayExt"];
pokemmo_s.exts.ArrayExt.random = function(arr) {
	return arr[Math.floor(arr.length * Math.random())];
}
pokemmo_s.exts.ArrayExt.prototype.__class__ = pokemmo_s.exts.ArrayExt;
pokemmo_s.Map = function(id) {
	if( id === $_ ) return;
	this.id = id;
	this.numInstances = 0;
	js.Node.process.stdout.write("Loading: " + id + "...");
	var sStart = Date.now().getTime();
	this.encounterAreas = [];
	this.warps = new Hash();
	this.points = new Hash();
	this.instances = new Hash();
	this.data = js.Node.parse(js.Node.fs.readFileSync("../site/resources/maps/" + id + ".json","utf8"));
	this.width = this.data.width;
	this.height = this.data.height;
	if(this.data.properties.players_per_instance == null) this.playersPerInstance = 0; else this.playersPerInstance = Std.parseInt(this.data.properties.players_per_instance);
	if(this.data.properties.grass_encounters != null) this.grassEncounters = js.Node.parse("{\"tmp\":[" + this.data.properties.grass_encounters + "]}").tmp;
	var _g = 0, _g1 = this.data.layers;
	while(_g < _g1.length) {
		var layer = _g1[_g];
		++_g;
		if(layer.type == "tilelayer") {
			if(layer.properties == null || layer.properties.data_layer != "1") continue;
			var j = 0;
			var twidth = this.data.width;
			var theight = this.data.height;
			this.solidData = new Array(twidth);
			var _g2 = 0;
			while(_g2 < twidth) {
				var x = _g2++;
				this.solidData[x] = new Array(theight);
				var _g3 = 0;
				while(_g3 < theight) {
					var y = _g3++;
					this.solidData[x][y] = 0;
				}
			}
			var _g2 = 0;
			while(_g2 < theight) {
				var y = _g2++;
				var _g3 = 0;
				while(_g3 < twidth) {
					var x = _g3++;
					var tileid = layer.data[j];
					if(tileid == null || tileid == 0) {
						++j;
						continue;
					}
					var tileset = this.getTilesetOfTile(tileid);
					if(tileset == null) "Tileset is null";
					var curTilesetTileid = tileid - tileset.firstgid;
					if(tileset.tileproperties[curTilesetTileid] != null) {
						if(tileset.tileproperties[curTilesetTileid].solid == "1") this.solidData[x][y] = 1; else if(tileset.tileproperties[curTilesetTileid].water == "1") this.solidData[x][y] = 2; else if(tileset.tileproperties[curTilesetTileid].grass == "1") this.solidData[x][y] = 7; else if(tileset.tileproperties[curTilesetTileid].ledge == "1") {
							this.solidData[x][y] = 3;
							if(tileset.tileproperties[curTilesetTileid].ledge_dir == "1") this.solidData[x][y] = 4; else if(tileset.tileproperties[curTilesetTileid].ledge_dir == "2") this.solidData[x][y] = 5; else if(tileset.tileproperties[curTilesetTileid].ledge_dir == "3") this.solidData[x][y] = 6;
						}
					}
					++j;
				}
			}
		} else if(layer.type == "objectgroup") {
			var _g2 = 0, _g3 = layer.objects;
			while(_g2 < _g3.length) {
				var obj = _g3[_g2];
				++_g2;
				var x1 = Math.round(obj.x / this.data.tilewidth);
				var y1 = Math.round(obj.y / this.data.tileheight);
				var x2 = Math.round((obj.x + obj.width) / this.data.tilewidth);
				var y2 = Math.round((obj.y + obj.height) / this.data.tileheight);
				switch(obj.type) {
				case "tall_grass":
					var encounters = js.Node.parse("{\"tmp\":[" + obj.properties.encounters + "]}").tmp;
					this.encounterAreas.push({ x1 : x1, y1 : y1, x2 : x2, y2 : y2, encounters : encounters});
					break;
				case "warp":
					this.warps.set(obj.name,{ x : x1, y : y1, type : obj.properties.type, destination : js.Node.parse(obj.properties.destination)});
					break;
				case "point":
					this.points.set(obj.name,{ mapName : id, x : x1, y : y1, direction : obj.properties.direction == null?0:obj.properties.direction});
					break;
				}
			}
		}
	}
	if(this.solidData == null) console.warn("Couldn't find data layer!");
	var sEnd = Date.now().getTime();
	js.Node.process.stdout.write(" (" + (sEnd - sStart) + " ms)\n");
}
pokemmo_s.Map.__name__ = ["pokemmo_s","Map"];
pokemmo_s.Map.prototype.id = null;
pokemmo_s.Map.prototype.data = null;
pokemmo_s.Map.prototype.width = null;
pokemmo_s.Map.prototype.height = null;
pokemmo_s.Map.prototype.solidData = null;
pokemmo_s.Map.prototype.encounterAreas = null;
pokemmo_s.Map.prototype.warps = null;
pokemmo_s.Map.prototype.points = null;
pokemmo_s.Map.prototype.instances = null;
pokemmo_s.Map.prototype.numInstances = null;
pokemmo_s.Map.prototype.playersPerInstance = null;
pokemmo_s.Map.prototype.grassEncounters = null;
pokemmo_s.Map.prototype.getEncounterAreasAt = function(x,y) {
	var arr = [];
	var _g = 0, _g1 = this.encounterAreas;
	while(_g < _g1.length) {
		var e = _g1[_g];
		++_g;
		if(x >= e.x1 && y >= e.y1 && x < e.x2 && y < e.y2) arr.push(e);
	}
	return arr;
}
pokemmo_s.Map.prototype.createInstance = function() {
	var id;
	do id = pokemmo_s.Utils.createRandomString(6); while(this.instances.exists(id));
	var i = new pokemmo_s.MapInstance(this,id);
	this.instances.set(id,i);
	return i;
}
pokemmo_s.Map.prototype.getTilesetOfTile = function(n) {
	var i = this.data.tilesets.length;
	while(i-- > 0) if(n >= this.data.tilesets[i].firstgid) return this.data.tilesets[i];
	return null;
}
pokemmo_s.Map.prototype.getWarp = function(name) {
	return this.warps.get(name);
}
pokemmo_s.Map.prototype.__class__ = pokemmo_s.Map;
Hash = function(p) {
	if( p === $_ ) return;
	this.h = {}
	if(this.h.__proto__ != null) {
		this.h.__proto__ = null;
		delete(this.h.__proto__);
	}
}
Hash.__name__ = ["Hash"];
Hash.prototype.h = null;
Hash.prototype.set = function(key,value) {
	this.h["$" + key] = value;
}
Hash.prototype.get = function(key) {
	return this.h["$" + key];
}
Hash.prototype.exists = function(key) {
	try {
		key = "$" + key;
		return this.hasOwnProperty.call(this.h,key);
	} catch( e ) {
		for(var i in this.h) if( i == key ) return true;
		return false;
	}
}
Hash.prototype.remove = function(key) {
	if(!this.exists(key)) return false;
	delete(this.h["$" + key]);
	return true;
}
Hash.prototype.keys = function() {
	var a = new Array();
	for(var i in this.h) a.push(i.substr(1));
	return a.iterator();
}
Hash.prototype.iterator = function() {
	return { ref : this.h, it : this.keys(), hasNext : function() {
		return this.it.hasNext();
	}, next : function() {
		var i = this.it.next();
		return this.ref["$" + i];
	}};
}
Hash.prototype.toString = function() {
	var s = new StringBuf();
	s.b[s.b.length] = "{" == null?"null":"{";
	var it = this.keys();
	while( it.hasNext() ) {
		var i = it.next();
		s.b[s.b.length] = i == null?"null":i;
		s.b[s.b.length] = " => " == null?"null":" => ";
		s.add(Std.string(this.get(i)));
		if(it.hasNext()) s.b[s.b.length] = ", " == null?"null":", ";
	}
	s.b[s.b.length] = "}" == null?"null":"}";
	return s.b.join("");
}
Hash.prototype.__class__ = Hash;
$_ = {}
js.Boot.__res = {}
js.Boot.__init();
{
	js.Node.__filename = __filename;
	js.Node.__dirname = __dirname;
	js.Node.setTimeout = setTimeout;
	js.Node.clearTimeout = clearTimeout;
	js.Node.setInterval = setInterval;
	js.Node.clearInterval = clearInterval;
	js.Node.global = global;
	js.Node.process = process;
	js.Node.require = require;
	js.Node.console = console;
	js.Node.module = module;
	js.Node.stringify = JSON.stringify;
	js.Node.parse = JSON.parse;
	js.Node.util = js.Node.require("util");
	js.Node.fs = js.Node.require("fs");
	js.Node.net = js.Node.require("net");
	js.Node.http = js.Node.require("http");
	js.Node.https = js.Node.require("https");
	js.Node.path = js.Node.require("path");
	js.Node.url = js.Node.require("url");
	js.Node.os = js.Node.require("os");
	js.Node.crypto = js.Node.require("crypto");
	js.Node.dns = js.Node.require("dns");
	js.Node.queryString = js.Node.require("querystring");
	js.Node.assert = js.Node.require("assert");
	js.Node.childProcess = js.Node.require("child_process");
	js.Node.vm = js.Node.require("vm");
	js.Node.tls = js.Node.require("tls");
	js.Node.dgram = js.Node.require("dgram");
	js.Node.assert = js.Node.require("assert");
	js.Node.repl = js.Node.require("repl");
	js.Node.cluster = js.Node.require("cluster");
}
{
	var d = Date;
	d.now = function() {
		return new Date();
	};
	d.fromTime = function(t) {
		var d1 = new Date();
		d1["setTime"](t);
		return d1;
	};
	d.fromString = function(s) {
		switch(s.length) {
		case 8:
			var k = s.split(":");
			var d1 = new Date();
			d1["setTime"](0);
			d1["setUTCHours"](k[0]);
			d1["setUTCMinutes"](k[1]);
			d1["setUTCSeconds"](k[2]);
			return d1;
		case 10:
			var k = s.split("-");
			return new Date(k[0],k[1] - 1,k[2],0,0,0);
		case 19:
			var k = s.split(" ");
			var y = k[0].split("-");
			var t = k[1].split(":");
			return new Date(y[0],y[1] - 1,y[2],t[0],t[1],t[2]);
		default:
			throw "Invalid date format : " + s;
		}
	};
	d.prototype["toString"] = function() {
		var date = this;
		var m = date.getMonth() + 1;
		var d1 = date.getDate();
		var h = date.getHours();
		var mi = date.getMinutes();
		var s = date.getSeconds();
		return date.getFullYear() + "-" + (m < 10?"0" + m:"" + m) + "-" + (d1 < 10?"0" + d1:"" + d1) + " " + (h < 10?"0" + h:"" + h) + ":" + (mi < 10?"0" + mi:"" + mi) + ":" + (s < 10?"0" + s:"" + s);
	};
	d.prototype.__class__ = d;
	d.__name__ = ["Date"];
}
{
	String.prototype.__class__ = String;
	String.__name__ = ["String"];
	Array.prototype.__class__ = Array;
	Array.__name__ = ["Array"];
	Int = { __name__ : ["Int"]};
	Dynamic = { __name__ : ["Dynamic"]};
	Float = Number;
	Float.__name__ = ["Float"];
	Bool = { __ename__ : ["Bool"]};
	Class = { __name__ : ["Class"]};
	Enum = { };
	Void = { __ename__ : ["Void"]};
}
{
	Math.__name__ = ["Math"];
	Math.NaN = Number["NaN"];
	Math.NEGATIVE_INFINITY = Number["NEGATIVE_INFINITY"];
	Math.POSITIVE_INFINITY = Number["POSITIVE_INFINITY"];
	Math.isFinite = function(i) {
		return isFinite(i);
	};
	Math.isNaN = function(i) {
		return isNaN(i);
	};
}
onerror = function(msg,url,line) {
		var f = js.Lib.onerror;
		if( f == null )
			return false;
		return f(msg,[url+":"+line]);
	}
pokemmo_s.GameConst.SPEED_HACK_N = 12;
pokemmo_s.GameConst.DIR_DOWN = 0;
pokemmo_s.GameConst.DIR_LEFT = 1;
pokemmo_s.GameConst.DIR_UP = 2;
pokemmo_s.GameConst.DIR_RIGHT = 3;
pokemmo_s.GameConst.LOAD_MAPS = ["pallet","pallet_hero_home_1f","pallet_hero_home_2f","pallet_oaklab","pallet_rival_home","pewter","viridianflorest"];
js.NodeC.UTF8 = "utf8";
js.NodeC.ASCII = "ascii";
js.NodeC.BINARY = "binary";
js.NodeC.BASE64 = "base64";
js.NodeC.HEX = "hex";
js.NodeC.EVENT_EVENTEMITTER_NEWLISTENER = "newListener";
js.NodeC.EVENT_EVENTEMITTER_ERROR = "error";
js.NodeC.EVENT_STREAM_DATA = "data";
js.NodeC.EVENT_STREAM_END = "end";
js.NodeC.EVENT_STREAM_ERROR = "error";
js.NodeC.EVENT_STREAM_CLOSE = "close";
js.NodeC.EVENT_STREAM_DRAIN = "drain";
js.NodeC.EVENT_STREAM_CONNECT = "connect";
js.NodeC.EVENT_STREAM_SECURE = "secure";
js.NodeC.EVENT_STREAM_TIMEOUT = "timeout";
js.NodeC.EVENT_STREAM_PIPE = "pipe";
js.NodeC.EVENT_PROCESS_EXIT = "exit";
js.NodeC.EVENT_PROCESS_UNCAUGHTEXCEPTION = "uncaughtException";
js.NodeC.EVENT_PROCESS_SIGINT = "SIGINT";
js.NodeC.EVENT_PROCESS_SIGUSR1 = "SIGUSR1";
js.NodeC.EVENT_CHILDPROCESS_EXIT = "exit";
js.NodeC.EVENT_HTTPSERVER_REQUEST = "request";
js.NodeC.EVENT_HTTPSERVER_CONNECTION = "connection";
js.NodeC.EVENT_HTTPSERVER_CLOSE = "close";
js.NodeC.EVENT_HTTPSERVER_UPGRADE = "upgrade";
js.NodeC.EVENT_HTTPSERVER_CLIENTERROR = "clientError";
js.NodeC.EVENT_HTTPSERVERREQUEST_DATA = "data";
js.NodeC.EVENT_HTTPSERVERREQUEST_END = "end";
js.NodeC.EVENT_CLIENTREQUEST_RESPONSE = "response";
js.NodeC.EVENT_CLIENTRESPONSE_DATA = "data";
js.NodeC.EVENT_CLIENTRESPONSE_END = "end";
js.NodeC.EVENT_NETSERVER_CONNECTION = "connection";
js.NodeC.EVENT_NETSERVER_CLOSE = "close";
js.NodeC.FILE_READ = "r";
js.NodeC.FILE_READ_APPEND = "r+";
js.NodeC.FILE_WRITE = "w";
js.NodeC.FILE_WRITE_APPEND = "a+";
js.NodeC.FILE_READWRITE = "a";
js.NodeC.FILE_READWRITE_APPEND = "a+";
pokemmo_s.Pokemon.MAX_LEVEL = 100;
pokemmo_s.Pokemon.MAX_MOVES = 4;
pokemmo_s.Pokemon.STATUS_NONE = 0;
pokemmo_s.Pokemon.STATUS_SLEEP = 1;
pokemmo_s.Pokemon.STATUS_FREEZE = 2;
pokemmo_s.Pokemon.STATUS_PARALYZE = 3;
pokemmo_s.Pokemon.STATUS_POISON = 4;
pokemmo_s.Pokemon.STATUS_BURN = 5;
pokemmo_s.Pokemon.GENDER_UNKNOWN = 0;
pokemmo_s.Pokemon.GENDER_MALE = 1;
pokemmo_s.Pokemon.GENDER_FEMALE = 2;
pokemmo_s.Pokemon.VIRUS_NONE = 0;
pokemmo_s.Pokemon.VIRUS_POKERUS = 1;
pokemmo_s.Pokemon.NATURE_NONE = 0;
pokemmo_s.Pokemon.BALL_MULT = 0;
pokemmo_s.Pokemon.BALL_ADD = 1;
pokemmo_s.Pokemon.NATURE_ATK_DEF = 1;
pokemmo_s.Pokemon.NATURE_ATK_SPATK = 2;
pokemmo_s.Pokemon.NATURE_ATK_SPDEF = 3;
pokemmo_s.Pokemon.NATURE_ATK_SPEED = 4;
pokemmo_s.Pokemon.NATURE_DEF_ATK = 5;
pokemmo_s.Pokemon.NATURE_DEF_SPATK = 6;
pokemmo_s.Pokemon.NATURE_DEF_SPDEF = 7;
pokemmo_s.Pokemon.NATURE_DEF_SPEED = 8;
pokemmo_s.Pokemon.NATURE_SPATK_ATK = 9;
pokemmo_s.Pokemon.NATURE_SPATK_DEF = 10;
pokemmo_s.Pokemon.NATURE_SPATK_SPDEF = 11;
pokemmo_s.Pokemon.NATURE_SPATK_SPEED = 12;
pokemmo_s.Pokemon.NATURE_SPDEF_ATK = 13;
pokemmo_s.Pokemon.NATURE_SPDEF_DEF = 14;
pokemmo_s.Pokemon.NATURE_SPDEF_SPATK = 15;
pokemmo_s.Pokemon.NATURE_SPDEF_SPEED = 16;
pokemmo_s.Pokemon.NATURE_SPEED_ATK = 17;
pokemmo_s.Pokemon.NATURE_SPEED_DEF = 18;
pokemmo_s.Pokemon.NATURE_SPEED_SPATK = 19;
pokemmo_s.Pokemon.NATURE_SPEED_SPDEF = 20;
pokemmo_s.Pokemon.NATURE_NONE_ATK = 21;
pokemmo_s.Pokemon.NATURE_NONE_DEF = 22;
pokemmo_s.Pokemon.NATURE_NONE_SPATK = 23;
pokemmo_s.Pokemon.NATURE_NONE_SPDEF = 24;
pokemmo_s.Pokemon.NATURE_NONE_SPEED = 25;
pokemmo_s.Pokemon.MAX_EV = 510;
pokemmo_s.Pokemon.MAX_INDIVIDUAL_EV = 255;
pokemmo_s.Pokemon.pokemonSaveFields = ["id","level","unique","gender","ability","experience","nature","status","virus","shiny","moves","movesPP","movesMaxPP","hp","evHp","evAtk","evDef","evSpAtk","evSpDef","evSpeed","ivHp","ivAtk","ivDef","ivSpAtk","ivSpDef","ivSpeed"];
pokemmo_s.Battle.BATTLE_WILD = 0;
pokemmo_s.Battle.BATTLE_TRAINER = 1;
pokemmo_s.Battle.BATTLE_VERSUS = 2;
pokemmo_s.Battle.powerMultipler = {"-6": 2/8,"-5": 2/7,"-4": 2/6,"-3": 2/5,"-2": 2/4,"-1": 2/3,"0": 1,"1": 1.5,"2": 2,"3": 2.5,"4": 3,"5": 3.5,"6": 4}
pokemmo_s.Battle.accuracyMultipler = {"-6": 3/9,"-5": 3/8,"-4": 3/7,"-3": 3/6,"-2": 3/5,"-1": 3/4,"0": 1,"1": 4/3,"2": 5/3,"3": 2,"4": 7/3,"5": 8/3,"6": 3,}
pokemmo_s.ClientCharacter.SPEED_HACK_N = 12;
pokemmo_s.ServerConst.MAX_CLIENTS = 200;
pokemmo_s.ServerConst.pokemonStarters = ["1","4","7","10","13","16","25","29","32","43","60","66","69","74","92","133"];
pokemmo_s.ServerConst.characterSprites = ["red","red_-135","JZJot","22jM7"];
js.Lib.onerror = null;
pokemmo_s.Map.SD_NONE = 0;
pokemmo_s.Map.SD_SOLID = 1;
pokemmo_s.Map.SD_WATER = 2;
pokemmo_s.Map.SD_LEDGE_DOWN = 3;
pokemmo_s.Map.SD_LEDGE_LEFT = 4;
pokemmo_s.Map.SD_LEDGE_UP = 5;
pokemmo_s.Map.SD_LEDGE_RIGHT = 6;
pokemmo_s.Map.SD_GRASS = 7;
pokemmo_s.Map.LAYER_TILELAYER = "tilelayer";
pokemmo_s.Map.LAYER_OBJECTGROUP = "objectgroup";
pokemmo_s.Main.main()