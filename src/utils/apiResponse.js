class ApiResponse {
    constructor(success, message, data) {
        this.statusCode = this.statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}