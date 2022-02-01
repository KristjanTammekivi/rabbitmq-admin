import Axios, { AxiosRequestConfig } from 'axios';
import { ClusterName, Definitions, ManagementPlugin, Node, Overview } from '.';
import { RabbitAdminBadRequestError, RabbitAdminNotFoundError } from './errors';
import { Connection, Consumer, Permissions, PermissionsObject, Queue, Vhost } from './types';

export interface RabbitAdminOptions {
    rabbitHost?: string;
    pathBase?: string;
    user?: string;
    pass?: string;
}

type Request = <T>(method: 'get' | 'put' | 'post' | 'delete', url: string, body?: any) => Promise<T>;

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
    const request: Request = async (method, requestUrl, body) => {
        try {
            const { data } = await Axios[method](`${ rabbitHost }${ pathBase }${ requestUrl }`, ...[body, defaults].filter(x => x));
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
        getVhostConnections: getVhostConnections(request),
        listVhosts: listVhosts(request),
        getVhost: getVhost(request),
        deleteVhost: deleteVhost(request),
        createVhost: createVhost(request),
        setUserPermissions: setUserPermissions(request),
        getUserPermissions: getUserPermissions(request),
        getConsumers: getConsumers(request),
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

const paginate = (path: string, { page, pageSize, name, useRegex }: PaginationOptions) => {
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

const getConnections = (request: Request) => (paginationOptions: PaginationOptions) => request<Connection>('get', paginate('/connections', paginationOptions));

const getVhostConnections = (request: Request) =>
    (vhostName: string, paginationOptions: PaginationOptions) =>
        request<Connection>('get', paginate(url`/vhosts/${ vhostName }/connections`, paginationOptions));

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

const getConsumers = (request: Request) =>
    async (vhostName?: string) => {
        const requestUrl = vhostName ? url`/consumers/${ vhostName }` : '/consumers';
        return request<Consumer[]>('get', requestUrl);
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

