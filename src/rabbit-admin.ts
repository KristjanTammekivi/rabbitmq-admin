import Axios, { AxiosRequestConfig } from 'axios';
import { Channel } from 'diagnostics_channel';
import { Binding, ClusterName, Definitions, Exchange, ManagementPlugin, Node, Overview, PagedResponse } from '.';
import { RabbitAdminBadRequestError, RabbitAdminNotFoundError } from './errors';
import { Connection, Consumer, Permissions, PermissionsObject, Queue, Vhost } from './types';
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

export const RabbitAdmin = (opts: RabbitAdminOptions = {}) => {
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
        getConnectionChannels: getConnectionChannels(request),
        getVhostChannels: getVhostChannels(request),
        listVhosts: listVhosts(request),
        getVhost: getVhost(request),
        deleteVhost: deleteVhost(request),
        createVhost: createVhost(request),
        setUserPermissions: setUserPermissions(request),
        getUserPermissions: getUserPermissions(request),
        getVhostQueues: getVhostQueues(request),
        getVhostQueue: getVhostQueue(request)
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
        request<Connection>('get', paginate(url`/vhosts/${ vhostName }/connections`, paginationOptions));

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
    async (vhost?: string, paginationOptions: PaginationOptions = {}) => {
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

const getVhostQueue = (request: Request) =>
    async (vhostName: string, queueName: string) =>
        request<Queue[]>('get', url`/queues/${ vhostName }/${ queueName }`);

const getVhostQueues = (request: Request) =>
    async (vhostName: string) =>
        request<Queue[]>('get', url`/queues/${ vhostName }`);


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

