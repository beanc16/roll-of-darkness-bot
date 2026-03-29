import { HangmonStrategy } from './HangmonStrategy.js';
import { OracleContinueStrategy } from './OracleContinueStrategy.js';
import { OracleCreateStrategy } from './OracleCreateStrategy.js';

export default {
    [HangmonStrategy.key]: HangmonStrategy,
    [OracleCreateStrategy.key]: OracleCreateStrategy,
    [OracleContinueStrategy.key]: OracleContinueStrategy,
};
