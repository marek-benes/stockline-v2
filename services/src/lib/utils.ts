export class Utils {

    public static async sleep(time: number) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    public static toTime(slot: number): string {
        if (slot & 1) {
            return `${(slot - 1) / 2}:30`;
        }
        else {
            return `${slot / 2}:00`;
        }
    }

    public static toKebabCase(s: string): string {
        if (!s) {
            return s;
        }

        return s.replace(/([a-zA-Z])(?=[A-Z])/g, "$1-").toLowerCase();
    };
}
