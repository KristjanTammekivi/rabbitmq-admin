import Axios, { AxiosRequestConfig } from 'axios';
import { Consumer, Permissions, PermissionsObject, Queue, Vhost } from './types';

export interface RabbitAdminOptions {
    rabbitHost?: string;
    pathBase?: string;
    user?: string;
    pass?: string;
}

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
    const getUrl = (...paths: string[]) => `${ rabbitHost }${ pathBase }${ paths.join('/') }`;
    return {
        listVhosts: async () => {
            const { data } = await Axios.get<Vhost[]>(getUrl('/vhosts'), defaults);
            return data;
        },
        getVhost: async (name: string) => {
            try {
                const { data } = await Axios.get<Vhost>(getUrl('/vhosts', encodeURIComponent(name)), defaults);
                return data;
            } catch (e) {
                if (Axios.isAxiosError(e) && e.response?.status === 404) {
                    return null;
                }
                throw e;
            }
        },
        deleteVhost: async (name: string) => {
            await Axios.delete(getUrl('/vhosts', encodeURIComponent(name)), defaults);
        },
        createVhost: async (vhostName: string) => {
            await Axios.put(getUrl('/vhosts', encodeURIComponent(vhostName)), {}, defaults);
        },
        setUserPermissions: async (vhostName: string, userName: string, permissions: PermissionsObject) => {
            await Axios.put(getUrl('/permissions', encodeURIComponent(vhostName), encodeURIComponent(userName)), permissions, defaults);
        },
        getUserPermissions: async (vhostName: string, userName: string) => {
            const { data } = await Axios.get<Permissions>(getUrl('/permissions', encodeURIComponent(vhostName), encodeURIComponent(userName)), defaults);
            return data;
        },
        getConsumers: async (vhostName?: string) => {
            const { data } = await Axios.get<Consumer[]>(getUrl(...['/consumers', vhostName && encodeURIComponent(vhostName)].filter(x => x) as string[]), defaults);
            return data;
        },
        getVhostQueues: async (vhostName: string) => {
            const { data } = await Axios.get<Queue[]>(getUrl('/queues', encodeURIComponent(vhostName)), defaults);
            return data;
        },
        getVhostQueue: async (vhostName: string, queueName: string) => {
            const { data } = await Axios.get<Queue[]>(getUrl('/queues', encodeURIComponent(vhostName), encodeURIComponent(queueName)), defaults);
            return data;
        }
    };
};



