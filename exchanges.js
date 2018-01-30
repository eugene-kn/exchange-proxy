const { Cryptopia } = require('./cryptopia');
const exchanges = { Cryptopia };

class Exchanges {
    static async find(code) {
        return new Promise((resolve, reject) => {
            let exchange = null;

            db.query('SELECT * FROM exchanges WHERE code = ?', [code], (error, results, fields) => {
                if (error != null)
                    return reject(error);

                if (results.length == 0)
                    return reject(new Error(`No such exchange - ${code}`));

                let name = results[0].name;
                let id = results[0].id;

                if (!exchanges.hasOwnProperty(name))
                    return reject(new Error(`Exchange is not supported - ${code}`));
                
                exchange = new exchanges[name](id, code, name);
                resolve(exchange);
            });
        });
    }
}

exports.Exchanges = Exchanges;