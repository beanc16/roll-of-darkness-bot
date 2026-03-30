import { HangmonStrategy } from './HangmonStrategy.js';
import { OracleContinueStrategy } from './OracleContinueStrategy.js';
import { OracleCreateStrategy } from './OracleCreateStrategy.js';
import { OracleViewStrategy } from './OracleViewStrategy.js';

export default {
    [HangmonStrategy.key]: HangmonStrategy,
    [OracleCreateStrategy.key]: OracleCreateStrategy,
    [OracleContinueStrategy.key]: OracleContinueStrategy,
    [OracleViewStrategy.key]: OracleViewStrategy,
};
