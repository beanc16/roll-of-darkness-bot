// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';

export function getFakeArray<Element>(value: Element, length: number): Element[]
{
    return Array.from({ length }, (_, _index) => value);
}

export function getArrayOfWords({ min, max }: {
    min: number;
    max: number;
} | {
    min?: never;
    max: number;
}): string[]
{
    const options = faker.lorem.words(faker.number.int({ min: max, max })).split(' ');
    const numOfElements = (min) ? faker.number.int({ min, max }) : max;

    return faker.helpers.arrayElements(options, numOfElements);
};
