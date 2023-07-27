import Axios, { AxiosRequestConfig } from 'axios';
import {
    Binding,
    ClusterName,
    CreateQueue,
    Definitions,
    DeleteQueue,
    Exchange,
    ManagementPlugin,
    Node,
    Overview,
    PagedResponse,
    PublishMessage,
    PublishMessageResponse
} from '.';
import { RabbitAdminBadRequestError, RabbitAdminNotFoundError } from './errors';
import { Channel, Connection, Consumer, CreateBindingParams, GetBindingParams, GetBindingsParams, GetMessagesParams, GetMessagesResponse, Permissions, PermissionsObject, Queue, RabbitmqInterface, Vhost } from './types';
import { PartialExcept } from './utility-types';

export interface RabbitAdminOptions {
    rabbitHost?: string;
    pathBase?: string;
    user?: string;
    pass?: string;
}

type Request = <T>(method: 'get' | 'put' | 'post' | 'delete', url: string, body?: any, headers?: Record<string, string>) => Promise<T>;

const url = (str: TemplateStringsArray, ...parameters: (string | undefined)[]) => {
    return [...str].reduce((acc, item, i) => {
        if (parameters[i]) {
            return `${ acc }${ item }${ encodeURIComponent(parameters[i] || '') }`;
        }
        return `${ acc }${ item }`;
    }, '');
};

export const RabbitAdmin = (opts: RabbitAdminOptions = {}): RabbitmqInterface => {
    const rabbitHost = opts.rabbitHost ?? 'http://localhost:15672';
    const pathBase = opts.pathBase ?? '/api';
    const defaults: AxiosRequestConfig = {
        headers: {
            'content-type': 'application/json'
        },
        auth: {
            username: opts.user ?? 'guest',
            password: opts.pass ?? 'guest',
        }
    };
    const request: Request = async (method, requestUrl, body, headers) => {
        try {
            const settings = {
                ...defaults,
                headers: {
                    ...defaults.headers,
                    ...headers
                }
            };
            const { data } = await Axios[method](`${ rabbitHost }${ pathBase }${ requestUrl }`, ...[body, settings].filter(x => x));
            return data;
        } catch (e) {
            if (!Axios.isAxiosError(e)) {
                throw e;
            }
            if (e.response?.status === 404) {
                throw new RabbitAdminNotFoundError(e);
            }
            if (e.response?.status === 400) {
                throw new RabbitAdminBadRequestError(e);
            }
            throw e;
        }
    };

    return {
        getOverview: getOverview(request),
        getClusterName: getClusterName(request),
        setClusterName: setClusterName(request),
        getNodes: () => getNodes<Node[]>(request)(),
        getNode: (name: string) => getNodes<Node>(request)(name),
        getExtensions: getExtensions(request),
        getDefinitions: getDefinitions(request),
        getConnections: getConnections(request),
        getConnection: getConnection(request),
        closeConnection: closeConnection(request),
        getVhostConnections: getVhostConnections(request),
        getChannels: getChannels(request),
        getChannel: getChannel(request),
        getConsumers: getConsumers(request),
        getExchanges: getExchanges(request),
        getExchange: getExchange(request),
        createExchange: createExchange(request),
        deleteExchange: deleteExchange(request),
        getSourceExchangeBindings: getSourceExchangeBindings(request),
        getDestinationExchangeBindings: getDestinationExchangeBindings(request),
        publishToExchange: publishToExchange(request),
        getQueues: getQueues(request),
        getQueue: getQueue(request),
        createQueue: createQueue(request),
        deleteQueue: deleteQueue(request),
        getQueueBindings: getQueueBindings(request),
        getConnectionChannels: getConnectionChannels(request),
        getVhostChannels: getVhostChannels(request),
        listVhosts: listVhosts(request),
        getVhost: getVhost(request),
        deleteVhost: deleteVhost(request),
        createVhost: createVhost(request),
        setUserPermissions: setUserPermissions(request),
        getUserPermissions: getUserPermissions(request),
        createBinding: createBinding(request),
        getBinding: getBinding(request),
        getBindings: getBindings(request),
        deleteBinding: deleteBinding(request),
        getMessages: getMessages(request)
    };
};

