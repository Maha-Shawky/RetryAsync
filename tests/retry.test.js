const { RetryAlgorithm, FixedRetry, LinearRetry, ExponentialRetry } = require('../index')

describe('Test retry logic', () => {
    afterAll(async() => {
        await new Promise(resolve => setTimeout(() => resolve(), 1000)); // avoid jest open handle error
    })


    const resolvedPromiseFn = (name, age) => {
        return Promise.resolve(`name: ${name}, age: ${age}`);

    }
    const rejectedPromiseFn = (name, age) => {
        return new Promise(() => {
            throw new Error(`Invalid name: ${name}, age: ${age}`);
        });
    }

    describe('Test algorithm', () => {
        it('Shouldn\'t retry if function succeeded', async() => {
            const retryAlgorithm = new RetryAlgorithm(2, 3);

            const mockFunc = jest.fn().mockImplementation(resolvedPromiseFn);
            await retryAlgorithm.retry(mockFunc, 'Saly', 10);
            expect(mockFunc).toHaveBeenCalledTimes(1)

        })

        it('Should pass args correctly', async() => {
            const retryAlgorithm = new RetryAlgorithm(2, 3);

            const mockFunc = jest.fn().mockImplementation(resolvedPromiseFn);
            await retryAlgorithm.retry(mockFunc, 'Saly', 10);

            expect(mockFunc).toHaveBeenCalledWith('Saly', 10)
        })

        it('Should retry if failed', async() => {
            const maxRetry = 3;
            const retryAlgorithm = new RetryAlgorithm(2, maxRetry);
            retryAlgorithm.sleep = jest.fn();

            const mockFunc = jest.fn().mockImplementation(rejectedPromiseFn);

            //expect(await fixedRetry.retry(mockFunc, 'Saly', 10)).rejects.toThrow()
            let message = null;
            try {
                await retryAlgorithm.retry(mockFunc, 'Saly', 10);
            } catch (e) { message = e.message; }

            expect(message).toBeTruthy();
            expect(mockFunc).toHaveBeenCalledTimes(maxRetry + 1 /**1 for original call */ )
        })

    })
    describe('Test delay', () => {
        const testRetry = async(retryAlgorithm, expectedOutput) => {

            retryAlgorithm.sleep = jest.fn();

            try {
                await retryAlgorithm.retry(rejectedPromiseFn, 'Saly', 10);
            } catch (e) {}

            expect(retryAlgorithm.sleep).toHaveBeenCalledTimes(3);
            expectedOutput.forEach((output, index) => {
                expect(retryAlgorithm.sleep.mock.calls[index][0]).toBe(output)

            })
        }

        it('Should delay with fixed delay if fixed retry is used', async() => {
            const retryAlgorithm = new FixedRetry(2, 3);
            await testRetry(retryAlgorithm, [2, 2, 2]);

        })
        it('Should delay with linear delay if linear retry is used', async() => {
            const retryAlgorithm = new LinearRetry(2, 3);
            await testRetry(retryAlgorithm, [2, 4, 6]);
        })
        it('Should delay with exponential delay if exponential retry is used', async() => {
            const retryAlgorithm = new ExponentialRetry(2, 3);
            await testRetry(retryAlgorithm, [2, 4, 8]);
        })
    })
})