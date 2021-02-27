interface String {
    toKebabCase(): string;
}

String.prototype.toKebabCase = function (): string {
    return this.replace(/([a-zA-Z])(?=[A-Z])/g, "$1-").toLowerCase();
};
