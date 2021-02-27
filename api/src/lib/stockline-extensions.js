String.prototype.toKebabCase = function () {
    return this.replace(/([a-zA-Z])(?=[A-Z])/g, "$1-").toLowerCase();
};
//# sourceMappingURL=stockline-extensions.js.map