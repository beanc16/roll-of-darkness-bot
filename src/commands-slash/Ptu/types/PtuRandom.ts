export interface RandomResult
{
    name: string;
    cost?: string;
    description: string;
    numOfTimesRolled?: number;
}

export interface RandomPokeball extends RandomResult
{
    mod?: string;
    type?: string;
    jailBreakerInfo?: RandomPokeball;
}
