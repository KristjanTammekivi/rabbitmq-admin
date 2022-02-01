import { AxiosError } from 'axios';

export class RabbitAdminError extends Error{}

export class RabbitAdminRequestError extends RabbitAdminError {
    constructor(message: string, public url: string, public statusCode: number) {
        super(message);
    }
}

export class RabbitAdminNotFoundError extends RabbitAdminRequestError {
    constructor(axiosError: AxiosError, message = 'Resource not found') {
        super(message, axiosError.config?.url as string, axiosError.response?.status as number || 404);
    }
}

export class RabbitAdminBadRequestError extends RabbitAdminRequestError {
    data: any;

    constructor(axiosError: AxiosError, message = 'Bad request') {
        super(message, axiosError.config?.url as string, axiosError.response?.status as number || 400);
        this.data = axiosError.response?.data;
    }
}
