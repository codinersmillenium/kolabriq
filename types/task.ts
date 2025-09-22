export type BlockId = bigint;

export type Project = any;
export type Timeline = any;
export type TeamAssignment = any;

export type ProjectBlockData =
    | { project: Project }
    | { timeline: Timeline }
    | { teamAssignment: TeamAssignment };

export interface ProjectBlock {
    id: BlockId;
    previousHash: string;
    data: ProjectBlockData;
    hash: string;
    signature: string;
    timestamp: bigint;
    nonce: bigint;
}
