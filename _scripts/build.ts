import path from 'path';
import { FS } from './utils/fs';
import { ChildProcess } from './utils/child-process';

export async function buildPlugin(): Promise<void> {
    const fs = new FS(path.join(process.cwd(), 'medusa-plugin-bcms'));
    await fs.deleteDir(['.medusa']);
    await ChildProcess.spawn('npm', ['run', 'build'], {
        cwd: fs.baseRoot,
        env: process.env,
        stdio: 'inherit',
    });
    await fs.copy(['.medusa', 'server', 'src'], ['dist', 'src']);
    let packageJsonStr = await fs.readString('package.json');
    packageJsonStr = packageJsonStr.replace(/\/.medusa\/server/g, '');
    const packageJson = JSON.parse(packageJsonStr);
    packageJson.scripts = undefined;
    packageJson.devDependencies = undefined;
    await fs.save(
        ['dist', 'package.json'],
        JSON.stringify(packageJson, null, 4),
    );
}