const getOverview = (request: Request) => () => request<Overview>('get', '/overview');
const getClusterName = (request: Request) => () => request<ClusterName>('get', '/cluster-name');
const setClusterName = (request: Request) => (name: string) => request<ClusterName>('put', '/cluster-name', { name });
const getNodes = <T extends Node | Node[]>(request: Request) => (name?: string) => request<T>('get', url`/nodes/${ name }`);
const getExtensions = (request: Request) => () => request<ManagementPlugin>('get', '/extensions');

const getDefinitions = (request: Request) => (vhost?: string) => request<Definitions>('get', url`/definitions/${ vhost }`);

export interface PaginationOptions {
    page?: number;
    pageSize?: number
    name?: string;
    useRegex?: boolean;
}

const paginate = (path: string, { page, pageSize, name, useRegex }: PaginationOptions = {}) => {
    const queryParams = [
        // Seems to be a bug in RabbitMQ where not passing page causes
        // all the other parameters to be discounted
        `page=${ page || 1 }`,
        pageSize && `page_size=${ pageSize }`,
        name && `name=${ encodeURIComponent(name) }`,
        useRegex && 'use_regex=true'
    ].filter(x => x).join('&');
    return `${ path }?${ queryParams }`;
};

const getConnections = (request: Request) => (paginationOptions: PaginationOptions = {}) => request<Connection[]>('get', paginate('/connections', paginationOptions));

const getConnection = (request: Request) => async (name: string) => nullNotFound(request<Connection>('get', url`/connections/${ name }`));

const closeConnection = (request: Request) =>
    async (name: string, reason: string) => {
        const headers: Record<string, string> = reason ? { 'X-Reason': reason } : {};
        return request<void>('delete', url`/connections/${ name }`, null, headers);
    };

const getVhostConnections = (request: Request) =>
    (vhostName: string, paginationOptions: PaginationOptions = {}) =>
        request<Connection[]>('get', paginate(url`/vhosts/${ vhostName }/connections`, paginationOptions));

const getChannels = (request: Request) =>
    async (paginationOptions: PaginationOptions = {}) =>
        request<Channel[]>('get', paginate('/channels', paginationOptions));

const getConnectionChannels = (request: Request) =>
    async (connectionName: string) =>
        request<Channel[]>('get', url`/connections/${ connectionName }/channels`);

const getVhostChannels = (request: Request) =>
    async (vhostName: string) =>
        request<Channel[]>('get', url`/vhosts/${ vhostName }/channels`);

const getChannel = (request: Request) =>
    async (channelId: string) =>
        request<Channel>('get', url`/channels/${ channelId }`);

const getConsumers = (request: Request) =>
    async (vhostName?: string) => {
        const requestUrl = vhostName ? url`/consumers/${ vhostName }` : '/consumers';
        return request<Consumer[]>('get', requestUrl);
    };

const getExchanges = (request: Request) =>
    async (vhost?: string | null, paginationOptions: PaginationOptions = {}) => {
        if (vhost) {
            return request<PagedResponse<Exchange>>('get', paginate(url`/exchanges/${ vhost }`, paginationOptions));
        }
        return request<PagedResponse<Exchange>>('get', paginate('/exchanges', paginationOptions));
    };

const getExchange = (request: Request) =>
    async (vhost: string, name: string) => {
        return request<Exchange>('get', url`/exchanges/${ vhost }/${ name }`);
    };

// TODO: add a error subclass for assertion mismatch?
const createExchange = (request: Request) =>
    async (vhost: string, exchange: PartialExcept<Exchange, 'type'>) =>
        request<Exchange>('put', url`/exchanges/${ vhost }/${ exchange.name }`, exchange);

const deleteExchange = (request: Request) =>
    async (vhost: string, name: string) => {
        await request<void>('delete', url`/exchanges/${ vhost }/${ name }`);
    };

const getSourceExchangeBindings = (request: Request) =>
    async (vhost: string, name: string) =>
        request<Binding[]>('get', url`/exchanges/${ vhost }/${ name }/bindings/source`);

const getDestinationExchangeBindings = (request: Request) =>
    async (vhost: string, name: string) =>
        request<Binding[]>('get', url`/exchanges/${ vhost }/${ name }/bindings/destination`);

const publishToExchange = (request: Request) =>
    async (vhost: string, exchange: string, message: PublishMessage) =>
        request<PublishMessageResponse>('post', url`/exchanges/${ vhost }/${ exchange }/publish`, message);

