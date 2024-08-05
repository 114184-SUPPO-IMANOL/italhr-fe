export class AuthorizationRequest {
    requestReceived: Date;
    comments: string;
    isAuthorized: boolean;

    constructor() {
        this.requestReceived = new Date();
        this.comments = '';
        this.isAuthorized = false;
    }
}