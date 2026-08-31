import { buildPlugin } from './build';
import { publishPlugin } from './publish';
import { getArgs } from './utils/args';
import { versionUpdatePlugin } from './version';

async function main(): Promise<void> {
    const args = getArgs();
    if (args.build) {
        switch (args.build) {
            case 'plugin':
                console.log('Building plugin...');
                await buildPlugin();
                break;
            default:
                throw Error(
                    `Invalid build target "${args.build}". Valid targets are: plugin`,
                );
        }
    } else if (args.publish) {
        switch (args.publish) {
            case 'plugin':
                console.log('Publishing plugin...');
                await buildPlugin();
                await publishPlugin();
                break;
            default:
                throw Error(
                    `Invalid publish target "${args.build}". Valid targets are: plugin`,
                );
        }
    } else if (args.version_update) {
        switch (args.version_update) {
            case 'plugin':
                console.log('Update plugin version...');
                await versionUpdatePlugin(
                    args.type as 'patch' | 'minor' | 'major',
                );
                await buildPlugin();
                break;
            default:
                throw Error(
                    `Invalid version update target "${args.build}". Valid targets are: plugin`,
                );
        }
    } else {
        throw Error('No valid argument provided.');
    }
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
