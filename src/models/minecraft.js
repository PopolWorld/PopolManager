// Import modules
const fs = require('fs');
const yaml = require('js-yaml');
const { spawn } = require('child_process');
const server = require('./server');

// Store instances
let instances = [];
let running = true;
let exitHandler = undefined;

// Create a class for servers (model)
class MinecraftServer {

    // Instances
    static getInstances() {
        if (!instances) {
            instances = [];
        }
        return instances;
    }

    // Stop all
    static stopAll(handler) {
        // Stop running
        running = false;
        exitHandler = handler;

        // If instances are empty
        if (instances.length == 0) {
            exitHandler();
        }

        // Stop all
        instances.forEach(serv => serv.dispatchCommand('stop'));
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
            if (!fs.existsSync('./minecraft')) { fs.mkdirSync('./minecraft') }
            const path = './minecraft/' + serv.id;
            if (!fs.existsSync(path)) { fs.mkdirSync(path) }

            // Check for software
            if (!fs.existsSync(path + '/' + serv.software)) {
                console.log('File ' + serv.software + ' not found for server ' + serv.id)
                return
            }

            // Generate a token
            this.serv.token = this.generateToken(32);
            this.serv.status = 'starting';
            this.serv.save();

            // Updating configuration
            if (!fs.existsSync(path + '/plugins')) { fs.mkdirSync(path + '/plugins') }
            if (!fs.existsSync(path + '/plugins/PopolServer')) { fs.mkdirSync(path + '/plugins/PopolServer') }
            fs.writeFileSync(path + '/plugins/PopolServer/config.yml', yaml.safeDump({
                'id': this.serv.id,
                'token': this.serv.token
            }));
            fs.writeFileSync(path + '/eula.txt', 'eula=true');

            // Launching server...
            this.process = spawn('java',
                ['-jar', this.serv.software, '-p', this.serv.port, 'nogui'],
                { cwd: path }
            );
            this.process.stdout.on('data', data => this.log(data))
            this.process.on('close', async () => {
                // Remove from array
                for (var i = 0; i < instances.length; i++) {
                    if (instances[i].serv.id === this.serv.id) {
                        instances.splice(i, 1);
                        break;
                    }
                }

                // Update status
                await this.serv.reload();
                this.serv.token = '';
                this.serv.status = 'offline';
                await this.serv.save();

                // Check if no more running and has an exit handler
                if (!running && exitHandler != undefined && instances.length == 0) {
                    exitHandler();
                }
            })
        } catch (err) {
            console.error(err)
        }
    }

    log(str) {
        // Update string
        str = str.toString().trim();

        // Don't append '>'
        if (str == '>') { return }

        // Append to logs
        this.logs += str + '\n';

        // Log
        console.log('[' + this.serv.id + '] ' + str);
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

    dispatchCommand(cmd) {
        if (this.process != undefined) {
            this.process.stdin.write(cmd.toString().trim() + '\n');
        }
    }

}

// Task to start offline servers
setInterval(async () => {
    // Check we are running
    if (running) {
        // Fetch offline servers
        const servers = await server.findAll({
            where: { status: 'offline' }
        });

        // Start them
        servers.forEach(serv => new MinecraftServer(serv));
    }
}, 10000);

// Export class
module.exports = MinecraftServer;