export class BarcodeReader {
    public onCode: (code: string) => void;

    private keys: string = "";

    // ASCII 2 == ""
    // ASCII 13 0xD == "Enter"
    constructor (start: string = String.fromCharCode(2), end: string = "Enter") {

        document.onkeypress = (e) => {
            if (this.keys.length === 0 && e.key !== start) {
                return;
            } else {
                e.preventDefault();
            }

            console.log(e);
            this.keys += e.key;

            if (this.keys.length <= start.length && start.indexOf(this.keys) !== 0) {
                this.keys = "";
            }

            if (this.keys.slice(-1 * end.length) === end) {
                const code = this.keys.slice(start.length, this.keys.length - end.length);
                if (this.onCode) {
                    this.onCode(code);
                }
                this.keys = "";
            }
        };
    }
}
