import Assert from '../';

describe('assert', () => {
    const stringNumber = Assert.or(String, Number);
    const stringOrArray = Assert.or(String, [String]);
    const booleanOrArrayOr = Assert.or(Boolean, [Assert.or(String, Number)]);
    const exactOr = Assert.or(Boolean, 'hello', 55);

    // [actual, expected]
    const successData: { [name: string]: [any, any] } = {
        stringC: ['hello', String],
        string: ['hello', 'hello'],
        numberC: [1, Number],
        number: [1, 1],
        booleanC: [true, Boolean],
        boolean: [false, false],
        functionC: [() => {}, Function],
        function: [() => {}, () => {}],
        objectC: [{}, Object],
        object: [{}, {}],
        symbolC: [Symbol(), Symbol],
        symbol: [Symbol(), Symbol()],
        undefined: [undefined, undefined],
        null: [null, null],
        stringNumber: ['hello', stringNumber],
        stringNumber2: [1, stringNumber],
        stringOrArray: ['hello', stringOrArray],
        stringOrArray2: [[], stringOrArray],
        stringOrArray3: [['hello'], stringOrArray],
        booleanOrArrayOr: [true, booleanOrArrayOr],
        booleanOrArrayOr2: [[], booleanOrArrayOr],
        booleanOrArrayOr3: [['hello'], booleanOrArrayOr],
        booleanOrArrayOr4: [[1], booleanOrArrayOr],
        booleanOrArrayOr5: [[2, 'goodbye'], booleanOrArrayOr],
        dict: [
            { a: 1, b: 'string', c: [true, {}] },
            {
                a: Number,
                b: String,
                c: [Assert.or(Boolean, Object)],
            },
        ],
        exactOr: [true, exactOr],
        exactOr2: [false, exactOr],
        exactOr3: ['hello', exactOr],
        exactOr4: [55, exactOr],
    };

    const errorData: {
        [name: string]: [[any, any], string, string, string] | [any, any];
    } = {
        'number-string': [[1, String], 'number', 'string', 'root'],
        null: [[[null], [{ a: 1 }]], 'null', 'object', 'root[0]'],
        stringNumber: [true, stringNumber],
        stringOrArray: [true, stringOrArray],
        stringOrArray2: [[1], stringOrArray],
        booleanOrArrayOr: ['hello', booleanOrArrayOr],
        booleanOrArrayOr2: [['hello', false, 2], booleanOrArrayOr],
        exactOr: ['goodbye', exactOr],
        exactOr2: [56, exactOr],
        exactOr3: [{}, exactOr],
    };

    Object.keys(successData).forEach((name) => {
        test(`success-${name}`, () => {
            Assert.check(...successData[name]);
        });
    });

    Object.keys(errorData).forEach((name) => {
        test(`error-${name}`, () => {
            const dat = errorData[name];

            let err = 'None of the types matched:';
            let args: [any, any];
            if (dat.length === 4) {
                let [argz, actual, expected, root] = errorData[name];
                args = argz;
                err = `Expected ${root} to be ${expected}; Actual: ${actual}`;
            } else {
                args = dat;
            }

            expect(() => Assert.check(...args)).toThrow(err);
        });
    });

    test('custom error', () => {
        expect(() => Assert.check(1, String, 'chicken nuggets')).toThrow(
            'chicken nuggets'
        );
    });

    test('nested error', () => {
        const obj = {
            key1: [
                [
                    {
                        key2: Number,
                        key3: Assert.or(undefined, String),
                    },
                ],
            ],
        };
        expect(() => Assert.check(1, obj)).toThrow(
            'Expected root to be object; Actual: number'
        );
        expect(() => Assert.check({}, obj)).toThrow(
            'Expected root.key1 to be array; Actual: undefined'
        );
        expect(() => Assert.check({ key1: 1 }, obj)).toThrow(
            'Expected root.key1 to be array; Actual: number'
        );
        expect(() => Assert.check({ key1: [[], '1'] }, obj)).toThrow(
            'Expected root.key1[1] to be array; Actual: string'
        );
        expect(() => Assert.check({ key1: [[], [], [1]] }, obj)).toThrow(
            'Expected root.key1[2][0] to be object; Actual: number'
        );
        expect(() =>
            Assert.check({ key1: [[], [], [{ key2: true }]] }, obj)
        ).toThrow(
            'Expected root.key1[2][0].key2 to be number; Actual: boolean'
        );
        expect(() =>
            Assert.check({ key1: [[], [], [{ key2: 1, key3: 1 }]] }, obj)
        ).toThrow(
            'None of the types matched:\nExpected root.key1[2][0].key3 to be undefined; Actual: number\nExpected root.key1[2][0].key3 to be string; Actual: number'
        );
    });
});
