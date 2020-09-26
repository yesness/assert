module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/src/**/__tests__/**/*.[jt]s?(x)'],
    transform: {
        '\\.[tj]sx?$': ['babel-jest'],
    },
};
