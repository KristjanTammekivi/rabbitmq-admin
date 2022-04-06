#!/usr/bin/env node

import { Command, Option } from 'commander';
import { nextTick } from 'process';
import { RabbitAdmin } from '../rabbit-admin';
import { dump as yamlDump } from 'js-yaml';
import { PublishMessage } from '..';

const program = new Command('rabbitmq-admin');

let admin: ReturnType<typeof RabbitAdmin>;

const print = (data: any) => {
    const format = program.opts().format;
    switch (format) {
        case 'json':
            console.log(JSON.stringify(data));
            break;
        case 'json-pretty':
            console.log(JSON.stringify(data, null, 2));
            break;
        case 'yaml':
            console.log(yamlDump(data));
            break;
        default:
            throw new Error(`Unknown format ${ format }`);
    }
};

program
    .option('-U, --user <user>', 'Username for authentication')
    .option('-P, --pass <pass>', 'Password for authentication')
    .option('--format <format>', 'Output format. Accepted values: json | json-pretty', 'json')
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
        print(await admin.getOverview());
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
            print(await admin.getNode(name));
        } else {
            print(await admin.getNodes());
        }
    });

program
    .command('extensions')
    .description('Get a list of installed management plugins')
    .action(async () => {
        print(await admin.getExtensions());
    });

// TODO: add setDefintions?
program
    .command('definitions')
    .description('Get a list of server definitions such as exchanges, queues, users, virtual hosts, permissions, topic permissions and parameters, everything excecpt messages')
    .option('-v, --vhost <vhost>', 'Return definitions for this vhost')
    .action(async ({ vhost }) => {
        print(await admin.getDefinitions(vhost));
    });

const connections = program
    .command('connections');

connections
    .command('list')
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
            print(await admin.getVhostConnections(vhost, {
                page,
                pageSize: parseInt(size, 10),
                name: nameFilter,
                useRegex
            }));
        } else {
            print(await admin.getConnections({
                page,
                pageSize: parseInt(size, 10),
                name: nameFilter,
                useRegex
            }));
        }
    });

connections
    .command('get <name>')
    .description('Get a single connection')
    .action(async (name) => {
        print(await admin.getConnection(name));
    });

connections
    .command('close <name>')
    .description('Close a connection')
    .option('-r, --reason <reason>', 'Reason for closing the connection')
    .action(async (name, { reason }) => {
        await admin.closeConnection(name, reason);
    });

program
    .command('channels')
    .description('Get a list of channels. Paginated.')
    .option('-p, --page <page>', 'Pagination page')
    .option('-s, --size <size>', 'Pagination size')
    .option('-n, --name <name>', 'Filter by name')
    .option('-r, --regex <regex>', 'Filter by regex')
    .option('-v, --vhost <vhost>', 'Filter by vhost (pagination and search will not work)')
    .option('-c, --connection <connection>', 'Filter by connection (pagination and search will not work)')
    .option('--channel <channel>', 'Get specific channel (all other options will be ignored)')
    .action(async ({ page, size, name, regex, vhost, connection, channel }) => {
        if (name && regex) {
            throw new Error('Cannot filter by both name and regex');
        }
        const useRegex = !!regex;
        const nameFilter = name || regex;
        const paginationOptions = {
            page,
            pageSize: parseInt(size, 10) || undefined,
            name: nameFilter,
            useRegex
        };
        if (channel) {
            print(await admin.getChannel(channel));
        } else if (vhost) {
            print(await admin.getVhostChannels(vhost));
        } else if (connection) {
            print(await admin.getConnectionChannels(connection));
        } else {
            print(await admin.getChannels(paginationOptions));
        }
    });

program
    .command('consumers')
    .option('-v, --vhost <vhost>', 'name of the vhost')
    .action(async ({ vhost }) => {
        print(await admin.getConsumers(vhost));
    });

const exchanges = program
    .command('exchanges');

exchanges
    .command('list')
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
        const paginationOptions = {
            page,
            pageSize: parseInt(size, 10) || undefined,
            name: nameFilter,
            useRegex
        };
        print(await admin.getExchanges(vhost, paginationOptions));
    });

exchanges
    .command('get <name>')
    .description('Get a single exchange')
    .requiredOption('-v, --vhost <vhost>', 'name of the vhost')
    .action(async (name, opts) => {
        // TODO: create exchange
        print(await admin.getExchange(opts.vhost, name));
    });

exchanges
    .command('delete <name>')
    .description('Delete an exchange')
    .requiredOption('-v, --vhost <vhost>', 'name of the vhost')
    .action(async (name, opts) => {
        await admin.deleteExchange(opts.vhost, name);
    });

exchanges
    .command('bindings <name>')
    .description('Get a list of bindings for an exchange')
    .requiredOption('-v, --vhost <vhost>', 'name of the vhost')
    .addOption(new Option('-t, --type <type>', 'type of binding').choices(['source', 'destination']))
    .action(async (name, opts) => {
        if (opts.type === 'source') {
            print(await admin.getSourceExchangeBindings(opts.vhost, name));
        } else {
            print(await admin.getDestinationExchangeBindings(opts.vhost, name));
        }
    });