const getQueues = (request: Request) =>
    async (vhost?: string | null, paginationOptions: PaginationOptions = {}) => {
        if (vhost) {
            return request<PagedResponse<Queue>>('get', paginate(url`/queues/${ vhost }`, paginationOptions));
        }
        return request<PagedResponse<Queue>>('get', paginate('/queues', paginationOptions));
    };


const getQueue = (request: Request) =>
    async (vhostName: string, queueName: string) =>
        request<Queue>('get', url`/queues/${ vhostName }/${ queueName }`);

const createQueue = (request: Request) =>
    async (vhost: string, name: string, options: CreateQueue) =>
        request<Queue>('put', url`/queues/${ vhost }/${ name }`, options);

const deleteQueue = (request: Request) =>
    async (vhost: string, name: string, opts: DeleteQueue) => {
        const queryParams = [
            opts.ifUnused && 'if-unused=true',
            opts.ifEmpty && 'if-empty=true',
        ].filter(x => x).join('&');
        return request<void>('delete', url`/queues/${ vhost }/${ name }?` + queryParams);
    };

const getQueueBindings = (request: Request) =>
    async (vhost: string, queueName: string) =>
        request<Binding[]>('get', url`/queues/${ vhost }/${ queueName }/bindings`);


const getVhost = (request: Request) => async (name: string) => nullNotFound(request<Vhost>('get', url`/vhosts/${ name }`));

const nullNotFound = async <T extends Promise<any>>(promise: T): Promise<T | null> => {
    try {
        return await promise;
    } catch (e) {
        if (e instanceof RabbitAdminNotFoundError) {
            return null;
        }
        throw e;
    }
};

const deleteVhost = (request: Request) =>
    async (name: string) => {
        return request('delete', url`/vhosts/${ name }`);
    };

const setUserPermissions = (request: Request) =>
    async (vhostName: string, userName: string, permissions: PermissionsObject) => {
        return request('put', url`/permissions/${ vhostName }/${ userName }`, permissions);
    };

const getUserPermissions = (request: Request) =>
    async (vhostName: string, userName: string) =>
        request<Permissions>('get', url`/permissions/${ vhostName }/${ userName }`);

const createVhost = (request: Request) =>
    async (vhostName: string) => {
        await request('put', url`/vhosts/${ vhostName }`, {});
    };

const listVhosts = (request: Request) =>
    async () =>
        request<Vhost[]>('get', '/vhosts');

const getBindings = (request: Request) =>
    async ({ vhost, ...params } = {} as GetBindingsParams) => {
        if (!('source' in params && params.source)) {
            if (vhost) {
                return request<Binding[]>('get', url`/bindings/${ vhost }`);
            }
            return request<Binding[]>('get', '/bindings');
        }
        const { source, destination } = params;
        const type = params.type === 'exchange' ? 'e' : 'q';
        return request<Binding[]>('get', url`/bindings/${ vhost }/e/${ source }/${ type }/${ destination }`);
    };

const getBinding = (request: Request) =>
    async ({ vhost, source, destination, props, ...params }: GetBindingParams) => {
        const type = params.type === 'exchange' ? 'e' : 'q';
        return request<Binding>('get', url`/bindings/${ vhost }/e/${ source }/${ type }/${ destination }/${ props }`);
    };

const createBinding = (request: Request) =>
    async ({ source, destination, vhost, args, routingKey, ...params }: CreateBindingParams) => {
        const type = params.type === 'exchange' ? 'e' : 'q';
        return request<''>('post', url`/bindings/${ vhost }/e/${ source }/${ type }/${ destination }`, {
            args,
            routing_key: routingKey
        });
    };

const deleteBinding = (request: Request) =>
    async ({ source, destination, vhost, props, ...params }: GetBindingParams) => {
        const type = params.type === 'exchange' ? 'e' : 'q';
        return request<''>('delete', url`/bindings/${ vhost }/e/${ source }/${ type }/${ destination }/${ props }`);
    };

const getMessages = (request: Request) =>
    async (vhost: string, queueName: string, opts: GetMessagesParams) => {
        return request<GetMessagesResponse[]>('post', url`/queues/${ vhost }/${ queueName }/get`, opts);
    };
