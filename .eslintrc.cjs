/* eslint-env node */
module.exports = {
    root: true,
    ignorePatterns: ['dist', 'server', 'node_modules'],
    env: { browser: true, es2022: true },
    extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:react-hooks/recommended'],
    plugins: ['react', 'react-hooks', 'react-refresh'],
    settings: { react: { version: 'detect' } },
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
    },
    rules: {
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        'react/no-unescaped-entities': 'off',
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
};
