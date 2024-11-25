import { ObjectId } from 'mongodb';
import { MongoDbController } from 'mongodb-controller';
import { PtuPokemon } from '../types/pokemon.js';

// TODO: Move this to a dedicated API for roll of darkness to call later instead
class PtuPokemonCollection
{
    public _id: ObjectId;
    public name: PtuPokemon['name'];
    public types: PtuPokemon['types'];
    public baseStats: PtuPokemon['baseStats'];
    public abilities: PtuPokemon['abilities'];
    public evolution: PtuPokemon['evolution'];
    public sizeInformation: PtuPokemon['sizeInformation'];
    public breedingInformation: PtuPokemon['breedingInformation'];
    public diets: PtuPokemon['diets'];
    public habitats: PtuPokemon['habitats'];
    public capabilities: PtuPokemon['capabilities'];
    public skills: PtuPokemon['skills'];
    public moveList: PtuPokemon['moveList'];
    public megaEvolutions: PtuPokemon['megaEvolutions'];
    public metadata: PtuPokemon['metadata'];
    public extras: PtuPokemon['extras'];

    constructor({
        _id,
        name,
        types,
        baseStats,
        abilities,
        evolution,
        sizeInformation,
        breedingInformation,
        diets,
        habitats,
        capabilities,
        skills,
        moveList,
        megaEvolutions,
        metadata,
        extras,
    }: PtuPokemon & { _id: ObjectId; })
    {
        if (_id)
        {
            this._id = _id;
        }
        else
        {
            this._id = new ObjectId();
        }

        this.name = name;
        this.types = types;
        this.baseStats = baseStats;
        this.abilities = abilities;
        this.evolution = evolution;
        this.sizeInformation = sizeInformation;
        this.breedingInformation = breedingInformation;
        this.diets = diets;
        this.habitats = habitats;
        this.capabilities = capabilities;
        this.skills = skills;
        this.moveList = moveList;
        this.megaEvolutions = megaEvolutions;
        this.metadata = metadata;
        this.extras = extras;
    }
}

export class PokemonController extends MongoDbController
{
    static dbName = 'ptu-microservice';
    static collectionName = 'pokemon';
    static Model = PtuPokemonCollection;
    // TODO: Figure out if it's necessary to add this later or not
    // static sortOptions = {
    //     name: 'ascending',
    // };
}
