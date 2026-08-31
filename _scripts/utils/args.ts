export function getArgs() {
    const args: { [key: string]: string } = {};
    let lastKey = '';
    for (let i = 2; i < process.argv.length; i++) {
        const value = process.argv[i];
        if (!value) {
            continue;
        }
        if (lastKey) {
            args[lastKey] = value;
            lastKey = '';
        } else if (value.startsWith('--')) {
            lastKey = value.replace('--', '');
            args[lastKey] = '';
        }
    }
    return args;
}
