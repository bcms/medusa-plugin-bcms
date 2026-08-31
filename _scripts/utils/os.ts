import os from 'os';

export function getPlatform() {
    const platform = os.platform();
    if (platform === 'win32') {
        return 'win';
    } else if (platform === 'darwin') {
        return 'mac';
    } else if (platform === 'linux') {
        return 'linux';
    }
    return '_unsupported';
}

export function isWin() {
    return os.platform() === 'win32';
}

export function isMac() {
    return os.platform() === 'darwin';
}

export function isLinux() {
    return os.platform() === 'linux';
}
