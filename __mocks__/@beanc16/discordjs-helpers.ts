class Code
{
    public static oneLine = jest.fn().mockImplementation((input: unknown) => input);
    public static multiLine = jest.fn().mockImplementation((input: unknown) => input);
}
class Ping
{
    public static user = jest.fn().mockImplementation((input: unknown) => input);
    public static role = jest.fn().mockImplementation((input: unknown) => input);
}
export class Text
{
    public static bold = jest.fn().mockImplementation((input: unknown) => input);
    public static italic = jest.fn().mockImplementation((input: unknown) => input);
    public static underline = jest.fn().mockImplementation((input: unknown) => input);
    public static strikethrough = jest.fn().mockImplementation((input: unknown) => input);
    public static Code = Code;
    public static Ping = Ping;
    public static emoji = jest.fn().mockImplementation((input: unknown) => input);
}
