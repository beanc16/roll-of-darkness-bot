import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';

import { Text } from '@beanc16/discordjs-helpers';
import { FileStorageResourceType, FileStorageService } from '@beanc16/file-storage';
import { discordLogger, logger } from '@beanc16/logger';
import AdmZip from 'adm-zip';

import { cleanupLoggers } from './shared/cleanupLoggers.js';

/**
 * @returns {string} timestamp formatted as YYYY-MM-DD_HH-MM-SS
 */
function getFormattedTimestamp(): string
{
    const now = new Date();

    const formatted = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0')
    ].join('-') + '_' + [
        String(now.getHours()).padStart(2, '0'),
        String(now.getMinutes()).padStart(2, '0'),
        String(now.getSeconds()).padStart(2, '0')
    ].join('-');
    
    return formatted;
}

async function recursivelyDeleteFileOrFolder(folderName: string): Promise<void>
{
    await fs.rm(folderName, { recursive: true, force: true });
}

/**
 * Run a shell command and wait for it to complete
 */
function runCliCommand(command: string, args: string[]): Promise<void>
{
    return new Promise((resolve, reject) =>
    {
        execFile(command, args, (error) =>
        {
            if (error)
            {
                reject('An unknown error occurred while running mongodump to backup database');
            }
            else
            {
                resolve();
            }
        });
    });
}

async function createMongodbDatabaseBackups(folderName: string): Promise<void>
{
    // Validate the necessary env vars
    if (!process.env.DBS_TO_BACKUP_CSV || process.env.DBS_TO_BACKUP_CSV.length === 0)
    {
        throw new Error('process.env.DBS_TO_BACKUP_CSV must define databases to back up');
    }
    if (!process.env.MONGO_URI || process.env.MONGO_URI.length === 0)
    {
        throw new Error('process.env.MONGO_URI must be defined');
    }

    const index = process.env.MONGO_URI.lastIndexOf('/');
    const BACKUP_MONGO_URI = process.env.MONGO_URI.substring(0, index);

    if (BACKUP_MONGO_URI.length === 0)
    {
        throw new Error('BACKUP_MONGO_URI must be greater than 0 characters in length');
    }

    const databases = process.env.DBS_TO_BACKUP_CSV.split(',');

    if (databases.some(database => database.length === 0))
    {
        throw new Error('All database strings in DBS_TO_BACKUP_CSV must be greater than 0 characters in length');
    }

    for (let index = 0; index < databases.length; index += 1)
    {
        const commandArgs = [
            `--uri="${BACKUP_MONGO_URI}"`,
            `--out=./${folderName}`,
            '--db', databases[index],
        ];

        await runCliCommand('mongodump', commandArgs);
    }
}

async function zipBackupFolderAndDeleteUnzippedFolder(folderName: string): Promise<string>
{
    const zip = new AdmZip();

    // Zip the folder
    const zipFolderName = `./${folderName}.zip`;
    zip.addLocalFolder(`./${folderName}`);
    zip.writeZip(zipFolderName);

    return zipFolderName;
}

async function uploadBackup({ folderName, zipFolderName }: { folderName: string; zipFolderName: string })
{
    // Validate the necessary env vars
    if (!process.env.APP_ID || process.env.APP_ID.length === 0)
    {
        throw new Error('process.env.APP_ID must be defined');
    }

    await FileStorageService.upload({
        appId: process.env.APP_ID as string,
        file: {
            fileName: folderName,
            url: zipFolderName,
        },
        nestedFolders: `db-backups`,
        resourceType: FileStorageResourceType.Raw,
        options: { uploadType: 'authenticated', overwrite: false },
    });
}

async function backupDatabase(): Promise<void>
{
    let folderName: string | undefined;
    let zipFolderName: string | undefined;
    let exitCode = 0;

    try
    {
        logger.debug('Starting to back up database...');

        // Create backups
        folderName = `mongodb-backup-${getFormattedTimestamp()}`;
        await createMongodbDatabaseBackups(folderName);

        // Zip the backups and delete the unzipped folder
        zipFolderName = await zipBackupFolderAndDeleteUnzippedFolder(folderName);

        // Upload the backup
        await uploadBackup({ folderName, zipFolderName });

        // Log success
        const logMessage = [
            Text.bold('Roll of Darkness Automation'),
            `Finished backing up database!`,
        ].join('\n\n');
        logger.debug('Finished backup up database!', { folderName });
        discordLogger.info(logMessage);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Fix this later if necessary
    catch (error: any)
    {
        logger.error(
            'Errors occurred while Roll of Darkness attempted to back up database',
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Fix this later if necessary
            error?.response?.data ?? error,
        );
        exitCode = 1;
    }

    // Close out the process faster
    finally
    {
        // Delete the original and zip folders if they were created
        const filesOrFoldersToDelete = [folderName, zipFolderName].filter(Boolean) as string[];

        for (let index = 0; index < filesOrFoldersToDelete.length; index += 1)
        {
            await recursivelyDeleteFileOrFolder(filesOrFoldersToDelete[index]);
        }

        // Flush loggers and exit the process
        await cleanupLoggers(logger, discordLogger, exitCode);
    }
}

await backupDatabase();