exchanges
    .command('publish <name>')
    .description('Publish to an exchange')
    .requiredOption('-v, --vhost <vhost>', 'name of the vhost')
    .requiredOption('-r, --routing-key <routing-key>', 'routing key')
    .requiredOption('-m, --message <message>', 'message')
    .addOption(new Option('-e, --encoding <encoding>', 'encoding').choices(['string', 'base64']).default('string'))
    .action(async (name, opts) => {
        const message: PublishMessage = {
            payload: opts.message,
            payload_encoding: opts.encoding,
            properties: {},
            routing_key: opts.routingKey
        };
        console.log(await admin.publishToExchange(opts.vhost, name, message));
    });

const queues = program.command('queues');

queues
    .command('list')
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
        const paginationOptions = {
            page,
            pageSize: parseInt(size, 10) || undefined,
            name: nameFilter,
            useRegex
        };
        print(await admin.getQueues(vhost, paginationOptions));
    });

queues
    .command('get <name>')
    .description('Get a single queue')
    .requiredOption('-v, --vhost <vhost>', 'name of the vhost')
    .action(async (name, opts) => {
        print(await admin.getQueue(opts.vhost, name));
    });

queues
    .command('delete <name>')
    .description('Delete a queue')
    .requiredOption('-v, --vhost <vhost>', 'name of the vhost')
    .option('--if-unused', 'Delete only if the queue has no consumers')
    .option('--if-empty', 'Delete only if the queue has no messages')
    .action(async (name, { vhost, ifUnused, ifEmpty }) => {
        await admin.deleteQueue(vhost, name, { ifUnused, ifEmpty });
    });

const vhosts = program
    .command('vhost');

vhosts
    .command('list')
    .option('-v, --vhost <vhost>', 'name of the vhost')
    .action(async ({ vhost }) => {
        if (vhost) {
            print(await admin.getVhost(vhost));
        } else {
            print(await admin.listVhosts());
        }
    });

vhosts
    .command('create')
    .requiredOption('-v, --vhost <vhost>', 'name of the vhost')
    .action(async ({ vhost }) => {
        const result = await admin.createVhost(vhost);
        print(result);
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
        print(result);
    });

permissions
    .command('get')
    .requiredOption('-u, --user <user>', 'Username to set permissions for')
    .requiredOption('-v, --vhost <vhost>', 'Vhost to set permissions for')
    .action(async ({ vhost, user }) => {
        print(await admin.getUserPermissions(vhost, user));
    });

const bindings = program
    .command('bindings');

bindings
    .command('list')
    .option('-v, --vhost <vhost>', 'name of the vhost')
    .option('-s, --source <source>', 'source exchange')
    .option('-d, --destination <destination>', 'destination')
    .addOption(new Option('-t, --type <type>', 'type of binding').choices(['queue', 'exchange']))
    .action(async ({ vhost, source, destination, type }) => {
        if ((source || destination || type) && !(source && destination && type)) {
            throw new Error('When specifying source / destination /type you must specify all three');
        }
        print(await admin.getBindings({ vhost, source, destination, type }));
    });

bindings
    .command('get')
    .requiredOption('-v, --vhost <vhost>', 'name of the vhost')
    .requiredOption('-s, --source <source>', 'source exchange')
    .requiredOption('-d, --destination <destination>', 'destination')
    .requiredOption('-p, --props <props>', 'a unique identifier for the binding composed of the routing key and hash of arguments')
    .addOption(new Option('-t, --type <type>', 'type of binding').choices(['queue', 'exchange']).makeOptionMandatory())
    .action(async ({ vhost, source, destination, type, props }) => {
        print(await admin.getBinding({ vhost, source, destination, type, props }));
    });

bindings
    .command('create')
    .requiredOption('-v, --vhost <vhost>', 'name of the vhost')
    .requiredOption('-s, --source <source>', 'source exchange')
    .requiredOption('-d, --destination <destination>', 'destination')
    .requiredOption('-r, --routing-key <routingKey>', 'routing key')
    .addOption(new Option('-t, --type <type>', 'type of binding').choices(['queue', 'exchange']).makeOptionMandatory())
    .action(async ({ vhost, source, destination, type, args, routingKey }) => {
        await admin.createBinding({ vhost, source, destination, type, args, routingKey });
    });

bindings
    .command('delete')
    .requiredOption('-v, --vhost <vhost>', 'name of the vhost')
    .requiredOption('-s, --source <source>', 'source exchange')
    .requiredOption('-d, --destination <destination>', 'destination')
    .requiredOption('-p, --props <props>', 'a unique identifier for the binding composed of the routing key and hash of arguments')
    .addOption(new Option('-t, --type <type>', 'type of binding').choices(['queue', 'exchange']).makeOptionMandatory())
    .action(async ({ vhost, source, destination, type, props }) => {
        await admin.deleteBinding({ vhost, source, destination, type, props });
    });


nextTick(async () => {
    await program.parseAsync(process.argv);
});
