export class BusinessError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
