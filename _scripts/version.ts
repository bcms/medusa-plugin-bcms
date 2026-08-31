import path from 'path';
import { FS } from './utils/fs';
import { ChildProcess } from './utils/child-process';

export async function versionUpdatePlugin(
    type: 'patch' | 'minor' | 'major',
): Promise<void> {
    const fs = new FS(path.join(process.cwd(), 'medusa-plugin-bcms'));
    const packageJson = JSON.parse(await fs.readString('package.json'));
    const versionParts = packageJson.version.split('.').map(Number);
    switch (type) {
        case 'patch':
            versionParts[2]++;
            break;
        case 'minor':
            versionParts[1]++;
            versionParts[2] = 0;
            break;
        case 'major':
            versionParts[0]++;
            versionParts[1] = 0;
            versionParts[2] = 0;
            break;
        default:
            throw new Error(
                `Invalid version type: ${type} -> available types are: patch, minor, major`,
            );
    }
    packageJson.version = versionParts.join('.');
    await fs.save('package.json', JSON.stringify(packageJson, null, 4));
    await ChildProcess.spawn('git', ['add', 'package.json'], {
        cwd: fs.baseRoot,
        env: process.env,
        stdio: 'inherit',
    });
    await ChildProcess.spawn(
        'git',
        ['commit', '-m', `Bump version to ${packageJson.version}`],
        {
            cwd: fs.baseRoot,
            env: process.env,
            stdio: 'inherit',
        },
    );
}
