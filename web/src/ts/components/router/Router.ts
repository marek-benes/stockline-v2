import { Route } from "./Route";

function clearSlashes (path: string): string {
    return path.replace(/\/$/, "").replace(/^\//, "");
}

export class Router {
    public get current (): string { return this.route; }
    public previous: string = "";

    private route: string;
    private ignore: boolean = false;

    constructor (private routes: Route[] = []) {
        window.addEventListener("hashchange", (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.resolve();
        });
    }

    public add (route: Route) {
        this.routes.push(route);
    }

    public navigate (path: string, ignore: boolean = false) {
        this.ignore = ignore;
        window.location.href = `${window.location.href.replace(/#(.*)$/, "")}#${path}`;
    }

    public resolve () {
        this.previous = this.route;
        this.route = this.getRoute();

        if (this.ignore) {
            this.ignore = false;
        } else {
            for (const route of this.routes) {
                const result = route.match(this.route);
                if (result) { break; }
            }
        }
    }

    private getRoute (): string {
        const match = window.location.href.match(/#(.*)$/);
        const fragmet = match ? match[1] : "";

        return clearSlashes(fragmet);
    }
}
