export const shuffleArrayTimes = <Element>(array: Element[], numOfTimesToShuffle: number): Element[][] =>
{
    return Array.from({ length: numOfTimesToShuffle }, () =>
        [...array].sort(() => Math.random() - 0.5),
    );
};
