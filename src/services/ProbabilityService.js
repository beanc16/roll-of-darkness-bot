class ProbabilityService
{
    getFactorial(n = 1)
    {
        let result = 1;
        
        if (n < 0)
        {
            throw new Error('Can only get factorial of positive numbers');
        }
        
        for (let i = n; i >= 1; i--)
        {
            result *= i;
        }
        
        return result;
    }

    getBinomialCoefficient({
        n = 1,
        k = 1,
    } = {})
    {
        const numerator = this.getFactorial(n);
        const denominator = this.getFactorial(k) * this.getFactorial(n - k);
        return numerator / denominator;
    }

    getDiscreteBinomialDistribution({
        n = 1,
        p = 0.3,
        k = 1,
    } = {})
    {
        const binomialCoefficientResult = this.getBinomialCoefficient({
            n,
            k,
        });
        const exponentResult1 = Math.pow(p, k);
        const exponentResult2 = Math.pow(1 - p, n - k);
        return binomialCoefficientResult * exponentResult1 * exponentResult2;
    }
}



module.exports = ProbabilityService;
