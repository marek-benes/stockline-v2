function clearSlashes (path: string): string {
    return path.replace(/\/$/, "").replace(/^\//, "");
}

export class Route {
    private route: string[] = [];
    private variables: string[] = [];
    private length: number;

    constructor (private path: string, private action: (parameters?: { [key: string]: string }) => void) {
        const arr = clearSlashes(this.path).split("/");
        this.length = arr.length;

        arr.forEach((v, i) => {
            if (v[0] === ":") {
                this.variables[i] = v.slice(1);
            } else {
                this.route[i] = v;
            }
        });
    }

    public match (path: string): boolean {
        if (this.route[0] === "*" && this.length === 1) {
            this.action();
            return true;
        } else {
            const arr = clearSlashes(path).split("/");
            if (arr.length === this.length) {
                const variables: { [key: string]: string } = {};
                let matches = 0;
                this.route.forEach((x, i) => {
                    if (arr[i] === x) { matches++; }
                });
                this.variables.forEach((x, i) => {
                    if (arr[i]) {
                        variables[x] = arr[i];
                        matches++;
                    }
                });

                if (matches === this.length) {
                    this.action(variables);
                    return true;
                }
            } else {
                return false;
            }

            return false;
        }

    }
}
