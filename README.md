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

 * listVhosts
 * getVhost
 * deleteVhost
 * createVhost
 * setUserPermissions
 * getUserPermissions
 * getConsumers
 * getVhostQueues
 * getVhostQueue
