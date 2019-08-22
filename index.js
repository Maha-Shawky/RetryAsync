class RetryAlgorithm {
    constructor(initial, maxRetry) {
        this.initial = initial;
        this.maxRetry = maxRetry;
    }
    sleep(delay) {
        return new Promise(resolve => setTimeout(() => resolve(), delay * 1000));
    }
    calcDelay(retryCount) {}

    async retry(asyncCallBack, ...args) {
        for (let i = 0; i <= this.maxRetry; i++) {
            try {
                return await asyncCallBack(...args);
            } catch (e) {
                if (i === this.maxRetry)
                    throw e;

                const delay = this.calcDelay(i + 1);
                await this.sleep(delay);

            }
        }
    }
}


class FixedRetry extends RetryAlgorithm {
    calcDelay(retryCount) {
        return this.initial;
    }
}

class LinearRetry extends RetryAlgorithm {
    calcDelay(retryCount) {
        return this.initial * retryCount;
    }
}

class ExponentialRetry extends RetryAlgorithm {
    calcDelay(retryCount) {
        return Math.pow(2, retryCount)
    }
}
module.exports = {
    RetryAlgorithm,
    FixedRetry,
    LinearRetry,
    ExponentialRetry
}