import { AddCharacterStrategy } from './AddCharacterStrategy.js';
import { EditCharacterHpStrategy } from './EditCharacterHpStrategy.js';
import { EditCharacterStrategy } from './EditCharacterStrategy.js';
import { RemoveCharacterStrategy } from './RemoveCharacterStrategy.js';
import { ShowSecretCharactersStrategy } from './ShowSecretCharactersStrategy.js';

export default {
    [AddCharacterStrategy.key]: AddCharacterStrategy,
    [RemoveCharacterStrategy.key]: RemoveCharacterStrategy,
    [EditCharacterStrategy.key]: EditCharacterStrategy,
    [EditCharacterHpStrategy.key]: EditCharacterHpStrategy,
    [ShowSecretCharactersStrategy.key]: ShowSecretCharactersStrategy,
};
