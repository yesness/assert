const OR = 'or';

class Assert {
    static model(expected: any, customErrorMessage?: string): Assert {
        return new Assert(expected, customErrorMessage);
    }

    static or(...values: any[]): any {
        return {
            __assert: OR,
            values,
        };
    }

    static check(
        actual: any,
        expected: any,
        customErrorMessage?: string,
        path: string = 'root'
    ) {
        const fail = (type: string) => {
            if (customErrorMessage) {
                throw new Error(customErrorMessage);
            }

            let act = typeof actual;
            if (typeof actual === typeof expected) {
                act = actual;
            }

            throw new Error(`Expected ${path} to be ${type}; Actual: ${act}`);
        };

        // Test arrays
        if (Array.isArray(expected)) {
            if (!Array.isArray(actual)) {
                return fail('array');
            }
            actual.forEach((obj, idx) => {
                Assert.check(
                    obj,
                    expected[0],
                    customErrorMessage,
                    `${path}[${idx}]`
                );
            });
            return;
        }

        // Check for class types
        const classes = [
            Boolean,
            Function,
            Number,
            Object,
            String,
            Symbol,
            undefined,
        ];
        if (classes.indexOf(expected) !== -1) {
            if (typeof expected === 'function') {
                if (typeof actual !== typeof expected()) {
                    return fail(typeof expected());
                }
            } else if (expected === undefined) {
                if (actual !== undefined) {
                    return fail('undefined');
                }
            } else {
                throw new Error('Invalid expected function');
            }
            return;
        }

        // Check for assert object
        if (typeof expected === 'object' && '__assert' in expected) {
            const op = expected.__assert;
            if (op === OR) {
                let valid = false;
                const errors: string[] = [];
                expected.values.forEach((val: any) => {
                    try {
                        Assert.check(actual, val, customErrorMessage, path);
                        valid = true;
                    } catch (e) {
                        errors.push(e.message);
                    }
                });
                if (!valid) {
                    throw new Error(
                        `None of the types matched:\n${errors.join('\n')}`
                    );
                }
            } else {
                throw new Error(`Invalid operation: ${op}`);
            }
            return;
        }

        // Check object type
        if (typeof expected === 'object') {
            if (typeof actual !== 'object') {
                return fail('object');
            }
            Object.keys(expected).forEach((key) => {
                Assert.check(
                    actual[key],
                    expected[key],
                    customErrorMessage,
                    `${path}.${key}`
                );
            });
            return;
        }

        // Function & Symbol
        const bypass = ['function', 'symbol'];
        if (
            bypass.indexOf(typeof expected) !== -1 &&
            typeof actual === typeof expected
        ) {
            return;
        }

        // Check exact type
        if (actual !== expected) {
            return fail(String(expected));
        }

        return;
    }

    private model: any;
    private customErrorMessage?: string;

    private constructor(model: any, customErrorMessage?: string) {
        this.model = model;
        this.customErrorMessage = customErrorMessage;
    }

    validate(actual: any) {
        Assert.check(actual, this.model, this.customErrorMessage);
    }
}

export default Assert;
