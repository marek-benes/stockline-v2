export interface IView {
    readonly id: string;
    show: (target: HTMLElement) => void;
    hide: () => void;
}
