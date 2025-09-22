import * as decUser from '@/declarations/user'
import * as decProject from '@/declarations/project'
import * as decTask from '@/declarations/task'
import * as decAi from '@/declarations/ai'
import * as decToken from '@/declarations/token'
import * as decIcpLedger from '@/declarations/icp_ledger'
import { AuthClient } from '@dfinity/auth-client'
import { Principal } from '@dfinity/principal';
import { HttpAgent } from '@dfinity/agent'

const network = process.env.DFX_NETWORK;
const identityProvider =
    network === 'ic'
        ? 'https://identity.ic0.app' // Mainnet
        : "http://localhost:4943/"
        // : process.env.API_HOST + '?canisterId=' + process.env.CANISTER_ID_INTERNET_IDENTITY

export let authClient: AuthClient | null = null
export let identity: any = null
export let options: any = {}

export const initClient = async () => {
    authClient = await AuthClient.create();
    identity = authClient.getIdentity();
    options = {
        agentOptions: {
            host: process.env.API_HOST,
            identity: identity
        }
    }
}

// Ensure auth client always ready
export const ensureClient = async () => {
    if (!authClient) {
        await initClient();
    }
}

type ActorName = 'user' | 'project' | 'task' | 'ai' | 'token' | 'icp_ledger';

export const initActor = async (canister: ActorName = 'user') => {
    await ensureClient();

    var canisterBlog: any = null
    switch (canister) {
        case 'user':
            canisterBlog = decUser.createActor(decUser.canisterId, options)
            break;
        case 'project':
            canisterBlog = decProject.createActor(decProject.canisterId, options)
            break;
        case 'task':
            canisterBlog = decTask.createActor(decTask.canisterId, options)
            break;
        case 'ai':
            canisterBlog = decAi.createActor(decAi.canisterId, options)
            break;
        case 'token':
            canisterBlog = decToken.createActor(decToken.canisterId, options)
            break;
        case 'icp_ledger':
            canisterBlog = decIcpLedger.createActor(decIcpLedger.canisterId, options)
            break;
    }
    return canisterBlog
}

export const getPrincipal = () => {
    return identity.getPrincipal()
}

export const callbackSignIn = async () => {
    await ensureClient();

    const isAuthenticated = await authClient!.isAuthenticated();
    if (!identity || !isAuthenticated) return 'init'

    const actor = await initActor()
    const { ok }: any = await callWithRetry(actor, "getUserDetail", getPrincipal())
    if (typeof ok === 'undefined') return false

    return true
}

export const signIn = async () => {
    await ensureClient();
    await authClient!.login({
        identityProvider,
        onSuccess: async () => {
            await initActor()
            window.location.href = '/login'
        }
    });
}

export const signOut = async () => {
    await ensureClient();
    await authClient!.logout();
    await initActor()
}

export const callWithRetry = async <T = any>(
    actor: any,
    functionName: string,
    ...params: any[]
): Promise<T> => {
    const MAX_RETRIES = 3;
    const BASE_DELAY = 1000;
    let lastError: Error;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            // Type-safe function call
            if (!actor || typeof actor[functionName] !== 'function') {
                throw new Error(`Function ${functionName} not found actor`);
            }

            const result: T = await actor[functionName](...params);
            return result;

        } catch (error: any) {
            lastError = error;
            console.log(`Attempt ${attempt + 1} failed call ${functionName}:`, error.message);

            // If it's the last attempt, don't retry
            if (attempt === MAX_RETRIES) {
                break;
            }

            // Only retry on specific errors
            const shouldRetry = error.message.includes('signature verification') ||
                error.message.includes('certificate') ||
                error.message.includes('Invalid certificate') ||
                error.message.includes('network error');

            if (shouldRetry) {
                // Reset auth client on auth errors
                authClient = null;

                // Exponential backoff delay
                const delay = BASE_DELAY * Math.pow(2, attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                // Don't retry on other types of errors
                break;
            }
        }
    }

    // If we reach here, all retries failed
    throw lastError!;
};