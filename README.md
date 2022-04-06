# Rabbitmq Admin

Meant to interact with RabbitMQ management plugin's API.

Starting off with commands I need in Haredo test suite,
but will eventually include everything detailed in the
[documentation](https://rawcdn.githack.com/rabbitmq/rabbitmq-server/v3.9.13/deps/rabbitmq_management/priv/www/api/index.html).

## Usage

### Initialization

Shown here with defaults

```typescript
const rabbitAdmin = new RabbitAdmin({
  rabbitHost: 'http://localhost:15672',
  pathBase: '/api',
  user: 'guest',
  password: 'guest',
});
```

### Commands

Currently implemented commands:

* getOverview
* getClusterName
* setClusterName
* getNodes
* getNode
* getExtensions
* getDefinitions
* getConnections
* getConnection
* closeConnection
* getVhostConnections
* getChannels
* getChannel
* getConsumers
* getExchanges
* getExchange
* createExchange
* deleteExchange
* getSourceExchangeBindings
* getDestinationExchangeBindings
* publishToExchange
* getQueues
* getQueue
* createQueue
* deleteQueue
* getQueueBindings
* getConnectionChannels
* getVhostChannels
* listVhosts
* getVhost
* deleteVhost
* createVhost
* setUserPermissions
* getUserPermissions
* createBinding
* getBinding
* getBindings
* deleteBinding

### CLI Usage

It's possible to use this package from the CLI by installing it globally or using `npx rabbitmq-admin`

```
Usage: rabbitmq-admin [options] [command]

Options:
  -U, --user <user>       Username for authentication
  -P, --pass <pass>       Password for authentication
  --format <format>       Output format. Accepted values: json | json-pretty (default: "json")
  -h, --help              display help for command

Commands:
  overview                Get information about the whole system
  cluster-name [options]  Get the name of the cluster
  nodes [options]         Get a list of nodes in the cluster. If no node name is given, all nodes are listed
  extensions              Get a list of installed management plugins
  definitions [options]   Get a list of server definitions such as exchanges, queues, users, virtual hosts, permissions, topic permissions and parameters, everything excecpt messages
  connections
  channels [options]      Get a list of channels. Paginated.
  consumers [options]
  exchanges
  queues
  vhost
  permissions
  bindings
  help [command]          display help for command
```
