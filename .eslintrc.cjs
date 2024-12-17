const path = require('path');

module.exports = {
    env: {
        node: true,
        es2022: true,
    },
    extends: 'airbnb-base',
    parser: '@typescript-eslint/parser',
    plugins: [
        '@stylistic',
        'file-progress',
        'import-newlines',
        'import',
        'newline-destructuring',
        'simple-import-sort',
    ],
    ignorePatterns: [
        '**/node_modules/*',
        '**/dist/*',            // For compiled versions of packages
        '**/lib/*',             // For compiled versions of packages
        '**/coverage',          // For coverage reports
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    rules: {
        // Spacing, Whitespace, Padding, Etc.
        'brace-style': ['error', 'allman'],     // Make curly braces exist on the next line
        indent: ['error', 4, {                  // Do 4-space indentation (not tabs)
            offsetTernaryExpressions: true,     // Indent all ternary operator values
            SwitchCase: 1,                      // Indent case clauses for switch statements
        }],
        'linebreak-style': 'off',               // Don't enforce unix or windows-specific linebreaks, use whatever linebreaks you want
        'max-len': ['error', {
            code: 160,                          // Maximum line length
            tabWidth: 4,                        // Character width for tabs
            ignoreComments: true,               // Ignore trailing comments and comments on their own lines when determining max length
            ignoreUrls: true,                   // Ignore URLs when determining max length
        }],
        'no-multiple-empty-lines': 'error',     // Disallow multiple blank lines right next to each other
        'no-multi-spaces': ['error', {          // Disallow multiple spaces...
            ignoreEOLComments: true,            // ...unless there's a trailing (EOL) comment (like this one)
        }],
        '@stylistic/no-multi-spaces': ['error', {       // Disallow multiple spaces...
            ignoreEOLComments: true,                    // ...unless there's a trailing (EOL) comment (like this one)
        }],
        'no-trailing-spaces': ['error', {       // Disallow trailing spaces...
            skipBlankLines: true,               // ...but, do allow it on blank lines
        }],
        'padding-line-between-statements': ['error', {  // Add a blank line...
            blankLine: 'always',                        // ...after all block-like statements
            prev: 'block-like',
            next: '*',
        }, {
            blankLine: 'always',                        // ...before case and default statements
            prev: ['case', 'default'],
            next: '*',
        }],

        // Variables
        'no-shadow': 'off',                     // Disallow variable declarations from shadowing variables declared in the outer scope (turned off, as it causes a bug with the below typescript version of this same rule)
        '@typescript-eslint/no-shadow': 'error', // Disallow variable declarations from shadowing variables declared in the outer scope (but it's for TypeScript and JavaScript)
        'no-param-reassign': ['error', {        // Disallow reassigning function parameters within functions...
            props: true,                        // ...but allow reassigning properties on objects
            ignorePropertyModificationsForRegex: [   // ...ignore property changes for .reduce functions
                '^acc[0-9]?$',
            ],
        }],
        'no-unused-vars': ['error', {           // Disallow unused variables
            args: 'all',                        // All function parameters/arguments must be used
            varsIgnorePattern: '^_',            // Variables declared with names that start with an underscore can be unused
            argsIgnorePattern: '^_',            // Function arguments declared with names that start with an underscore can be unused
        }],
        'prefer-template': 'off',               // Do not prefer template strings over string concatenation

        // Objects, Imports, & Exports
        'import/prefer-default-export': 'off',                      // Do not prefer default export over named export
        'import-newlines/enforce': ['error', {                      // Import values on a new line...
            items: 2,                                               // ...when importing more than 2 items with one import statement
        }],
        '@stylistic/object-curly-newline': ['error', {  // Enforce consistent line breaks after opening and before closing braces for...
            ObjectExpression: {                         // ...object literals with at least 3 properties
                multiline: true,
                minProperties: 3,
                consistent: true,
            },
            ObjectPattern: {                            // ...object patterns of destructuring assignments with at least 3 properties
                multiline: true,
                minProperties: 3,
                consistent: true,
            },
            ImportDeclaration: {                        // ...named imports with at least 3 properties
                multiline: true,
                minProperties: 3,
            },
            ExportDeclaration: {                        // ...named exports with at least 3 properties
                multiline: true,
                minProperties: 3,
            },
        }],
        'object-curly-spacing': 'error',            // Enforce consistent spacing inside curly brackets
        '@stylistic/object-property-newline': ['error', {   // Enforce placing object properties on separate lines such that...
            allowAllPropertiesOnSameLine: true,            // ...properties can be on the same line, with newline-destructuring/newline handling the max number of properties
        }],
        'newline-destructuring/newline': 'error',   // Deconstruct object properties on separate lines if objects have more than 3 or more properties
        'simple-import-sort/imports': 'error',      // Enforce sorting of imports
        'simple-import-sort/exports': 'error',      // Enforce sorting of exports
        'import/extensions': ['error', 'ignorePackages', { // Require extensions for imports...
            ts: 'never',                        // ... except for .ts files since this plugin doesn't allow .js imports in .ts files which is needed for our TS config, but the compiler will catch any import issues anyways
            js: 'always',                       // ... in .js files for ESM compatibility
        }],

        // Promises & Async
        'require-await': 'error',               // Require await in async functions

        // Returns
        'arrow-body-style': ['error', 'as-needed', {    // Require braces around arrow function bodies...
            requireReturnForObjectLiteral: true,        // ...especially when returning an object literal
        }],
        'no-return-await': 'off',               // Allow return await

        // Miscellaneous
        'file-progress/activate': 1,            // Show progress in console while linting
        'no-control-regex': 'off',              // Allow control characters in regular expressions
    },
    overrides: [
        {   // Rules for...
            // ...TypeScript files only
            files: [
                '**/*.ts',
            ],
            extends: [
                'airbnb-typescript/base',
                'plugin:@stylistic/recommended-extends',
                'plugin:@stylistic/disable-legacy',
                'plugin:@typescript-eslint/recommended-requiring-type-checking',
            ],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                project: [
                    path.resolve(path.resolve(), 'tsconfig.json'),          // Required for: @typescript-eslint/recommended-requiring-type-checking
                    path.resolve(path.resolve(), 'tests/tsconfig.json'),    // Required for the below jest overrides to take effect for typescript files
                ],
            },
            rules: {
                // Spacing, Whitespace, Padding, Etc.
                '@stylistic/indent': ['error', 4, {                             // Do 4-space indentation (not tabs)
                    // Ignore indents
                    ignoredNodes: [
                        'FunctionExpression > .params[decorators.length > 0]',  // Ignore indentation rules for parameters in function expressions with decorators
                        'FunctionDeclaration > .params[decorators.length > 0]', // Ignore indentation rules for parameters in function declarations with decorators
                    ],
                    FunctionDeclaration: { parameters: 'first' },               // For function declarations, align parameters with the first parameter on the next line
                    FunctionExpression: { parameters: 'first' },                // For function expressions, align parameters with the first parameter on the next line
                    CallExpression: { arguments: 'first' },                     // For function calls, align arguments with the first argument on the next line
                    ArrayExpression: 'first',                                   // For array literals, align elements with the first element on the next line
                    ObjectExpression: 'first',                                  // For object literals, align properties with the first property on the next line
                }],
                '@stylistic/indent-binary-ops': ['error', 4],               // Do 4-space indentation (not tabs) for binary operations

                // Miscellaneous
                '@stylistic/arrow-parens': 'off',                           // Do not require parentheses around arrow function arguments
                '@stylistic/brace-style': ['error', 'allman'],              // Make curly braces exist on the next line
                '@stylistic/comma-dangle': ['error', 'always-multiline'],   // Require trailing commas
                '@stylistic/member-delimiter-style': ['error', {            // Style of delimiter between members
                    multiline: {
                        delimiter: 'semi',
                        requireLast: true,
                    },
                    singleline: {
                        delimiter: 'semi',
                        requireLast: false,
                    },
                    overrides: {
                        interface: {
                            multiline: {
                                delimiter: 'semi',
                                requireLast: true,
                            },
                        },
                    },
                }],
                '@stylistic/semi': ['error', 'always'],
                '@typescript-eslint/explicit-function-return-type': ['error', {     // Define a return type for functions in typescript...
                    allowExpressions: true,                                         // ...including expressions
                }],
                '@typescript-eslint/explicit-member-accessibility': ['error', {     // On, class members...
                    accessibility: 'explicit',                                      // ...require an explicit "public", "protected", or "private" on all class members
                    overrides: {
                        accessors: 'no-public',                                     // ...require an explicit "protected" or "private" on accessors (gets/sets)
                        constructors: 'no-public',                                  // ...require an explicit "protected" or "private" on constructors
                    },
                }],
                '@typescript-eslint/return-await': ['error', 'always'],     // Allow return await
                '@typescript-eslint/naming-convention': ['error', {    // Define naming convention rules
                    selector: 'variable',
                    modifiers: ['unused'],                             // Specifically target unused variables
                    format: ['camelCase', 'PascalCase', 'UPPER_CASE'], // Use existing naming convention formatting
                    leadingUnderscore: 'require',                      // Require a leading underscore, as otherwise unused vars fail standard the naming convention
                }],
                '@typescript-eslint/no-misused-promises': ['error',     // Overwrite from plugin:@typescript-eslint/recommended-requiring-type-checking
                    {
                        checksVoidReturn: false, // Allows async functions in void-returning places
                    },
                ],
                '@typescript-eslint/no-unused-vars': ['error', {    // Disallow unused variables
                    args: 'all',                                    // All function parameters/arguments must be used
                    varsIgnorePattern: '^_',                        // Variables declared with names that start with an underscore can be unused
                    argsIgnorePattern: '^_',                        // Function arguments declared with names that start with an underscore can be unused
                }],
            },
            settings: {
                'import/parsers': {
                    '@typescript-eslint/parser': ['.ts'],
                },
                'import/resolver': {
                    typescript: {
                        alwaysTryTypes: true,           // Always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
                        project: [
                            './tsconfig.json',
                        ],
                    },
                },
            },
        },
        {
            // Rules for Jest files
            files: [
                '**/*.spec.js',
                '**/*.spec.ts',
                '**/*.test.js',
                '**/*.test.ts',
            ],
            env: {
                jest: true,
            },
            plugins: [
                'jest',
            ],
            extends: [
                'plugin:jest/recommended',
            ],
            parser: '@typescript-eslint/parser',
            rules: {
                '@typescript-eslint/dot-notation': 'off', // Allow for object['property'] notation for testing of protected/private classes
            },
        },
    ],
};
