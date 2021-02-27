declare module '*.hbs' {
    const fn: (data?: any) => string;
    export default fn;
}

declare module "*.json" {
    const value: any;
    export default value;
}