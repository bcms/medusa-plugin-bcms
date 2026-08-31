import { ChildProcess } from './utils/child-process';
import path from 'path';

export async function publishPlugin(): Promise<void> {
    await ChildProcess.spawn('npm', ['publish', '--access', 'public'], {
        cwd: path.join(process.cwd(), 'medusa-plugin-bcms', 'dist'),
        env: process.env,
        stdio: 'inherit',
    });
}
