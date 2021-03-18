const fs = require('fs');
const crypto = require('crypto');

class Authentication {
	constructor(db_path) {  // конструктор класса
		this.db_path = db_path;
		this.db = null;
		this.init()
	}

	init() {  // инициализируешь базу данных
		if (fs.existsSync(this.db_path, function(err) {  // если файла базы данных не существует, то создаем его
			if (err)
				console.log('fs.exists: ' + err);
		}) == false) {
			var json_object = {};
			json_object['users'] = {};
			fs.writeFileSync(this.db_path, JSON.stringify(json_object));
		}
		this.load();
	}

	save() {  // сохраняем базу данных
		fs.writeFileSync(this.db_path, JSON.stringify(this.db));
	}

	load() { // загружаем базу данных
		this.db = JSON.parse(fs.readFileSync(this.db_path, 'utf8'))
	}

	message(result, text) {  // отправляем сообщение пользователя
		return {"result": result, "message": text};
	}

	success(text) {  // сообщение, с успехом
		return this.message(true, text);
	}

	error(text) {  // сообщение с ошибкой
		return this.message(false, text);
	}

	userExists(login) {  // проверяет существует ли такой пользователь
		return this.db['users'].hasOwnProperty(login);
	}

	getMD5(text) {  // генерирует MD5 хеш строки
		var md5sum = crypto.createHash('md5');
		md5sum.update(text);
		return md5sum.digest('hex').toString();
	}

	register(login, password) {  // регистрация пользователя
		if (this.userExists(login))  // если такой пользователь уже есть то выдаем ошибку, иначе добавляем его в базу
			return this.error("User already exists");
		this.db['users'][login] = {};
		this.db['users'][login]['password'] = this.getMD5(password);
		this.save();
		return this.success("User registered");
	}

	login(login, password) {  // авторизация пользователя
		if (this.userExists(login)) {  // если такой пользователь есть то идем дальше, иначе отправляем сообщение с ошибкой
			if (this.getMD5(password) == this.db['users'][login]['password']) {  // если пароли совпадают то идем дальше, иначе отправляем сообщение с ошибкой
				this.save();
				return this.success("User logined");
			} else {
				return this.error("Password is incorrect");
			}
		} else {
			return this.error("User not exists");
		}
	}
}


exports.Authentication = Authentication;  // для доступа к классу аутентификатора
