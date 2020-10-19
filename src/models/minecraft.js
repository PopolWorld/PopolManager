// Import modules
const fs = require('fs');
const yaml = require('js-yaml');
const { spawn } = require('child_process');
const server = require('./server');

// Store instances
let instances = [];

// Create a class for servers (model)
class MinecraftServer {

    // Instances
    static getInstances() {
        if (!instances) {
            instances = [];
        }
        return instances;
    }

    // Constructor
    constructor(serv) {
        // Add instance
        this.serv = serv;
        MinecraftServer.getInstances().push(this);

        // Init and start server
        console.log('Starting minecraft server id:' + serv.id + '...')
        try {
            // Check folders
            if (!fs.existsSync('./minecraft')) {
                fs.mkdirSync('./minecraft')
            }
            if (!fs.existsSync('./minecraft/' + serv.id)) {
                fs.mkdirSync('./minecraft/' + serv.id)
            }

            // Check for software
            if (!fs.existsSync('./minecraft/' + serv.id + '/' + serv.software)) {
                console.log('File ' + serv.software + ' not found for server ' + serv.id)
                return
            }

            // Generate a token
            serv.token = this.generateToken(32);
            serv.status = 'starting';
            serv.save();

            // Updating configuration
            if (!fs.existsSync('./minecraft/' + serv.id + '/plugins')) {
                fs.mkdirSync('./minecraft/' + serv.id + '/plugins')
            }
            if (!fs.existsSync('./minecraft/' + serv.id + '/plugins/PopolServer')) {
                fs.mkdirSync('./minecraft/' + serv.id + '/plugins/PopolServer')
            }
            fs.writeFileSync('./minecraft/' + serv.id + '/plugins/PopolServer/config.yml', yaml.safeDump({
                'id': serv.id,
                'token': serv.token
            }));

            // Launching server...
            this.process = spawn('java',
                [
                    '-jar',
                    serv.software,
                    'nogui'
                ],
                {
                    cwd: './minecraft/' + serv.id
                }
            );
            this.process.stdout.on('data', data => this.log(data))
            this.process.on('close', () => {
                this.serv.token = '';
                this.serv.status = 'offline';
                this.serv.save();
            })
        } catch (err) {
            console.error(err)
        }
    }

    log(str) {
        this.logs += str;
    }

    generateToken(length) {
        var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");
        var b = [];
        for (var i = 0; i < length; i++) {
            var j = (Math.random() * (a.length - 1)).toFixed(0);
            b[i] = a[j];
        }
        return b.join("");
    }

}

// Export class
module.exports = MinecraftServer;