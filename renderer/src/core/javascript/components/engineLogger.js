export class EngineLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 5000;

        ["log", "warn", "error", "info"].forEach(type => {
            const original = console[type];

            console[type] = (...args) => {
                this.add(type, args);
                original(...args);
            };
        });

        window?.addEventListener?.("error", e => {
            this.add("crash", [e.message, e.filename, e.lineno]);
        });

        window?.addEventListener?.("unhandledrejection", e => {
            this.add("promise", [e.reason]);
        });
    }

    add(type, data) {
        const entry = {
            type,
            data,
            time: performance.now()
        };

        this.logs.push(entry);

        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
    }

    getAll() {
        return this.logs;
    }

    clear() {
        this.logs.length = 0;
    }
}
