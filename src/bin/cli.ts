import { Command } from 'commander';
import { RabbitAdmin } from '..';

const program = new Command('rabbitmq-admin');

program
    .option('-U, --user <user>', 'Username for authentication')
    .option('-P, --pass <pass>', 'Password for authentication');

const vhosts = program
    .command('vhost');

vhosts
    .command('list')
    .option('-v, --vhost <vhost>', 'name of the vhost')
    .action(async ({ vhost }) => {
        const admin = RabbitAdmin({
            user: program.opts().user,
            pass: program.opts().pass
        });
        if (vhost) {
            console.log(await admin.getVhost(vhost));
        } else {
            console.log(await admin.listVhosts());
        }
    });

vhosts
    .command('create')
    .requiredOption('-v, --vhost <vhost>', 'name of the vhost')
    .action(async ({ vhost }) => {
        const rabbitAdmin = RabbitAdmin({ user: program.opts().user, pass: program.opts().pass });
        const result = await rabbitAdmin.createVhost(vhost);
        console.log(JSON.stringify(result));
    });

vhosts
    .command('delete')
    .requiredOption('-v, --vhost <vhost>', 'name of the vhost')
    .action(async ({ vhost }) => {
        const rabbitAdmin = RabbitAdmin({ user: program.opts().user, pass: program.opts().pass });
        await rabbitAdmin.deleteVhost(vhost);
    });


const permissions = program
    .command('permissions');

// options are configure, write, and read

permissions
    .command('set')
    .requiredOption('-u, --user <user>', 'Username to set permissions for')
    .requiredOption('-v, --vhost <vhost>', 'Vhost to set permissions for')
    .requiredOption('-c, --configure <configure>', 'Permissions for configure')
    .requiredOption('-w, --write <write>', 'Permissions for write')
    .requiredOption('-r, --read <read>', 'Permissions for read')
    .action(async (cmd) => {
        const rabbitAdmin = RabbitAdmin({ user: program.opts().user, pass: program.opts().pass });
        const result = await rabbitAdmin.setUserPermissions(cmd.vhost, cmd.user, {
            configure: cmd.configure,
            write: cmd.write,
            read: cmd.read
        });
        console.log(JSON.stringify(result));
    });

permissions
    .command('get')
    .requiredOption('-u, --user <user>', 'Username to set permissions for')
    .requiredOption('-v, --vhost <vhost>', 'Vhost to set permissions for')
    .action(async ({ vhost, user }) => {
        const rabbitAdmin = RabbitAdmin({ user: program.opts().user, pass: program.opts().pass });
        console.log(await rabbitAdmin.getUserPermissions(vhost, user));
    });

program
    .command('consumers')
    .option('-v, --vhost <vhost>', 'name of the vhost')
    .action(async ({ vhost }) => {
        const rabbitAdmin = RabbitAdmin({ user: program.opts().user, pass: program.opts().pass });
        console.log(await rabbitAdmin.getConsumers(vhost));
    });

const queues = program
    .command('queue');

queues
    .command('list')
    .requiredOption('-v, --vhost <vhost>', 'name of the vhost')
    .option('-q, --queue <queue>', 'name of the queue')
    .action(async ({ vhost, queue }) => {
        const rabbitAdmin = RabbitAdmin({ user: program.opts().user, pass: program.opts().pass });
        if (queue) {
            console.log(await rabbitAdmin.getVhostQueue(vhost, queue));
        } else {
            const result = await rabbitAdmin.getVhostQueues(vhost);
            console.log(JSON.stringify(result));
        }

    });

program.parse(process.argv);
