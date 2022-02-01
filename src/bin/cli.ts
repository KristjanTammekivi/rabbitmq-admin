#!/usr/bin/env node

import { Command } from 'commander';
import { nextTick } from 'process';
import { RabbitAdmin } from '../rabbit-admin';

const program = new Command('rabbitmq-admin');

let admin: ReturnType<typeof RabbitAdmin>;

program
    .option('-U, --user <user>', 'Username for authentication')
    .option('-P, --pass <pass>', 'Password for authentication')
    .hook('preAction', () => {
        admin = RabbitAdmin({
            user: program.opts().user,
            pass: program.opts().pass
        });
    });

program
    .command('overview')
    .description('Get information about the whole system')
    .action(async () => {
        console.log(JSON.stringify(await admin.getOverview()));
    });

program
    .command('cluster-name')
    .description('Get the name of the cluster')
    .option('-n, --name <name>', 'Set the name of the cluster')
    .action(async ({ name }) => {
        if (name) {
            await admin.setClusterName(name);
        } else {
            console.log(await admin.getClusterName());
        }
    });

program
    .command('nodes')
    .description('Get a list of nodes in the cluster. If no node name is given, all nodes are listed')
    .option('-n, --node <node>', 'Return this single node')
    .action(async ({ name }) => {
        if (name) {
            console.log(JSON.stringify(await admin.getNode(name)));
        } else {
            console.log(JSON.stringify(await admin.getNodes()));
        }
    });

program
    .command('extensions')
    .description('Get a list of installed management plugins')
    .action(async () => {
        console.log(JSON.stringify(await admin.getExtensions()));
    });

// TODO: add setDefintions?
program
    .command('definitions')
    .description('Get a list of server definitions such as exchanges, queues, users, virtual hosts, permissions, topic permissions and parameters, everything excecpt messages')
    .option('-v, --vhost <vhost>', 'Return definitions for this vhost')
    .action(async ({ vhost }) => {
        console.log(JSON.stringify(await admin.getDefinitions(vhost)));
    });

program
    .command('connections')
    .description('Get a list of connections. Paginated.')
    .option('-p, --page <page>', 'Pagination page')
    .option('-s, --size <size>', 'Pagination size')
    .option('-n, --name <name>', 'Filter by name')
    .option('-r, --regex <regex>', 'Filter by regex')
    .option('-v, --vhost <vhost>', 'Filter by vhost')
    .action(async ({ page, size, name, regex, vhost }) => {
        if (name && regex) {
            throw new Error('Cannot filter by both name and regex');
        }
        const useRegex = !!regex;
        const nameFilter = name || regex;
        if (vhost) {
            console.log(JSON.stringify(await admin.getVhostConnections(vhost, {
                page,
                pageSize: parseInt(size, 10),
                name: nameFilter,
                useRegex
            })));
        } else {
            console.log(JSON.stringify(await admin.getConnections({
                page,
                pageSize: parseInt(size, 10),
                name: nameFilter,
                useRegex
            })));
        }
    });

const vhosts = program
    .command('vhost');

vhosts
    .command('list')
    .option('-v, --vhost <vhost>', 'name of the vhost')
    .action(async ({ vhost }) => {
        if (vhost) {
            console.log(JSON.stringify(await admin.getVhost(vhost)));
        } else {
            console.log(JSON.stringify(await admin.listVhosts()));
        }
    });

vhosts
    .command('create')
    .requiredOption('-v, --vhost <vhost>', 'name of the vhost')
    .action(async ({ vhost }) => {
        const result = await admin.createVhost(vhost);
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
        const result = await admin.setUserPermissions(cmd.vhost, cmd.user, {
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
        console.log(await admin.getUserPermissions(vhost, user));
    });

program
    .command('consumers')
    .option('-v, --vhost <vhost>', 'name of the vhost')
    .action(async ({ vhost }) => {
        console.log(await admin.getConsumers(vhost));
    });

const queues = program
    .command('queue');

queues
    .command('list')
    .requiredOption('-v, --vhost <vhost>', 'name of the vhost')
    .option('-q, --queue <queue>', 'name of the queue')
    .action(async ({ vhost, queue }) => {
        if (queue) {
            console.log(await admin.getVhostQueue(vhost, queue));
        } else {
            const result = await admin.getVhostQueues(vhost);
            console.log(JSON.stringify(result));
        }

    });

nextTick(async () => {
    await program.parseAsync(process.argv);
});
