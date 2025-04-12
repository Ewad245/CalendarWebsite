

export type User = {
    id: number; 
    userWorkflowId: number;
    userId: string; 
    method: number; 
    check: number; 
    earlyIn: number;
    lateIn: number;
    earlyOut: number;
    lateOut: number;
    inAt: Date; 
    outAt: Date; 
    wt: number; 
    at: Date; 
    fullName: string; 
    data: string;
}

export type UserInfo = {
    userId: string;
    fullName: string;
}