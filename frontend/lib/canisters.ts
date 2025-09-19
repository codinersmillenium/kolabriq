import * as decUser from '@/declarations/user'
import * as decProject from '@/declarations/project'
import * as decTask from '@/declarations/task'
import * as decAi from '@/declarations/ai'
import * as decToken from '@/declarations/token'
import { AuthClient } from '@dfinity/auth-client'
import { Principal } from '@dfinity/principal';
import { HttpAgent } from '@dfinity/agent'

const network = process.env.DFX_NETWORK;
const identityProvider =
    network === 'ic'
        ? 'https://identity.ic0.app' // Mainnet
        : process.env.API_HOST + '?canisterId=' + process.env.CANISTER_ID_INTERNET_IDENTITY

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

    console.log("InitClient Principal:", identity.getPrincipal().toString());
}

// Ensure auth client always ready
export const ensureClient = async () => {
    if (!authClient) {
        await initClient();
    }
}

export const initActor = async (canister: string = 'user') => {
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
    }
    return canisterBlog
}

export const getPrincipal = () => {
    const principal = identity.getPrincipal().toString()
    const principal_ = Principal.fromText(principal)
    return [principal, principal_]
}

export const callbackSignIn = async () => {
    await ensureClient();

    const isAuthenticated = await authClient!.isAuthenticated();
    if (!identity || !isAuthenticated) return 'init'

    const principal: any = getPrincipal()
    const actor = await initActor()

    const { ok }: any = await actor.getUserDetail(principal[1])
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