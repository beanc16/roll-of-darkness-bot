import type { ParserOptions } from 'expr-eval';

export const addMathParserOptions: ParserOptions = {
    operators: {
        // Only allow addition
        add: true,

        // Make everything else false
        subtract: false,
        comparison: false,
        concatenate: false,
        conditional: false,
        divide: false,
        factorial: false,
        logical: false,
        multiply: false,
        power: false,
        remainder: false,
        sin: false,
        cos: false,
        tan: false,
        asin: false,
        acos: false,
        atan: false,
        sinh: false,
        cosh: false,
        tanh: false,
        asinh: false,
        acosh: false,
        atanh: false,
        sqrt: false,
        log: false,
        ln: false,
        lg: false,
        log10: false,
        abs: false,
        ceil: false,
        floor: false,
        round: false,
        trunc: false,
        exp: false,
        length: false,
        in: false,
        random: false,
        min: false,
        max: false,
        assignment: false,
        fndef: false,
        cbrt: false,
        expm1: false,
        log1p: false,
        sign: false,
        log2: false,
    },
};

export const addAndSubtractMathParserOptions: ParserOptions = {
    operators: {
        // Only allow addition and subtraction
        ...addMathParserOptions.operators,
        subtract: true,
    },
};
