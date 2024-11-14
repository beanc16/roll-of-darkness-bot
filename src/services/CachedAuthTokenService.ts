import { logger } from '@beanc16/logger';
import { UserGetServiceToServiceAuthTokenParametersV1, UserMicroservice } from '@beanc16/microservices-abstraction';

import authTokenSingleton from '../models/authTokenSingleton.js';

/* eslint-disable no-await-in-loop */ // We want to do asynchronous retries, so allow awaits in loops
export class CachedAuthTokenService
{
    static #retries = 1;
    static #parameters: UserGetServiceToServiceAuthTokenParametersV1 = {
        calledBy: process.env.APPLICATION_NAME,
        expiresInSeconds: 86400, // 86400 seconds = 24 hours
    };

    public static async getAuthToken(): Promise<string>
    {
        if (!authTokenSingleton.isEmpty())
        {
            return authTokenSingleton.get();
        }

        const {
            data: {
                token = '',
            } = {},
        } = await UserMicroservice.v1.getServiceToServiceAuthToken(this.#parameters);

        authTokenSingleton.set(token);
        return authTokenSingleton.get();
    }

    public static async resetAuthToken(): Promise<string>
    {
        for (let i = 0; i <= this.#retries; i += 1)
        {
            try
            {
                const {
                    data: {
                        token = '',
                    } = {},
                } = await UserMicroservice.v1.getServiceToServiceAuthToken(this.#parameters);

                authTokenSingleton.set(token);
                return authTokenSingleton.get();
            }

            catch (error)
            {
                logger.warn('Failed to CachedAuthTokenService.resetAuthToken', (error as any)?.response?.data || error);
            }
        }

        throw new Error('Maximum number of retries reached.');
    }
}
