export class OtherRemarksRequest {
    manager: string;
    requestReceived: Date;
    comments: string;

    constructor() {
        this.manager = '';
        this.requestReceived = new Date();
        this.comments = '';
    }
}