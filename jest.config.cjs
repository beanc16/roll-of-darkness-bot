// For ignoring any troublesome ESM modules that throw import errors
const esmModules = [
].join('|');

module.exports = {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.ts',
        '!node_modules/**',
    ],
    coveragePathIgnorePatterns: [
        // Don't show coverage data for code we don't need to unit test
        '/.*/constants',
        '/.*/constants.ts',
        '/.*/decorators',
        '/.*/decorators.ts',
        '/.*/types',
        '/.*/types.ts',

        // Root setup & orchestrator
        'src/bot.ts',

        // Scripts
        '/.*/registerSlashCommands.ts', // This is tested with other files

        // Command parameter options
        '/.*/options',
        '/.*/options.ts',
        '/.*/subcommand-groups',

        // Dals
        '/.*/dal',

        // Events
        '/.*/events/onReady.ts',

        // General Classes
        '/.*/CachedAuthTokenService.ts',
        '/.*/StringSingleton.ts',
        '/.*/Singleton.ts',

        // General Strategies
        '/.*/BaseLookupStrategy.ts',

        // Search Services
        '/.*/SearchService.ts',
        '/.*/PtuAbilitiesSearchService.ts',
        '/.*/PtuMovesSearchService.ts',

        // Ptu
        '/.*/PtuDamageChartService.ts',

        // NWOD
        '/.*/NwodCacheInitializer.ts',

        // Curseborne
        '/.*/CurseborneDiceService.ts',
        '/.*/BaseCurseborneLookupStrategy.ts',

        // Counter
        '/.*/dal/models/Counter.ts',
        '/.*/dal/models/CounterContainer.ts',
        '/.*/Counter/services/CounterEventHandler.ts',
        '/.*/Counter/services/upsertCounterCountainerWithDbUpdate.ts',

        // Media
        '/.*/ImageUpscaleStrategy.ts',
        '/.*/MediaStrategyExecutor.ts',

        // Roll of Darkness API
        '/.*/CachedRollOfDarknessApi.ts',
        '/.*/rollOfDarknessApiHasErrorSingleton.ts',
    ],
    moduleFileExtensions: ['js', 'ts'],
    extensionsToTreatAsEsm: ['.ts'],
    resolver: 'ts-jest-resolver',
    transform: {
        '^.+\\.ts?$': [
            '@swc/jest',
        ],
    },
    transformIgnorePatterns: [
        `<rootDir>/node_modules/(?!${esmModules})`,
    ],
};
